import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@blinkdotnew/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, stripe-signature",
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const projectId = Deno.env.get("BLINK_PROJECT_ID");
    const secretKey = Deno.env.get("BLINK_SECRET_KEY");

    if (!stripeKey || !webhookSecret || !projectId || !secretKey) {
      console.error("Missing env vars:", { stripeKey: !!stripeKey, webhookSecret: !!webhookSecret, projectId: !!projectId, secretKey: !!secretKey });
      return new Response(JSON.stringify({ error: "Missing config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const blink = createClient({ projectId, secretKey });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tokens = parseInt(session.metadata?.tokens || "0");
      const packageId = session.metadata?.packageId;

      if (!userId || !tokens) {
        console.error("Missing metadata:", session.metadata);
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const now = new Date().toISOString();

      // Get or create token balance using table() API
      const balances = await blink.db.table("token_balances").list({
        where: { user_id: userId },
        limit: 1,
      }) as any[];

      if (balances.length > 0) {
        const bal = balances[0];
        await blink.db.table("token_balances").update(bal.id, {
          tokens: Number(bal.tokens) + tokens,
          updated_at: now,
        });
      } else {
        await blink.db.table("token_balances").create({
          user_id: userId,
          tokens,
          updated_at: now,
        });
      }

      // Record transaction
      await blink.db.table("token_transactions").create({
        user_id: userId,
        amount: tokens,
        type: "purchase",
        description: `Purchased ${packageId} pack (${tokens.toLocaleString()} tokens)`,
        stripe_session_id: session.id,
        created_at: now,
      });

      console.log(`Added ${tokens} tokens to user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);

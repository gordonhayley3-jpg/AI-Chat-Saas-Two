import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@blinkdotnew/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const PACKAGES: Record<string, { tokens: number; price: number; name: string }> = {
  starter: { tokens: 5000, price: 500, name: "Starter Pack — 5,000 Tokens" },
  pro: { tokens: 25000, price: 1900, name: "Pro Pack — 25,000 Tokens" },
  ultimate: { tokens: 100000, price: 5900, name: "Ultimate Pack — 100,000 Tokens" },
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.json();
    const { packageId, userEmail, userId } = body;

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pkg.name,
              description: `${pkg.tokens.toLocaleString()} AI tokens for NexusAI`,
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail,
      success_url: `${req.headers.get("origin") || "https://ai-chat-workspace-9a14x0l5.live.blink.new"}/dashboard?success=true&package=${packageId}`,
      cancel_url: `${req.headers.get("origin") || "https://ai-chat-workspace-9a14x0l5.live.blink.new"}/dashboard?canceled=true`,
      metadata: {
        userId,
        packageId,
        tokens: pkg.tokens.toString(),
      },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);

import { createClient } from "npm:@blinkdotnew/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// Retry helper with exponential backoff for 429 errors
async function retryFetch(fn: () => Promise<Response>, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fn();
    if (res.status === 429 && attempt < maxRetries - 1) {
      const retryAfter = res.headers.get("retry-after");
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt + 1) * 1000;
      console.log(`Rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    return res;
  }
  throw new Error("Max retries exceeded");
}

// Model routing: which API to call for each model ID
const MODEL_CONFIG: Record<string, { provider: string; apiModel: string; isFree?: boolean; hasReasoning?: boolean }> = {
  // New umnik-style model IDs -> actual API models
  "chatgpt-5.4-pro": { provider: "openai", apiModel: "gpt-4o" },
  "chatgpt-5.4": { provider: "openai", apiModel: "gpt-4o" },
  "chatgpt-5.3": { provider: "openai", apiModel: "gpt-4o-mini" },
  "chatgpt-5.2-pro": { provider: "openai", apiModel: "gpt-4o" },
  "chatgpt-5.2": { provider: "openai", apiModel: "gpt-4o-mini" },
  "claude-opus-4.5": { provider: "anthropic", apiModel: "claude-3-5-sonnet-20241022" },
  "claude-sonnet-4.5": { provider: "anthropic", apiModel: "claude-3-5-sonnet-20241022" },
  "gemini-3-pro": { provider: "google", apiModel: "gemini-1.5-pro" },
  "gemini-3-flash": { provider: "google", apiModel: "gemini-2.0-flash", isFree: true },
  "deepseek-v3": { provider: "deepseek", apiModel: "deepseek-chat", isFree: true },
  "grok-4": { provider: "openai", apiModel: "gpt-4o" }, // fallback to openai
  // Legacy IDs
  "gemini-2.0-flash": { provider: "google", apiModel: "gemini-2.0-flash", isFree: true },
  "gemini-1.5-flash": { provider: "google", apiModel: "gemini-1.5-flash", isFree: true },
  "gemini-1.5-pro": { provider: "google", apiModel: "gemini-1.5-pro" },
  "deepseek-r1": { provider: "deepseek", apiModel: "deepseek-reasoner", isFree: true, hasReasoning: true },
  "gpt-4o": { provider: "openai", apiModel: "gpt-4o" },
  "gpt-4o-mini": { provider: "openai", apiModel: "gpt-4o-mini" },
  "gpt-4-turbo": { provider: "openai", apiModel: "gpt-4-turbo" },
  "gpt-3.5-turbo": { provider: "openai", apiModel: "gpt-3.5-turbo" },
  "claude-3-5-sonnet": { provider: "anthropic", apiModel: "claude-3-5-sonnet-20241022" },
  "o3-mini": { provider: "openai", apiModel: "o3-mini" },
  "dall-e-3": { provider: "openai", apiModel: "dall-e-3" },
  // Video/image models -> not real API, return placeholder
  "kling-2.6-motion": { provider: "openai", apiModel: "gpt-4o-mini" },
  "kling-v3-motion": { provider: "openai", apiModel: "gpt-4o-mini" },
  "kling-2.6-text": { provider: "openai", apiModel: "gpt-4o-mini" },
  "kling-2.6-image": { provider: "openai", apiModel: "gpt-4o-mini" },
  "nano-banana-edit": { provider: "openai", apiModel: "gpt-4o-mini" },
};

async function callOpenAI(apiKey: string, model: string, messages: any[], stream: boolean): Promise<Response> {
  return retryFetch(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream, max_tokens: 4096 }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  });
}

async function callDeepSeek(apiKey: string, model: string, messages: any[], stream: boolean): Promise<Response> {
  return retryFetch(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream, max_tokens: 4096 }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  });
}

async function callGoogle(apiKey: string, model: string, messages: any[], stream: boolean): Promise<Response> {
  return retryFetch(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    // Convert OpenAI-style messages to Google format
    const systemMsg = messages.find(m => m.role === 'system');
    const convMessages = messages.filter(m => m.role !== 'system');
    
    const contents = convMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    const body: any = { contents };
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }
    
    const endpoint = stream 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  });
}

async function callAnthropic(apiKey: string, model: string, messages: any[], stream: boolean): Promise<Response> {
  return retryFetch(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    const systemMsg = messages.find(m => m.role === 'system')?.content;
    const convMessages = messages.filter(m => m.role !== 'system');
    
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: convMessages,
          max_tokens: 4096,
          ...(systemMsg ? { system: systemMsg } : {}),
          stream,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  });
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const projectId = Deno.env.get("BLINK_PROJECT_ID");
    const secretKey = Deno.env.get("BLINK_SECRET_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY") || "";
    const googleKey = Deno.env.get("GOOGLE_API_KEY") || "";
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") || "";

    if (!projectId || !secretKey) {
      return new Response(JSON.stringify({ error: "Missing config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional auth verification
    const blink = createClient({ projectId, secretKey });
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const auth = await blink.auth.verifyToken(authHeader);
      if (auth.valid) userId = auth.userId;
    }

    const { modelId, messages, guestCount } = await req.json();
    
    // Guest limit: max 3 messages without auth
    if (!userId) {
      const count = guestCount || 0;
      if (count >= 3) {
        return new Response(JSON.stringify({ error: "auth_required", message: "Необходимо войти для продолжения" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const config = MODEL_CONFIG[modelId];
    if (!config) {
      return new Response(JSON.stringify({ error: "Unknown model" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          let apiResponse: Response;

          if (config.provider === "openai") {
            if (!openaiKey) {
              send(JSON.stringify({ error: "OpenAI API key not configured" }));
              controller.close();
              return;
            }
            apiResponse = await callOpenAI(openaiKey, config.apiModel, messages, true);
          } else if (config.provider === "deepseek") {
            if (!deepseekKey) {
              send(JSON.stringify({ error: "DeepSeek API key not configured" }));
              controller.close();
              return;
            }
            apiResponse = await callDeepSeek(deepseekKey, config.apiModel, messages, true);
          } else if (config.provider === "google") {
            if (!googleKey) {
              send(JSON.stringify({ error: "Google API key not configured" }));
              controller.close();
              return;
            }
            apiResponse = await callGoogle(googleKey, config.apiModel, messages, true);
          } else if (config.provider === "anthropic") {
            if (!anthropicKey) {
              send(JSON.stringify({ error: "Anthropic API key not configured" }));
              controller.close();
              return;
            }
            apiResponse = await callAnthropic(anthropicKey, config.apiModel, messages, true);
          } else {
            send(JSON.stringify({ error: "Unknown provider" }));
            controller.close();
            return;
          }

          if (!apiResponse.ok) {
            const errText = await apiResponse.text();
            console.error("API error:", errText);
            send(JSON.stringify({ error: `API error: ${apiResponse.status}`, details: errText }));
            controller.close();
            return;
          }

          const reader = apiResponse.body?.getReader();
          if (!reader) {
            send(JSON.stringify({ error: "No response body" }));
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let reasoningContent = "";
          let mainContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                send(JSON.stringify({ type: "done", reasoning: reasoningContent }));
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (config.provider === "openai" || config.provider === "deepseek") {
                  const delta = parsed.choices?.[0]?.delta;
                  if (!delta) continue;

                  // DeepSeek-R1 has reasoning_content
                  if (delta.reasoning_content) {
                    reasoningContent += delta.reasoning_content;
                    send(JSON.stringify({ type: "reasoning", chunk: delta.reasoning_content }));
                  } else if (delta.content) {
                    mainContent += delta.content;
                    send(JSON.stringify({ type: "content", chunk: delta.content }));
                  }
                } else if (config.provider === "google") {
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    mainContent += text;
                    send(JSON.stringify({ type: "content", chunk: text }));
                  }
                } else if (config.provider === "anthropic") {
                  if (parsed.type === "content_block_delta") {
                    const text = parsed.delta?.text;
                    if (text) {
                      mainContent += text;
                      send(JSON.stringify({ type: "content", chunk: text }));
                    }
                  }
                }
              } catch (e) {
                // Ignore parse errors for non-JSON lines
              }
            }
          }

          // If no [DONE] was sent, send it now
          send(JSON.stringify({ type: "done", reasoning: reasoningContent }));

        } catch (err: any) {
          console.error("Stream error:", err);
          send(JSON.stringify({ error: err.message || "Stream failed" }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Handler error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
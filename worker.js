export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- PUBLIC COMPLIANCE & SPEC ROUTES ---

    // 1. Privacy Policy Page
    if (url.pathname === "/privacy" && request.method === "GET") {
      const html = `<!DOCTYPE html><html><head><title>Privacy Policy</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222;}</style></head><body><h1>Privacy Policy</h1><p>The Wardrobe & Stylist Connector stores clothing catalog details and outfit logs solely to provide contextual styling suggestions within Meta Muse.</p><p>We do not sell, rent, or distribute personal information to third parties. All clothing metadata is stored in encrypted cloud storage.</p><p>Contact: krish95k@gmail.com</p></body></html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // 2. Terms of Service Page
    if (url.pathname === "/terms" && request.method === "GET") {
      const html = `<!DOCTYPE html><html><head><title>Terms of Service</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222;}</style></head><body><h1>Terms of Service</h1><p>By connecting the Wardrobe & Stylist tool, you grant permission for the agent to index clothing metadata and retrieve wear logs.</p><p>The service is provided on an "as is" basis without warranty of any kind.</p><p>Contact: krish95k@gmail.com</p></body></html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // 3. OpenAPI 3.1.0 Specification
    if (url.pathname === "/openapi.json" && request.method === "GET") {
      const openapi = {
        openapi: "3.1.0",
        info: {
          title: "Personal Wardrobe & Stylist Connector",
          description: "Allows Meta Muse to catalog clothing, retrieve items, delete items, and log worn outfits.",
          version: "1.1.0"
        },
        servers: [{ url: url.origin }],
        paths: {
          "/items": {
            get: {
              summary: "Get wardrobe items",
              operationId: "getWardrobeItems",
              parameters: [
                { name: "user_id", in: "query", required: true, schema: { type: "string" } },
                { name: "formality", in: "query", schema: { type: "string" } },
                { name: "category", in: "query", schema: { type: "string" } }
              ],
              responses: { 200: { description: "List of clothing items" } }
            },
            post: {
              summary: "Save a new clothing item",
              operationId: "addClothingItem",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["user_id", "category", "sub_category", "color_primary", "formality"],
                      properties: {
                        user_id: { type: "string" },
                        category: { type: "string" },
                        sub_category: { type: "string" },
                        color_primary: { type: "string" },
                        material: { type: "string" },
                        formality: { type: "string" }
                      }
                    }
                  }
                }
              },
              responses: { 201: { description: "Item saved successfully" } }
            },
            delete: {
              summary: "Delete a clothing item",
              operationId: "deleteClothingItem",
              parameters: [
                { name: "id", in: "query", required: true, schema: { type: "string" } }
              ],
              responses: { 200: { description: "Item deleted successfully" } }
            }
          },
          "/outfits": {
            post: {
              summary: "Log an outfit worn",
              operationId: "logOutfitWorn",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["user_id", "item_ids"],
                      properties: {
                        user_id: { type: "string" },
                        item_ids: { type: "array", items: { type: "string" } },
                        event_name: { type: "string" }
                      }
                    }
                  }
                }
              },
              responses: { 201: { description: "Outfit logged" } }
            }
          }
        }
      };
      return new Response(JSON.stringify(openapi, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // --- BEARER TOKEN AUTHENTICATION ---
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.API_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const headers = {
      "apikey": env.SUPABASE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };

    // --- REST ENDPOINTS ---

    // GET /items
    if (url.pathname === "/items" && request.method === "GET") {
      const userId = url.searchParams.get("user_id") || "me";
      let queryUrl = `${env.SUPABASE_URL}/rest/v1/wardrobe_items?user_id=eq.${userId}&order=last_worn_at.asc.nullsfirst`;
      
      const formality = url.searchParams.get("formality");
      if (formality) queryUrl += `&formality=eq.${formality}`;

      const res = await fetch(queryUrl, { headers });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /items
    if (url.pathname === "/items" && request.method === "POST") {
      const payload = await request.json();
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/wardrobe_items`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }

    // DELETE /items
    if (url.pathname === "/items" && request.method === "DELETE") {
      const itemId = url.searchParams.get("id");
      if (!itemId) {
        return new Response(JSON.stringify({ error: "Item ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/wardrobe_items?id=eq.${itemId}`, {
        method: "DELETE",
        headers
      });
      return new Response(JSON.stringify({ message: "Item deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /outfits
    if (url.pathname === "/outfits" && request.method === "POST") {
      const payload = await request.json();
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/outfit_logs`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ message: "Wardrobe Connector Active" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

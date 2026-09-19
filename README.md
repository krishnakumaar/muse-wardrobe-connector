# Wardrobe & Stylist Agent Connector for Meta Muse

A serverless connector enabling Meta Muse agents to index personal clothing, retrieve recommendations based on formality/climate, track outfit wear history, and serve compliance endpoints.

## Architecture
- **Agent Platform:** Meta Muse (tool-calling via OpenAPI 3.1)
- **Edge Compute:** Cloudflare Workers (sub-100ms routing & security middleware)
- **Database:** Supabase (PostgreSQL with PostgREST auto-generated REST API)

---

## Setup & Deployment Guide

### 1. Database Provisioning (Supabase)
1. Create a free database project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab and execute all commands from `schema.sql`.
3. In **Project Settings** → **API**, copy:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **Service Role Key** (`sb_secret_...` or service role JWT)

### 2. Edge API Deployment (Cloudflare Workers)
1. In [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**, create an application named `wardrobe-connector`.
2. Go to **Settings** → **Variables and Secrets** and configure:
   - `SUPABASE_URL` (Plain text variable): Your Supabase Project URL
   - `SUPABASE_KEY` (Secret): Your Supabase Secret Key
   - `API_SECRET` (Secret): A secure bearer token phrase for agent auth
3. Open the code editor, paste the contents of `worker.js`, and hit **Deploy**.

---

## API Endpoints

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/openapi.json` | OpenAPI 3.1 JSON schema for Muse discovery | Public |
| `GET` | `/privacy` | Public HTML Privacy Policy page | Public |
| `GET` | `/terms` | Public HTML Terms of Service page | Public |
| `GET` | `/items` | List items filtered by `formality` & `category` | Bearer Auth |
| `POST` | `/items` | Add clothing item parsed from user prompt/image | Bearer Auth |
| `DELETE` | `/items?id={id}` | Delete item from wardrobe | Bearer Auth |
| `POST` | `/outfits` | Log an ensemble combination | Bearer Auth |

---

## Meta Muse Registration
1. Navigate to the Meta Muse Developer Portal → **Add Connector** → **Raw API**.
2. Set **API URL** to `https://<your-worker>.workers.dev`.
3. Set **OpenAPI URL** to `https://<your-worker>.workers.dev/openapi.json`.
4. Select **API Key / Bearer** authentication and supply your `API_SECRET`.

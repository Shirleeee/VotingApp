import { serve } from "https://deno.land/std@0.156.0/http/server.ts";
import { handleRequest } from "./src/app.js";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

const env_selfmade = await load({ export: true, path: ".env" });

Deno.env.set("PORT", env_selfmade.PORT);

await serve(handleRequest, { port: env_selfmade.PORT });

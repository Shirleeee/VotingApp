
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
const env_selfmade = await load({ export: true, path: "./.env" });



module.exports = {
  apps: [
    {
      name: "Publikumspreis",
      script:
        "deno run --allow-net --allow-read --allow-env --allow-write --watch server.js",

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        ENV: "production",
        DEBUG: "*",
        PORT: env_selfmade.PORT,
      },
      error_file: "../log/error.log",
      out_file: "../log/out.log",
      merge_logs: true,
    },
  ],
};

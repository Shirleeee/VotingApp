import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

  const client = await new Client();

const env_selfmade = await load({ export: true, path: "./.env" });
///!Server
// client.connect({
//   hostname: "127.0.0.1",
//   username: env_selfmade.DB_USER,
//   password: env_selfmade.DB_PW,
//   db: env_selfmade.DB_NAME,
//   idleTimeout: "0",
// });

// /!localer Server
 client.connect({
  hostname: "localhost",
  username: "root",
  password: "",
  db: "kft_thesis",
  idleTimeout: "0",
 timeout: 5000, 
});

export default client;

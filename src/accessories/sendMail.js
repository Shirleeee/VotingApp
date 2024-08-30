//  const { USERNAME, PWD, HOSTNAME } = Deno.env.toObject();
import * as mod from "https://deno.land/std@0.224.0/dotenv/mod.ts";
const env_selfmade = await mod.load({ export: true, path: "./.env" });
// import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import "https://deno.land/x/dotenv/load.ts";
Deno.env.set("HOSTNAME", env_selfmade.HOSTNAME);
export default function () {
  return {
    send_mail: async (html='<h1>test</h1>',to="shirley_lein@posteo.de",subject="test") => {


      
      const client = new SMTPClient({
        connection: {
          hostname: env_selfmade.HOSTNAME,
          port: 465,
          tls: true,
          auth: {
            username: env_selfmade.USERNAME,
            password: env_selfmade.PWD,
          },
        },
      });

      //   await client.connectTLS(connectConfig);

      await client.send({
        from: "kft-voting@filmkorte.de",
        to: to,
        subject: subject,
        content: "...",
        html: html,
      });
      

      await client.close();
    },
  };
}

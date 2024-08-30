import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
// Funktioniert nur wenn python installiert ist
// https://stackoverflow.com/questions/61710787/how-to-run-a-python-script-from-deno

import { to } from "./qrcode.js";


Deno.test(
  "processElements should generate QR codes for elements with id ",
  async () => {
    const command = new Deno.Command("python", {
      args: ["qrcodeGen/scanQRCode.py"],
    });
    const { stdout } = await command.output();

    const encodedQRCodes = new TextDecoder()
      .decode(stdout)
      .replace(/\r/g, "")
      .trim()
      .split("\n");

    let arr = [];
    // open the file and read the content
    const file = await Deno.open("urls.csv");
    const decoder = new TextDecoder();
    const content = decoder.decode(await Deno.readAll(file));
    const lines = content
      .split("\n")
      .slice(1)
      .filter((line) => line);
    const passwords = lines.map((line) => {
      return line.split(",")[1];
    });

    for (const element of encodedQRCodes) {
      console.log("🚀 ~ element:", element)
      const splittedUrl = element.split("/");
      arr.push(splittedUrl[splittedUrl.length - 1]);

      assertEquals(
        passwords.includes(arr[0]),
        true
      );
    }

    Deno.close(file.rid);
  }
);

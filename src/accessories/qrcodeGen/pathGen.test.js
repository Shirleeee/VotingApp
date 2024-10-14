// import { makeQRCodeList } from "./pathGen.js";


import {
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "https://deno.land/std/testing/asserts.ts";

Deno.test(
  "makeQRCodeList should generate the correct passwords, location and amount",
  async (t) => {
    // const lengthList = 1350;
    // const lengthPass = 8;
    // const lengthBlock = 170;
    // const lengthBlockPIL = 50;

    // await makeQRCodeList(lengthList, lengthPass, lengthBlock, lengthBlockPIL);

    await t.step("check right length of generated urls", async () => {
      const file = await Deno.open("./qrcodeGen/urls.csv");

      const decoder = new TextDecoder();
      const content = decoder.decode(await Deno.readAll(file));
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line);

      const generatedPasswords = lines.map((line) => line.split(",")[1]);

      assertEquals(generatedPasswords.length, 1570);
      Deno.close(file.rid);
    });

    await t.step("check length for blocks", async () => {
      const file = await Deno.open("./qrcodeGen/urls.csv");
      const decoder = new TextDecoder();
      const content = decoder.decode(await Deno.readAll(file));
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line);

      const blocks = [
        "wb1",
        "wb2",
        "wb3",
        "wb4",
        "wb5",
        "wb6",
        "wbt",
        "wbp",
        "wbd",
      ];
      const blocksChecked = lines.map((line) => {
        return line.split(",")[6].trim();
      });

      for (const block of blocks) {
      
        const blockCount = blocksChecked.filter((b) => b === block).length;
        if (block === "wbp" || block === "wbd") {

          assertEquals(blockCount, 120);
        } else {

          assertEquals(blockCount, 190);
        }
      }
      Deno.close(file.rid);
    });
    await t.step("check length for location", async () => {
      const file = await Deno.open("./qrcodeGen/urls.csv");
      const decoder = new TextDecoder();
      const content = decoder.decode(await Deno.readAll(file));
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line);

      const locations = ["Pil", "Deu"];

      const deuBlocks = 120 * 9;
      const pilBlocks = 70 * 7;

      const locationChecked = lines.map((line) => {
        return line.split(",")[3];
      });
      for (const location of locations) {
        if (location === "Pil") {
          const locationCount = locationChecked.filter(
            (l) => l === location
          ).length;
          assertEquals(locationCount, pilBlocks);
          // continue;
        }
        if (location === "Deu") {
          const locationCount = locationChecked.filter(
            (l) => l === location
          ).length;
          assertEquals(locationCount, deuBlocks);
        }
      }
      Deno.close(file.rid);
    });

    await t.step("check for all not used = 0", async () => {
      const file = await Deno.open("./qrcodeGen/urls.csv");
      const decoder = new TextDecoder();
      const content = decoder.decode(await Deno.readAll(file));
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line);
      const usedCheck = lines.map((line) => {
        return line.split(",")[2];
      });
      const usedCount = usedCheck.filter((u) => u === "0").length;
      assertEquals(usedCount, 1570);
      Deno.close(file.rid);
    });

    await t.step("check password format", async () => {
    const file = await Deno.open("./qrcodeGen/urls.csv");
      const decoder = new TextDecoder();
      const content = decoder.decode(await Deno.readAll(file));
      const lines = content
        .split("\n")
        .slice(1)
        .filter((line) => line);

      const passwords = lines.map((line) => {
        return line.split(",")[1];
      });
      for (const password of passwords) {
        const regex = /^QRvote\w{12}$/;
        assertMatch(password, new RegExp(regex));

        const regexSpecial = /[^\w\s]/;
        assertNotMatch(password, new RegExp(regexSpecial));
      }
      Deno.close(file.rid);
    });
  }
);

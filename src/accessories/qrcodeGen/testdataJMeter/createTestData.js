//  const url = "https://randomuser.me/api/?results=1570&inc=name,email&format=csv&dl";
import { parse as parseCsv } from "https://deno.land/std@0.82.0/encoding/csv.ts";

import filmModel from "./../../src/db/models/films.js";
import blockModel from "./../../src/db/models/blocks.js";

import * as client from "./../../src/db/client.js";
// https://blog.octoperf.com/mastering-jmeter-csv-data-set-config/

const content = await parseCsv(await Deno.readTextFile("download.csv"), {
  skipFirstRow: true,
});
const contentPathnames = await parseCsv(await Deno.readTextFile("./urls.csv"), {
  skipFirstRow: true,
});
const encoder = new TextEncoder();

// console.log(content);

/**
 * Retrieves all the blocks and their corresponding film IDs from the database.
 * @returns {Promise<Array<Object>>} An array of objects containing the block name and the number of films in each block.
 */
const getAllTheBlocks = async () => {
  const allBlocks = await blockModel().get_all_blocks(client.default);
  // console.log("🚀 ~ getAllTheBlocks ~ allBlocks:", allBlocks);

  let objArray = [];
  for (const ele of allBlocks) {
    // console.log("🚀 ~ getAllTheBlocks ~ ele:", ele);
    const filmsIdbyBlock = {};

    const lengthblock = await filmModel().get_all_blockIds_by_block(
      client.default,
      `${ele.block}`
    );
    // console.log("🚀 ~ getAllTheBlocks ~ lengthblock:", lengthblock.length);

    filmsIdbyBlock.block = ele.block;
    filmsIdbyBlock.length = lengthblock.length;
    objArray.push(filmsIdbyBlock);
  }

  return objArray;
};

/**
 * Creates test data by writing URLs, names, and emails to separate CSV files.
 * @returns {Promise<void>} A promise that resolves when the test data is created.
 */
const createTestdata = async () => {
  const allTheBlocks = await getAllTheBlocks();

  await Deno.writeTextFile("test_urls.csv", "");
  await Deno.writeTextFile("test_names.csv", "");
  await Deno.writeTextFile("test_mails.csv", "");

  let file_testurls = await Deno.open("test_urls.csv", {
    write: true,
    create: true,
    truncate: true,
  });
  let file_testnames = await Deno.open("test_names.csv", {
    write: true,
    create: true,
    truncate: true,
  });
  let file_testmails = await Deno.open("test_mails.csv", {
    write: true,
    create: true,
    truncate: true,
  });

  for (let i = 0; i < contentPathnames.length; i++) {
    const elementPath = contentPathnames[i];
    const elementContent = content[i];

    if (elementPath && elementContent) {
      for (const ele of allTheBlocks) {
        if (ele.block === elementPath.block) {
          const rowurl = `${elementPath.pathname}\n`;
          await Deno.write(file_testurls.rid, encoder.encode(rowurl));

          const rowname = `${elementContent.first} ${elementContent.last}\n`;
          await Deno.write(file_testnames.rid, encoder.encode(rowname));

          const rowmail = `${elementContent.email}\n`;
          await Deno.write(file_testmails.rid, encoder.encode(rowmail));
        }
      }
    }
  }

  Deno.close(file_testmails.rid);
  Deno.close(file_testnames.rid);
  Deno.close(file_testurls.rid);
};

createTestdata();

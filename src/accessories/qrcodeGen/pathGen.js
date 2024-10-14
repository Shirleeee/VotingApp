import { randomNumber } from "https://deno.land/x/random_number/mod.ts";
import filmModel from "./../src/db/models/films.js";
import blockModel from "./../src/db/models/blocks.js";
import { encode as base64Encode } from "https://deno.land/std@0.203.0/encoding/base64.ts";
import csrf from "./../src/accessories/csrf.js";
import * as client from "./../src/db/client.js";


const countAllBlocks = 9;
const lengthBlocks = 190;

const lengthList = lengthBlocks * countAllBlocks;

const lengthPassword = 12;
const lengthBlockPIL = 70;
// const lengthBlockDEU = 120;
makeQRCodeList(lengthList, lengthPassword, lengthBlocks, lengthBlockPIL);

/**
 * Shuffles the elements of an array randomly.
 * @param {Array} item - The array to be shuffled.
 * @returns {Array} - The shuffled array.
 */
function shuffle(item) {
  const itemClone = item;
  const result = [];
  while (itemClone.length > 0) {
    const index = randomNumber({ min: 0, max: itemClone.length });
    result.push(itemClone[index]);
    itemClone.splice(index, 1);
  }
  //   console.log("🚀 ~ shuffle ~ result:", result);

  return result;
}
/**
 * Creates sublists of a given password list.
 *
 * @param {Array} passList - The list of passwords.
 * @param {number} lengthBlocks - The length of each sublist.
 * @param {number} lengthPass - The number of sublists to create.
 * @returns {Array} - An array of sublists.
 */
function createSubLists(passList, lengthBlocks, lengthPass) {
  let passAux = [...passList];
  let passwords = [];
  for (let i = 0; i < lengthPass + 1; i++) {
    let pas = passAux.splice(0, lengthBlocks);
    passwords.push(pas);
  }

  return passwords;
}
/**
 * Replaces special characters in a string with the letter 'z'.
 * @param {string} str - The input string.
 * @returns {string} - The modified string with special characters replaced by 'z'.
 */
function replaceSpecialCharacters(str) {
  const regex = /[^a-zA-Z0-9]/g;
  return str.replace(regex, "z");
}


/**
 * Generates a random password of the specified length.
 * @param {number} length - The length of the password to generate.
 * @returns {string} The generated password.
 */
function generatePassword(length) {  
  let letters = csrf().generate_token();
  let result = Array.from(replaceSpecialCharacters(letters));

  result = result.slice(0, length);

  // console.log("🚀 ~ generateStrongPassword ~BFORE  result:", result);
  result = shuffle(result);
  // console.log("🚀 ~ generateStrongPassword ~AFTER  result:", result);
  return result.join("");
}


/**
 * Generates a list of QR codes with corresponding passwords and saves them to a CSV file.
 * @param {number} lengthList - The length of the list of QR codes to generate.
 * @param {number} lengthPass - The length of each password for the QR codes.
 * @param {number} lengthBlocks - The number of blocks to divide the passwords into.
 * @param {number} lengthBlockPIL - The number of passwords to assign to each block before moving to the next block.
 * @returns {Promise<void>} - A promise that resolves when the QR codes are generated and saved.
 */

export async function makeQRCodeList(
  lengthList,
  lengthPass,
  lengthBlocks,
  lengthBlockPIL
) {
  let count = 1;

  let passList = [];
  const times = lengthList;

  for (let i = 0; i < times; i++) {
    passList.push(`QRvote${generatePassword(lengthPass)}`);
  }
  // console.log("🚀 ~ makeQRCodeList ~ passList:", passList);

  const passwords = createSubLists(passList, lengthBlocks, lengthPass);

  // console.log("🚀 ~ makeQRCodeList ~ passwords:", passwords)

  const encoder = new TextEncoder();

  await Deno.writeTextFile("urls.csv");

  const allBlocks = await blockModel().get_all_blocks(client.default);

  let i = 0;
  const nulls = "00:00:00";
  let csvRows = [];

  for (const ele of allBlocks) {
    for (let j = 0; j < lengthBlockPIL; j++) {
      if (ele.block === "wbd" || ele.block === "wbp") {
        break;
      }
      csvRows.push(
        `${count},${passwords[i][j]},0,Pil,${nulls},${nulls},${ele.block},`
      );

      count++;
    }
    for (let k = lengthBlockPIL; k < lengthBlocks; k++) {
      csvRows.push(
        `${count},${passwords[i][k]},0,Deu,${nulls},${nulls},${ele.block},`
      );
      count++;
    }
    i++;
  }
  // csvRows = shuffle(csvRows);

  const file = await Deno.open("urls.csv", {
    write: true,
    create: true,
    truncate: true,
  });

  await Deno.write(
    file.rid,
    encoder.encode(
      "urlid,pathname,used,location,timestamp_called,timestamp_send,block,time\n"
    )
  );
  for (const row of csvRows) {
    await Deno.write(file.rid, encoder.encode(row + "\n"));
  }

  Deno.close(file.rid);
}

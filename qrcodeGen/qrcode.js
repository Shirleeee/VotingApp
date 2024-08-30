import { parse as parseCsv } from "https://deno.land/std@0.82.0/encoding/csv.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import blockModel from "./../src/db/models/blocks.js";
//https://medium.com/deno-the-complete-reference/generate-qr-code-in-deno-using-google-api-ff07c6b9e99d
import * as client from "./../src/db/client.js";
// deno run --allow-net --allow-read --allow-write --allow-env qrcode.js

const from = 1;
export const to = 150;
const size = 300;

const content = await parseCsv(await Deno.readTextFile("./urls.csv"), {
  skipFirstRow: true,
  columns: [
    "id",
    "pathname",
    "used",
    "location",
    "timestamp_called",
    "timestamp_send",
    "block",
    "time"
  ],
});
await processElements(content, from, to, size);

/**
 * Generates a QR code image using the Google Charts API and saves it to a file.
 *
 * @param {string} folder - The directory where the QR code image will be saved.
 * @param {string} filename - The name of the QR code image file.
 * @param {string} url - The URL to be encoded in the QR code.
 * @param {number} size - The size of the QR code image in pixels.
 * @param {number} [retries=5] - The number of times to retry the operation if there is an error.
 * @returns {Promise<void>} - A Promise that resolves when the QR code image has been saved.
 */
async function generateQR(folder, filename, url, size, retries = 5) {
  const qp = new URLSearchParams({
    size: `${size}x${size}`,
    data: `${url}`,
  });
  try {
    const res = await fetch(
      "https://api.qrserver.com/v1/create-qr-code/?" + qp
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    if (res.status === 200 && res.body) {
      await ensureDir(folder);
      const qrFile = await Deno.open(`./${folder}/${filename}`, {
        create: true,
        write: true,
      });

      res.body.pipeTo(qrFile.writable);
    }
  } catch (error) {

    if (retries > 0) {
      // Wait before retrying - Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, (5 - retries) ** 2 * 1000)
      );

      await generateQR(filename, url, size, retries - 1);
    }
  }
}

/**
 * Processes a collection of elements, generating QR codes for each element that falls within the specified range.
 *
 * @param {Object[]} content - An array of content elements to process.
 * @param {number} from - The lower bound of the ID range to process.
 * @param {number} to - The upper bound of the ID range to process.
 * @param {number} size - The size of the QR code image in pixels.
 * @returns {Promise<void>} - A Promise that resolves when all QR codes have been generated.
 */
async function processElements(content, from, to, size) {
  // console.log("🚀 ~ processElements ~ content:", content);
  const alltheBlocks = await blockModel().get_all_blocks(client.default);

  for (const element of content) {
    let id = parseInt(`${element.id}`);

    if (id >= from && id <= to) {
      for (const value of alltheBlocks) {
        if (element.location === "Pil") {
          if (value.block === element.block) {
            const filename = `${element.id}-${element.location}-${element.block}.png`;
            await generateQR(
              `qrCodes${element.location}-${element.block}`,
              filename,
              `https://publikumspreis.filmkorte.de/vote/${element.pathname}`,
              size
            );
          }
        }
        if (element.location === "Deu") {
          if (value.block === element.block) {
            const filename = `${element.id}-${element.location}-${element.block}.png`;
            await generateQR(
              `qrCodes${element.location}-${element.block}`,
              filename,
              `https://publikumspreis.filmkorte.de/vote/${element.pathname}`,
              size
            );
          }
        }
      }
    }
  }
}

import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";

// https://medium.com/swlh/how-to-create-and-modify-pdf-files-in-deno-ffaad7099b0

const from = 1;
const to = 100;
const size = 100;

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89; //in points
const MARGIN = 20; // Margin around the QR codes
const QR_CODES_PER_PAGE = 24;

/**
 * Creates a PDF document by embedding QR codes from the specified folder.
 * @param {string} folder - The path to the folder containing the QR code images.
 * @returns {Promise<void>} - A promise that resolves when the PDF document is created.
 */
async function createPDF(folder) {
  console.log("🚀 ~createPDFPil folder:", folder);
  const fileNames = [];

  for await (const dirEntry of Deno.readDir(folder)) {
    if (dirEntry.isFile) {
      fileNames.push(dirEntry.name);
    }
  }
  console.log("🚀 ~ createPDFPil ~ fileNames:", fileNames.length);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  let x = MARGIN;
  let y = A4_HEIGHT - size - MARGIN;
  let qrCodeCounter = 0;
  let pageNumber = 1;

  for (let i = 0; i < fileNames.length; i++) {
    const qrCodePath = fileNames[i];

    try {
      const qrImageBytes = await Deno.readFile(`${folder}/${qrCodePath}`);

      const qrImage = await pdfDoc.embedPng(qrImageBytes);

      if (qrCodeCounter >= QR_CODES_PER_PAGE) {
        // Neue Seite beginnen, wenn die maximale Anzahl von QR-Codes pro Seite erreicht ist
        pageNumber++;
        if (pageNumber > Math.ceil(fileNames.length / QR_CODES_PER_PAGE)) {
          // Stoppen, wenn alle QR-Codes platziert wurden
          break;
        }
        const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        x = MARGIN;
        y = A4_HEIGHT - size - MARGIN;
        qrCodeCounter = 0;
      }

      const currentPage = pdfDoc.getPage(pageNumber - 1);
      currentPage.drawImage(qrImage, {
        x: x,
        y: y,
        width: size,
        height: size,
      });

      x += size + MARGIN;
      qrCodeCounter++;

      if (x + size + MARGIN > A4_WIDTH) {
        x = MARGIN;
        y -= size + MARGIN;
      }
    } catch (error) {
      console.error(`Error reading QR code file ${qrCodePath}:`, error);
    }
  }
  const outputPDF = `${folder}.pdf`;
  const pdfBytes = await pdfDoc.save();
  await Deno.writeFile(outputPDF, pdfBytes);
}



/**
 * Retrieves the names of folders in a directory that match a specific location.
 * @param {string} dir - The directory path.
 * @param {string} location - The location to match in folder names.
 * @returns {Promise<string[]>} - A promise that resolves to an array of folder names.
 */
const getFolderinDir = async (dir, location) => {
  const dirNames = [];

  for await (const dirEntry of Deno.readDir(dir)) {
    if (dirEntry.isDirectory && dirEntry.name.includes(location)) {
      dirNames.push(dirEntry.name);
    }
  }

  return dirNames;
};

/**
 * This function performs some asynchronous operations.
 * It gets the folders in the current directory with the name "Pil" and "Deu",
 * creates PDFs for each folder, and logs the success or error messages.
 * @returns {Promise<void>} A promise that resolves when all operations are completed.
 */
const createPDFFromFolders = async () => {
  const getPilFolders = await getFolderinDir("./", "Pil");
  console.log("🚀 ~ getPilFolders:", getPilFolders);

  for (const folder of getPilFolders) {
    createPDF(folder)
      .then(() => {
        console.log("PDF created successfully");
      })
      .catch((err) => {
        console.error("Error creating PDF", err);
      });
  }

  const getDeuFolders = await getFolderinDir("./", "Deu");
  console.log("🚀 ~ getDeuFolders:", getDeuFolders);
  for (const folder of getDeuFolders) {
    createPDF(folder)
      .then(() => {
        console.log("Deu PDF created successfully");
      })
      .catch((err) => {
        console.error("Error creating Deu PDF", err);
      });
  }
};

createPDFFromFolders();

import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.170.0/media_types/mod.ts";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

const debug = Debug("app:dataHandling");
export default function () {
  return {
    removeDataFromDirectory: (path) => {
      if ("http" === path.substr(0, 4)) {
        return;
      }

      Deno.remove(`./public/${path}`);
      debug("@removeDataFromDirectory() ---> path  %O", path);
    },
    generateFilename: (file, pathToFile) => {
      return path.join(
        pathToFile,
        crypto.randomUUID() + "." + mediaTypes.extension(file.type)
      );
    },
    addFileExtension: (filename) => {
      // debug("@addFileExtension  filename filename --->", filename);

      const splitedFilebyDot = filename.split(".");
      return splitedFilebyDot[0] + "." + "glb";
    },
    checkIfFileExists: async (filePath) => {
      try {
        await Deno.stat(`./public/${filePath}`);	
        return true;
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return false;
        } else {
          throw error;
        }
      }
    },
  };
}

// export function checkAvatarFile(pathToFile) {
//   let urlToFile;
//   const part = pathToFile.substr(0, 4);
//   if ("http" === part) {
//     // debug("@profileOtherUser. -------pathToFile.avatar == part ???", part);
//     urlToFile = pathToFile;
//   }
//   // debug("@addFileExtension  filename filename --->", urlToFile);
//   return urlToFile;
// }

// export function createCommentObjectArray(commentsArray) {
//   let obj;
//   let comments = [];
//   for (const row of commentsArray) {
//     obj = {
//       id: row[0],
//       userId: row[1],
//       commentText: row[2],
//       releasedDate: row[3].slice(0, 16).split("T"),
//       assetId: row[4],
//       author: row[5],
//     };
//     comments.push(obj);
//   }

//   return comments;
// }
// export function createAssetObjectArray(assetArray) {
//   let objectAsset = [];

//   for (let i = 0; i < assetArray.length; i++) {
//     let objTest = {};
//     objTest.datapaths = assetArray[i][3];
//     objTest.names = assetArray[i][1];
//     objTest.sizes = assetArray[i][2];
//     objTest.id = assetArray[i][0];
//     objectAsset.push(objTest);
//   }

//   return objectAsset;
// }
// export function createDatapathArray(assetArray) {
//   const datapathsArr = [];
//   for (const row of assetArray) {
//     datapathsArr.push(row[3]);
//   }

//   return datapathsArr;
// }

// export function deleteEverythingFromEverywhere(ctx, user) {
//   removeDataFromDirectory(user.avatar);

//   const alreadyLikedArray = likesModel.allAlreadyLikedByUserIdArray(
//     ctx.db,
//     user.id,
//   );
//   debug("@submitDeleteUser...self delete --->", alreadyLikedArray);
//   for (const row of alreadyLikedArray) {
//     likesModel.deleteAssetsAlreadyLikedDB(ctx.db, row[1]);
//   }
//   const assetArray = assetModel.allAssetsByUserIdArray(ctx.db, user.id);
//   debug("@submitDeleteUser...self delete --->", assetArray);
//   for (const row of assetArray) {
//     removeDataFromDirectory(row[3]);
//   }
//   userModel.deleteUserFromDB(ctx.db, user.id);
//   assetModel.deleteAllAssetsByUserIdArray(ctx.db, user.id);
//   sessions.deleteAllSessionsCookiesTokens(ctx);
// }

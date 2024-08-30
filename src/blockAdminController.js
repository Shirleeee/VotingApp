import blockModel from "./db/models/blocks.js";
import filmModel from "./db/models/films.js";
import * as mediaTypes from "https://deno.land/std@0.170.0/media_types/mod.ts";

import * as path from "https://deno.land/std@0.152.0/path/posix.ts";
import participantsModel from "./db/models/participants.js";
import feedbackModel from "./db/models/feedback.js";

import * as calc from "./accessories/calculations.js";

import csrf from "./accessories/csrf.js";
import dataHand from "./accessories/dataHandling.js";

import valid from "./accessories/validation.js";
import blocks from "./db/models/blocks.js";

export async function deleteBlock(ctx) {
  // console.log("🚀 ~ deleteBlock ~ ctx:", ctx)
  const userAuth = ctx.state.authenticated;
  console.log("🚀 ~ deleteBlock ~ userAuth:", userAuth);

  if (userAuth) {
    const formData = await ctx.request.formData();
    console.log("🚀 ~ deleteBlock ~ formData:", formData);

    const dataForm = {
      _csrf: formData.get("_csrf"),
    };
    csrf().check_token(ctx, "tokenBlock", dataForm._csrf, "/error");
    const deleted = await blockModel().delete_by_id(
      ctx.db,
      Number(ctx.params.id)
    );

    const lastUrl = ctx.request.headers.referer;
    console.log("🚀 ~ deleteBlock ~ lastUrl:", lastUrl);
    ctx.redirect = Response.redirect(ctx.url.origin + "/WBBoverview", 303);
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }
  return ctx;
}
//! ADD BLOCK
export async function addNewBlock(ctx) {
  const userAuth = ctx.state.authenticated;

  if (userAuth) {
    const token = csrf().generate_token();
    ctx.token.set("tokenAddNewBlocks", token);
    const userid = ctx.session.user.id;
    const actualBlocks = await blockModel().get_all_blocks_content(ctx.db);
    const numArray = actualBlocks.map((block) => block.id);

    const max = Math.max(...numArray);
    console.log(max); // 5

    ctx.response.body = ctx.nunjucks.render("newBlock.html", {
      blockid: max + 1,
      form: { _csrf: token },
      userAuth: userAuth,
      headerBlock: "headerEva",
      userid: userid,
      role: ctx.session.user.role,
    });

    ctx.response.status = 200;
    ctx.response.headers["Content-type"] = "text/html; charset=utf-8";
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }
  return ctx;
}
export async function submitAddNewBlock(ctx) {
  const userAuth = ctx.state.authenticated;
  console.log("🚀 ~ submitAddNewBlock ~ userAuth:", userAuth);

  if (userAuth) {
    const formData = await ctx.request.formData();
    console.log("🚀 ~ submitAddNewBlock ~ formData:", formData);

    const data = {
      id: formData.get("id"),
      block: formData.get("block"),
      blocktitle: formData.get("blocktitle"),
      blocksubline: formData.get("blocksubline"),
      _csrf: formData.get("_csrf"),
    };

    csrf().check_token(ctx, "tokenAddNewBlocks", data._csrf, "/error");
    const userid = ctx.session.user.id;
    const errors = await valid().validateBlocks(ctx, data);

    if (Object.values(errors).length > 0) {
      console.log("🚀 ~ submitAddNewBlock ~ errors:", errors);
      // const allBlocksContent = await blockModel().get_all_blocks_content(
      //   ctx.db
      // );

      ctx.response.body = ctx.nunjucks.render("newBlock.html", {
        data: data,
        errors: errors,
        userAuth: userAuth,
        userid: userid,
        role: ctx.session.user.role,
        headerEva: "headerEva",
      });

      ctx.response.status = 200;
      ctx.response.headers["content-type"] = "text/html";
      return ctx;
    }
    await blockModel().add_to_DB(ctx.db, data);
    ctx.redirect = Response.redirect(ctx.url.origin + "/WBBoverview", 303);
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }
  return ctx;
}

export async function changeBlock(ctx) {
  const userAuth = ctx.state.authenticated;
  console.log(
    "🚀 ~ changeBlock ~ ctx.session.user.role:",
    ctx.session.user.role
  );

  if (userAuth && ctx.session.user.role == "admin") {
    const formData = await ctx.request.formData();
    console.log("🚀 ~ changeBlock ~ formData:", formData);

    const dataForm = {
      id: formData.get("id"),
      block: formData.get("block"),
      blocktitle: formData.get("blocktitle"),
      blocksubline: formData.get("blocksubline"),
      PIL: formData.get("PIL"),
      DEU: formData.get("DEU"),
      _csrf: formData.get("_csrf"),
    };
    const userid = ctx.session.user.id;

    csrf().check_token(ctx, "tokenBlock", dataForm._csrf, "/error");

    const errors = await valid().validateBlocks(ctx, dataForm);

    if (Object.values(errors).length > 0) {
      const allBlocks = await blockModel().get_all_blocks_content(ctx.db);

      ctx.response.body = ctx.nunjucks.render("WBBoverview.html", {
        data: dataForm,
        errors: errors,
        userAuth: userAuth,
        userid: userid,
        allBlocks: allBlocks,
        role: ctx.session.user.role,
        headerEva: "headerEva",
      });

      ctx.response.status = 200;
      ctx.response.headers["content-type"] = "text/html";
      return ctx;
    }
    const newLine = await blockModel().update_by_id(
      ctx.db,
      dataForm,
      Number(ctx.params.id)
    );
    ctx.redirect = Response.redirect(ctx.url.origin + "/WBBoverview", 303);
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }
  return ctx;
}

//! ADD FILM
export async function addBlockDetails(ctx) {
  const userAuth = ctx.state.authenticated;
  if (userAuth && ctx.session.user.role === "admin") {
    const allBlocks = await blockModel().get_all_blocks_content(ctx.db);
    const id = ctx.params.id;
    const userid = ctx.session.user.id;

    const token = csrf().generate_token();

    ctx.token.set("tokenAddblockDetails", token);
    const block = await blockModel().get_block_by_id(ctx.db, id);
    const filmsbyBlock = await filmModel().get_all_films_by_block(
      ctx.db,
      block[0].block
    );

    if (filmsbyBlock.length > 0) {
      // console.log("🚀 ~ addBlockDetails ~ filmsbyBlock:", filmsbyBlock);

      ctx.response.body = ctx.nunjucks.render("blockDetails.html", {
        userAuth: userAuth,
        userid: userid,
        show: true,
        filmss: filmsbyBlock,
        blockContents: await blockModel().get_all_by_block(
          ctx.db,
          block[0].block
        ),
        form: { _csrf: token },
        blockname: block[0].block,
        role: ctx.session.user.role,
        allBlocks: allBlocks,
        headerEva: "headerEva",
      });
      ctx.response.status = 200;
      ctx.response.headers["content-type"] = "text/html";
    } else {
      ctx.response.body = ctx.nunjucks.render("blockDetails.html", {
        userAuth: userAuth,
        blockid: id,
        form: { _csrf: token },
        show: false,
        userid: userid,
        blockname: block[0].block,
        role: ctx.session.user.role,

        headerEva: "headerEva",
      });

      ctx.response.status = 200;
      ctx.response.headers["content-type"] = "text/html";
    }
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }

  return ctx;
}
export async function submitBlockDetails(ctx) {
  const userAuth = ctx.state.authenticated;

  if (userAuth && ctx.session.user.role == "admin") {
    const formData = await ctx.request.formData();
    console.log("🚀 ~ submitBlockDetails ~ formData:", formData);

    const data = {
      id: formData.get("id"),
      filmtitle: formData.get("filmtitle") ?? "",
      regie: formData.get("regie") ?? "",
      blockname: formData.get("blockname"),
      jpg: formData.get("jpg") ?? "",
      webp: formData.get("webp") ?? "",
      oldwebp: formData.get("oldwebp") ?? "",
      oldjpg: formData.get("oldjpg") ?? "",
      _csrf: formData.get("_csrf"),
    };
    csrf().check_token(ctx, "tokenAddblockDetails", data._csrf, "/error");

    const userid = ctx.session.user.id;

    const filmid = data.id;
    const blockFilmId = data.blockname + "-" + filmid;

    const errors = await valid().validateBlockDetails(ctx, data);
    if (Object.values(errors).length > 0) {
      ctx.response.status = 400;
      ctx.response.headers["content-type"] = "application/json";
      ctx.response.body = JSON.stringify(errors);
    } else {
      if (data.filmtitle !== "") {
        filmModel().update_one_filmdata_by_blockFilmId(
          ctx.db,
          data.filmtitle,
          "filmtitle",
          blockFilmId
        );

        ctx.response.body = JSON.stringify({
          message: "Filmtitle erfolgreich hinzugefügt.",
        });
      } else if (data.regie !== "") {
        filmModel().update_one_filmdata_by_blockFilmId(
          ctx.db,
          data.regie,
          "regie",
          blockFilmId
        );

        ctx.response.body = JSON.stringify({
          message: "Regie erfolgreich hinzugefügt.",
        });
      } else if (data.webp || data.jpg) {
        let imgPath_jpg;

        if (data.jpg) {
          imgPath_jpg = `/img/Filmstills/${data.blockname}/${data.jpg.name}`;

          const destFile = await Deno.open(
            path.join(
              Deno.cwd(),
              `public/img/Filmstills/${data.blockname}`,
              data.jpg.name
            ),
            {
              create: true,
              write: true,
              truncate: true,
            }
          );

          const upload = data.jpg;
          await upload.stream().pipeTo(destFile.writable);

          const oldjpgPath = data.oldjpg.substring(1);
          const test = await dataHand().checkIfFileExists(oldjpgPath);
          console.log("🚀 ~ submitBlockDetails ~ test:", test);
          if (
            data.oldjpg !== "" &&
            (await dataHand().checkIfFileExists(oldjpgPath))
          ) {
            dataHand().removeDataFromDirectory(`${oldjpgPath}`);
          }
          await filmModel().update_one_filmdata_by_blockFilmId(
            ctx.db,
            imgPath_jpg,
            "imagepath",
            blockFilmId
          );
        }
        let imgPath_webp;

        if (data.webp) {
          imgPath_webp = `/img/Filmstills/${data.blockname}/${data.webp.name}`;
          const destFile = await Deno.open(
            path.join(
              Deno.cwd(),
              `public/img/Filmstills/${data.blockname}`,
              data.webp.name
            ),
            {
              create: true,
              write: true,
              truncate: true,
            }
          );
          const upload = data.webp;

          await upload.stream().pipeTo(destFile.writable);
          const oldwebpPath = data.oldwebp.substring(1);

          if (
            data.oldwebp !== "" &&
            (await dataHand().checkIfFileExists(oldwebpPath))
          ) {
            dataHand().removeDataFromDirectory(`${oldwebpPath}`);
          }
          filmModel().update_one_filmdata_by_blockFilmId(
            ctx.db,
            imgPath_webp,
            "imagepath_webp",
            blockFilmId
          );
        }
        ctx.response.body = JSON.stringify({
          message: "Bild erfolgreich hochgeladen.",
          path_webp: imgPath_webp,
          path_jpg: imgPath_jpg,
        });
      } else {
      }

      ctx.response.status = 200;
      ctx.response.headers["content-type"] = "application/json";
    }
  }
  return ctx;
}
export async function wbbOverview(ctx) {
  const userAuth = ctx.state.authenticated;
  if (userAuth && ctx.session.user.role === "admin") {
    const allBlocks = await blockModel().get_all_blocks_content(ctx.db);

    const userid = ctx.session.user.id;

    const token = csrf().generate_token();
    ctx.token.set("tokenBlock", token);

    ctx.response.body = ctx.nunjucks.render("wbbOverview.html", {
      userAuth: userAuth,
      userid: userid,

      role: ctx.session.user.role,
      allBlocks: allBlocks,
      headerEva: "headerEva",
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }
  return ctx;
}

//! -----------UPLOAD

export async function submitAddAssets(ctx) {
  const userAuth = ctx.state.authenticated;

  const formData = await ctx.request.formData();
  const objectData = {
    file: formData.get("upload"),
    name: formData.get("objectName"),
  };

  const errorsFile = await valid.validateAssetUpload(objectData.file);

  debug("@submitAddAssets.  --errorsForm--> %O", errorsFile);
  if (Object.values(errorsFile).length > 0) {
    debug("@submitAddAssets.  --errorsForm--> %O", errorsFile);
    formData.upload = undefined;

    ctx.response.body = ctx.nunjucks.render("addAssetForm.html", {
      userAuth,
      errorsFile,
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  } else if (objectData.file) {
    const filename = dataHandling.generateFilename(objectData.file, "upload");
    const newFilename = dataHandling.addFileExtension(filename);
    const destFile = await Deno.open(
      path.join(Deno.cwd(), "public", newFilename),
      {
        create: true,
        write: true,
        truncate: true,
      }
    );
    const upload = objectData.file;

    objectData.file = newFilename;
    objectData.userId = ctx.session.user.id;
    objectData.username = ctx.session.user.username;
    objectData.size = upload.size;
    debug("@submitAddAssets.  -- upload--> %O", upload);

    await upload.stream().pipeTo(destFile.writable);

    assetModel.addAssetToDB(ctx.db, objectData);
  }

  ctx.redirect = Response.redirect(ctx.url.origin + `/previewAsset`, 303);

  return ctx;
}

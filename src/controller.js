import zuschauerModel from "./db/models/participants.js";
import voteModel from "./db/models/votes.js";
import filmModel from "./db/models/films.js";
import feedbackModel from "./db/models/feedback.js";

import urlModel from "./db/models/urls.js";
import blockModel from "./db/models/blocks.js";

import createdata from "./accessories/preparedata.js";
import check from "./accessories/check.js";

import csrf from "./accessories/csrf.js";
import valid from "./accessories/validation.js";
import i18n from "./accessories/i18n.js";

/**
 * Handles the addition of a block form.
 *
 * @param {Object} ctx - The context object.
 * @param {Object} ctx.db - The database connection.
 * @param {Object} ctx.params - The request parameters.
 * @param {string} ctx.params.urlid - The URL ID.
 * @param {Object} ctx.nunjucks - The Nunjucks rendering engine.
 * @param {Object} ctx.response - The response object.
 * @param {number} ctx.httpstatus - The HTTP error code.
 * @param {string} ctx.message - The error message.
 * @param {string} ctx.messagedanske - The Danish error message.
 * @param {Object} ctx.token - The CSRF token.
 * @returns {Object} The modified context object.
 */
export async function wblock_add(ctx) {
  const isUsed = await urlModel().check_url(ctx.db, ctx.params.urlid);

  const blockname = await urlModel().get_block_by_pathname(
    ctx.db,
    ctx.params.urlid
  );

  if (
    blockname === undefined ||
    blockname === null ||
    blockname.length === 0 ||
    isUsed.length === 0 ||
    isUsed === undefined ||
    isUsed === null ||
    isUsed[0].used === 1 ||
    isUsed[0].used === 2
  ) {
    ctx.httpstatus = 404;
    ctx.message = "URL nicht gefunden oder wurde bereits verwendet  ";
    ctx.messagedanske = "URL ikke fundet eller allerede brugt. ";
    return await error(ctx);
  } else {
    await check().check_time(ctx);

    const token = csrf().generate_token();
    ctx.token.set("tokenBlocks", token);

    ctx.response.body = ctx.nunjucks.render("block.html", {
      form: {
        csrf: token,
      },
      text: blockname[0].block === "wbd" ? i18n("dk") : i18n("de"),
      films: await filmModel().get_all_films_by_block(
        ctx.db,
        blockname[0].block
      ),
      blockContent: await blockModel().get_all_by_block(
        ctx.db,
        blockname[0].block
      ),
      blockname: blockname,
      headerBlock: "headerBlock",
    });
    ctx.response.status = 200;
    ctx.response.headers["Content-type"] = "text/html; charset=utf-8";
    ctx.response.headers["Cache-Control"] = "max-age=604800";
  }
  return ctx;
}
/**
 * Handles the submission of a block form.
 *
 * @param {Object} ctx - The context object.
 * @param {Object} ctx.db - The database connection.
 * @param {Object} ctx.params - The request parameters.
 * @param {string} ctx.params.urlid - The URL ID.
 * @param {Object} ctx.nunjucks - The Nunjucks rendering engine.
 * @param {Object} ctx.response - The response object.
 * @param {number} ctx.httpstatus - The HTTP error code.
 * @param {string} ctx.message - The error message.
 * @param {string} ctx.messagedanske - The Danish error message.
 * @returns {Object} The modified context object.
 */
export async function wblock_submit(ctx) {
  const isUsed = await urlModel().check_url(ctx.db, ctx.params.urlid);
  console.log("🚀 ~ wblock_submit ~ isUsed:", isUsed);

  const blockname = await urlModel().get_block_by_pathname(
    ctx.db,
    ctx.params.urlid
  );

  if (
    blockname === undefined ||
    blockname === null ||
    blockname.length === 0 ||
    isUsed.length === 0 ||
    isUsed === undefined ||
    isUsed === null ||
    isUsed[0].used === 1 ||
    isUsed[0].used === 2
  ) {
    ctx.httpstatus = 404;
    ctx.message = "URL nicht gefunden oder wurde bereits verwendet  ";
    ctx.messagedanske = "URL ikke fundet eller allerede brugt. ";
    return await error(ctx);
  } else {
    const wbFilme = await filmModel().get_all_films_by_block(
      ctx.db,
      blockname[0].block
    );
    const data = await createdata().wblock_submit_create_data_object(
      ctx,
      blockname,
      wbFilme
    );

    const setTime = await urlModel().set_timestamp_send(
      ctx.db,
      ctx.params.urlid
    );

    const errors = await valid().validate_participation(
      ctx,
      data,
      blockname[0].block
    );
    if (errors.filmnull && Object.values(errors).length === 1) {
      let expires = new Date();
      expires.setDate(expires.getDate() - 1);

      ctx.cookies.set("0", "del", {
        expires: expires,
        domain: "publikumspreis.filmkorte.de",
        overwrite: true,
        httpOnly: true,
        path: "/",
      });
      ctx.cookies.delete("0", "del", {
        expires: expires,
        domain: "publikumspreis.filmkorte.de",
        httpOnly: true,
        overwrite: true,
        path: "/",
        sameSite: true,
      });
    } else if (Object.values(errors).length > 0) {
      if (errors.time) {
        ctx.message =
          blockname[0].block === "wbd"
            ? i18n("dk")("errorTime")
            : i18n("de")("errorTime");
        ctx.httpstatus = 404;
        return await error(ctx);
      }

      ctx.response.body = ctx.nunjucks.render("block.html", {
        films: wbFilme,
        data: data,
        errors: errors,
        blockContent: await blockModel().get_all_by_block(
          ctx.db,
          blockname[0].block
        ),
        text: blockname[0].block === "wbd" ? i18n("dk") : i18n("de"),
        blockname: blockname[0].block,
        headerBlock: "headerBlock",
      });
      ctx.message = "Fehler in der Eingabe. Bitte versuche es erneut.";
      ctx.messagedanske = "Fejl i input. Prøv venligst igen.";
      ctx.response.status = 200;

      ctx.response.headers["Content-type"] = "text/html; charset=utf-8";

      return ctx;
    }

    csrf().check_token(ctx, "tokenBlocks", data._csrf, "/error");

    if (!(data.email === "") && !(data.name === "")) {
      await zuschauerModel().add_viewer(ctx.db, data);
    }

    if (!(data.feedback === "")) {
      await feedbackModel().add_feedback(ctx.db, data);
    }

    const added = await voteModel().add_votes(ctx.db, data);

    // set update used to true - make sure that the url can only be used once
    await urlModel().update_used(ctx.db, 1, ctx.params.urlid);

    ctx.sessionStore.destroy("errorFilm");

    ctx.response.body = ctx.nunjucks.render("thankyou.html", {
      name: data.name,
      block: data.block,
      relink: ctx.params.href,
      text: blockname[0].block === "wbd" ? i18n("dk") : i18n("de"),
      headerBlock: "headerBlock",
    });

    ctx.response.status = 200;
    ctx.response.headers["Content-type"] = "text/html; charset=utf-8";
  }

  return ctx;
}

/**
 * Renders the "all.html" template with the provided error message and Danish error message.
 *
 * @param {Object} ctx - The context object.
 * @param {string} ctx.message - The error message to be displayed.
 * @param {string} ctx.messagedanske - The Danish error message to be displayed.
 * @returns {Object} The modified context object.
 */
export async function all(ctx) {
  ctx.response.body = ctx.nunjucks.render("all.html", {
    message: ctx.message,
    messagedanske: ctx.messagedanske,
    headerBlock: "headerBlock",
  });
  ctx.response.status = ctx.httpstatus || 404;
  ctx.response.headers["Content-type"] = "text/html; charset=utf-8";

  return ctx;
}

/**
 * Renders the "datenschutz.html" template.
 *
 * @param {Object} ctx - The context object.
 * @returns {Object} The modified context object.
 */
export async function datenschutz(ctx) {
  ctx.response.body = ctx.nunjucks.render("datenschutz.html", {
    headerBlock: "headerBlock",
  });
  ctx.response.status = 200;
  ctx.response.headers["Content-type"] = "text/html; charset=utf-8";

  return ctx;
}

/**
 * Renders the "impressum.html" template.
 *
 * @param {Object} ctx - The context object.
 * @returns {Object} The modified context object.
 */
export async function impressum(ctx) {
  ctx.response.body = ctx.nunjucks.render("impressum.html", {
    headerBlock: "headerBlock",
  });
  ctx.response.status = 200;
  ctx.response.headers["Content-type"] = "text/html; charset=utf-8";

  return ctx;
}
/**
 * Renders the "thankyou.html" template .
 *
 * @param {Object} ctx - The context object.
 * @returns {Object} The modified context object.
 */
export async function thankyou(ctx) {
  ctx.response.body = ctx.nunjucks.render("thankyou.html", {
    headerBlock: "headerBlock",
  });
  ctx.response.status = 200;
  ctx.response.headers["Content-type"] = "text/html; charset=utf-8";

  return ctx;
}

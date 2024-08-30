
import blockModel from "./db/models/blocks.js";
import participantsModel from "./db/models/participants.js";
import feedbackModel from "./db/models/feedback.js";

import * as calc from "./accessories/calculations.js";

import csrf from "./accessories/csrf.js";

import valid from "./accessories/validation.js";



//STUB WBB OVERVIEW END
export async function feedback(ctx) {
  const userAuth = ctx.state.authenticated;
  if (userAuth) {
    const allpartsFeedback = await feedbackModel().get_all_feedbacks(ctx.db);

    const userid = ctx.session.user.id;

    ctx.response.body = ctx.nunjucks.render("feedback.html", {
      userAuth: userAuth,
      userid: userid,

      role: ctx.session.user.role || "user",
      allpartsFeedback: allpartsFeedback,
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
/**
 * Renders the "index.html" template if the user is authenticated, otherwise redirects to the login page.
 *
 * @param {Object} ctx -  context object.
 * @return {Promise<Object>}  context object with the rendered HTML response.
 */
export async function index(ctx) {
  const userAuth = ctx.state.authenticated;
  if (ctx.session.user) {
    const userid = ctx.session.user.userid;
    ctx.response.body = ctx.nunjucks.render("index.html", {
      userAuth: userAuth,
      userid: userid,
      role: ctx.session.user.role || "user",
      headerEva: "headerEva",
    });
    ctx.response.status = 200;
    ctx.response.headers["Content-type"] = "text/html; charset=utf-8";
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/login";
  }
  return ctx;
}

/**
 * Retrieves all the blocks from the database and renders the evaluation page.
 *
 * @param {Object} ctx - The context object containing the authenticated user and the database connection.
 * @return {Promise<Object>} The updated context object with the rendered evaluation page.
 */
export async function evaluation(ctx) {
  const userAuth = ctx.state.authenticated;
  if (userAuth) {
    const alltheBlocks = await blockModel().get_all_blocks(ctx.db);

    const overAllContestBlocks = alltheBlocks.filter(
      (item) => item.block !== "wbp" && item.block !== "wbd"
    );

    const overallWinnerMC = await calc.get_main_contest_winner(
      await calc.get_all_calculation(ctx.db, overAllContestBlocks)
    );

    const userid = ctx.session.user.id;
    const allcalcs = await calc.get_all_calculation(ctx.db, alltheBlocks);
    ctx.response.body = ctx.nunjucks.render("evaluation.html", {
      userAuth: userAuth,
      userid: userid,
      filmObjs: allcalcs,
      role: ctx.session.user.role || "user",
      winnerMC: overallWinnerMC,
      alltheBlocks: alltheBlocks,
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



/**
 * Renders the "winner.html" template if the user is authenticated, otherwise redirects to the login page.
 *
 * @param {Object} ctx -  context object.
 * @return {Promise<Object>}  context object with the rendered HTML response.
 */
export async function addWinner(ctx) {
  const userAuth = ctx.state.authenticated;

  if (userAuth) {
    const userid = ctx.session.user.id;

    ctx.response.body = await ctx.nunjucks.render("winner.html", {
      userAuth: userAuth,
      userid: userid,
      headerEva: "headerEva",
      role: ctx.session.user.role,
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }
  return ctx;
}

/**
 * API endpoint for handling Eva error responses.
 *
 * @param {Object} ctx - The context object.
 * @returns {Promise<Object>} - The  context object with the rendered error response.
 */
export async function evaerror(ctx) {
  ctx.response.body = ctx.nunjucks.render("evaerror.html", {
    message: ctx.message,
    headerEva: "headerEva",
    messagedanske: ctx.messagedanske,
  });
  ctx.response.status = ctx.httpError || 404;
  ctx.response.headers["content-type"] = "text/html";
  return ctx;
}

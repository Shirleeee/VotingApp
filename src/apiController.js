import zuschauerModel from "./db/models/participants.js";

import userModel from "./db/models/users.js";

import createdata from "./accessories/preparedata.js";

/**
 * API endpoint for retrieving a random winner entry.
 *
 * @param {Object} ctx -  context object.
 * @returns {Promise<Object>} - A JSON response containing the user ID and a random winner entry.
 */
export async function winnerData(ctx) {
  const userAuth = ctx.state.authenticated;
  if (userAuth) {
    const winner = await zuschauerModel().get_random_entry(ctx.db);
    console.log("🚀 ~ winnerData ~ winner:", winner);

    const jsonResponse = {
      winner: winner,
    };

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "application/json";
    ctx.response.body = JSON.stringify(jsonResponse);
  } else {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
  }
  return ctx;
}
/**
 * API endpoint for the Evaluation reload ajax
 *
 * @param {Object} ctx - context object.

 * @returns {Promise<Object>} - A JSON response containing the Eva data and the overall winner.
 */
export async function evaData(ctx) {
  const userAuth = ctx.state.authenticated;
  if (userAuth) {
    const evaDataobj = await createdata().make_evaData_obj(ctx);
    const jsonResponse = {
      filmObj: evaDataobj,
      winnerMC: await createdata().get_over_all_winner(ctx),
    };
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "application/json";

    ctx.response.body = JSON.stringify(jsonResponse);
  } else {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
  }

  return ctx;
}

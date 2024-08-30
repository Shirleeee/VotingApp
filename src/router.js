import * as controller from "./controller.js";
import * as evaController from "./evaController.js";

import * as blockAdminController from "./blockAdminController.js";

import * as loginController from "./loginController.js";
import * as apiController from "./apiController.js";

import { URLPattern } from "https://deno.land/x/url_pattern/mod.ts";

export async function routes(ctx) {
  const url = new URL(ctx.request.url);
  if (url.pathname == "/") {
    ctx.message = "Hier bist du falsch";
    ctx.messagedanske = "Du er det forkerte sted";
    return controller.all(ctx);
  }
  if (url.pathname == "/impressum") {
    return controller.impressum(ctx);
  }
  if (url.pathname == "/datenschutz") {
    return controller.datenschutz(ctx);
  }
  if (ctx.url.pathname.match(/\/logout\/(.*)/)) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/logout\/(.*)/);
      ctx.params.id = matches[1];

      return loginController.logOut(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  if (url.pathname == "/qZaa3") {
    if (ctx.session.user) {
      return evaController.index(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  if (url.pathname.match("/evaqZaa3") && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return await evaController.evaluation(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  if (url.pathname.match("/feedback") && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return await evaController.feedback(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  if (url.pathname.match("/winner") && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return await evaController.addWinner(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  if (ctx.url.pathname == "/winner" && ctx.request.method == "POST") {
    if (ctx.session.user) {
      return evaController.winner(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  ///ANCHOR - API ROUTES START

  if (url.pathname.match("/evaData1Pa77") && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return apiController.evaData(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  if (url.pathname.match("/awinnerData") && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return apiController.winnerData(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  ///ANCHOR - API ROUTES END

  // ////! DISPLAY Blocks
  const pattern = new URLPattern("/vote/:urlid");

  if (pattern.match(url.pathname) && ctx.request.method == "GET") {
    const matches = pattern.match(url.pathname);
    ctx.params.urlid = matches.urlid;

    return await controller.wblock_add(ctx);
  }

  if (pattern.match(url.pathname) && ctx.request.method == "POST") {
    const matches = pattern.match(url.pathname);
    ctx.params.urlid = matches.urlid;
    console.log("🚀 ~ routes ~ ctx.params.urlid:", ctx.params.urlid);
    return await controller.wblock_submit(ctx);
  }
  //! DISPLAY Blocks END
  if (ctx.url.pathname == "/register" && ctx.request.method == "POST") {
    return await loginController.submitAddReg(ctx);
  }
  if (ctx.url.pathname == "/register" && ctx.request.method == "GET") {
    return await loginController.addReg(ctx);
  }
  if (ctx.url.pathname == "/login" && ctx.request.method == "GET") {
    return await loginController.addLogin(ctx);
  }
  if (ctx.url.pathname == "/login" && ctx.request.method == "POST") {
    return await loginController.submitCheckLogin(ctx);
  }

  if (
    ctx.url.pathname.match(/\/validmail\/(.*)/) &&
    ctx.request.method == "GET"
  ) {
    let token = url.searchParams.get("token");
    console.log("🚀 ~ routes validmail ~ token:", token);
    const id = url.searchParams.get("id");
    if (token) {
      token = decodeURIComponent(token);
      console.log("🚀 ~ routes ~ token:", token);
    }
    ctx.params.id = id;
    ctx.params.token = token;

    return await loginController.addMailproof(ctx);
  }
  //! FORGOT PASSWORD
  if (ctx.url.pathname == "/forgotten" && ctx.request.method == "GET") {
    return await loginController.addorderNewPassword(ctx);
  }
  if (ctx.url.pathname == "/forgotten" && ctx.request.method == "POST") {
    return await loginController.submitOrderNewPassword(ctx);
  }
  // const patternReset = new URLPattern("/reset/?&id=:id&token=:token");
  if (ctx.url.pathname.match(/\/reset\/(.*)/) && ctx.request.method == "GET") {
    let token = url.searchParams.get("token");
    const id = url.searchParams.get("id");
    if (token) {
      token = decodeURIComponent(token);
      console.log("🚀 ~ routes ~ token:", token);
    }
    ctx.params.id = id;
    ctx.params.token = token;

    return await loginController.addResetNewPassword(ctx);
  }

  if (ctx.url.pathname == "/reset/" && ctx.request.method == "POST") {
    let token = url.searchParams.get("token");
    const id = url.searchParams.get("id");
    ctx.params.id = id;
    ctx.params.token = token;
    console.log("🚀 ~ routes  reset ~ ctx.params.id:", ctx.params.id);
    return await loginController.submitResetNewPassword(ctx);
  }
  //!SECTION FORGOT PASSWORD END

  //LINK - WBB customize
  if (ctx.url.pathname == "/WBBoverview" && ctx.request.method == "GET") {
    // console.log("🚀 ~ routes ~ ctx.session.user:", ctx.session.user)

    if (ctx.session.user) {
      return blockAdminController.wbbOverview(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  if (ctx.url.pathname == "/addNewBlock" && ctx.request.method == "GET") {
    if (ctx.session.user) {
      return blockAdminController.addNewBlock(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  if (ctx.url.pathname == "/addNewBlock" && ctx.request.method == "POST") {
    if (ctx.session.user) {
      return blockAdminController.submitAddNewBlock(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  const blockDetailsPattern = new URLPattern("/blockDetails/:urlid");

  if (blockDetailsPattern.match(url.pathname) && ctx.request.method == "GET") {
    if (ctx.session.user) {
      const matches = blockDetailsPattern.match(url.pathname);
      console.log("🚀 ~ routes ~ matches:", matches)

      ctx.params.id = matches.urlid;
      return blockAdminController.addBlockDetails(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  if (blockDetailsPattern.match(url.pathname) && ctx.request.method == "POST") {
    if (ctx.session.user) {
      const matches = blockDetailsPattern.match(url.pathname);
      console.log("🚀 ~ routes ~ matches:", matches)

      ctx.params.id = matches.urlid;
      return blockAdminController.submitBlockDetails(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  if (
    ctx.url.pathname.match(/\/changeBlock\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/changeBlock\/(.*)/);
      ctx.params.id = matches[1];
      return blockAdminController.changeBlock(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }

  if (
    ctx.url.pathname.match(/\/deleteBlock\/.*/) &&
    ctx.request.method == "POST"
  ) {
    if (ctx.session.user) {
      const matches = ctx.url.pathname.match(/\/deleteBlock\/(.*)/);
      ctx.params.id = matches[1];
      return blockAdminController.deleteBlock(ctx);
    } else {
      ctx.message = "You are not logged in";
      return evaController.evaerror(ctx);
    }
  }
  return ctx;
}

import userModel from "./db/models/users.js";
import tempModel from "./db/models/temp.js";

import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import * as controller from "./controller.js";

import csrf from "./accessories/csrf.js";
import mail from "./accessories/sendMail.js";

import valid from "./accessories/validation.js";

import * as sessions from "./middleware/sessions.js";

export async function addResetNewPassword(ctx) {
  const userAuth = ctx.state.authenticated;
  console.log("🚀 ~ addResetNewPassword ~ userAuth:", userAuth);

  if (!userAuth) {
    const userid = ctx.params.id;
    const passwordToken = ctx.params.token;
    const user = await userModel().get_user_by_id(ctx.db, userid);
    console.log("🚀 ~ addResetNewPassword ~ user:", user);

    if (user[0].passwordCode === passwordToken) {

      const token = csrf().generate_token();
      // ctx.cookies.clear();
      ctx.token.set("tokenOrderNew", token);

      ctx.response.body = await ctx.nunjucks.render("resetPassword.html", {
        form: { _csrf: token },
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
export async function submitResetNewPassword(ctx) {
  const formData = await ctx.request.formData();
  const params = {
    token: ctx.params.token,
    userid: ctx.params.id,
  };
  const dataForm = {
    password: formData.get("password"),
    password_again: formData.get("password_again"),

    _csrf: formData.get("_csrf"),
  };
  csrf().check_token(ctx, "tokenOrderNew", dataForm._csrf, "/login");

  const user = await userModel().get_user_by_id(ctx.db, params.userid);

  const errors = await valid().validateResetPassword(dataForm, params, user);
  console.log("🚀 ~ submitResetNewPassword ~ errors:", errors);

  if (Object.values(errors).length > 0) {
    ctx.response.body = ctx.nunjucks.render("resetPassword.html", {
      form: dataForm,
      errors: errors,
      headerEva: "headerEva",
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  } else {
    user[0].password = undefined;
    const hash = await bcrypt.hash(dataForm.password);
    dataForm.password = hash;
    dataForm.password_again = "";
    await userModel().update_password(ctx.db, hash, ctx.params.id);

    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/login";
  }
  return ctx;
}
export async function submitOrderNewPassword(ctx) {
  const formData = await ctx.request.formData();

  const dataForm = {
    email: formData.get("email"),
    _csrf: formData.get("_csrf"),
  };

  csrf().check_token(ctx, "tokenOrderNew", dataForm._csrf, "/login");

  const user = await userModel().get_all_by_username_or_email(
    ctx.db,
    "",
    dataForm.email
  );
  console.log("🚀 ~ submitOrderNewPassword ~ user:", user[0]);

  if (user[0]) {
    const now = new Date(Date.now());
    const newPasswordToken = csrf().generate_token();
    await userModel().add_passwordCode(
      ctx.db,
      now,
      newPasswordToken,
      user[0].userid
    );
    const encodednewPasswordToken = encodeURIComponent(newPasswordToken);
    const html = `<h1>Neues Passwort</h1> <p>Dein neues Passwort kannst du über den Link zurücksetzen.</p><div class="eva-login"><a href='https://publikumspreis.filmkorte.de/reset/?id=${user[0].userid}&token=${encodednewPasswordToken}'>NEUES PASSWORT HIER ÄNDERN</a></div>`;
    await mail().send_mail(html, user[0].email, "Neues Passwort");

    ctx.response.body = ctx.nunjucks.render("orderNewPassword.html", {
      form: dataForm,
      headerEva: "headerEva",
      success:
        "Es wurde ein Link zum Zurücksetzen deines Passwortes an diese Email gesendet",
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  } else {
    ctx.response.body = ctx.nunjucks.render("orderNewPassword.html", {
      form: dataForm,
      headerEva: "headerEva",
      errors: { email: "Deine Eingaben waren falsch." },
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  }
  return ctx;
}

export async function addorderNewPassword(ctx) {
  const userAuth = ctx.state.authenticated;

  if (!userAuth) {
    const token = csrf().generate_token();
    // ctx.cookies.clear();
    ctx.token.set("tokenOrderNew", token);

    ctx.response.body = await ctx.nunjucks.render("orderNewPassword.html", {
      form: { _csrf: token },
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
 * Adds a login functionality to the context.
 *
 * @param {Object} ctx - The context object containing the state and other properties.
 * @return {Promise<Object>} The updated context object.
 */
export async function addLogin(ctx) {
  const userAuth = ctx.state.authenticated;

  // await sendMail().send_mail();
  if (!userAuth) {
    const token = csrf().generate_token();
    ctx.cookies.clear();
    ctx.token.set("tokenLog", token);

    ctx.response.body = await ctx.nunjucks.render("loginForm.html", {
      form: { _csrf: token },
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
 * Submits the login form and checks the user's credentials.
 *
 * @param {Object} ctx - The context object.
 * @return {Promise<Object>} The updated context object.
 */
export async function submitCheckLogin(ctx) {
  const formData = await ctx.request.formData();

  const dataForm = {
    username: formData.get("username"),
    password: formData.get("password"),
    _csrf: formData.get("_csrf"),
  };

  csrf().check_token(ctx, "tokenLog", dataForm._csrf, "/login");

  const user = await userModel().get_all_by_username_or_email(
    ctx.db,
    dataForm.username,
    dataForm.email
  );

  if ((await valid().passwordIsCorrect(user, dataForm.password)) === true) {
    user[0].password = undefined;

    ctx.token.set(`session-key`, csrf().generate_token());

    const MAX_AGE = 60 * 30 * 1000; //1.800.000 ms - half hour

    const expireDate = new Date(Date.now() + MAX_AGE);
    const sessionKey = ctx.token.get(`session-key`);

    ctx.cookies.set("session", sessionKey, {
      expires: expireDate,
      httpOnly: true,
      overwrite: true,
      // sameSite: true,
      // secure: true,
    });
    ctx.session.user = user[0];

    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  } else {
    ctx.response.body = ctx.nunjucks.render("loginForm.html", {
      form: dataForm,
      headerEva: "headerEva",
      errors: { login: "Deine Eingaben waren falsch." },
    });

    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
  }
  return ctx;
}
///!SECTION - LOGOUT
/**
 * Logs out the user
 * - by deleting all sessions, cookies, and tokens associated with the user's context.
 * Redirects the user to the "/qZaa3" page with a 303 status code.
 *
 * @param {Object} ctx - The context object.
 * @returns {Promise<Object>} - The context object with the redirect response.
 */
export async function logOut(ctx) {
  const sessionId = ctx.cookies.get("session");

  // const user = await userModel().get_user_by_id(ctx.db, payload.iss);

  sessions.delete_all_sessions_cookies_tokens(ctx);
  ctx.sessionStore.destroy(sessionId);

  const delJWT = ctx.cookies.delete("session");

  const del = ctx.cookies.delete(ctx.sessionId);

  ctx.session = undefined;

  ctx.redirect = Response.redirect(ctx.url.origin + "/qZaa3", 303);

  return ctx;
}
//////////////////////////!

/**
 * Adds a registration functionality to the context.
 *
 * @param {Object} ctx - The context object.
 * @return {Promise<Object>} The updated context object.
 */
export async function addReg(ctx) {
  const token = csrf().generate_token();

  ctx.token.set("tokenReg", token);
  const userAuth = ctx.state.authenticated;
  if (!userAuth) {
    ctx.response.body = ctx.nunjucks.render("regForm.html", {
      headerEva: "headerEva",
      form: {
        _csrf: token,
      },
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
 * Submits the registration form data and handles the registration process.
 *
 * @param {Object} ctx - The context object containing the request and response.
 * @return {Promise<Object>} The updated context object after handling the registration.
 */
export async function submitAddReg(ctx) {
  const formData = await ctx.request.formData();
  let role;
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_again: formData.get("password_again"),
    _csrf: formData.get("_csrf"),
  };
  //TODO: check make admin
  if (data.email === "shirley@filmkorte.de"||data.email === "maja@filmkorte.de"||data.email === "sandra@filmkorte.de") {
    role = "admin";
  }

  csrf().check_token(ctx, "tokenReg", data._csrf, "/register");

  const errors = await valid().validateReg(ctx, data);

  if (Object.values(errors).length > 0) {
    ctx.response.body = ctx.nunjucks.render("regForm.html", {
      form: data,
      errors: errors,
      headerEva: "headerEva",
    });
    ctx.response.status = 200;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  } else {
    const newPasswordToken = csrf().generate_token();
    data.proofcode = newPasswordToken;

    const encodednewPasswordToken = encodeURIComponent(newPasswordToken);
    const html = `<h1>Registrierung</h1> <p>Über diesen Link kannst du deine E-Mail Adresse validieren. </p><div class="eva-login"><a href='https://publikumspreis.filmkorte.de/validmail/?id=${data.username}&token=${encodednewPasswordToken}'>HIER E-MAIL VALIDIEREN</a></div>`;
    await mail().send_mail(html, data.email, "Registrierung");

    const hash = await bcrypt.hash(data.password);
    data.password = hash;
    data.password_again = "";

    const getAllTemps = await tempModel().get_temp_user_by_username(
      ctx.db,
      data.username
    );
    console.log("🚀 ~ submitAddReg ~ getAllTemps:", getAllTemps);

    if (getAllTemps.length > 0) {
      await tempModel().update_temp_user_DB(ctx.db, data, role);
    } else {
      await tempModel().add_to_DB(ctx.db, data, role);
    }

  }
  ctx.httpstatus = 200;
  ctx.message = "In deinem Mailpostfach hast du einen Link zum Fertigstellen deiner Registrierung erhalten. ";
  return await controller.all(ctx);
}
export async function addMailproof(ctx) {
  const userAuth = ctx.state.authenticated;
  console.log("🚀 ~ addResetNewPassword ~ userAuth:", userAuth);

  if (!userAuth) {
    const username = ctx.params.id;
    const passwordToken = ctx.params.token;
    const user = await tempModel().get_temp_user_by_username(ctx.db, username);

    // console.log("🚀 ~ addResetNewPassword ~ user:", user.length);
    // console.log("🚀 ~ addMailproof ~ user[0].proofcode === passwordToken:", user[0].proofcode === passwordToken)
    // console.log("🚀 ~ addMailproof ~ user[0].proofcode:", user[0].proofcode)

    if (user[0].proofcode === passwordToken) {
      await userModel().add_to_DB(ctx.db, user[0], user[0].role);
      ctx.response.status = 303;
      ctx.response.headers["location"] = ctx.url.origin + "/login";
    }
  } else {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + "/qZaa3";
  }

  return ctx;
}

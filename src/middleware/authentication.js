import userModel from "./../db/models/users.js";

/**
 * Middleware function that checks if the user is authenticated.
 *
 * This function retrieves the session key from the request token, and then
 * checks if a session ID is associated with that key in the session store.
 * If a valid session is found, the function sets the `authenticated` state
 * to `true`. If no valid session is found, the function sets the
 * `authenticated` state to `false` and redirects the user to the login page.
 *
 * @param {object} ctx - The Koa context object.
 * @returns {object} The modified Koa context object.
 */

export const isAuthenticated = async (ctx) => {
  let sessionIdOfLoginKey;
  if (ctx.session.user) {
    const sessionkey = ctx.cookies.get("session");

    sessionIdOfLoginKey = ctx.cookies.get(sessionkey ?? "");

    ctx.sessionStore.get(sessionIdOfLoginKey) ?? {};
  }

  if (sessionIdOfLoginKey == undefined) {
    ctx.response.status = 303;
    ctx.response.headers["location"] = ctx.url.origin + `/`;

    ctx.state.authenticated = false;
    return ctx;
  }

  ctx.state.authenticated = true;

  return ctx;
};

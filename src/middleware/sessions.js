import csrf from "../accessories/csrf.js";
import userModel from "./../db/models/users.js";


const MAX_AGE = 60 * 30 * 1000; //1.800.000 ms - half hour

//3.600.000 ms - one hour
// 360.000 6 minutes
//900 000 ms - 15 minutes

/**
 * Gets the session for the current context.
 *
 * @param {object} ctx - The current context object.
 * @returns {object} The updated context object with the session data.
 */
export async function get_session(ctx) {
  const sessionId = ctx.cookies.get("session") ?? "";

  if (sessionId) {
  
    ctx.sessionId = ctx.cookies.get(sessionId ?? "") ?? "";

    ctx.session = ctx.sessionStore.get(ctx.sessionId, MAX_AGE) ?? {};
 
  } else {
    const MAX_AGE = 60 * 30 * 1;
    const sessionKey = ctx.token.get(`session-key`) ?? "";
    ctx.sessionId = ctx.cookies.get(sessionKey) ?? undefined;
    ctx.session = ctx.sessionStore.get(ctx.sessionId, MAX_AGE) ?? {};
  }

  return ctx;
}

/**
 * Sets the session for the current context.
 *
 * If the `ctx.session` object is not empty, it generates a new session ID and sets a session cookie with the ID.
 * The session data is then stored in the session store with the session ID and a maximum age of `MAX_AGE`.
 *
 * If the `ctx.session` object is empty, it destroys the current session by deleting the session cookie and removing the session data from the session store.
 *
 * @param {object} ctx - The current context object.
 * @returns {object} The updated context object.
 */
export function set_session(ctx) {
  if (typeof ctx.session === "object") {
    if (Object.values(ctx.session).find(Boolean)) {
      ctx.sessionId = ctx.sessionId ?? csrf().generate_token();

      const expireDate = new Date(Date.now() + MAX_AGE);
      //cookie setzen
      ctx.cookies.set(ctx.token.get("session-key"), ctx.sessionId, {
        expires: expireDate,
        httpOnly: true,
        overwrite: true,
        sameSite: "strict",
      });

      ctx.sessionStore.set(ctx.sessionId, ctx.session, MAX_AGE);
      ctx.sessionStore.getAll();
    }
  } else {
    ctx.sessionStore.destroy(ctx.sessionId);
    ctx.cookies.clear();
    ctx.cookies.delete(ctx.token.get("session-key"));
  }
  return ctx;
}

/**
 * Creates a session store wrapper with get, set, and destroy methods.
 *
 * The session store wrapper provides a consistent interface for interacting with the underlying session store, handling session expiration and deletion.
 *
 * @param {object} sessionStore - The underlying session store implementation.
 * @returns {object} An object with get, set, and destroy methods for managing sessions.
 */
export const create_session_store = (sessionStore) => {
  return {
    get(key) {
      const data = sessionStore.get(key);
      if (!data) return;
      return data.maxAge < Date.now() ? this.destroy(key) : data.session;
    },
    set(key, session, maxAge) {
      sessionStore.set(key, {
        session,
        maxAge: Date.now() + maxAge,
      });
    },
    destroy(key) {
      sessionStore.delete(key);
    },

    getAll() {
      const allSessions = [];
      for (const [key, value] of sessionStore.entries()) {
        allSessions.push([key, value.session]);
      }
      // console.log("Gesamter Inhalt der Session-Store:", allSessions);
      return allSessions;
    },
  };
};

/**
 * Deletes all sessions, cookies, and tokens associated with the current context.
 *
 * This function is used to clear all session-related data from the current context, including:
 * - Deleting all cookies associated with the session key
 * - Clearing all tokens
 * - Destroying the session in the session store
 * - Resetting the session object to an empty object
 * - Unsetting the session ID
 *
 * This function is typically called when a user logs out or when a session needs to be invalidated.
 *
 * @param {object} ctx - The current context object, which should contain session-related data.
 * @returns {object} The updated context object with all session-related data cleared.
 */
export async function delete_all_sessions_cookies_tokens(ctx) {
  ctx.token.clear();
  ctx.cookies.clear();

  ctx.cookies.set("session", {
    expires: getPastDate(1),
    domain: "publikumspreis.filmkorte.de",
    overwrite: true,
    httpOnly: true,
    path: "/",
  });
  ctx.cookies.delete("session", {
    expires: getPastDate(1),
    domain: "publikumspreis.filmkorte.de",
    overwrite: true,
    httpOnly: true,
    path: "/",
  });

  ctx.sessionStore.destroy(ctx.sessionId);
  ctx.sessionStore.destroy("");

  ctx.session = ctx.sessionStore.get(ctx.sessionId, MAX_AGE) ?? {};

  let expires = getPastDate(1);

  const n = "session";
  const lookie = n + "=" + ("value" || "") + expires + "; path=/; httponly";
  ctx.response.headers["Set-Cookie"] = `${lookie}`;

  ctx.session = {};

  ctx.session = undefined;
  return ctx;
}
/**
 * Generates a past date based on the input number of days.
 *
 * @param {number} days - The number of days to subtract from the current date.
 * @return {string} The formatted past date in UTC string format.
 */
function getPastDate(days) {
  let date = new Date();
  date.setDate(date.getDate() - days);
  return date.toUTCString();
}

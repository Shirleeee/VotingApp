import * as controller from "./controller.js";
import * as sessionsControl from "./middleware/sessions.js";
import { routes } from "./router.js";
import * as serve from "./middleware/servestatic.js";
import { gzipEncode } from "https://deno.land/x/wasm_gzip@v1.0.0/mod.ts";
import * as authen from "./middleware/authentication.js";
import {
  CookieMap,
  mergeHeaders,
} from "https://deno.land/std@0.203.0/http/mod.ts";

import * as client from "./db/client.js";

import nunjucks from "https://deno.land/x/nunjucks@3.2.4/mod.js";

nunjucks.configure("templates", {
  autoescape: true,
  noCache: false,
});

const sessionStore = new Map();
const tokenMap = new Map();

/**
 * Handles an incoming HTTP request by executing a pipeline of middleware functions.
 *
 * The `handleRequest` function is the main entry point for processing incoming HTTP requests. It sets up a context object that is passed through the middleware pipeline, which includes the database client, session store, cookies, authentication state, and other request-specific data.
 *
 * The middleware pipeline consists of the following functions:
 * - `sessionsControl.get_session`: Retrieves the session data from the session store.
 * - `authen.isAuthenticated`: Checks if the request is authenticated.
 * - `serve.serve_static_file("public")`: Serves static files from the "public" directory.
 * - `routes`: Handles the routing of the request to the appropriate controller function.
 * - `sessionsControl.set_session`: Saves the updated session data to the session store.
 *
 * The `pipeAsync` function is used to compose the middleware pipeline and execute it asynchronously.
 *
 * If the request is redirected during the middleware pipeline, the redirect response is returned. Otherwise, the function sets the default response status to 404 if no response body is provided, and then calls the `controller.error` function to handle the error.
 *
 * Finally, the function merges the response headers with the updated cookies and returns a new `Response` object with the appropriate status and headers.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - The response to the incoming request.
 */
export const handleRequest = async (request) => {
  const ctx = {
    db: client.default,
    sessionStore: sessionsControl.create_session_store(sessionStore),
    cookies: new CookieMap(request),
    token: tokenMap,
    state: { authenticated: false },
    session: {},
    request: request,
    url: new URL(request.url),
    params: {},
    redirect: undefined,
    response: {
      headers: {},
      body: undefined,
      status: undefined,
    },
    nunjucks: nunjucks,
  };

  const middleware = [
    sessionsControl.get_session,
    authen.isAuthenticated,

    serve.serve_static_file("public"),
    routes,
    sessionsControl.set_session,
  ];

  const pipeAsync =
    (...funcs) =>
    (ctx) =>
      funcs.reduce(async (state, func) => func(await state), ctx);

  let result = await pipeAsync(...middleware)(ctx);
  if (result.redirect) {
    return result.redirect;
  }

  // Fallback
  result.response.status = result.response.status ?? 404;

  if (!result.response.body && result.response.status == 404) {
    result = await controller.all(result);
  }
// Compress the response body if it's a text-based resource
if (typeof result.response.body === "string" || result.response.body instanceof Uint8Array) {
  const acceptEncoding = result.request.headers.get("Accept-Encoding") || "";

  if (acceptEncoding.includes("gzip")) {
    const compressedBody = gzipEncode(new TextEncoder().encode(result.response.body));
    result.response.body = compressedBody;
    result.response.headers["Content-Encoding"] =  "gzip";
  }
  // Optional: Add more compression algorithms if needed (e.g., Brotli)
}
  const allHeaders = mergeHeaders(result.response.headers, result.cookies);
  // console.log("🚀 ~ handleRequest ~ allHeaders:", allHeaders);
  result.response.headers["Set-cookie"] = allHeaders.get("set-cookie");

  // result.response.headers["X-Content-Type-Options"] = "nosniff";
  result.response.headers = allHeaders;

  return new Response(result.response.body, {
    status: result.response.status,
    headers: result.response.headers,
  });
};

import * as path from "https://deno.land/std@0.203.0/path/posix.ts";
import * as mediaTypes from "https://deno.land/std@0.203.0/media_types/mod.ts";

/**
 * Serves a static file from the specified base directory.
 *
 * @param {string} base - The base directory from which to serve the file.
 * @returns {function} - A middleware function that handles the request and serves the static file.
 */
export const serve_static_file = (base) => async (ctx) => {
  let file;
  const fullPath = path.join(base, ctx.url.pathname);

  if (fullPath.indexOf(base) !== 0 || fullPath.indexOf("\0") !== -1) {
    ctx.response.body = ctx.nunjucks.render("all.html", {
      message: "Irgendwas lief falsch.",
      headerBlock: "headerBlock",
      messagedanske: "Noget gik galt",
    });
    ctx.response.status = 403;
    ctx.response.headers["content-type"] = "text/html";

    return ctx;
  }
  try {
    file = await Deno.open(fullPath, {
      read: true,
    });
  } catch (_error) {
    ctx.response.body = ctx.nunjucks.render("all.html", {
      message: "Irgendwas lief falsch.",
      headerBlock: "headerBlock",
      messagedanske: "Noget gik galt",
    });
    ctx.response.status = 403;
    ctx.response.headers["content-type"] = "text/html";
    return ctx;
  }
  const { ext } = path.parse(ctx.url.pathname);
  const contentType = mediaTypes.contentType(ext);
  if (contentType) {
    ctx.response.body = file.readable;
    ctx.response.headers["Cache-Control"] = "max-age=31536000";
    ctx.response.headers["Content-type"] = contentType;
    ctx.response.status = 200;
  } else {
    Deno.close(file.rid);
  }
  return ctx;
};

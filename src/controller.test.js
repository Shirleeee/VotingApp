import {
  assertNotEquals,
  assertExists,
  assertEquals,
} from "https://deno.land/std@0.221.0/assert/mod.ts";
import * as client from "./db/client.js";

import voteModel from "./db/models/votes.js";
import filmModel from "./db/models/films.js";

import urlModel from "./db/models/urls.js";

import checks from "./accessories/check.js";

import nunjucks from "https://deno.land/x/nunjucks@3.2.4/mod.js";
nunjucks.configure("test", { autoescape: true, noCache: true });
// import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
// await load({ export: true, path: "./.env" });
import { wblock_submit, wblock_add } from "./controller.js";


/**
 * Generates random films within a specified range.
 *
 * @param {number} from - The starting index of the range.
 * @param {number} to - The ending index of the range.
 * @return {Object} An object containing randomly generated film names with corresponding ratings.
 */

function getRandomFilms(from, to) {
  const films = {};
  for (let i = from; i <= to; i++) {
    films[`film${i}`] = Math.floor(Math.random() * 5 + 1).toString();
  }
  return films;
}

let ctx = {
  db: client.default,

  params: {
    urlid: "",
  },
  request: {
    url: ``,
  },
  message: "",

  messagedanske: "",

  httpstatus: "",
  nunjucks: {
    render: (template, data) => {
      return `Rendered template: ${template}, Data: ${JSON.stringify(data)}`;
    },
  },
  response: {
    body: "",
    status: 0,
    headers: {},
  },
  sessionStore: {
    get: function (key) {
      return this[key];
    },
    set: function (key, value) {
      this[key] = value;
    },

    destroy: function (key, value) {
      delete this[key];
    },
  },
  cookies: {
    get: function (key) {
      return this[key];
    },
    set: function (key, value) {
      this[key] = value;
    },
    delete: function (key) {
      delete this[key];
    },
  },
  token: {
    get: function (key) {
      return this[key];
    },
    set: function (key, value) {
      this[key] = value;
    },
    delete: function (key) {
      delete this[key];
    },
    clear: function (key) {
      delete this[key];
    },
  },
};

Deno.test({
  name: "UNITS - ",
  fn: async (t) => {
    const rndUrlNotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
    ctx.params = {
      urlid: rndUrlNotUsed[0].pathname,
    };
    ctx.request = {
      url: `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`,
    };

    await t.step({
      name: "UNIT check url not used",
      fn: async () => {
        const checkedurlidNotUsed = await urlModel().check_url(
          ctx.db,
          ctx.params.urlid
        );
        assertEquals(checkedurlidNotUsed, [{ used: 0 }]);
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });

    await t.step({
      name: "UNIT - get_all_films_by_block",
      fn: async () => {
        const blockname = await urlModel().get_block_by_pathname(
          ctx.db,
          ctx.params.urlid
        );

        const wbFilme = await filmModel().get_all_films_by_block(
          ctx.db,
          blockname[0].block
        );

        switch (blockname[0].block) {
          case "wb1":
            assertEquals(
              wbFilme[0].filmtitle,
              "Mister Paper und sein Doppelgänger"
            );
            break;
          case "wb2":
            assertEquals(wbFilme[0].filmtitle, "Concept of a happy mom");
            break;
          case "wb3":
            assertEquals(wbFilme[0].regie, "Ann Carolin Renninger");
            break;
          case "wb4":
            assertEquals(wbFilme[0].blockFilm_id, "wb4-1");
            break;
          case "wb5":
            assertEquals(wbFilme[1].blockFilm_id, "wb5-2");
            break;
          case "wb6":
            assertEquals(wbFilme[3].blockFilm_id, "wb6-4");
            break;
          case "wbd":
            assertEquals(wbFilme[0].blockFilm_id, "wbd-1");
            break;
          case "wbt":
            assertEquals(
              wbFilme[0].filmtitle,
              "Sit down, don't touch anything"
            );
            break;
          case "wbp":
            assertEquals(wbFilme[10].filmtitle, "Striekers");
        }
        assertExists(wbFilme);
      },
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
Deno.test({
  name: "SECURITY - check XSS attack",
  fn: async (t) => {
    const rndUrlNotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
    ctx.params = {
      urlid: rndUrlNotUsed[0].pathname,
    };
    ctx.request = {
      url: `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`,
    };

    await wblock_add(ctx);

    // Simulate form data with XSS attempt
    ctx.request.formData = async () => {
      const data = {
        _csrf: ctx.token.get("tokenBlocks"),
        ...getRandomFilms(1, 12),
        name: "<script>alert('XSS')</script>",
        email: "<script>alert('XSS')</script>",
        feedback: "<script>alert('XSS')</script>",
        datasec: "on",
      };
      data.get = function (key) {
        return this[key];
      };
      return new Promise((resolve) => {
        resolve(data);
      });
    };

    const result = await wblock_submit(ctx);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
Deno.test({
  name: "wblock_add should return the expected response",
  fn: async (t) => {
    const rndUrlNotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
    ctx.params = {
      urlid: rndUrlNotUsed[0].pathname,
    };
    ctx.request = {
      url: `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`,
    };

    await t.step({
      name: "INTEGRATION - wblock_add not used",
      fn: async () => {
        const result = await wblock_add(ctx);
        ctx.request.formData = async () => {
          const data = {
            _csrf: result.token.get("tokenBlocks"),

            ...getRandomFilms(1, 12),
            name: "",
            email: "",
            feedback: "",
            datasec: "on",
          };

          data.get = function (key) {
            return this[key];
          };

          return new Promise((resolve) => {
            resolve(data);
          });
        };
        assertEquals(result, ctx);
        assertEquals(result.response.status, 200);
        const resultsub = await wblock_submit(ctx);
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });

    await t.step({
      name: "INTEGRATION - wblock_add used",
      fn: async () => {
        const rndUrlNotUsed = await urlModel().get_random_block_by_used(
          ctx.db,
          0
        );
        await urlModel().update_used(ctx.db, 1, rndUrlNotUsed[0].pathname);

        const rndUrlUsed = await urlModel().get_random_block_by_used(ctx.db, 1);
        ctx.params = {
          urlid: rndUrlUsed[0].pathname,
        };
        ctx.request = {
          url: `http://localhost:8100/vote/${rndUrlUsed[0].pathname}`,
        };

        const result = await wblock_add(ctx);
        ctx.request.formData = async () => {
          const data = {
            _csrf: result.token.get("tokenBlocks"),

            ...getRandomFilms(1, 12),
            name: "",
            email: "",
            feedback: "",
            datasec: "on",
          };

          data.get = function (key) {
            return this[key];
          };

          return new Promise((resolve) => {
            resolve(data);
          });
        };
        assertEquals(result, ctx);
        assertEquals(
          result.message,
          "URL nicht gefunden oder wurde bereits verwendet  "
        );
        assertEquals(result.response.status, 404);
        assertEquals(
          result.response.headers["Content-type"],
          "text/html; charset=utf-8"
        );
        const resultsub = await wblock_submit(ctx);
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });

    await t.step({
      name: "INTEGRATION - wblock_add isUsed by date URL",
      fn: async () => {
        let rndUrlUsedby_date_expire =
          await urlModel().get_random_block_by_used(ctx.db, 2);

        if (rndUrlUsedby_date_expire === undefined) {
          const tempBlock = await urlModel().get_random_block_by_used(
            ctx.db,
            0
          );
          rndUrlUsedby_date_expire = await urlModel().update_used(
            ctx.db,
            2,
            tempBlock[0].pathname
          );
        }
        if (rndUrlUsedby_date_expire[0] !== undefined) {
          ctx.url = new URL(
            `http://localhost:8100/vote/${rndUrlUsedby_date_expire[0].pathname}`
          );
          ctx.request = {
            url: `http://localhost:8100/vote/${rndUrlUsedby_date_expire[0].pathname}`,
          };
          ctx.params = {
            urlid: rndUrlUsedby_date_expire[0].pathname,
          };
          const resultadd = await wblock_add(ctx);

          assertEquals(resultadd.response.status, 404);
        }
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
Deno.test({
  name: "SECURITY - prevent SQL injection",
  fn: async (t) => {
    const rndUrlNotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
    ctx.params = {
      urlid: rndUrlNotUsed[0].pathname,
    };
    ctx.request = {
      url: `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`,
    };

    await wblock_add(ctx);

    // Simulate form data with SQL injection attempt
    ctx.request.formData = async () => {
      const data = {
        _csrf: ctx.token.get("tokenBlocks"),
        film1: "1'; DROP TABLE votes; --",
        ...getRandomFilms(2, 12),
        name: "1'; DROP TABLE participants; --",
        email: "1'; DROP TABLE films; --",
        feedback: "1'; DROP TABLE users; --",
        datasec: "on",
      };
      data.get = function (key) {
        return this[key];
      };
      return new Promise((resolve) => {
        resolve(data);
      });
    };

    const result = await wblock_submit(ctx);
    assertEquals(ctx.httpstatus, 404);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "INTEGRATION - wblock_submit test ",
  fn: async (t) => {
    await t.step({
      name: "submit with warning 0 vote points ",
      fn: async () => {
        let rndUrlNotUsed = await urlModel().get_random_block_by_used(
          ctx.db,
          0
        );
        ctx.url = new URL(
          `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`
        );
        ctx.request = {
          url: `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`,
        };
        ctx.params = {
          urlid: rndUrlNotUsed[0].pathname,
        };

        const resultadd = await wblock_add(ctx);
        ctx.request.formData = async () => {
          const data = {
            _csrf: resultadd.token.get("tokenBlocks"),
            film1: `0`,
            film2: 0,
            ...getRandomFilms(3, 12),
            name: "",
            email: "",
            feedback: "",
            datasec: "on",
          };

          data.get = function (key) {
            return this[key];
          };

          return new Promise((resolve) => {
            resolve(data);
          });
        };

        const result = await wblock_submit(ctx);


        assertEquals(ctx.cookies.get("0"), 1);
      },

      sanitizeResources: false,
      sanitizeOps: false,
    });

    await t.step({
      name: "INTEGRATION - submit not succesfully with warning to many characters ",
      fn: async () => {
        const lastVote = await voteModel().get_last_vote(ctx.db);
        let newURLnotUsed;
        if (lastVote) {
          const lastBlock = lastVote.blockFilm_id.split("-")[0];

          newURLnotUsed =
            await urlModel().get_block_by_timestamp_called_and_notused(
              ctx.db,
              lastBlock
            );
        } else {
          newURLnotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
        }
        await checks().updateDateToActual(ctx, newURLnotUsed[0].block);

        ctx.url = new URL(
          `http://localhost:8100/vote/${newURLnotUsed[0].pathname}`
        );
        ctx.request = {
          url: `http://localhost:8100/vote/${newURLnotUsed[0].pathname}`,
        };
        ctx.params = {
          urlid: newURLnotUsed[0].pathname,
        };

        const resultadd = await wblock_add(ctx);
        ctx.request.formData = async () => {
          const data = {
            _csrf: resultadd.token.get("tokenBlocks"),
            ...getRandomFilms(1, 12),
            name: "shirleyyelrihs".repeat(160),
            email: "shirleyyelrihs".repeat(160),
            feedback: "",
            datasec: "on",
          };

          data.get = function (key) {
            return this[key];
          };

          return new Promise((resolve) => {
            resolve(data);
          });
        };

        const result = await wblock_submit(ctx);

        const wbFilme = await filmModel().get_all_films_by_block(
          ctx.db,
          newURLnotUsed[0].block
        );
        const rows = await voteModel().get_last_votes(
          ctx.db,
          `${newURLnotUsed[0].block}`,
          wbFilme.length
        );

        const highestId = await voteModel().get_highest_id(ctx.db);
        assertEquals(
          result.message,
          "Fehler in der Eingabe. Bitte versuche es erneut."
        );
        assertNotEquals(rows[0].voteid, highestId[0].voteid);
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });

    await t.step({
      name: "INTEGRATION - submit succesfully ",
      fn: async () => {
        const lastVote = await voteModel().get_last_vote(ctx.db);
        let newURLnotUsed;
        if (lastVote) {
          const lastBlock = lastVote.blockFilm_id.split("-")[0];

          newURLnotUsed =
            await urlModel().get_block_by_timestamp_called_and_notused(
              ctx.db,
              lastBlock
            );
        } else {
          newURLnotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
        }
        ctx.url = new URL(
          `http://localhost:8100/vote/${newURLnotUsed[0].pathname}`
        );
        ctx.request = {
          url: `http://localhost:8100/vote/${newURLnotUsed[0].pathname}`,
        };
        ctx.params = {
          urlid: newURLnotUsed[0].pathname,
        };
 

        await checks().updateDateToActual(ctx, newURLnotUsed[0].block);

        const resultadd = await wblock_add(ctx);

        resultadd.request.formData = async () => {
          const data = {
            _csrf: resultadd.token.get("tokenBlocks"),
            ...getRandomFilms(1, 12),
            name: "",
            email: "",
            feedback: "",
            datasec: "on",
          };
          data.get = function (key) {
            return this[key];
          };
          return new Promise((resolve) => {
            resolve(data);
          });
        };

        const result = await wblock_submit(resultadd);

        const wbFilme = await filmModel().get_all_films_by_block(
          result.db,
          newURLnotUsed[0].block
        );

        const rows = await voteModel().get_last_votes(
          result.db,
          newURLnotUsed[0].block,
          wbFilme.length
        );

        const highestId = await voteModel().get_highest_id(result.db);

        assertEquals(rows[0], highestId[0]);
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });
    ctx.db.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

import urlModel from "./../db/models/urls.js";
import  checks from "./check.js";

import * as valid from "./validation.js";
import validation from "./validation.js";
import { assertEquals } from "https://deno.land/std@0.219.0/assert/mod.ts";
import * as client from "./../db/client.js";



Deno.test("UNIT - validate_timestamp should return false", async () => {
  const db = client.default;
  const pathname = "QRvoteY59SdC3q";

  const time_diff = [
    {
      id: 256,
      timestamp_called: "15:22:08",
      timestamp_send: "15:22:27",
      difference: 3599,
    },
  ];
  // const pathname = "QRvote01823x26"; //local db

  const result = await valid.validate_timestamp(db, pathname, time_diff);
  assertEquals(result, false);
});

Deno.test(
  "UNIT - validate_block should return true if block exists in alltheBlocks, false if not",
  () => {
    const alltheBlocks = [{ block: "wb1" }, { block: "wb2" }, { block: "wb3" }];
    const block = "wb2";
    const result = validation().validate_block(alltheBlocks, block);
    assertEquals(result, true);
    const blockfalse = "wb4";
    const resultfalse = validation().validate_block(alltheBlocks, blockfalse);
    assertEquals(resultfalse, false);
  }
);
const ctx = {
  db: client.default,
};
Deno.test("INTEGRATION - validate_participation - errors object ", async (t) => {
  const rndUrlNotUsed = await urlModel().get_random_block_by_used(ctx.db, 0);
  // console.log("🚀 ~ fn: ~ rndUrlNotUsed:", rndUrlNotUsed);
  ctx.params = {
    urlid: rndUrlNotUsed[0].pathname,
  };

  ctx.cookies= {
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
  ctx.url = new URL(`http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`);
  ctx.request = {
    url: `http://localhost:8100/vote/${rndUrlNotUsed[0].pathname}`,
  };
  ctx.params = { urlid: rndUrlNotUsed[0].pathname };
  ctx.sessionStore = {
    get: () => null,
    set: () => {},
    destroy: () => {},
  };

  const data = {
    filmValues: new Map([
      ["1", "4"],
      ["2", "4"],
      ["3", "4"],
      ["4", "4"],
      ["5", "4"],
      ["6", "4"],
      ["7", "4"],
      ["8", "4"],
      ["9", "4"],
      ["10", "4"],
      ["11", "4"],
      ["12", "6"],
    ]),
    block: rndUrlNotUsed[0].block,
    name: "Shirley",
    email: "shirley@filmkorte.de",
    feedback: "GEILOO",

    datasec: "on",
    _csrf:
      "fM/6BmPDJB/ZRMdkIsBYoXyoaGuc8vKFbWOMO0LiyR+NxVn8KzjZPGbv/dk06W/VdOf6UlRUQ4LdpR3i8htdWA==",
  };

  const errors = await validation().validate_participation(
    ctx,
    data,
    rndUrlNotUsed[0].block
  );



  if (await checks().check_date(ctx, rndUrlNotUsed[0].block)) {
    assertEquals(errors, {
      // film: "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.",
      time: "Die Gültigkeit des Links ist leider abgelaufen.",
    });
  } else {
    assertEquals(errors, {
      // film: "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.",
    });
  }

  await t.step(
    "UNIT - validate_participation - datasec should through an error",
    async () => {
      data.datasec = null;

      const errors = await validation().validate_participation(
        ctx,
        data,
        rndUrlNotUsed[0].block
      );

      if (await checks().check_date(ctx, rndUrlNotUsed[0].block)) {
        assertEquals(errors, {
          datasec: "Die Einwilligung der Datenschutzerklärung ist notwendig.",
          // film: "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.",
          time: "Die Gültigkeit des Links ist leider abgelaufen.",
        });
      } else {
        assertEquals(errors, {
          datasec: "Die Einwilligung der Datenschutzerklärung ist notwendig.",
          // film: "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.",
        });
      }
    }
  );

  await t.step("feedback, email, name should through an error", async () => {
    data.feedback = "GEILOO".repeat(100);
    data.email = "GEILOO".repeat(100);

    data.name = "GEILOO".repeat(100);

    const errors = await validation().validate_participation(
      ctx,
      data,
      rndUrlNotUsed[0].block
    );

    if (await checks().check_date(ctx, rndUrlNotUsed[0].block)) {
      assertEquals(errors, {
        datasec: "Die Einwilligung der Datenschutzerklärung ist notwendig.",
        email: "Das sind zu viele Zeichen. Max. 254 Zeichen.",
        feedback: "Das sind zu viele Zeichen. Max. 455 Zeichen.",
        // film: "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.",

        name: "Das sind zu viele Zeichen. Max. 120 Zeichen.",
        time: "Die Gültigkeit des Links ist leider abgelaufen.",
      });
    } else {
      assertEquals(errors, {
        datasec: "Die Einwilligung der Datenschutzerklärung ist notwendig.",
        email: "Das sind zu viele Zeichen. Max. 254 Zeichen.",
        feedback: "Das sind zu viele Zeichen. Max. 455 Zeichen.",
        // film: "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.",
        name: "Das sind zu viele Zeichen. Max. 120 Zeichen.",
      });
    }
  });

  await t.step(
    "validate_participation should return empty errors object",
    async () => {
      const data = {
        filmValues: new Map([
          ["1", "4"],
          ["2", "4"],
          ["3", "4"],
          ["4", "4"],
          ["5", "4"],
          ["6", "4"],
          ["7", "4"],
          ["8", "4"],
          ["9", "4"],
          ["10", "4"],
          ["11", "4"],
          ["12", "6"],
        ]),
        block: rndUrlNotUsed[0].block,
        name: "Shirley",
        email: "shirley@filmkorte.de",
        feedback: "GEILOO",
        datasec: "on",
        _csrf:
          "fM/6BmPDJB/ZRMdkIsBYoXyoaGuc8vKFbWOMO0LiyR+NxVn8KzjZPGbv/dk06W/VdOf6UlRUQ4LdpR3i8htdWA==",
      };

      const errors = await validation().validate_participation(
        ctx,
        data,
        rndUrlNotUsed[0].block
      );

      if (await checks().check_date(ctx, rndUrlNotUsed[0].block)) {
        assertEquals(errors, {
          time: "Die Gültigkeit des Links ist leider abgelaufen.",
        });
      } else {
        assertEquals(errors, {});
      }
      ctx.db.close();
    }
  );
});

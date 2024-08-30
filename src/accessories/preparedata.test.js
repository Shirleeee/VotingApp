import preparedata from "./preparedata.js";
import * as prep from "./preparedata.js";

import { assertEquals } from "https://deno.land/std@0.221.0/assert/mod.ts";
import { format } from "https://deno.land/std@0.91.0/datetime/mod.ts";
import * as client from "./../db/client.js";



Deno.test("UNIT - make_obj_for_blockFilm_id should return the expected object", () => {
  const objArr = [
    { blockFilm_id: "wb1-1", total: 10 },
    { blockFilm_id: "2", total: 20 },
    { blockFilm_id: "3", total: 30 },
  ];

  const expectedResult = {
    "wb1-1": 10,
    "2": 20,
    "3": 30,
  };

  const result = prep.make_obj_for_blockFilm_id(objArr);

  assertEquals(expectedResult, result);
});



Deno.test("UNIT - sort_keys should return the expected sorted map", async () => {
  const maptosort = [
    { blockFilm_id: "wb3-1", total: 20 },
    { blockFilm_id: "wb3-11", total: 10 },
    { blockFilm_id: "wb3-3", total: 30 },
  ];

  const expectedResult = [
    { blockFilm_id: "wb3-1", total: 20 },
    { blockFilm_id: "wb3-3", total: 30 },
    { blockFilm_id: "wb3-11", total: 10 },
  ];

  const result = await preparedata().sort_keys(maptosort);

  assertEquals(expectedResult, result);
});

Deno.test("UNIT - add_votes_new_keys should return the expected data object", async () => {
  const data = {
    filmValues: new Map([
      ["1", "1"],
      ["2", "2"],
      ["3", "3"],
    ]),
  };
  const block = "wb1";

  const expectedResult = {
    filmValues: new Map([
      ["wb1-1", "1"],
      ["wb1-2", "2"],
      ["wb1-3", "3"],
    ]),
  };

  const result = await preparedata().add_votes_new_keys(data, block);

  assertEquals(expectedResult, result);
});

Deno.test("wblock_submit_create_data_object should return the expected data object", async () => {
 
  const ctx = {
    request: {
      formData: async () => {
        return {
          get: (key) => {
            if (key === "film1") return "1";
            if (key === "film2") return "2";
            if (key === "film3") return "3";
            return null;
          },
        };
      },
    },
  };
  const block = [{ block: "wb1" }];
  const wbFilme = [
    { film: "film1" },
    { film: "film2" },
    { film: "film3" },
  ];
  const dateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const expectedResult = {
    filmValues: new Map([
      ["1", "1"],
      ["2", "2"],
      ["3", "3"],
    ]),
    block: "wb1",
    name: null,
    email: null,
    feedback: null,
    dateTime: dateTime,
    datasec: null,
    _csrf: null,
  };

  const result = await preparedata().wblock_submit_create_data_object(
    ctx,
    block,
    wbFilme
  );

  assertEquals(expectedResult, result);
});
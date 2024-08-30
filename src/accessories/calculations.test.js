import { assertEquals } from "https://deno.land/std@0.219.0/assert/mod.ts";
import * as calc from "./calculations.js";
Deno.test("ERROR - calc_results should handle empty inputs", () => {
  const votesPoint100Obj = {};
  const summedVotes = [];

  const expected = {};

  const result = calc.calc_results(votesPoint100Obj, summedVotes);

  assertEquals(result, expected);
});

Deno.test("ERROR - votes_100percent_eachblockfilm should handle empty input array", () => {
  const withoutZeros = [];

  const expected = {};

  const result = calc.votes_100percent_eachblockfilm(withoutZeros);

  assertEquals(result, expected);
});
Deno.test("ERROR - calc_results should handle missing keys in inputs", () => {
  const votesPoint100Obj = {
    "wbt-1": 100,
    // Missing "wbt-2"
    "wbt-3": 325,
  };

  const summedVotes = [
    { blockFilm_id: "wbt-1", total: 20 },
    { blockFilm_id: "wbt-2", total: 150 },
    { blockFilm_id: "wbt-3", total: 295 },
  ];

  const expected = {
    "wbt-1": "20.000",
    "wbt-2": "NaN",
    "wbt-3": "90.769",
  };

  const result = calc.calc_results(votesPoint100Obj, summedVotes);

  assertEquals(result, expected);
});

Deno.test("UNIT -  calc_results should calculate the right percentage", () => {
  const votesPoint100Obj = {
    "wbt-1": 100,
    "wbt-2": 150,
    "wbt-3": 325,
  };

  const summedVotes = [
    { blockFilm_id: "wbt-1", total: 20 },
    { blockFilm_id: "wbt-2", total: 150 },
    { blockFilm_id: "wbt-3", total: 295 },
  ];
  const expected = {
    "wbt-1": "20.000",
    "wbt-2": "100.000",
    "wbt-3": "90.769",
  };
  const result = calc.calc_results(votesPoint100Obj, summedVotes);
  // console.log("🚀 ~ Deno.test ~ result:", result);

  assertEquals(result, expected);
});



Deno.test(
  "UNIT - votes_100percent_eachblockfilm should calculate the total votes for each block film",
  () => {
    const withoutZeros = [
      { blockFilm_id: "block1", total: 5 },
      { blockFilm_id: "block2", total: 10 },
      { blockFilm_id: "block3", total: 15 },
    ];
    const expected = { block1: 30, block2: 60, block3: 90 };
    const result = calc.votes_100percent_eachblockfilm(withoutZeros);

    assertEquals(result, expected);
  }
);

Deno.test(
  "UNIT - get_main_contest_winner should calculate the winner of the main contest",
  async () => {
  
    const overAllContestBlocks = [
      { blockWin: "58.152", blockid: "wbt-2", blockWinner: "Die graue March" },
      {
        blockWin: "64.444",
        blockid: "wb4-7",
        blockWinner: "Dat Beste an Platt",
      },
      {
        blockWin: "64.445",
        blockid: "wb4-2",
        blockWinner: "Hola Llamigo",
      },
    ];
    const expected = {
      value: "64.445",
      blockid: "wb4-2",
      blockWinner: "Hola Llamigo",
    };
    const result = await calc.get_main_contest_winner( overAllContestBlocks);

    assertEquals(result, expected);
   
  }
);
Deno.test("ERROR - get_main_contest_winner should handle empty input array", async () => {
  const overAllContestBlocks = [];

  const expected = {value:0}; 

  const result = await calc.get_main_contest_winner(overAllContestBlocks);

  assertEquals(result, expected);
});
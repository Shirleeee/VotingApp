import { format } from "https://deno.land/std@0.91.0/datetime/mod.ts";
import voteModel from "../db/models/votes.js";
import blockModel from "../db/models/blocks.js";
import * as calc from "../accessories/calculations.js";


/**
 * Converts an array of objects with `blockFilm_id` and `total` properties into a map where the keys are the `blockFilm_id` values and the values are the corresponding `total` values.
 *
 * @param {Object[]} objArr - An array of objects with `blockFilm_id` and `total` properties.
 * @returns {Object} - A map where the keys are the `blockFilm_id` values and the values are the corresponding `total` values.
 */
export const make_obj_for_blockFilm_id = (objArr) => {
  let totalMap = {};
  objArr.forEach((item) => {
    totalMap[item.blockFilm_id] = item.total;
  });

  return totalMap;
};

export default function () {
  return {
    /**
     * Adds additional data to the `getFilms` object based on the provided parameters.
     *
     * @param {Object} db - The database connection.
     * @param {Object} getFilms - The object to be updated with additional data.
     * @param {Object[]} summedVotes - An array of objects with `blockFilm_id` and `total` properties.
     * @param {Object} blockWinner - An object with `value`, `blockid`, and `film` properties.
     * @param {string} blockname - The name of the block.
     * @param {Object} votesPoint100Obj - An object with `blockFilm_id` keys and corresponding vote counts.
     * @returns {Object} - The updated `getFilms` object.
     */

    add_to_obj: async (
      db,
      getFilms,
      summedVotes,
      blockWinner,
      blockname,
      votesPoint100Obj
    ) => {
      getFilms.blockWin = blockWinner.value;
      getFilms.blockid = blockWinner.blockid;
      getFilms.blockWinner = blockWinner.film;

      const summedVotesObj = make_obj_for_blockFilm_id(summedVotes);
      const allZero = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,0)
      );

      const allSix = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,6)
      );
      const allFive = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,5)
      );
      const allFour = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,4)
      );
      const allThree = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,3)
      );
      const allTwo = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,2)
      );
      const allOne = make_obj_for_blockFilm_id(
        await voteModel().count_all_votepoint_by_block(db, blockname,1)
      );

      const amountVotesByBlock = await voteModel().count_votes_by_block(
        db,
        blockname
      );
      getFilms.allZero = allZero;
      getFilms.allOne = allOne;
      getFilms.allTwo = allTwo;
      getFilms.allThree = allThree;
      getFilms.allFour = allFour;
      getFilms.allFive = allFive;
      getFilms.allSix = allSix;
      getFilms.summedVotes = summedVotesObj;
      getFilms.votesPoint100 = votesPoint100Obj;
      getFilms.blockname = blockname;
      let size = Object.keys(votesPoint100Obj).length;
      const division =
        amountVotesByBlock === 0 && size === 0 ? 0 : amountVotesByBlock / size;

      getFilms.amountVotesByBlock = division;

      return getFilms;
    },
    /**
     * Sorts a map of objects by the numeric part of the `blockFilm_id` property.
     *
     * @param {Map<string, any>} maptosort - The map to be sorted.
     * @returns {Map<string, any>} - The sorted map.
     */
    sort_keys: async (maptosort) => {
      const sortedMap = maptosort.sort(function (a, b) {
        return (
          parseInt(a.blockFilm_id.split("-")[1]) -
          parseInt(b.blockFilm_id.split("-")[1])
        );
      });

      return sortedMap;
    },
    /**
     * Adds new keys to a map of film values based on the provided block name.
     *
     * @param {Object} data - An object containing the film values map and other data.
     * @param {string} block - The name of the block to use for the new keys.
     * @returns {Object} - The updated data object with the new keys added to the film values map.
     */
    add_votes_new_keys: async (data, block) => {
      let newMap = new Map();
      const oldMap = data.filmValues;
      oldMap.forEach((value, key) => {
        let newKey = block + "-" + key;
        newMap.set(newKey, value);
      });
      data.filmValues = newMap;
      return data;
    },
    /**
     * Creates a data object for a block submission.
     *
     * @param {Object} ctx - The context object containing the request data.
     * @param {Array} block - An array containing the block information.
     * @param {Array} wbFilme - An array of film data.
     * @returns {Object} - An object containing the form data and other relevant information.
     */
    wblock_submit_create_data_object: async (ctx, block, wbFilme) => {
  
      const formData = await ctx.request.formData();

      const blockname = block[0].block;

      const filmMap = new Map();
      for (let i = 1; i <= wbFilme.length; i++) {
        const num = i.toString();
        const value =
          formData.get("film" + num) === null
            ? parseInt("0")
            : formData.get("film" + num);
        filmMap.set(num, value);
      }

      const dateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

      return {
        filmValues: filmMap,
        block: blockname,
        name: formData.get("name"),
        email: formData.get("email"),
        feedback: formData.get("feedback"),
        dateTime: dateTime,
        datasec: formData.get("datasec"),
        _csrf: formData.get("_csrf"),
      };
    },
    /**
     * Creates an evaluation data object for all blocks.
     *
     * @param {Object} ctx - The context object containing the database connection.
     * @returns {Array} - An array of objects containing evaluation data for each block.
     */
    make_evaData_obj: async (ctx) => {
      const alltheBlocks = await blockModel().get_all_blocks(ctx.db);

      const getAllblocks = [];

      for (const value of alltheBlocks) {
        const filmCalcs = await calc.get_calculation(ctx.db, value.block);

        const allZero = filmCalcs.allZero;
        const allOne = filmCalcs.allOne;
        const allTwo = filmCalcs.allTwo;
        const allThree = filmCalcs.allThree;
        const allFour = filmCalcs.allFour;
        const allFive = filmCalcs.allFive;
        const allSix = filmCalcs.allSix;

        const votesPoint100 = filmCalcs.votesPoint100;
        const summedVotes = filmCalcs.summedVotes;
        const amountVotesByBlock = await voteModel().count_votes_by_block(
          ctx.db,
          value.block
        );

        const obj = {
          blockfilms: filmCalcs,

          amountVotesByBlock: amountVotesByBlock,
          allZero: allZero,
          allOne: allOne,
          allTwo: allTwo,
          allThree: allThree,
          allFour: allFour,
          allFive: allFive,
          allSix: allSix,
          votesPoint100: votesPoint100,
          summedVotes: summedVotes,
        };

        getAllblocks.push(obj);
      }

      return await getAllblocks;
    },
    /**
     * Retrieves the overall winner of the contest, excluding the "wbp" and "wbd" blocks.
     *
     * @param {Object} ctx - The context object containing the database connection.
     * @returns {Object} - The overall winner of the contest.
     */
    get_over_all_winner: async (ctx) => {
      const alltheBlocks = await blockModel().get_all_blocks(ctx.db);

      const overAllContestBlocks = alltheBlocks.filter(
        (item) => item.block !== "wbp" && item.block !== "wbd"
      );

      const overallWinnerMC = await calc.get_main_contest_winner(
        await calc.get_all_calculation(ctx.db, overAllContestBlocks)
      );
      return overallWinnerMC;
    },
  };
}

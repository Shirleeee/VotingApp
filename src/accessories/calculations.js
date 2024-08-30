import filmeModel from "../db/models/films.js";
import voteModel from "../db/models/votes.js";
import prepare from "./preparedata.js";

/**
 * Calculates the percentage of votes for each block film based on the maximum possible votes.
 *
 * @param {Object} votesPoint100byBlockFilm - An object mapping block film IDs to the maximum possible votes for that block film.
 * @param {Array} summedVotes - An array of objects containing the total votes for each block film.
 * @returns {Object} - An object mapping block film IDs to the percentage of votes for that block film.
 */
export const calc_results = (votesPoint100byBlockFilm, summedVotes) => {
  let totalMap = {};

  summedVotes.forEach((item) => {
    totalMap[item.blockFilm_id] = (
      (item.total * 100) /
      votesPoint100byBlockFilm[item.blockFilm_id]
    ).toFixed(3);
  });

  return totalMap;
};


/**
 * Calculates the maximum possible votes for each block film.
 *
 * @param {Array} withoutZeros - An array of objects containing the votes for each block film, excluding any with zero votes.
 * @returns {Object} - An object mapping block film IDs to the maximum possible votes for that block film.
 */
export const votes_100percent_eachblockfilm = (withoutZeros) => {
  const MAX_POINTS = 6;

  let totalMap = {};

  withoutZeros.forEach((item) => {

    
    totalMap[item.blockFilm_id] = item.total * MAX_POINTS;
  });

  return totalMap;
};

/**
 * Retrieves the calculation results for a specific block in the application.
 *
 * @param {Object} db - The database connection object.
 * @param {string} blockname - The name of the block to retrieve the calculation results for.
 * @returns {Promise<Array>} - An array of film objects with the calculated results for the specified block.
 */
export const get_calculation = async (db, blockname) => {
  const withoutZeros = await voteModel().takeOutZero_votes_by_block(
    db,
    blockname
  );

  // calculate max points per block which represents 100%
  const votesPoint100byBlockFilm = votes_100percent_eachblockfilm(withoutZeros);

  const summedVotes = await voteModel().sum_all_votepoints_by_blockfilm(
    db,
    blockname
  );
  console.log("🚀 ~ constget_calculation= ~ summedVotes:", summedVotes)

  const getFilms = await filmeModel().get_all_films_by_block(db, blockname);

  const films = await calc_best_block(
    db,
    blockname,
    getFilms,
    votesPoint100byBlockFilm,
    summedVotes,
    withoutZeros
  );

  return films;
};

/**
 * Calculates the best block film based on the provided data.
 *
 * @param {Object} db - The database connection object.
 * @param {string} blockname - The name of the block to calculate the best film for.
 * @param {Array} getFilms - An array of film objects for the specified block.
 * @param {Object} votesPoint100Obj - An object mapping block film IDs to the maximum possible votes for that block film.
 * @param {number} summedVotes - The total number of votes for all block films.
 * @returns {Promise<Array>} - An array of film objects with the calculated results for the specified block.
 */
const calc_best_block = async (
  db,
  blockname,
  getFilms,
  votesPoint100Obj,
  summedVotes
) => {
  let blockWinner = { value: 0 };

  const totalMapPercent = calc_results(votesPoint100Obj, summedVotes);

  getFilms = getFilms.map((film) => {
    delete film.imagepath;
    console.log("🚀 ~ getFilms=getFilms.map ~ otalMapPercent[film.blockFilm_id]:", totalMapPercent[film.blockFilm_id]);

    if (totalMapPercent[film.blockFilm_id] > blockWinner.value) {

      blockWinner.film = film.filmtitle;
      blockWinner.value = totalMapPercent[film.blockFilm_id];
      blockWinner.blockid = film.blockFilm_id;
    }

    return {
      ...film,
      total: totalMapPercent[film.blockFilm_id],
    };
  });

  const extendedGetFilms = await prepare().add_to_obj(
    db,
    getFilms,
    summedVotes,
    blockWinner,
    blockname,
    votesPoint100Obj
  );

  return extendedGetFilms;
};

/**
 * Retrieves the calculation results for all contest blocks.
 *
 * @param {Object} db - The database connection object.
 * @param {Array} overAllContestBlocks - An array of objects representing the contest blocks.
 * @returns {Promise<Array>} - An array of calculation results for each contest block.
 */
export const get_all_calculation = async (db, overAllContestBlocks) => {
  let allFilms = [];

  for (const b of overAllContestBlocks) {
    const film = await get_calculation(db, b.block);
    allFilms.push(film);
  }

  return allFilms;
};

/**
 * Retrieves the main contest winner from a list of contest block calculations.
 *
 * @param {Array} overAllContestcalcs - An array of objects representing the contest block calculations.
 * @returns {Object} - An object containing the details of the main contest winner, including the block ID, the winning value, and the block winner name.
 */
export const get_main_contest_winner = async (overAllContestcalcs) => {
  let mainContestWinner = { value: 0 };

  for (const film of overAllContestcalcs) {
    if (film.blockWin > mainContestWinner.value) {
      mainContestWinner.blockid = film.blockid;
      mainContestWinner.value = film.blockWin;
      mainContestWinner.blockWinner = film.blockWinner;
    }
  }

  return mainContestWinner;
};

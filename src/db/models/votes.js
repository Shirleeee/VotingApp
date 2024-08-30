// https://www.freecodecamp.org/news/how-to-use-mysql-in-deno-oak/
import urlModel from "./urls.js";
import preparedata from "./../../accessories/preparedata.js";
export default function () {
  return {
    //!UNIT - TESTS

    /**
     * Retrieves the last vote with the highest ID from the database.
     *
     * @param {object} db - The database connection object.
     * @returns {Promise<object[]>} - An array containing the last vote with the highest ID.
     * @throws {Error} - If there is an error executing the database query.
     */
    get_highest_id: async (db) => {
      try {
        const rows = await db.query(
          `SELECT * FROM votes ORDER BY voteid DESC LIMIT 1`
        );

        return rows;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
    //!UNIT - TESTS

    /**
     * Retrieves the last set of votes for a given block ID prefix, up to the specified limit.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID prefix to filter the votes by.
     * @param {number} limit - The maximum number of votes to retrieve.
     * @returns {Promise<object[]>} - An array of vote objects, ordered by voteid in descending order.
     * @throws {Error} - If there is an error executing the database query.
     */
    get_last_votes: async (db, block, limit) => {
      try {
        const rows = await db.query(
          `SELECT * FROM votes WHERE blockFilm_id LIKE ? ORDER BY voteid DESC LIMIT ?`,
          [block.substring(0, 3) + "%", limit]
        );

        return rows;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
    //!UNIT - TESTS

    /**
     * Retrieves the last vote based on the block ID prefix.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID prefix to filter the votes by.
     * @returns {Promise<object>} - An object representing the last vote.
     */
    get_last_vote_by_block: async (db, block) => {
      try {
        const rows = await db.query(
          `SELECT * FROM votes WHERE blockFilm_id LIKE ? ORDER BY voteid DESC LIMIT 1 `,
          [block.substring(0, 3) + "%"]
        );

        return rows;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
    //!UNIT - TESTS
    /**
     * Retrieves the last vote with the highest ID from the database.
     *
     * @param {object} db - The database connection object.
     * @returns {Promise<object>} - A promise that resolves to the last vote with the highest ID.
     * @throws {Error} - If there is an error executing the database query.
     */

    get_last_vote: async (db) => {
      try {
        const rows = await db.query(
          `SELECT * FROM votes WHERE voteid = (SELECT MAX(voteid) FROM votes)`
        );

        return rows[0]; // Return the entire row
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS

    /**
     * Adds a set of votes to the database.
     *
     * @param {object} db - The database connection object.
     * @param {object} data - An object containing the vote data to be added.
     *   - `data.block`: The block ID prefix to associate the votes with.
     *   - `data.filmValues`: An object where the keys are the blockFilm_id values and the values are the vote values to be inserted.
     * @returns {Promise<void>} - A Promise that resolves when the votes have been added to the database.
     * @throws {Error} - If there is an error executing the database query.
     */
    add_votes: async (db, data) => {
      try {
        preparedata().add_votes_new_keys(data, data.block);

        for (var [key, value] of data.filmValues.entries()) {
          await db.execute(
            `INSERT INTO votes (blockFilm_id, votevalue, time) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [key, value]
          );
        }
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },

    /**
     * Retrieves the sum of all votevalue for each blockFilm_id that matches the given block ID prefix.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID prefix to filter the votes by.
     * @returns {Promise<object>} - An object containing the sum of votevalue for each matching blockFilm_id.
     */
    sum_all_votepoints_by_blockfilm: async (db, block) => {
      try {
        let d = block + "-%";
        const result = await db.query(
          ` SELECT 
        blockFilm_id as blockFilm_id, 
        CAST(SUM(votevalue) AS UNSIGNED) as total FROM votes WHERE blockFilm_id LIKE ? GROUP BY blockFilm_id; 
        `,
          [d]
        );

        return preparedata().sort_keys(result);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves the count of all votes for each blockFilm_id that matches the given block ID prefix.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID prefix to filter the votes by.
     * @returns {Promise<object>} - An object containing the count of votes for each matching blockFilm_id.
     */
    count_all_votes_by_blockfilm: async (db, block) => {
      try {
        let d = block + "-%";
        const result = await db.query(
          ` SELECT 
        blockFilm_id as blockFilm_id, 
        COUNT(*) as total FROM votes WHERE blockFilm_id LIKE ? GROUP BY blockFilm_id; 
        `,
          [d]
        );

        return preparedata().sort_keys(result);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves the count of votes for each block, excluding votes with a value of 0.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID to filter the votes by.
     * @returns {Promise<number>} - The total number of votes for the specified block, excluding votes with a value of 0.
     */
    count_votes_by_block: async (db, block) => {
      try {
        // AND votevalue != 0
        const [result] = await db.query(
          `SELECT COUNT(*) count FROM votes WHERE SUBSTRING(blockFilm_id, 1, 3) = ?  GROUP BY SUBSTRING(blockFilm_id, 1, 3)`,
          [block]
        );

        return result?.count === undefined ? parseInt("0") : result?.count;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },

    /**
     * Retrieves the count of votes with the specified votepoint value for each blockFilm_id that matches the given block ID prefix.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID prefix to filter the votes by.
     * @param {number} votepoint - The votevalue to filter the votes by.
     * @returns {Promise<object>} - An object containing the count of votes with the specified votepoint value for each matching blockFilm_id.
     */
    count_all_votepoint_by_block: async (db, block, votepoint) => {
      try {
        let d = block + "-%";

        // AND votevalue != 0
        const result = await db.query(
          ` SELECT 
        blockFilm_id as blockFilm_id, 
        COUNT(*) as total FROM votes WHERE blockFilm_id LIKE ? AND votevalue = ? GROUP BY blockFilm_id; 
        `,
          [d, votepoint]
        );
        return preparedata().sort_keys(result);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves the total number of votes for each block, excluding votes with a value of 0.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block ID to filter the votes by.
     * @returns {Promise<object>} - An object containing the total number of votes for each block, excluding votes with a value of 0.
     */
    takeOutZero_votes_by_block: async (db, block) => {
      try {
        let d = block + "-%";
        // AND votevalue != 0
        const result = await db.query(
          ` SELECT 
        blockFilm_id as blockFilm_id, 
        COUNT(*) as total FROM votes WHERE blockFilm_id LIKE ? AND votevalue != 0 GROUP BY blockFilm_id; 
        `,
          [d]
        );

        return preparedata().sort_keys(result);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
  };
}

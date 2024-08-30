import preparedata from "./../../accessories/preparedata.js";

export default function () {
  return {
    /**
     * Retrieves all the films for the specified block.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block to filter the films by.
     * @returns {Promise<Array<object>>} - An array of film objects.
     */
    get_all_films_by_block: async (db, block) => {
      try {
        const result = await db.query(`SELECT * FROM films WHERE block= ?`, [
          block,
        ]);
        return preparedata().sort_keys(result);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },

    /**
     * Retrieves all the blockFilm_id values for the specified block.
     *
     * @param {object} db - The database connection object.
     * @param {string} block - The block to filter the films by.
     * @returns {Promise<Array<{blockFilm_id: number}>>} - An array of objects containing the blockFilm_id values.
     */
    get_all_blockIds_by_block: async (db, block) => {
      try {
        return db.query(`SELECT blockFilm_id FROM films WHERE block= ?`, [
          block,
        ]);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    get_film_by_blockFilmId: async (db, blockFilmId) => {
      try {
        return db.query(`SELECT * FROM films WHERE blockFilm_id= ?`, [
          blockFilmId,
        ]);
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    update_one_filmdata_by_blockFilmId: async (db, data,column, blockFilmId) => {
      try {
        const result = await db.execute(
          `UPDATE films SET ${column} = ? WHERE blockFilm_id = ?`,
          [data, blockFilmId]
        );

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    
   
  };
}

export default function () {
  return {
    /**
     * Adds a new participant to the database.
     *
     * @param {Object} db - The database connection object.
     * @param {Object} data - An object containing the participant data to be inserted.
     * @param {string} data.name - The name of the participant.
     * @param {string} data.email - The email address of the participant.
     * @param {string} data.feedback - The feedback provided by the participant.
     * @param {boolean} data.block - Indicates whether the participant is blocked.
     * @returns {Promise<number>} - The ID of the newly inserted participant.
     */
    add_viewer: async (db, data) => {
      try {
        const result = await db.execute(
          `INSERT INTO participants (name, email, block, time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,

          [data.name, data.email, data.block]
        );

        return result.lastInsertId;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },

    /**
     * Retrieves a random entry from the participants table.
     *
     * @param {Object} db - The database connection object.
     * @returns {Promise<Object>} - The randomly selected participant record.
     */
    get_random_entry: async (db) => {
      try {
        const [result] = await db.query(
          `SELECT * FROM participants ORDER BY RAND() LIMIT 1`
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
  };
}

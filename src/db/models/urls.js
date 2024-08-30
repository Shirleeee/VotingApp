export default function () {
  return {
    /**
     * Retrieves the `location` value from the `urls` table for the given `pathname`.
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The `pathname` value to retrieve the `location` for.
     * @returns {Promise<Object>} - The `location` value from the `urls` table.
     */
    get_location: async (db, pathname) => {
      try {
        const result = await db.query(
          `SELECT location FROM urls WHERE pathname= ?`,
          [pathname]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves the `timestamp_called` value from the `urls` table for the given `pathname`.
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The `pathname` value to retrieve the `timestamp_called` for.
     * @returns {Promise<string>} - The `timestamp_called` value from the `urls` table, or undefined if not found.
     */
    get_timestamp_called: async (db, pathname) => {
      try {
        const result = await db.query(
          `SELECT timestamp_called FROM urls WHERE pathname= ?`,
          [pathname]
        );
        return result[0].timestamp_called;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
    get_block_by_timestamp_called_and_notused: async (db, block) => {
      try {
        const result = await db.query(
          `SELECT * FROM urls WHERE used= 0 AND timestamp_called = "00:00:00" AND NOT block = ? LIMIT 1`,
          [block]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
    /**
     * Updates the `timestamp_called` column in the `urls` table for the given `pathname` to the current timestamp if the existing value is "00:00:00".
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The `pathname` value to update in the `urls` table.
     * @returns {Promise<Object>} - The result of the database update operation, or undefined if the `timestamp_called` was already set.
     */
    set_timestamp_called: async (db, pathname) => {
      try {
        const timestampC = await db.query(
          `SELECT timestamp_called FROM urls WHERE pathname= ?`,
          [pathname]
        );

        if (timestampC === undefined) {
          return;
        }

        if (timestampC[0].timestamp_called === "00:00:00") {
          await db.query(
            `UPDATE urls SET timestamp_called = CURRENT_TIMESTAMP, time = CURRENT_TIMESTAMP WHERE pathname = ?`,
            [pathname]
          );
        }
        return timestampC;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Updates the `timestamp_send` column in the `urls` table for the given `pathname` to the current timestamp.
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The `pathname` value to update in the `urls` table.
     * @returns {Promise<Object>} - The result of the database update operation.
     */
    set_timestamp_send: async (db, pathname) => {
      try {
        const result = await db.query(
          `UPDATE urls SET timestamp_send = CURRENT_TIMESTAMP, time = CURRENT_TIMESTAMP WHERE pathname = ?`,
          [pathname]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves the difference in seconds between the `timestamp_called` and `timestamp_send` columns for the URL with the given `pathname`.
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The `pathname` value to search for in the `urls` table.
     * @returns {Promise<Object>} - An object containing the `urlid`, `timestamp_called`, `timestamp_send`, and the difference in seconds between the two timestamps.
     */
    get_difference_timestamp: async (db, pathname) => {
      try {
        const result = await db.query(
          `SELECT urlid, timestamp_called, timestamp_send, TIMESTAMPDIFF(SECOND, timestamp_called, timestamp_send) AS difference FROM urls WHERE pathname= ?`,
          [pathname]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },

    /**
     * Checks if a URL with the given pathname exists in the database and returns its 'used' status.
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The pathname to check for in the 'urls' table.
     * @returns {Promise<Object>} - An object containing the 'used' status of the URL with the given pathname.
     */
    check_url: async (db, pathname) => {
      try {
        const result = await db.query(
          `SELECT used FROM urls WHERE pathname= ?`,
          [pathname]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Updates the `used` column in the `urls` table for the given `pathname`.
     *
     * @param {Object} db - The database connection object.
     * @param {string} used - The new value to set for the `used` column.
     * @param {string} pathname - The `pathname` value to update in the `urls` table.
     * @returns {Promise<Object>} - The result of the database update operation.
     */
    update_used: async (db, used, pathname) => {
      try {
        const result = await db.execute(
          `UPDATE urls SET used=?, time = CURRENT_TIMESTAMP WHERE pathname= ?`,
          [used, pathname]
        );

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves the `block` value from the `urls` table for the given `pathname`.
     *
     * @param {Object} db - The database connection object.
     * @param {string} pathname - The `pathname` value to search for in the `urls` table.
     * @returns {Promise<Object>} - The `block` value from the matching record in the `urls` table.
     */
    get_block_by_pathname: async (db, pathname) => {
      try {
        const result = await db.query(
          `SELECT block FROM urls WHERE pathname= ?`,
          [pathname]
        );

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
    /**
   * Retrieves a random block from the 'urls' table in the database where the 'used' column matches the given 'kind'.
   *
   * @param {Object} db - The database connection object.
   * @param {Integer} kind - The value to match against the 'used' column.
   * @return {Promise<Array|Object|null>} - A Promise that resolves to an array containing the random block, or an object representing the random block, or null if no matching blocks are found.

   */

    get_random_block_by_used: async (db, kind) => {
      try {
        const result = await db.query(
          `SELECT * FROM urls WHERE used = ? ORDER BY RAND() LIMIT 1`,
          [kind]
        );
        if (result.length === 0) {
          return result[0];
        } else {
          return result;
        }
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    //!UNIT - TESTS
  };
}

export default function () {
  return {
    update_password: async (db, newPassword, id) => {
      try {
        const result = await db.execute(
          `UPDATE users SET password = ? WHERE userid = ?`,
          [ newPassword, id ]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    add_passwordCode: async (db, date, passcode,id) => {
      console.log("🚀 ~ add_passwordCode: ~ date:", date)
      try {
        const result = await db.execute(
          `UPDATE users SET passwordCode = ?, passwordTime = ? WHERE userid = ?`,
          [ passcode, date, id ]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves all users from the database with the specified username.
     *
     * @param {object} db - The database connection object.
     * @param {string} username - The username to filter the users by.
     * @returns {Promise<object[]>} - An array of user objects that match the provided username.
     */
    get_all_by_username_or_email: async (db, username="",email="") => {
      try {
        const result = await db.query(`SELECT * FROM users WHERE username= ? OR email= ?`, [
          username,email
        ]);
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves a user from the database by their ID.
     *
     * @param {object} db - The database connection object.
     * @param {string} id - The ID of the user to retrieve.
     * @returns {Promise<object>} - A Promise that resolves to the user object.
     */
    get_user_by_id: async (db, id) => {
      try {
        const result = await db.query(`SELECT * FROM users WHERE userid= ?`, [
          id,
        ]);

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Adds a new user to the database.
     *
     * @param {object} db - The database connection object.
     * @param {object} data - An object containing the username and password for the new user.
     * @param {string} data.username - The username for the new user.
     * @param {string} data.password - The password for the new user.
     * @returns {Promise<object>} - The result of the database insert operation.
     */
    add_to_DB: async (db, data,role = 'user') => {
      console.log("🚀 ~ add_to_DB: ~ data:", data)
      try {
        const result = await db.execute(
          `INSERT INTO users (username, email, password, role, time) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [data.username, data.email, data.password, role]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Updates the session ID for a specific user in the database.
     *
     * @param {object} db - The database connection object.
     * @param {string} userid - The ID of the user whose session ID needs to be updated.
     * @param {string} sessionId - The new session ID.
     * @returns {Promise<object>} - A Promise that resolves to the result of the database query.
     */
    add_sessionId_by_userid: async (db, userid, sessionId) => {
      try {
        const result = await db.execute(
          `UPDATE users SET sessionId = ?, time = CURRENT_TIMESTAMP WHERE userid = ?`,
          [sessionId, userid]
        );

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Updates the session ID for a specific user in the database to null.
     *
     * @param {object} db - The database connection object.
     * @param {string} userid - The ID of the user whose session ID needs to be updated.
     * @return {Promise<object>} - A Promise that resolves to the result of the database query.
     */
    set_sessionId_to_null_by_userid: async (db, userid) => {
      try {
        const result = await db.execute(
          `UPDATE users SET sessionId = NULL, time = CURRENT_TIMESTAMP WHERE userid = ?`,
          [userid]
        );

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    /**
     * Retrieves all users from the database.
     *
     * @param {object} db - The database connection object.
     * @returns {Promise<object[]>} - An array of user objects.
     */
    get_all: async (db) => {
      try {
        const result = await db.query(`SELECT * FROM users`);

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
  };
}

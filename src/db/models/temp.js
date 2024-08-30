export default function () {
  return {
    add_to_DB: async (db, data, role = "user") => {
      console.log("🚀 ~ add_to_DB: ~ data:", data);
      try {
        const result = await db.execute(
          `INSERT INTO temp (username, email, password, role, proofcode) VALUES (?, ?, ?, ?, ?)`,
          [data.username, data.email, data.password, role, data.proofcode]
        );
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    update_temp_user_DB: async (db, data, role = "user") => {
      console.log("🚀 ~ update_temp_user_DB: ~ data:", data);
      try {
        const result = await db.execute(
          `UPDATE temp SET username = ?, email = ?, password = ?, role = ?, proofcode = ?  WHERE username = ?`,
          [data.username, data.email, data.password, role, data.proofcode, data.username]
        );

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    get_temp_user_by_username: async (db, username) => {
      try {
        const result = await db.query(`SELECT * FROM temp WHERE username= ?`, [
          username,
        ]);

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
    delete_temp_user_by_username: async (db, username) => {
      try {
        const result = await db.execute(`DELETE FROM temp WHERE username = ?`, [
          username,
        ]);

        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
  };
}

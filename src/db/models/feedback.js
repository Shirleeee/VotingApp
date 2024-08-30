export default function () {
  return {
    add_feedback: async (db, data) => {
      console.log("🚀 ~ add_feedback: ~ data:", data)
      try {
        const result = await db.execute(
          `INSERT INTO feedback (feedback,block,time) VALUES (?, ?, CURRENT_TIMESTAMP)`,

          [data.feedback, data.block]
        );

        return result.lastInsertId;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },

    get_all_feedbacks: async (db) => {
      try {
        const result = await db.query(`SELECT * FROM feedback`);
        return result;
      } catch (error) {
        console.error("Error executing query:", error);
        throw error;
      }
    },
  };
}

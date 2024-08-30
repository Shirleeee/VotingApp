export default function () {
  return {
    /**
     * Retrieves all blocks from the database.
     * @param {object} db - The database connection object.
     * @param {string} block - The block to retrieve.
     * @returns {Promise<Array>} - An array of blocks matching the provided block.
     */
    get_all_by_block: async (db, block) => {      
      return db.query(`SELECT * FROM blocks WHERE block= ?`, [block]);
    },
    get_block_by_id: async (db, id) => {      
      return db.query(`SELECT * FROM blocks WHERE id= ?`, [id]);
    },
    /**
     * Retrieves all distinct block values from the blocks table.
     * @param {object} db - The database connection object.
     * @returns {Promise<Array>} - An array of distinct block values.
     */
    get_all_blocks: async (db) => {
      return db.query(`SELECT block FROM blocks GROUP BY block`);
    },

    get_all_blocks_content: async (db) => {
      return db.query(`SELECT * FROM blocks`);
    },
    // get_dates_by_block: async (db,block) => {
    //   return db.query(`SELECT id,PIL,DEU FROM blocks WHERE block= ?`, [block]);
    // },
    delete_by_id: async (db, id) => {
      const result = await db.execute(`DELETE FROM blocks WHERE id = ?`, [id]);

      return result;
    },
    update_by_id: async (db, updateObj, id) => {
      const result = await db.execute(
        `UPDATE blocks  SET block = ?, blocktitle = ?, blocksubline = ?, PIL = ?, DEU = ?, time = CURRENT_TIMESTAMP  WHERE id = ?`,
        [
          updateObj.block,
          updateObj.blocktitle,
          updateObj.blocksubline,
          updateObj.PIL,
          updateObj.DEU,
          id,
        ]
      );

      return result;
    },

    update_dates_by_id: async (db, updateObj, id) => {
      const result = await db.execute(
        `UPDATE blocks SET  PIL = ?, DEU = ?, time = CURRENT_TIMESTAMP  WHERE id = ?`,
        [updateObj.PIL, updateObj.DEU, id]
      );

      return result;
    },
    add_to_DB: async (db, data) => {
      console.log("🚀 ~ add_to_DB: ~ data:", data);

      const result = await db.execute(
        `INSERT INTO blocks (block,blocktitle,blocksubline,time) VALUES (?, ?, ?,CURRENT_TIMESTAMP)`,

        [data.block, data.blocktitle, data.blocksubline]
      );
      return result;
    },

    get_dates_by_block_loc: async (db, loc, block) => {
      const result = await db.query(
        `SELECT ${loc} FROM blocks WHERE block = ?`,
        [block]
      );
      let loca = `${loc}`;

      return result[0][loca];
    },
  };
}

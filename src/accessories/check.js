import urlModel from "./../db/models/urls.js";
import blockModel from "./../db/models/blocks.js";

export default function () {
  return {
    /**
     * Checks the timestamp of a URL and updates it if it consists only of zeros.
     *
     * @async
     * @function check_time
     * @param {object} ctx - The context object containing the database connection and URL ID.
     * @returns {Promise<void>} - Resolves when the timestamp has been checked and updated if necessary.
     */
    check_time: async (ctx) => {
      const time = await urlModel().get_timestamp_called(
        ctx.db,
        ctx.params.urlid
      );

      if (time.toString().match(/^[0:]+$/)) {
        const updateTimeCalled = await urlModel().set_timestamp_called(
          ctx.db,
          ctx.params.urlid
        );
      }
    },
    //!UNIT - TESTS
    /**
     * Checks if the date is not the same as the date of the block.
     *
     * @async
     * @function check_date
     * @param {object} ctx - The context object containing the database connection.
     * @param {string} block - The block identifier.
     * @returns {Promise<boolean>} - Resolves with a boolean indicating if the date is not the same as the date of the block.
     */
    check_date: async (ctx, block) => {
      const date = new Date();

      const dateBlock = await blockModel().get_all_by_block(ctx.db, block);
      console.log("🚀 ~ check_date: ~ dateBlock:", dateBlock[0])
      console.log("🚀 ~ check_date: ~ dateBlock:", dateBlock[0].PIL)


      const dateNotPIL =
        date.getDate().toString() !== dateBlock[0].PIL.split(".")[0];

      const dateNotDeu =
        date.getDate().toString() !== dateBlock[0].DEU.split(".")[0];

      return dateNotPIL || dateNotDeu;
    },
    //!UNIT - TESTS

    //!UNIT - TESTS

    /**
     * Updates the date in the database to the current date for the given block.
     * If the date is not in the database or is incorrect, it will be set to the current date.
     *
     * @async
     * @function updateDateToActual
     * @param {object} ctx - The context object containing the database connection.
     * @param {string} rndUrlNotUsedBlock - The block identifier.
     * @returns {Promise<void>} - Resolves when the date is updated in the database.
     */
    updateDateToActual: async (ctx, rndUrlNotUsedBlock) => {
      const daterow = await blockModel().get_all_by_block(
        ctx.db,
        rndUrlNotUsedBlock
      );
      console.log("🚀 ~ updateDateToActual: ~ daterow:", daterow);

      // Update the row in the database with the current date for the given block
      const updated = await blockModel().update_dates_by_id(
        ctx.db,
        {
          PIL: `${new Date().getDate()}.${new Date().getMonth() + 1}`,
          DEU: `${new Date().getDate()}.${new Date().getMonth() + 1}`,
        },
        daterow.id
      );
      //!UNIT - TESTS
    },
  };
}

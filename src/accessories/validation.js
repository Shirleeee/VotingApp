import urlModel from "./../db/models/urls.js";
import userModel from "./../db/models/users.js";
import blockModel from "./../db/models/blocks.js";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
let count = 0;
const is_valid_block_date = (text) => text.length <= 3 && text.startsWith("wb");
const is_valid_name_text_length = (text) => text.length <= 120;
const is_valid_mail_length = (text) => text.length <= 254;
const is_valid_feedback_text_length = (text) => text.length <= 455;
/**
 * Checks for non-numeric values in a map and replaces them with "0".
 *
 * @param {Map} filmmap - The map to check for non-numeric values.
 * @return {boolean} Always true.
 */
const checkForNum = (filmmap) => {
  for (const [key, value] of filmmap) {
    if (isNaN(Number(value))) {
      filmmap.set(key, "0");
    }
  }
  return true;
};
/**
 * Sanitizes user input by removing special characters.
 *
 * This function takes a user input string and removes any occurrences of the following special characters: `< > & " ' { } ; = ( ) \``. The function returns the sanitized input string.
 *
 * @param {string} userInput - The user input string to be sanitized.
 * @returns {string} The sanitized input string.
 */

const sanitizeInput = (userInput) => {
  const specialChars = {
    "<": "",
    ">": "",
    "&": "",
    '"': "",
    "'": "",
    "{": "",
    "}": "",
    ";": "",
    "=": "",
    "(": "",
    ")": "",
    "`": "",
  };

  let sanitizedInput = userInput;
  for (let char in specialChars) {
    const replacement = specialChars[char];
    const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    sanitizedInput = sanitizedInput.replace(regex, replacement);
  }
  return sanitizedInput;
};

/**
 * Checks if a given text string represents a valid date format.
 *
 * This function takes a text string and checks if it matches the expected date format of "DD.MM". The function returns true if the input text matches the expected format, and false otherwise.
 *
 * @param {string} text - The text string to be checked for a valid date format.
 * @returns {boolean} True if the input text matches the expected date format, false otherwise.
 */

const is_valid_date_format = (text) => {
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[0-2])$/;
  console.log("🚀 ~ regex.test(text):", regex.test(text));

  return regex.test(text);
};
/**
 * Validates the current date against the expected date for a given block and location.
 *
 * @param {Object} db - The database object.
 * @param {string} block - The block identifier.
 * @param {string} pathname - The pathname associated with the validation.
 * @returns {boolean} True if the current date matches the expected date, false otherwise.
 */
const valid_date = async (db, block, pathname) => {
  let today = new Date();
  let currDay = today.getDate().toString();
  let currMonth = (today.getMonth() + 1).toString();

  let loc = await urlModel().get_location(db, pathname);

  const datebyblockloc = await blockModel().get_dates_by_block_loc(
    db,
    loc[0].location,
    block
  );
  const currDate = `${currDay}.${currMonth}`;

  if (currDate !== datebyblockloc) {
    //verwendet Block am falschen Tag steht für 2
    await urlModel().update_used(db, 2, pathname);
    return true;
  }

  return false;
};

/**
 * Checks if the time difference between the current time and a given timestamp exceeds a specified threshold.
 *
 * This function takes a database connection object, a pathname, and a time difference value. It checks if the time difference exceeds 3600 seconds (1 hour) and updates the usage status for the given pathname in the database if the threshold is exceeded. The function returns true if the time difference exceeds the threshold, and false otherwise.
 *
 * @param {object} db - The database connection object.
 * @param {string} pathname - The pathname to update in the database.
 * @param {object} time_diff - An object containing the time difference information.
 * @returns {Promise<boolean>} - True if the time difference exceeds the threshold, false otherwise.
 */
export const validate_timestamp = async (db, pathname, time_diff) => {
  // 30 Minute = 1800 Sekundn
  //  3 Min = 180 Sekunden
  //  5 min = 300 Sekunden

  if (time_diff[0].difference > 3600) {
    await urlModel().update_used(db, 2, pathname);

    return true;
  }
  return false;
};
function isValidEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input)) {
    return false;
  }

  const domain = "filmkorte.de";
  const emailDomain = input.split("@")[1];
  if (emailDomain !== domain) {
    return false;
  }

  return true;
}
export default function () {
  return {
    validateBlockDetails: async (ctx, formData) => {
      console.log("🚀 ~ validateNewFilmsBlock: ~ formData:", formData);
      // const bId = formData.id;
      let errors = {};
      // const allBlocks = await blockModel().get_all_blocks_content(ctx.db);
      // const datesId = formData.id;

      if (formData.filmtitle !== "") {
        if (!is_valid_mail_length(formData.filmtitle)) {
          errors.filmtitle = "Das sind zu viele Zeichen. Max. 254 Zeichen.";
        }
      }else if (formData.regie !== "") {
        if (!is_valid_mail_length(formData.regie)) {
          errors.regie = "Das sind zu viele Zeichen. Max. 254 Zeichen.";
        }
      }
      // if (!is_valid_feedback_text_length(formData.blocksubline)) {
      //   errors[`blocksubline${bId}`] =
      //     "Das sind zu viele Zeichen. Max. 455 Zeichen.";
      // }

      return errors;
    },
    validateResetPassword: async (formData, params, user) => {
      let errors = {};

      if (!(formData.password_again === formData.password)) {
        errors.password = "Die Passwörter stimmen nicht überein.";
      }
      if (!(user[0].passwordCode === params.token)) {
        errors.passwordCode = "Die password Code stimmt nicht.";
      }
      return errors;
    },
    validateBlocks: async (ctx, formData) => {
      console.log("🚀 ~ validateBlocks: ~ formData:", formData);
      const bId = formData.id;
      let errors = {};
      const allBlocks = await blockModel().get_all_blocks_content(ctx.db);
      const datesId = formData.id;

      if (
        allBlocks.some(
          (b) => b.id.toString() === bId && b.block === formData.block
        )
      ) {
      } else if (allBlocks.some((b) => b.block === formData.block)) {
        errors[`block${bId}`] = "Ist doppelt drin.";
      } else if (allBlocks.some((b) => b.blocktitle === formData.blocktitle)) {
        errors[`blocktitle${bId}`] = "Ist doppelt drin.";
      } else if (
        allBlocks.some((b) => b.blocksubline === formData.blocksubline) &&
        formData.blocksubline !== ""
      ) {
        errors[`blocksubline${bId}`] = "Ist doppelt drin.";
      }

      if (!is_valid_block_date(formData.block)) {
        errors[`block${bId}`] = "z.B. wb1";
      }

      if (!is_valid_feedback_text_length(formData.blocktitle)) {
        errors[`blocktitle${bId}`] =
          "Das sind zu viele Zeichen. Max. 120 Zeichen.";
      }

      if (!is_valid_feedback_text_length(formData.blocksubline)) {
        errors[`blocksubline${bId}`] =
          "Das sind zu viele Zeichen. Max. 455 Zeichen.";
      }

      if (formData.PIL != undefined) {
        if (formData.PIL !== "") {
          if (!is_valid_date_format(formData.PIL)) {
            errors[`PIL${bId}`] = "richtig ist das Format 1.1";
          }
        }
      }

      if (formData.DEU != undefined) {
        if (formData.DEU !== "") {
          if (!is_valid_date_format(formData.DEU)) {
            errors[`DEU${bId}`] = "richtig ist das Format 31.1";
          }
        }
      }

      return errors;
    },

    /**
     * Validates the registration form data.
     *
     * This function takes the context object `ctx`, the form data object `formData`, and an array of existing usernames `userNAmeArr` as input. It checks if the number of existing users is less than 2, if the username and password lengths are valid, if the passwords match, and if the username is unique. If any validation errors are found, they are added to the `errors` object, which is returned.
     *
     * @param {object} ctx - The context object, which includes the database connection.
     * @param {object} formData - The form data object, which includes the `username` and `password` fields.
     * @param {array} userNAmeArr - An array of existing usernames.
     * @returns {object} - An object containing any validation errors.
     */
    validateReg: async (ctx, formData) => {
      let errors = {};

      const userNAmeArr = await userModel().get_all_by_username_or_email(
        ctx.db,
        formData.username,
        formData.email
      );

      const users = await userModel().get_all(ctx.db);

      if (users.length >= 3) {
        errors.username = " Maximal 2 User sind erlaubt.";
      }
      if (!isValidEmail(formData.email)) {
        errors.email =
          "Die E-Mail-Adresse ist entweder ungültig oder hat die falsche Domain.";
      }
      if (!is_valid_name_text_length(formData.username)) {
        errors.username = "Das sind zu viele Zeichen. Max. 120 Zeichen.";
      }
      if (!is_valid_name_text_length(formData.password)) {
        errors.password = "Das sind zu viele Zeichen. Max. 120 Zeichen.";
      }
      if (!(formData.password_again === formData.password)) {
        errors.password = "Die Passwörter stimmen nicht überein.";
      }
      if (userNAmeArr.length > 0) {
        errors.username =
          "Bitte wähle einen anderen Benutzernamen oder E-Mail. Eines davon oder beide können schon vergeben sein.";
      } else {
        formData.username = sanitizeInput(formData.username);
      }

      return errors;
    },
    /**
     * Checks if a given block is present in an array of blocks.
     *
     * @param {object[]} alltheBlocks - An array of block objects.
     * @param {string} block - The block to search for.
     * @returns {boolean} - True if the block is found in the array, false otherwise.
     */
    validate_block: (alltheBlocks, block) => {
      for (const value of alltheBlocks) {
        if (value.block == block) {
          return true;
        }
      }
      return false;
    },

    /**
     * Compares a provided password with the stored password hash for a user.
     *
     * @param {object} user - The user object containing the stored password hash.
     * @param {string} formPassword - The password provided by the user.
     * @returns {Promise<boolean>} - True if the provided password matches the stored hash, false otherwise.
     */
    passwordIsCorrect: async (user, formPassword) => {
      if (typeof user[0] === "object") {
        const ok = await bcrypt.compare(formPassword, user[0].password);

        return ok;
      } else {
        return false;
      }
    },
    ///////////////////////////////////////////////////////
    /**
     * Validates the participation data submitted by a user.
     *
     * @param {object} ctx - The context object.
     * @param {object} data - The form data submitted by the user.
     * @param {string} block - The block identifier.
     * @returns {object} - An object containing any validation errors.
     */
    validate_participation: async (ctx, data, block) => {
      let errors = {};

      if (await valid_date(ctx.db, block, ctx.params.urlid)) {
        errors.time = "Die Gültigkeit des Links ist leider abgelaufen.";
      }

      let time_diff = await urlModel().get_difference_timestamp(
        ctx.db,
        ctx.params.urlid
      );

      if (await validate_timestamp(ctx.db, ctx.params.urlid, time_diff)) {
        errors.time = "Die Gültigkeit des Links ist leider abgelaufen.";
      }

      if (data.datasec === null) {
        errors.datasec =
          "Die Einwilligung der Datenschutzerklärung ist notwendig.";
      }

      if (!is_valid_name_text_length(data.name)) {
        errors.name = "Das sind zu viele Zeichen. Max. 120 Zeichen.";
      } else {
        data.name = sanitizeInput(data.name);
      }

      if (!is_valid_feedback_text_length(data.feedback)) {
        errors.feedback = "Das sind zu viele Zeichen. Max. 455 Zeichen.";
      } else {
        data.feedback = sanitizeInput(data.feedback);
      }
      if (!is_valid_mail_length(data.email) && data.email) {
        errors.email = "Das sind zu viele Zeichen. Max. 254 Zeichen.";
      } else {
        data.email = sanitizeInput(data.email);
      }
      const MAX_AGE = 60 * 30 * 150; //1.800.000 ms - 5 min

      const expireDate = new Date(Date.now() + MAX_AGE);
      // const errorSession = ctx.sessionStore.get("errorFilm");
      // let count = ctx.sessionStore.get("errorFilmCount") || 0;
      let count = ctx.cookies.get("0") ?? 0;
      console.log(
        "🚀 ~ validate_participation: ~ ctx.cookies.get:",
        ctx.cookies.get("0")
      );
      let foundZero = false;
      if (count === "1" || count === 1) {
        console.log(
          "🚀 ~ validate_participation:   count === 2~ ctx.cookies.get:",
          ctx.cookies.get("0")
        );
        errors.filmnull = "0";

        count = 0;
      }
      console.log("🚀 ~ validate_participation: ~ count:", count);
      if (!ctx.cookies.get("0")) {
        for (const [key, value] of data.filmValues) {
          if (value == 0 || value == "0") {
            errors.film =
              "Da sind einer oder mehrere Filme mit 0 Punkte bewertet worden. Willst du diesen Filmen auch noch Punkte geben? Bitte bedenke 0 Punkte werden nicht gewertet.";
            // ctx.sessionStore.set("errorFilm", true, 3600000);

            ctx.cookies.set("0", 0, {
              expires: expireDate,
              httpOnly: true,
              overwrite: true,
              sameSite: "strict",
              // secure: true,
            });
            console.log(
              "🚀 ~ validate_participation: inside loop ~ ctx.cookies.get:",
              ctx.cookies.get("0")
            );
            foundZero = true;
            break;
          }
        }
      }

      if (foundZero) {
        console.log("🚀 ~ validate_participation: ~ foundZero:", foundZero);
        // const count = ctx.cookies.get("0") + 1;
        count++;
        ctx.cookies.set("0", count++, {
          expires: expireDate,
          httpOnly: true,
          overwrite: true,
          sameSite: "strict",
          // secure: true,
        });
      }
      count = 0;

      if (!checkForNum(data.filmValues)) {
        errors.values = "Keine Zahlen";
      }
      return errors;
    },
  };
}

import i18next from "https://deno.land/x/i18next/index.js";
import dkTranslation from "./locales/dk/translation.json" with { type: "json" };
import deTranslation from "./locales/de/translation.json" with { type: "json" };
import Backend from "https://deno.land/x/i18next_fs_backend/index.js";
const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

i18next.use(Backend).init({
  // debug: true,
  fallbackLng: "de",
  resources: {
    dk: {
      translation: dkTranslation,
    },
    de: {
      translation: deTranslation,
    },
  },
});

/**
 * Returns a function that provides translations for the specified language.
 *
 * @param {string} [lng] - The language code to use for translations. If not provided, the system locale will be used.
 * @returns {function} A function that can be used to translate strings.
 */
export default (lng) => i18next.getFixedT(lng || systemLocale);

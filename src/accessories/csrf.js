
import { encodeBase64 } from "https://deno.land/std@0.203.0/encoding/base64.ts";

export default function () {
  return {
    /**
     * Generates a random CSRF token as a base64-encoded string.
     * @returns {string} A random CSRF token.
     */
    generate_token: () => {
      const array = new Uint8Array(64);
      crypto.getRandomValues(array);
      console.log("🚀 ~ encodeBase64(array):", encodeBase64(array))

      return encodeBase64(array);
    },
    /**
     * Checks the validity of a CSRF token submitted in a form.
     * @param {object} ctx - The context object containing the request and response.
     * @param {string} tokenName - The name of the CSRF token to check.
     * @param {string} formToken - The CSRF token submitted in the form.
     * @param {string} navigateTo - The URL to redirect to if the token is invalid.
     * @returns {object} The updated context object.
     */
    check_token: (ctx, tokenName, formToken, navigateTo) => {
      const token = ctx.token.get(tokenName);
      console.log("🚀 ~ token:", token);
      if (token !== formToken) {
        ctx.message = "CSRF token mismatch";
        ctx.response.status = 303;
        ctx.response.headers["location"] = ctx.url.origin + navigateTo;
        ctx.token.delete(tokenName);
        return ctx;
      }
      ctx.token.delete(tokenName);
      return ctx;
    },
  };
}

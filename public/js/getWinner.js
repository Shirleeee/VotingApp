export const init = () => {
  if (
    "querySelector" in document &&
    "head" in document &&
    "classList" in document.head &&
    "addEventListener" in window
  ) {
    document.addEventListener("DOMContentLoaded", setup);
  }
};
const setup = async () => {
  document.querySelector("#btnWinner").addEventListener("click", async () => {
    try {
      let response = await fetch(
        `https://publikumspreis.filmkorte.de/awinnerData`
      );
      let data = await response.json();
      reloadData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  });
};
function reloadData(data) {

  document.querySelector("#winnerName").innerHTML = data.winner.name;
  document.querySelector("#winnerMail").innerHTML = data.winner.email;
}

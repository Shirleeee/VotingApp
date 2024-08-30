/**
 * Initializes the page reload functionality.
 * This function sets up an event listener for a switch element that controls whether the page should be automatically reloaded.
 * If the switch is on, the function periodically fetches data from a remote URL and updates the page content accordingly.
 */
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
let btnSwitch = true;

const setup = () => {
  const refreshInterval = 1000; // 5000 Millisekunden (5 Sekunden)

  const reloadPage = async () => {
    if (btnSwitch) {
      try {
        let response = await fetch(
          `https://publikumspreis.filmkorte.de/evaData1Pa77`
        );

        let data = await response.json();
        reloadData(data);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  setInterval(reloadPage, refreshInterval);

  function reloadData(data) {
    console.log("🚀 ~ reloadData ~ data:", data);
    const tableConatiners = document.querySelectorAll(".panel-container");
    const winnerText = document.querySelectorAll(".winnerText");
    winnerText.forEach((winner) => {
      winner.innerHTML = `Der Gewinnerfilm ist <span>${data.winnerMC.blockWinner}</span> mit dem Ergebnis <span> ${data.winnerMC.value} %</span> aus dem Block <span>${data.winnerMC.blockid}</span>`;
    });

    const svgs = document.querySelectorAll(".chart");
    const tabPanelHeaders = document.querySelectorAll(".tabpanel-header");

    tabPanelHeaders.forEach((tabPanelHeader, index) => {
      const filmData = data.filmObj[index].blockfilms;

      tabPanelHeader.querySelector(".voted-p").textContent = `${
        data.filmObj[index].amountVotesByBlock / filmData.length
      } x abgestimmt => ${
        (data.filmObj[index].amountVotesByBlock / filmData.length) * 6
      }   Maximale Punktzahl s`;
    });

    svgs.forEach((svg, index) => {
      const bars = svg.querySelectorAll(".bar");

      const filmData = data.filmObj[index].blockfilms;
      // console.log("🚀 ~ svgs.forEach ~ filmData:", filmData);

      bars.forEach((bar) => {
        const dataIndex = bar.getAttribute("data-index");
        if (filmData[dataIndex - 1] !== undefined) {
          const blockFilmId = filmData[dataIndex - 1].blockFilm_id;

          const rect = bar.querySelector("rect");
          const total = bar.querySelector(".total");
          const summed = bar.querySelector(".summed");
          const svgText = bar.querySelectorAll(".svgText");

          if (window.innerWidth < 769) {
            rect.setAttribute("width", "100%");
          } else {
            rect.setAttribute("width", filmData[dataIndex - 1].total + "%");
          }

          svgText.forEach((text) => {
            text.style.fill = "black";
          });
          summed.textContent = `${data.filmObj[index].summedVotes[blockFilmId]??0} von ${data.filmObj[index].votesPoint100[blockFilmId]??0}`;
        }
      });
    });

    tableConatiners.forEach((table, index) => {
      const tables = table.querySelectorAll("table");
      const filmData = data.filmObj[index].blockfilms;
      // console.log("🚀 ~ tableConatiners.forEach ~ filmData:", filmData);
      tables.forEach((tablerow) => {
        const content0 = tablerow.querySelector(".zero");
        const content1 = tablerow.querySelector(".one");
        const content2 = tablerow.querySelector(".two");
        const content3 = tablerow.querySelector(".three");
        const content4 = tablerow.querySelector(".four");
        const content5 = tablerow.querySelector(".five");
        const content6 = tablerow.querySelector(".six");
        const summedVotes = tablerow.querySelector(".summedVotes");
        const votesPoint100 = tablerow.querySelector(".votesPoint100");

        const dataIndex = tablerow.getAttribute("data-index");
        if (filmData[dataIndex - 1] !== undefined) {
          const blockFilmId = filmData[dataIndex - 1].blockFilm_id;

          content0.textContent = `${data.filmObj[index].allZero[blockFilmId]??0}`;
          content1.textContent = `${data.filmObj[index].allOne[blockFilmId]??0}`;
          content2.textContent = `${data.filmObj[index].allTwo[blockFilmId]??0}`;

          content3.textContent = `${data.filmObj[index].allThree[blockFilmId]??0}`;
          content4.textContent = `${data.filmObj[index].allFour[blockFilmId]??0}`;
          content5.textContent = `${data.filmObj[index].allFive[blockFilmId]??0}`;

          content6.textContent = `${data.filmObj[index].allSix[blockFilmId]??0}`;
          summedVotes.textContent = `${data.filmObj[index].summedVotes[blockFilmId]??0}`;
          votesPoint100.textContent = `${data.filmObj[index].votesPoint100[blockFilmId]??0}`;
        }
      });
    });
  }

  const switchUpdate = document.querySelector(".switchUpdate");

  switchUpdate.addEventListener("click", (e) => {
    btnSwitch = !btnSwitch;
    if (btnSwitch) {
      e.target.value = "Stop Updates";
    } else {
      e.target.value = "Start Updates";
    }
  });
};

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
const setup = () => {
  const btnNextContainers = document.querySelectorAll(".btn-next-container");
  btnNextContainers.forEach(function (nextBtn) {
    nextBtn.style.display = "grid";
  });

  let maxIndex = 12 + 1;
  let allsecElements = [];

  for (let i = 1; i <= maxIndex; i++) {
    let sec_elements = document.querySelectorAll(".sec" + i);
    allsecElements.push(...sec_elements);
  }
  allsecElements.forEach((element) => {
    element.style.display = "none";
  });

  document.querySelector(".sec1").style.display = "block";

  const nextBtns = document.querySelectorAll(`section .next`);
  const prevButton = document.querySelector("#prevFilm");

  if (nextBtns) {
    nextBtns.forEach(function (nextBtn) {
      nextBtn.addEventListener("click", function () {
        let nextSection = parseInt(nextBtn.name) + 1;


        if (nextSection) {
          document.getElementById(nextSection).style.display = "block";       

          let lastSection = parseInt(nextBtn.name);
          document.getElementById(lastSection).style.display = "none";

          if (allsecElements.length === nextSection) {
            document.querySelector("#prevFilm").style.display = "block";
            document.querySelector("#submitBtn").style.display = "block";
          }
        }
      });
    });

    prevButton.addEventListener("click", function () {
      allsecElements.forEach((element) => {
        element.style.display = "none";
      });

      document.querySelector(".sec1").style.display = "block";

      document.querySelector(".sec1").scrollIntoView({ behavior: "smooth" });
    });
  }

  ///!SECTION
  const errorEmail = document.getElementById("errorEmail");
  const errorName = document.getElementById("errorName");
  const errorFeedback = document.getElementById("errorFeedback");

  const errorDatasec = document.getElementById("errorDatasec");
  const errorFilm = document.getElementById("errorFilm");

  if (errorDatasec || errorFilm || errorEmail || errorName || errorFeedback) {
    document.querySelector(".sec1").style.display = "none";
    document.querySelector(`.sec${allsecElements.length}`).style.display =
      "block";
    document.querySelector("#prevFilm").style.display = "block";
    document.querySelector("#submitBtn").style.display = "block";
  }
  if (errorEmail) {
    errorDatasec.scrollIntoView({
      behavior: "smooth",
    });
  }
  if (errorName) {
    errorFilm.scrollIntoView({
      behavior: "smooth",
    });
  }
  if (errorFeedback) {
    errorFilm.scrollIntoView({
      behavior: "smooth",
    });
  }
  if (errorDatasec) {
    errorDatasec.scrollIntoView({
      behavior: "smooth",
    });
  }
  if (errorFilm) {
    errorFilm.scrollIntoView({
      behavior: "smooth",
    });
  }
};

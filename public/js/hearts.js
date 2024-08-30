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
  const ratingsDivs = document.querySelectorAll(".ratings");

  ratingsDivs.forEach(function (ratingsDiv) {
    const hearts = ratingsDiv.querySelectorAll(`.heart`);
    const cancelHeart = ratingsDiv.querySelector(".cancel-hearts");

    // display hidden js elements
    cancelHeart.style.display = "inline-block";

    //! delete all hearts by clicking the cross
    cancelHeart.addEventListener("click", function () {
      const selectedHearts = ratingsDiv.querySelectorAll(".selected");
      const radioBtnsCross = ratingsDiv.querySelectorAll(".heart__radiobtn");

      selectedHearts.forEach(function (selectedHeart) {
        selectedHeart.classList.remove("selected");
      });

      radioBtnsCross.forEach((radioBtn) => {
        radioBtn.checked = false;
      });
    });

    //! check hearts
    hearts.forEach(function (heart) {
      let clickedHeart = false;
      let tappedHeart = false;

      heart.addEventListener("click", function (e) {
        if (!clickedHeart) {
          //if tap is not set, set up single tap
          clickedHeart = setTimeout(function () {
            clickedHeart = null;
            const selectedHearts = ratingsDiv.querySelectorAll(".selected");
            selectedHearts.forEach(function (selectedHeart) {
              selectedHeart.classList.remove("selected");
            });
            heart.classList.add("selected");
            //insert things you want to do when single tapped
          }, 300); //wait 300ms then run single click code
        } else {
          //tapped within 300ms of last tap. double tap
          clearTimeout(clickedHeart); //stop single tap callback
          clickedHeart = null;
          const selectedHearts = ratingsDiv.querySelectorAll(".selected");
          selectedHearts.forEach(function (selectedHeart) {
            selectedHeart.classList.remove("selected");
          });
          //insert things you want to do when double tapped
        }
        e.preventDefault();
      });

      heart.addEventListener("touchend", function (e) {
        if (!tappedHeart) {
          //if tap is not set, set up single tap
          tappedHeart = setTimeout(function () {
            tappedHeart = null;
            const selectedHearts = ratingsDiv.querySelectorAll(".selected");
            selectedHearts.forEach(function (selectedHeart) {
              selectedHeart.classList.remove("selected");
            });
            heart.classList.add("selected");
            //insert things you want to do when single tapped
          }, 300); //wait 300ms then run single click code
        } else {
          //tapped within 300ms of last tap. double tap
          clearTimeout(tappedHeart); //stop single tap callback
          tappedHeart = null;
          const selectedHearts = ratingsDiv.querySelectorAll(".selected");
          selectedHearts.forEach(function (selectedHeart) {
            selectedHeart.classList.remove("selected");
          });
          //insert things you want to do when double tapped
        }
        e.preventDefault();
      });
    });

    ///! Radiobuttons
    // console.log("🚀 ~ file: hearts.js:35 ~ radioBtns:", radioBtns)
    const radioBtns = ratingsDiv.querySelectorAll(".heart__radiobtn");

    const hiddenInput = document.querySelector("#hiddenErrors");
    //if no element in hiddenInput delete all checked radiobuttons
    // otherwise render them again if page reloaded
    if (!hiddenInput) {
      radioBtns.forEach((radioBtn) => {
        radioBtn.checked = false;
      });
    }

    radioBtns.forEach((radioBtn) => {
      radioBtn.style.appearance = "none";
    });

    radioBtns.forEach((radioBtn) => {
      let tappedRadio = false;
      let clickedRadio = false;

      radioBtn.addEventListener("click", function (e) {
        if (!clickedRadio) {
          //if tap is not set, set up single tap
          clickedRadio = setTimeout(function () {
            clickedRadio = null;
            e.target.checked = true;
            //insert things you want to do when single tapped
          }, 300); //wait 300ms then run single click code
        } else {
          //tapped within 300ms of last tap. double tap
          clearTimeout(clickedRadio); //stop single tap callback
          clickedRadio = null;
          radioBtns.forEach((radioBtn) => {
            radioBtn.checked = false;
          });
        }
        e.preventDefault();
      });

      radioBtn.addEventListener("touchend", function (e) {
        if (!tappedRadio) {
          //if tap is not set, set up single tap
          tappedRadio = setTimeout(function () {
            tappedRadio = null;
            e.target.checked = true;
            //insert things you want to do when single tapped
          }, 300); //wait 300ms then run single click code
        } else {
          //tapped within 300ms of last tap. double tap
          clearTimeout(tappedRadio); //stop single tap callback
          tappedRadio = null;
          radioBtns.forEach((radioBtn) => {
            radioBtn.checked = false;
          });
        }
        e.preventDefault();
      });
    });
  });
};

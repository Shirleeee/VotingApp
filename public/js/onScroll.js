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
  window.onscroll = function () {
    scrollFunction();
  };
  function scrollFunction() {
    if (document.querySelector(".headerEva")) {
      document.querySelector(".headerEva").style.display = "none";
      if (
        document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 50
      ) {
      } else {
        document.querySelector(".headerEva").style.display = "flex";
      }
    }
  }
};

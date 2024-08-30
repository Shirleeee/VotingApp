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
  const toggle = document.getElementById("menu__toggle");
  const nav = document.querySelector("nav");
  const menuBtn = document.querySelector(".menu__btn");

  nav.style.transform = "scale(0)";
  nav.style.display = "none";


  toggle.addEventListener("change", function () {
    if (toggle.checked) {
      nav.style.transform = "scale(1)";
      nav.style.display = "flex";
    } else {
      nav.style.transform = "scale(0)";
    }
  });

  menuBtn.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      toggle.checked = !toggle.checked; 
      const event = new Event("change");
      toggle.dispatchEvent(event);
    }
  });
};

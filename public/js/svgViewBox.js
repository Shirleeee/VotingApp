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
  function setViewBox() {
    let svg = document.querySelector(".chart");
    // console.log("🚀 ~ setViewBox ~ svg:", svg.height.baseVal.value);
    let svgWidth = svg.clientWidth;
    // console.log("🚀 ~ setViewBox ~ svgWidth:", svgWidth)
    let svgHeight = svg.height.baseVal.value;
    if (window.innerWidth < 1000) {
      svgHeight += 100;
    }
    svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
  }

  window.addEventListener("load", setViewBox);
  window.addEventListener("resize", setViewBox);

  const bars = document.querySelectorAll(".bar");

  bars.forEach((bar) => {
    const svgText = bar.querySelectorAll(".svgText");
    svgText.forEach((text) => {     
      text.style.fill= "black";
    });
    const rect = bar.querySelector("rect");
    const dynamicWidth = bar.querySelector(".dynamic-width");

    const total = rect.getAttribute("data-total");


    if (window.innerWidth < 769) {
      dynamicWidth.setAttribute("width", "100%");
    } else {
      dynamicWidth.setAttribute("width", total + "%");
    }
  });
};

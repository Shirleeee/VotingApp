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
  let activeIndex = 0;

  const tabElements = document.querySelectorAll('button[role="tab"]');
  const panelElements = document.querySelectorAll('[role="tabpanel"]');

  // Listen to clicks and key presses on tabs
  tabElements.forEach(function (tab, index) {

    tab.addEventListener("click", function (event) {
      setActiveTabClick(index);
    });

    tab.addEventListener("keydown", function (event) {
      const lastIndex = tabElements.length - 1;

      if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
        if (activeIndex === 0) {
          // First element, jump to end
          setActiveTab(lastIndex);
        } else {
          // Move left
          setActiveTab(activeIndex - 1);
        }
      } else if (event.code === "ArrowRight" || event.code === "ArrowDown") {
        if (activeIndex === lastIndex) {
          // Last element, jump to beginning
          setActiveTab(0);
        } else {
          // Move right
          setActiveTab(activeIndex + 1);
        }
      } else if (event.code === "Home") {
        // Move to beginning
        setActiveTab(0);
      } else if (event.code === "End") {
        // Move to end
        setActiveTab(lastIndex);
      }
    });
  });

  function setActiveTabClick(index) {
    // Make currently active tab inactive
    tabElements[activeIndex].setAttribute("aria-selected", "false");
    tabElements[activeIndex].tabIndex = -1;
  

    // Set the new tab as active
    tabElements[index].setAttribute("aria-selected", "true");
    tabElements[index].tabIndex = 0;
    tabElements[index].focus();

    setActivePanelClick(index);
    activeIndex = index;
  }
  function setActivePanelClick(index) {
    // Hide currently active panel
    panelElements.forEach(element => {
        element.setAttribute("hidden", "");
        element.tabIndex = -1;
        if (panelElements[index]) {
            panelElements[index].removeAttribute("hidden");
            panelElements[index].tabIndex = 0;
        }
    });
    

  
  }
  function setActiveTab(index) {
    // Make currently active tab inactive
    tabElements[activeIndex].setAttribute("aria-selected", "false");
    tabElements[activeIndex].tabIndex = -1;

    // Set the new tab as active
    tabElements[index].setAttribute("aria-selected", "true");
    tabElements[index].tabIndex = 0;
    tabElements[index].focus();

    setActivePanel(index);
    activeIndex = index;
  }

  function setActivePanel(index) {
    // Hide currently active panel
    panelElements[activeIndex].setAttribute("hidden", "");
    panelElements[activeIndex].tabIndex = -1;

    // Show the new active panel
    panelElements[index].removeAttribute("hidden");
    panelElements[index].tabIndex = 0;
  }
};

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
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', function(event) {
        touchStartY = event.touches[0].clientY;
    }, false);
    
    window.addEventListener('touchmove', function(event) {
        touchEndY = event.touches[0].clientY;
        if (window.scrollY === 0 && touchEndY > touchStartY) {
            event.preventDefault();
        }
    }, { passive: false });
    
};

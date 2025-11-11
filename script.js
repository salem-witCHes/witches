function openCurtains() {
  document.querySelector('.left-forest').style.transform = "translateX(-100%)";
  document.querySelector('.right-forest').style.transform = "translateX(100%)";

  // Fade out the forest layer after curtain opens
  setTimeout(() => {
    document.querySelector('.forest-container').style.opacity = "0";
  }, 1200);

  // Show the main site content
  setTimeout(() => {
    document.getElementById("homepage");
    homepage.classList.remove("hidden");
    homepage.classList.add("visible");
  }, 1800);
}
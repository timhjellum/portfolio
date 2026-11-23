const body = document.body;
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  // At the very top of the page
  if (currentScroll <= 0) {
    body.classList.remove("scroll-up");
    return;
  }

  // Scrolling Down
  if (currentScroll > lastScroll && !body.classList.contains("scroll-down")) {
    body.classList.remove("scroll-up");
    body.classList.add("scroll-down");
  } 
  // Scrolling Up
  else if (currentScroll < lastScroll && body.classList.contains("scroll-down")) {
    body.classList.remove("scroll-down");
    body.classList.add("scroll-up");
  }
  
  lastScroll = currentScroll;
});
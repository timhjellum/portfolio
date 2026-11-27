// Drifting bars for the hero. Sizes, positions, colours and speeds come from
// CSS random() in style.css; this script only adds the elements, and fills in
// the same ranges itself in browsers that don't support random() yet.
(function () {
  "use strict";

  var host = document.getElementById("hero-bars");
  if (!host) return;

  var COUNT = 30;
  var native = window.CSS && CSS.supports && CSS.supports("top", "random(0px, 10px)");
  var r = function (min, max) { return min + Math.random() * (max - min); };

  for (var i = 0; i < COUNT; i++) {
    var el = document.createElement("span");
    el.className = "bar";

    if (!native) {
      var dur = r(45, 150);
      el.style.top = r(-2, 98) + "%";
      el.style.width = r(60, 380) + "px";
      el.style.height = r(3, 28) + "px";
      el.style.background = "hsl(" + r(198, 218) + " 85% " + r(62, 82) + "% / " + r(0.06, 0.22) + ")";
      el.style.animationDuration = dur + "s";
      el.style.animationDelay = -r(0, dur) + "s";
    }

    host.appendChild(el);
  }
})();

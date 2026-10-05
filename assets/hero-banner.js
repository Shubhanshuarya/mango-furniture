(function () {
  const heroBanner = () => {
    const heroSections = document.querySelectorAll(".hero-banner-section");
    heroSections.forEach((heroSection) => {
      if (heroSection.classList.contains("js-init")) {
        return "";
      }
      heroSection.classList.add("js-init");
      const effectLogo = heroSection.querySelector(".scroll-logo");
      let effectLogoMargin = +effectLogo.style.marginBottom.slice(0, -2) - 20;
      if (!effectLogo) return "";
      const sectionPos = heroSection.offsetTop;
      window.addEventListener("scroll", scrollEffect);
      function scrollEffect() {
        if (
          window.scrollY >= sectionPos &&
          window.scrollY <= sectionPos + heroSection.offsetHeight
        ) {
          let posScroll =
            (window.scrollY - sectionPos) / heroSection.offsetHeight;
          let opacityValue = posScroll.toFixed(2);
          effectLogo.style.opacity = 1 - opacityValue;
          effectLogo.style.transform = `translateY(max(${effectLogoMargin}px,-${
            opacityValue * 100
          }px))`;
        }
      }
      scrollEffect();
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    heroBanner();
    document.addEventListener("shopify:section:load", function () {
      heroBanner();
    });
  });
})();

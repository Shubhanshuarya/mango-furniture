(function () {
  function swiperInit() {
    subSliderInit(true);
    sliderInit(true);
  }

  document.addEventListener("shopify:section:load", function (e) {
    swiperInit();
  });

  let lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;

    $(".product-section .js-media-list").each(function () {
      this.swiper.destroy();
    });
    $(".product-section .js-media-sublist").each(function () {
      this.swiper.destroy();
    });

    swiperInit();
  });

  swiperInit();
})();

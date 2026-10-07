(function () {
  const announcementSlider = () => {
    $(".section-announcement").each(function () {
      if ($(this).hasClass("slider_started")) {
        return "";
      }
      const swiperEl = $(this).find(".swiper")[0];
      if (!swiperEl) return;
      $(this).addClass("slider_started");
      const box = $(this).find(".announcement-bar");
      const autoplay = box.data("autoplay");
      const stopAutoplay = box.data("stop-autoplay");
      const delay = box.data("delay") * 1000;
      const speed = box.data("speed") * 1000;
      let autoplayParm;
      if (autoplay) {
        autoplayParm = {
          autoplay: {
            delay: delay,
            pauseOnMouseEnter: stopAutoplay,
            disableOnInteraction: false,
            waitForTransition: true,
          },
        };
      } else {
        autoplayParm = {};
      }
      const announcementSwiper = new Swiper(swiperEl, {
        direction: "vertical",
        slidesPerView: "1",
        autoHeight: true,
        speed: speed,
        loop: true,
        ...autoplayParm,
      });
    });
  };

  announcementSlider();
  document.addEventListener("shopify:section:load", function () {
    announcementSlider();
  });
})();

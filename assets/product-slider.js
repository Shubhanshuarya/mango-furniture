(function () {
  const prodSlider = () => {
    $(".product-slider-section").each(function () {
      if ($(this).hasClass("slider_started")) {
        return "";
      }

      $(this).addClass("slider_started");
      const id = $(this).attr("id");
      const section = $(this).find(".product-slider");
      const autoplay = section.data("autoplay");
      const stopAutoplay = section.data("stop-autoplay");
      const fade = section.data("fade");
      const delay = section.data("delay") * 1000;
      const speed = section.data("speed") * 1000;
      let autoplayParm;
      let effectFade;

      if (fade) {
        effectFade = "fade";
      } else {
        effectFade = "";
      }

      if (autoplay) {
        autoplayParm = {
          autoplay: {
            delay: delay,
            disableOnInteraction: false,
            pauseOnMouseEnter: stopAutoplay,
            waitForTransition: true,
          },
        };
      } else {
        autoplayParm = { autoplay: false };
      }

      const prodSliderSwiperParams = {
        centeredSlides: false,
        autoHeight: false,
        calculateHeight: false,
        spaceBetween: 4,
        loop: true,
        speed: speed,
        reverseDirection: false,
        ...autoplayParm,
      };

      const swiperRightImg = new Swiper(`#${id} .product-slider__right-block`, {
        ...prodSliderSwiperParams,
        parallax: true,
        effect: effectFade,
      });

      const swiperLeft = new Swiper(`#${id} .swiper-product-slider`, {
        navigation: {
          nextEl: `#${id} .swiper-button-next__prod-slider`,
          prevEl: `#${id} .swiper-button-prev__prod-slider`,
        },
        pagination: {
          el: `#${id} .swiper-pagination`,
          clickable: true,
          type: "bullets",
          renderBullet: function (activeIndex, className) {
            return (
              '<span class="' + className + '">' + "<em>" + "</em>" + "</span>"
            );
          },
        },
        ...prodSliderSwiperParams,
        autoplay: false,
      });

      if (stopAutoplay) {
        swiperLeft.el.addEventListener("mouseenter", () => {
          swiperRightImg.autoplay.stop();
        });

        swiperLeft.el.addEventListener("mouseleave", () => {
          swiperRightImg.autoplay.start();
        });
      }
      swiperRightImg.controller.control = swiperLeft;
      swiperLeft.controller.control = swiperRightImg;
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    prodSlider();
  });

  document.addEventListener("shopify:section:load", function () {
    prodSlider();
  });

  prodSlider();
})();

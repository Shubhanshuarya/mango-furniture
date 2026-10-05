(function () {
  $(document).on("click", ".product-about__accordion-title", function () {
    const $this = $(this);

    if (!$this.hasClass("active")) {
      $(".product-about__accordion-title.active").removeClass("active");

      $this.addClass("active");

      $(".product-about__accordion-content").stop().slideUp(300);

      $this.siblings(".product-about__accordion-content").stop().slideDown(300);
    } else {
      $this.removeClass("active");

      $this.siblings(".product-about__accordion-content").stop().slideUp(300);
    }
  });
})();

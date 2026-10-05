(function () {
  const initializeCollapsibleSections = () => {
    $(".collapsible-content").each(function () {
      const $section = $(this);

      $section.find(".collapsible-content-summery").eq(0).addClass("active");

      $section
        .find(".collapsible-content-summery")
        .off("click")
        .on("click", function () {
          const $summary = $(this);
          const $description = $summary.siblings(
            ".collapsible-content-block__description"
          );

          if (!$summary.hasClass("active")) {
            $section
              .find(".collapsible-content-summery.active")
              .removeClass("active");
            $section
              .find(".collapsible-content-block__description")
              .stop()
              .slideUp(300);

            $summary.addClass("active");
            $description.stop().slideDown(300);
          } else {
            $summary.removeClass("active");
            $description.stop().slideUp(300);
          }
        });
    });
  };

  initializeCollapsibleSections();

  document.addEventListener("shopify:section:load", function () {
    setTimeout(() => {
      initializeCollapsibleSections();
    }, 100);
  });
})();

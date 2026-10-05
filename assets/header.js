(function () {
  const header = () => {
    const body = document.querySelector("body");
    const header = document.querySelector(".shopify-section-header");
    const headerDetails = document.querySelector(".menu-drawer-container");
    const headerIsAlwaysSticky =
      header
        .querySelector(".header-wrapper")
        .getAttribute("data-sticky-type") === "always";

    headerDetails.addEventListener("toggle", function (e) {
      const colorScheme =
        this.querySelector("#menu-drawer").dataset.colorScheme;
      if (window.innerWidth > 576) {
        header.classList.toggle(colorScheme);
      }

      if (window.innerWidth <= 576 && !header.classList.contains(colorScheme)) {
        header.classList.add(colorScheme);
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        header.classList.remove("shopify-section-header-sticky", "animate");
        body.classList.remove("overflow-hidden");
      }
    });

    document.addEventListener("scroll", () => {
      let scrollTop = window.scrollY;
      if (scrollTop > header.offsetHeight && headerIsAlwaysSticky) {
        header.classList.add("fixed", "animate");
      } else if (scrollTop <= header.offsetHeight && headerIsAlwaysSticky) {
        header.classList.remove("fixed", "animate");
      }
    });

    //$(".mega-menu-details summary").click(function (e) {
    //	e.preventDefault();
    //	const attrOpen = $(this).attr("open");
    //	if (attrOpen === false || attrOpen === undefined) {
    //		console.log(attrOpen);
    //		//$(".mega-menu-details").removeAttr("open");
    //		//$(this).attr("open", "open");
    //	} else {
    //		$(".mega-menu-details").removeAttr("open");
    //	}
    //});

    $(".header__icon--account").click(function (e) {
      $(".search-modal").removeClass("active");
    });

    const announcementBar = document.querySelector(".announcement-bar");
    const headerOffcanvas = document.querySelector(".burger-drawer");

    announcementBar &&
      headerOffcanvas &&
      headerOffcanvas.classList.add("announcement-bar-show");

    $(window).scroll(function () {
      if ($(window).scrollTop() > 100) {
        announcementBar &&
          headerOffcanvas &&
          headerOffcanvas.classList.add("announcement-bar-hide");
        announcementBar &&
          headerOffcanvas &&
          headerOffcanvas.classList.remove("announcement-bar-show");
      } else {
        announcementBar &&
          headerOffcanvas &&
          headerOffcanvas.classList.remove("announcement-bar-hide");
        announcementBar &&
          headerOffcanvas &&
          headerOffcanvas.classList.add("announcement-bar-show");
      }
    });
    $(".shopify-section-header").hover(
      function () {
        if (
          !$(".burger-drawer").hasClass("active") ||
          !$("#search-modal").hasClass("active")
        ) {
          $(".shopify-section-header").addClass("color-background-1");
        }
      },
      function () {
        if (
          $(".burger-drawer").hasClass("active") ||
          $("#search-modal").hasClass("active")
        ) {
          $(".shopify-section-header").addClass("color-background-1");
        } else {
          $(".shopify-section-header").removeClass("color-background-1");
        }
      }
    );
  };
  document.addEventListener("shopify:section:load", header);
  header();

  // When child menu items extend beyond the container, need to change the childmenue opening direction.
  const headerSubMenu = () => {
    const dir = document.querySelector("html").getAttribute("dir");
    const listMenu = document.querySelector(".header__menu .list-menu");
    const listMenuRect = listMenu.getBoundingClientRect();

    const allSubmenus = listMenu.querySelectorAll(
      ".header__submenu .list-menu-has-child .header__submenu"
    );
    allSubmenus.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      if (dir === "rtl") {
        if (itemRect.right > listMenuRect.right) {
          item.style.left = "auto";
          item.style.right = "100%";
        }
      } else {
        if (itemRect.left < listMenuRect.left) {
          item.style.left = "100%";
          item.style.right = "auto";
        }
      }
    });
  };

  headerSubMenu();
})();

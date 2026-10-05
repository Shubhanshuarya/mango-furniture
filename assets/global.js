document.addEventListener("DOMContentLoaded", function () {
  const slideInItems = document.querySelectorAll(".slide-up-animated");
  if (!slideInItems) return;
  slideInItems.forEach((item) => {
    item.classList.add("animation-start");
  });
});
function getSliderSettings() {
  return {
    slidesPerView: 1,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  };
}

function getSubSliderProductSettings() {
  return {
    slidesPerView: "auto",
    direction: "vertical",
    navigation: false,
  };
}

const sliderInit = (isUpdate) => {
  if (
    document.querySelectorAll(".product-section .js-media-list") &&
    document.querySelectorAll(".product-section .js-media-list").length > 0
  ) {
    const dir = document.querySelector("html").getAttribute("dir");

    let nextEl = ".swiper-btn--next";
    let prevEl = ".swiper-btn--prev";

    if (dir === "rtl") {
      [nextEl, prevEl] = [prevEl, nextEl];
    }

    let slider = new Swiper(".product-section .js-media-list", {
      slidesPerView: 1,
      autoHeight: true,
      spaceBetween: 4,
      navigation: {
        nextEl: nextEl,
        prevEl: prevEl,
      },
      thumbs: {
        swiper: document.querySelector(".product-section .js-media-sublist")
          .swiper,
      },
      on: {
        slideChangeTransitionStart: function () {
          document
            .querySelector(".product-section .js-media-sublist")
            .swiper.slideTo(
              document.querySelector(".product-section .js-media-list").swiper
                .activeIndex
            );
        },
        slideChange: function () {
          window.pauseAllMedia();
          this.params.noSwiping = false;
        },
        slideChangeTransitionEnd: function () {
          if (this.slides[this.activeIndex].querySelector("model-viewer")) {
            this.slides[this.activeIndex]
              .querySelector(".shopify-model-viewer-ui__button--poster")
              .removeAttribute("hidden");
          }
        },
        touchStart: function (s, e) {
          if (this.slides[this.activeIndex].querySelector("model-viewer")) {
            if (
              !this.slides[this.activeIndex]
                .querySelector("model-viewer")
                .classList.contains("shopify-model-viewer-ui__disabled")
            ) {
              this.params.noSwiping = true;
              this.params.noSwipingClass = "swiper-slide";
            }
          }
        },
      },
    });
    if (isUpdate) {
      setTimeout(() => {
        if (slider.swiper) {
          slider.swiper.update();
        }
      }, 800);
    }
  }
};

const subSliderInit = (isUpdate = false) => {
  const subSliders = document.querySelectorAll(
    ".product-section .js-media-sublist"
  );

  if (!subSliders.length) return;

  subSliders.forEach((sliderEl) => {
    // already initialized
    if (sliderEl.swiper) {
      if (isUpdate) {
        setTimeout(() => {
          if (sliderEl.swiper) {
            sliderEl.swiper.update();
          }
        }, 800);
      }

      return;
    }

    new Swiper(sliderEl, {
      centeredSlides: true,
      centeredSlidesBounds: true,
      slidesPerView: 3,
      spaceBetween: 2,
      direction: "horizontal",
      navigation: false,
      freeMode: false,
      watchSlidesProgress: true,

      on: {
        touchEnd(s) {
          const range = 5;

          const diff = s.isHorizontal()
            ? s.touches.currentX - s.touches.startX
            : s.touches.currentY - s.touches.startY;

          if (diff < range || diff > -range) {
            s.allowClick = true;
          }
        },
      },

      breakpoints: {
        990: {
          direction: "vertical",
        },
      },
    });
  });
};

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute("role", "button");
  summary.setAttribute("aria-expanded", "false");

  if (summary.nextElementSibling.getAttribute("id")) {
    summary.setAttribute("aria-controls", summary.nextElementSibling.id);
  }

  summary.addEventListener("click", (event) => {
    event.currentTarget.setAttribute(
      "aria-expanded",
      !event.currentTarget.closest("details").hasAttribute("open")
    );
  });

  if (summary.closest("header-drawer")) return;
  summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;

  const openDetailsElement = event.target.closest("details[open]");
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector("summary");
  openDetailsElement.removeAttribute("open");
  summaryElement.setAttribute("aria-expanded", false);
  summaryElement.focus();
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus.focus();
}

function pauseAllMedia() {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
      "*"
    );
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("product-model").forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );

    // Opt-in for lists where 0 removes the line (quick order list)
    const allowZero = this.hasAttribute("data-allow-zero");
    const fallbackValue = allowZero ? 0 : 1;

    var eventList = ["paste", "input"];

    for (event of eventList) {
      this.input.addEventListener(event, function (e) {
        const numberRegex = allowZero ? /^\d+$/ : /^0*?[1-9]\d*$/;

        if (
          numberRegex.test(e.currentTarget.value) ||
          e.currentTarget.value === ""
        ) {
          e.currentTarget.value;
        } else {
          e.currentTarget.value = fallbackValue;
        }
      });
    }

    this.input.addEventListener("focusout", function (e) {
      if (e.currentTarget.value === "") {
        e.currentTarget.value = fallbackValue;
      }
    });
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define("quantity-input", QuantityInput);

class PricePerItem extends HTMLElement {
  constructor() {
    super();
    this.handleQuantityUpdate = this.updatePrice.bind(this);
    this.handleCartChange = this.onCartChange.bind(this);
  }

  connectedCallback() {
    this.quantityInput = this.closest(".product-form__quantity")?.querySelector(
      ".quantity__input"
    );
    this.priceText = this.querySelector("[data-price-per-item-text]");
    this.priceBreaks = [];

    this.parsePriceBreaks();
    this.bindEvents();
    this.updatePrice();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  parsePriceBreaks() {
    const minQuantity = parseInt(this.dataset.minQuantity || "1", 10) || 1;
    const variantPrice = this.dataset.variantPrice;

    if (variantPrice) {
      this.priceBreaks.push({ quantity: minQuantity, price: variantPrice });
    }

    if (this.dataset.priceBreaks) {
      try {
        const priceBreaks = JSON.parse(this.dataset.priceBreaks);

        priceBreaks.forEach((priceBreak) => {
          const quantity = parseInt(priceBreak.quantity, 10);

          if (quantity && priceBreak.price) {
            this.priceBreaks.push({ quantity, price: priceBreak.price });
          }
        });
      } catch (error) {
        console.error("Failed to parse volume price breaks", error);
      }
    }

    this.priceBreaks.sort((firstBreak, secondBreak) => {
      return secondBreak.quantity - firstBreak.quantity;
    });
  }

  bindEvents() {
    if (this.quantityInput) {
      ["input", "change", "focusout"].forEach((eventName) => {
        this.quantityInput.addEventListener(
          eventName,
          this.handleQuantityUpdate
        );
      });
    }

    document.addEventListener("cart:change", this.handleCartChange);
  }

  unbindEvents() {
    if (this.quantityInput) {
      ["input", "change", "focusout"].forEach((eventName) => {
        this.quantityInput.removeEventListener(
          eventName,
          this.handleQuantityUpdate
        );
      });
    }

    document.removeEventListener("cart:change", this.handleCartChange);
  }

  getCurrentQuantity() {
    if (!this.quantityInput) return 1;

    const minimumQuantity = parseInt(
      this.dataset.minQuantity || this.quantityInput.min || "1",
      10
    );
    const cartQuantity = parseInt(
      this.quantityInput.dataset.cartQuantity || "0",
      10
    );
    const inputQuantity = parseInt(this.quantityInput.value || "", 10);

    return (
      cartQuantity +
      (Number.isNaN(inputQuantity) ? minimumQuantity : inputQuantity)
    );
  }

  onCartChange(event) {
    if (!this.quantityInput) return;

    const selectedVariantId = this.dataset.variantId;
    const cart = event.detail?.cart;

    if (!selectedVariantId || !cart?.items) return;

    const matchingLineItem = cart.items.find((item) => {
      return String(item.variant_id) === selectedVariantId;
    });

    this.quantityInput.dataset.cartQuantity = String(
      matchingLineItem?.quantity || 0
    );
    this.updatePrice();
  }

  updatePrice() {
    if (!this.priceText || !this.priceBreaks.length) return;

    const currentQuantity = this.getCurrentQuantity();
    const activePriceBreak =
      this.priceBreaks.find((priceBreak) => {
        return currentQuantity >= priceBreak.quantity;
      }) || this.priceBreaks[this.priceBreaks.length - 1];

    if (!activePriceBreak) return;

    this.priceText.textContent = `${this.dataset.atText} ${activePriceBreak.price}/${this.dataset.eachText}`;
  }
}

customElements.define("price-per-item", PricePerItem);

class AnchoredPopover extends HTMLElement {
  constructor() {
    super();
    this.interactionDelay = 150;
    this.openTimeout = null;
    this.closeTimeout = null;
    this.onTriggerEnter = this.handleTriggerEnter.bind(this);
    this.onTriggerLeave = this.handleTriggerLeave.bind(this);
    this.onPopoverEnter = this.handlePopoverEnter.bind(this);
    this.onPopoverLeave = this.handlePopoverLeave.bind(this);
    this.onTriggerClick = this.handleTriggerClick.bind(this);
    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onDocumentKeydown = this.handleDocumentKeydown.bind(this);
    this.onWindowResize = this.handleWindowResize.bind(this);
  }

  connectedCallback() {
    this.triggerElement = this.querySelector('[ref="trigger"]');
    this.popoverElement = this.querySelector('[ref="popover"]');

    if (!this.triggerElement || !this.popoverElement) return;

    this.popoverElement.hidden = true;
    this.triggerElement.addEventListener("pointerenter", this.onTriggerEnter);
    this.triggerElement.addEventListener("pointerleave", this.onTriggerLeave);
    this.popoverElement.addEventListener("pointerenter", this.onPopoverEnter);
    this.popoverElement.addEventListener("pointerleave", this.onPopoverLeave);
    this.triggerElement.addEventListener("click", this.onTriggerClick);
    this.triggerElement.addEventListener("focus", this.onTriggerEnter);
    this.triggerElement.addEventListener("blur", this.onTriggerLeave);
    document.addEventListener("click", this.onDocumentClick);
    document.addEventListener("keydown", this.onDocumentKeydown);
    window.addEventListener("resize", this.onWindowResize);
  }

  disconnectedCallback() {
    this.clearTimers();
    if (!this.triggerElement || !this.popoverElement) return;

    this.triggerElement.removeEventListener(
      "pointerenter",
      this.onTriggerEnter
    );
    this.triggerElement.removeEventListener(
      "pointerleave",
      this.onTriggerLeave
    );
    this.popoverElement.removeEventListener(
      "pointerenter",
      this.onPopoverEnter
    );
    this.popoverElement.removeEventListener(
      "pointerleave",
      this.onPopoverLeave
    );
    this.triggerElement.removeEventListener("click", this.onTriggerClick);
    this.triggerElement.removeEventListener("focus", this.onTriggerEnter);
    this.triggerElement.removeEventListener("blur", this.onTriggerLeave);
    document.removeEventListener("click", this.onDocumentClick);
    document.removeEventListener("keydown", this.onDocumentKeydown);
    window.removeEventListener("resize", this.onWindowResize);
  }

  clearTimers() {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  isOpen() {
    if (!this.popoverElement) return false;

    if (typeof this.popoverElement.matches === "function") {
      try {
        if (this.popoverElement.matches(":popover-open")) return true;
      } catch (error) {}
    }

    return this.popoverElement.classList.contains("is-open");
  }

  updatePosition() {
    if (!this.triggerElement || !this.popoverElement) return;

    const triggerRect = this.triggerElement.getBoundingClientRect();
    const popoverRect = this.popoverElement.getBoundingClientRect();
    const viewportMargin = 16;
    const spacing = 8;
    let left = triggerRect.left;
    let top = triggerRect.bottom + spacing;

    if (left + popoverRect.width > window.innerWidth - viewportMargin) {
      left = window.innerWidth - popoverRect.width - viewportMargin;
    }

    if (top + popoverRect.height > window.innerHeight - viewportMargin) {
      top = triggerRect.top - popoverRect.height - spacing;
    }

    left = Math.max(viewportMargin, left);
    top = Math.max(viewportMargin, top);

    this.popoverElement.style.setProperty("--popover-left", `${left}px`);
    this.popoverElement.style.setProperty("--popover-top", `${top}px`);
  }

  openPopover() {
    if (!this.popoverElement || this.isOpen()) return;

    this.clearTimers();

    if (typeof this.popoverElement.showPopover === "function") {
      this.popoverElement.showPopover();
    }

    this.popoverElement.hidden = false;
    this.popoverElement.classList.add("is-open");
    this.triggerElement?.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      this.updatePosition();
    });
  }

  closePopover() {
    if (!this.popoverElement || !this.isOpen()) return;

    this.clearTimers();

    if (typeof this.popoverElement.hidePopover === "function") {
      this.popoverElement.hidePopover();
    }

    this.popoverElement.classList.remove("is-open");
    this.popoverElement.hidden = true;
    this.triggerElement?.setAttribute("aria-expanded", "false");
  }

  handleTriggerEnter() {
    this.clearTimers();
    this.openTimeout = setTimeout(() => {
      this.openPopover();
    }, this.interactionDelay);
  }

  handleTriggerLeave() {
    this.clearTimers();
    this.closeTimeout = setTimeout(() => {
      this.closePopover();
    }, this.interactionDelay);
  }

  handlePopoverEnter() {
    this.clearTimers();
  }

  handlePopoverLeave() {
    this.clearTimers();
    this.closeTimeout = setTimeout(() => {
      this.closePopover();
    }, this.interactionDelay);
  }

  handleTriggerClick(event) {
    event.preventDefault();

    if (this.isOpen()) {
      this.closePopover();
    } else {
      this.openPopover();
    }
  }

  handleDocumentClick(event) {
    if (!this.contains(event.target)) {
      this.closePopover();
    }
  }

  handleDocumentKeydown(event) {
    if (event.key === "Escape") {
      this.closePopover();
    }
  }

  handleWindowResize() {
    if (this.isOpen()) {
      this.updatePosition();
    }
  }
}

customElements.define("anchored-popover-component", AnchoredPopover);

class VolumePricingInfo extends HTMLElement {
  constructor() {
    super();
    this.handleQuantityChange = this.updateFromInput.bind(this);
  }

  connectedCallback() {
    this.quantityInput =
      this.closest(".cart-item")?.querySelector(".quantity__input");

    if (!this.quantityInput) return;

    ["input", "change"].forEach((eventName) => {
      this.quantityInput.addEventListener(eventName, this.handleQuantityChange);
    });

    this.updateFromInput();
  }

  disconnectedCallback() {
    if (!this.quantityInput) return;

    ["input", "change"].forEach((eventName) => {
      this.quantityInput.removeEventListener(
        eventName,
        this.handleQuantityChange
      );
    });
  }

  updateActiveTier(quantity) {
    const rows = this.querySelectorAll(
      ".cart-volume-pricing-info__row[data-quantity]"
    );

    if (!rows.length) return;

    let activeRow = null;

    rows.forEach((row) => {
      row.classList.remove("cart-volume-pricing-info__row--active");

      const minimumQuantity = parseInt(row.dataset.quantity || "0", 10);

      if (quantity >= minimumQuantity) {
        activeRow = row;
      }
    });

    if (activeRow) {
      activeRow.classList.add("cart-volume-pricing-info__row--active");
    }
  }

  updateFromInput() {
    const quantity = parseInt(this.quantityInput?.value || "0", 10);

    if (Number.isNaN(quantity)) return;

    this.updateActiveTier(quantity);
  }
}

customElements.define("volume-pricing-info", VolumePricingInfo);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const serializeForm = (form) => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options["hideElement"] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector("details");
    const summaryElements = this.querySelectorAll("summary");
    this.addAccessibilityAttributes(summaryElements);

    if (navigator.platform === "iPhone")
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${window.innerHeight}px`
      );

    this.addEventListener("keyup", this.onKeyUp.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll("summary").forEach((summary) =>
      summary.addEventListener("click", this.onSummaryClick.bind(this))
    );
    this.querySelectorAll("button").forEach((button) => {
      if (this.querySelector(".header__localization-button") === button) return;
      if (this.querySelector(".header__localization-lang-button") === button)
        return;
      button.addEventListener("click", this.onCloseButtonClick.bind(this));
    });
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach((element) => {
      element.setAttribute("role", "button");
      element.setAttribute("aria-expanded", false);
      element.setAttribute("aria-controls", element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    const openDetailsElement = event.target.closest("details[open]");
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute("open");

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen
        ? this.closeMenuDrawer(summaryElement)
        : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector("button")
      );

      setTimeout(() => {
        detailsElement.classList.add("menu-opening");
      });
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove("menu-opening");
      this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
        details.removeAttribute("open");
        details.classList.remove("menu-opening");
      });
      this.mainDetailsToggle
        .querySelector("summary")
        .setAttribute("aria-expanded", false);
      document.body.classList.remove(
        `overflow-hidden-${this.dataset.breakpoint}`
      );
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute("open") &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest("details");
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove("menu-opening");
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute("open");
        if (detailsElement.closest("details[open]")) {
          trapFocus(
            detailsElement.closest("details[open]"),
            detailsElement.querySelector("summary")
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header =
      this.header || document.querySelector(".shopify-section-header");
    this.borderOffset =
      this.borderOffset ||
      this.closest(".header-wrapper").classList.contains(
        "header-wrapper--border-bottom"
      )
        ? 1
        : 0;
    document.documentElement.style.setProperty(
      "--header-bottom-position",
      `${parseInt(
        this.header.getBoundingClientRect().bottom - this.borderOffset
      )}px`
    );

    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });

    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

customElements.define("header-drawer", HeaderDrawer);

class BurgerDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector("#BurgerDrawer-Overlay").addEventListener(
      "click",
      this.close.bind(this)
    );

    this.querySelector("#burger-drawer-close").addEventListener(
      "click",
      this.close.bind(this)
    );
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector("#burger-icon-bubble");
    cartLink.setAttribute("role", "button");
    cartLink.setAttribute("aria-haspopup", "dialog");
    cartLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener("keydown", (event) => {
      if (event.code.toUpperCase() === "SPACE") {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    setTimeout(() => {
      this.classList.add("animate", "active");
    });

    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = document.getElementById("BurgerDrawer");
        const focusElement =
          this.querySelector(".drawer__inner") ||
          this.querySelector(".burger__close");
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add("overflow-hidden");
  }

  close() {
    this.classList.remove("active");
    removeTrapFocus(this.activeElement);
    document.body.classList.remove("overflow-hidden");
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define("burger-drawer", BurgerDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();

    // bind once
    this.handleCloseClick = this.hide.bind(this);
    this.init();
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", (event) => {
        if (
          event.pointerType === "mouse" &&
          !event.target.closest("deferred-media, product-model")
        )
          this.hide();
      });
    } else {
      this.addEventListener("click", (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  init() {
    // remove old listener if exists
    if (this.closeButton) {
      this.closeButton.removeEventListener("click", this.handleCloseClick);
    }

    // find new button after content replace
    this.closeButton = this.querySelector('[id^="ModalClose-"]');

    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.handleCloseClick);
    }
  }

  reinit() {
    this.init();
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector(".template-popup");
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    let isOpen = false;

    this.removeAttribute("open");
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();

    document.querySelectorAll("body > quick-add-modal").forEach((el) => {
      if (el.hasAttribute("open")) {
        isOpen = true;
      }
    });

    if (!isOpen) {
      document.body.classList.remove("overflow-hidden");
      document.body.dispatchEvent(new CustomEvent("modalClosed"));
    }
  }
}

customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}

customElements.define("modal-opener", ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener(
      "click",
      this.loadContent.bind(this)
    );
    if (this.getAttribute("data-autoplay")) {
      this.loadContent();
    }
  }

  loadContent() {
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );
      this.setAttribute("loaded", true);
      window.pauseAllMedia();
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (this.getAttribute("data-autoplay")) {
              let playPromise = entry.target.play();
              if (playPromise !== undefined) {
                playPromise.then((_) => {}).catch((error) => {});
              }
            }
          } else {
            entry.target.pause();
          }
        });
      });
      const deferredElement = this.appendChild(
        content.querySelector("video, model-viewer, iframe")
      );

      if (
        deferredElement.nodeName == "VIDEO" ||
        deferredElement.nodeName == "IFRAME"
      ) {
        // force autoplay for safari

        if (this.classList.contains("video-section__media")) {
          let playPromise = deferredElement.play();
          if (playPromise !== undefined) {
            playPromise.then((_) => {}).catch((error) => {});
          }
          videoObserver.observe(deferredElement);
        } else {
          deferredElement.play();
        }
      }
      if (
        this.closest(".swiper")?.swiper.slides[
          this.closest(".swiper").swiper.activeIndex
        ].querySelector("model-viewer")
      ) {
        if (
          !this.closest(".swiper")
            .swiper.slides[
              this.closest(".swiper").swiper.activeIndex
            ].querySelector("model-viewer")
            .classList.contains("shopify-model-viewer-ui__disabled")
        ) {
          this.closest(".swiper").swiper.params.noSwiping = true;
          this.closest(".swiper").swiper.params.noSwipingClass = "swiper-slide";
        }
      }
    }
  }
}

customElements.define("deferred-media", DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector(".slider");
    this.sliderItems = this.querySelectorAll(".slider__slide");
    this.pageCount = this.querySelector(".slider-counter--current");
    this.pageTotal = this.querySelector(".slider-counter--total");
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    const resizeObserver = new ResizeObserver((entries) => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener("scroll", this.update.bind(this));
    this.prevButton.addEventListener("click", this.onButtonClick.bind(this));
    this.nextButton.addEventListener("click", this.onButtonClick.bind(this));
  }

  initPages() {
    if (!this.sliderItems.length === 0) return;
    this.slidesPerPage = Math.floor(
      this.slider.clientWidth / this.sliderItems[0].clientWidth
    );
    this.totalPages = this.sliderItems.length - this.slidesPerPage + 1;
    this.update();
  }

  update() {
    if (!this.pageCount || !this.pageTotal) return;
    this.currentPage =
      Math.round(this.slider.scrollLeft / this.sliderItems[0].clientWidth) + 1;

    if (this.currentPage === 1) {
      this.prevButton.setAttribute("disabled", true);
    } else {
      this.prevButton.removeAttribute("disabled");
    }

    if (this.currentPage === this.totalPages) {
      this.nextButton.setAttribute("disabled", true);
    } else {
      this.nextButton.removeAttribute("disabled");
    }

    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
  }

  onButtonClick(event) {
    event.preventDefault();
    const slideScrollPosition =
      event.currentTarget.name === "next"
        ? this.slider.scrollLeft + this.sliderItems[0].clientWidth
        : this.slider.scrollLeft - this.sliderItems[0].clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }
}

customElements.define("slider-component", SliderComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
    this.isHighVariantNeedUpdate = false;
    this.isCombinedListingsNeedUpdate = false;
    this.infoBlocksList = ["Product-details", "Tags", "ProductModal"];
  }

  onVariantChange(event) {
    if (!this.contains(event.target)) return;
    const selectedValuesIds = this.getSelectedValuesIds();

    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, "", false);

    this.isHighVariantNeedUpdate = false;

    if (
      (!this.currentVariant && this.dataset.isHighVariantProduct === "true") ||
      (!this.currentVariant && this.combinedProductURL)
    ) {
      this.highVariantRequestUrl = this.createRequestUrl({
        selectedValuesIds: selectedValuesIds,
        combinedProductURL: this.combinedProductURL,
      });

      if (this.highVariantRequestUrl) {
        this.isHighVariantNeedUpdate = true;
      }
      if (this.combinedProductURL) {
        this.isCombinedListingsNeedUpdate = true;
      }
    }

    if (this.isHighVariantNeedUpdate === false) {
      this.updatePickupAvailability();
      this.updateVariantStatuses();
    }

    this.resetErrorMessage();

    if (!this.currentVariant) {
      // -----
      // for high-variant products
      if (this.isHighVariantNeedUpdate) {
        this.classList.add("high-variant-loading");
        this.renderProductInfo(this.highVariantRequestUrl);
        return;
      }
      // -----

      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      if (
        this.currentVariant?.featured_media &&
        this.dataset?.variantMediaDisplay === "show_all"
      ) {
        // If variant display != "show_all", the media gallery element is fully replaced inside updateElementsAfterFetch
        this.updateMediaSub();
        this.updateMedia();
      }

      this.updateURL();
      this.updateVariantInput();
      const requestUrl = this.createRequestUrl({
        currentVariantId: this.currentVariant.id,
        combinedProductURL: this.combinedProductURL,
      });
      this.renderProductInfo(requestUrl);
      // update slider
      quickAddSlider_G();
    }

    if (this.currentVariant) {
      // dispatch variant:change
      document.dispatchEvent(
        new CustomEvent("variant:change", {
          detail: {
            variant: this.currentVariant,
            previousVariant: this.previousVariant || null,
            formElement: document.querySelector(`#${this.getAttribute("id")}`),
            sectionId: this.dataset.section,
          },
        })
      );
      // dispatch variant:change

      // Save the previous version
      this.previousVariant = this.currentVariant;
    }
  }

  updateOptions() {
    const fieldsets = [...this.querySelectorAll("fieldset")];

    fieldsets.sort((a, b) => {
      return (
        Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition)
      );
    });

    this.options = fieldsets.map((fieldset) => {
      const select = fieldset.querySelector("select");
      if (select) return select.value;
      return Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked
      ).value;
    });
  }

  getSelectedValuesIds() {
    const controls = [
      ...this.querySelectorAll(".product-form__controls"),
      ...this.querySelectorAll(".product-form__input"),
    ];

    controls.sort((a, b) => {
      return (
        Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition)
      );
    });

    return controls.map((control) => {
      const checkedInput = control.querySelector('input[type="radio"]:checked');
      const selectedOption = control.querySelector("select option:checked");

      if (checkedInput?.dataset?.productUrl) {
        this.combinedProductURL = checkedInput.dataset.productUrl;
      }

      if (selectedOption?.dataset?.productUrl) {
        this.combinedProductURL = selectedOption.dataset.productUrl;
      }

      return checkedInput?.dataset?.optionValueId
        ? checkedInput.dataset.optionValueId
        : selectedOption?.dataset?.optionValueId
        ? selectedOption?.dataset?.optionValueId
        : null;
    });
  }

  createRequestUrl({
    combinedProductURL = "",
    currentVariantId = "",
    selectedValuesIds = [],
  }) {
    const productUrl = combinedProductURL || `${this.dataset.url}`;
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    if (currentVariantId) {
      return `${productUrl}?variant=${currentVariantId}&section_id=${sectionId}`;
    }

    // -----
    // for high-variant products
    // and if variant not found in liquid <script data-all-variants-no-high>
    if (selectedValuesIds.length) {
      const params = [];
      params.push(`section_id=${sectionId}`);
      params.push(`option_values=${selectedValuesIds.join(",")}`);
      return `${productUrl}?${params.join("&")}`;
    }
    // -----
  }

  // !!! Need to add for update data
  setCurrentVariantAfterFetch(html) {
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    const variantPickerSource =
      html.getElementById(`variant-radios-${sourceSectionId}`) ||
      html.getElementById(`variant-selects-${sourceSectionId}`);

    const variantPickerDestination =
      document.getElementById(`variant-radios-${this.dataset.section}`) ||
      document.getElementById(`variant-selects-${this.dataset.section}`);

    if (!variantPickerSource) return;

    const newVariantDataEl = variantPickerSource.querySelector(
      "[data-selected-variant]"
    );
    if (!newVariantDataEl) return;

    if (
      variantPickerSource.dataset.url != variantPickerDestination.dataset.url
    ) {
      this.dataset.url = variantPickerSource.dataset.url;
    }

    const newVariantData = variantPickerSource.querySelector(
      "[data-selected-variant]"
    ).innerHTML;

    const selectedVariant = !!newVariantData
      ? JSON.parse(newVariantData)
      : null;

    this.currentVariant = selectedVariant;

    const oldEl = variantPickerDestination.querySelector(
      "[data-selected-variant]"
    );
    if (oldEl) {
      oldEl.innerHTML = newVariantData;
    }
  }

  updateMasterId() {
    if (this.variantData || this.querySelector("[data-all-variants-no-high]")) {
      this.currentVariant = this.getVariantData().find((variant) => {
        //this.options.sort();
        //variant.options.sort();

        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      });
    }
  }

  isHidden(elem) {
    const styles = window.getComputedStyle(elem);
    return styles.display === "none" || styles.visibility === "hidden";
  }

  updateMedia() {
    if (!this.currentVariant || !this.currentVariant?.featured_media) return;

    const swiperWrappers = document.querySelectorAll(".product__media-wrapper");

    swiperWrappers.forEach((elem) => {
      if (!this.isHidden(elem)) {
        const newMedia = document.querySelector(
          `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
        );

        if (!newMedia) return;
        if (elem.querySelector(".js-media-list")?.swiper) {
          elem
            .querySelector(".js-media-list")
            .swiper.slideTo(
              elem
                .querySelector(".js-media-list")
                .swiper.slides.indexOf(newMedia)
            );
        }
      }
    });
  }

  updateMediaSub() {
    if (!this.currentVariant || !this.currentVariant?.featured_media) return;

    const newMediaSub = document.querySelector(
      `[data-media-sub-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );

    if (!newMediaSub) return;

    // Thumbnails and main slides are synced by index, so the thumbnail order
    // must stay identical to the main gallery. Slide to it instead of reordering.
    const subSlider = newMediaSub.closest(".js-media-sublist")?.swiper;

    if (subSlider) {
      subSlider.slideTo(subSlider.slides.indexOf(newMediaSub));
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__input")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        if (input.tagName === "OPTION") {
          input.innerText = input.getAttribute("value");
        } else if (input.tagName === "INPUT") {
          input.classList.remove("disabled");
        }
      } else {
        if (input.tagName === "OPTION") {
          input.innerText =
            window.variantStrings.unavailable_with_option.replace(
              "[value]",
              input.getAttribute("value")
            );
        } else if (input.tagName === "INPUT") {
          input.classList.add("disabled");
        }
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  resetErrorMessage() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}, #sticky-bar-product-form-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const parentEl = productForm.closest("product-form");
      if (parentEl) {
        const errorWrapperEl = parentEl.querySelector(
          ".product-form__error-message-wrapper"
        );
        const errorTextEl = errorWrapperEl?.querySelector(
          ".product-form__error-message"
        );
        if (!errorWrapperEl || !errorTextEl) return;
        errorWrapperEl.setAttribute("hidden", true);
        errorTextEl.textContent = "";
      }
    });
  }

  renderProductInfo(requestUrl) {
    this.abortController?.abort();
    this.abortController = new AbortController();

    fetch(requestUrl, { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections

        const html = new DOMParser().parseFromString(responseText, "text/html");

        try {
          this.setCurrentVariantAfterFetch(html);
        } catch (err) {
          console.log(err);
        }
        // -----
        // for high-variant products
        // and if variant not found in liquid <script data-all-variants-no-high>
        // but it was found after a request with the option_values parameter
        if (this.isHighVariantNeedUpdate) {
          try {
            this.updateURL();
            this.updatePickupAvailability();
            this.updatePickerInnerHtml(html);
            if (this.currentVariant) {
              this.updateVariantInput();
              if (
                this.currentVariant.featured_media &&
                this.dataset?.variantMediaDisplay === "show_all"
              ) {
                // If variant display != "show_all", the media gallery element is fully replaced inside updateElementsAfterFetch
                this.updateMedia();
              }
            }
          } catch (err) {
            console.log(err);
          }
        }
        // -----
        this.updateElementsAfterFetch(html);

        if (!this.currentVariant) {
          this.toggleAddButton(true, "");
          this.setUnavailable();
        } else {
          this.toggleAddButton(
            !this.currentVariant?.available,
            window.variantStrings.soldOut
          );
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.info("Fetch aborted by user");
        } else {
          console.error(error);
        }
      })
      .finally(() => {
        this.classList.remove("high-variant-loading");
      });
  }

  updatePickerInnerHtml(html) {
    // attr data-original-section use for Quick view modal
    const currentSectionId = this.dataset.section;
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    const variantPickerSource =
      html.getElementById(`variant-radios-${sourceSectionId}`) ||
      html.getElementById(`variant-selects-${sourceSectionId}`);

    const variantPickerDestination =
      document.getElementById(`variant-radios-${currentSectionId}`) ||
      document.getElementById(`variant-selects-${currentSectionId}`);
    if (variantPickerSource && variantPickerDestination) {
      const quickViewModal = this.closest("quick-view-modal");
      const quicAddModal = this.closest("quick-add-modal");

      let preSel = "quickview";
      if (quicAddModal) {
        preSel = "quickadd";
      }

      if (quickViewModal || quicAddModal) {
        variantPickerDestination.innerHTML =
          variantPickerSource.innerHTML.replaceAll(
            sourceSectionId,
            `${preSel}-${sourceSectionId}`
          );
      } else {
        variantPickerDestination.innerHTML = variantPickerSource.innerHTML;
      }
    }
  }

  getSectionScopedHtml(htmlString, sourceSectionId, currentSectionId) {
    const quickViewModal = this.closest("quick-view-modal");
    const quickAddModal = this.closest("quick-add-modal");

    if (!quickViewModal && !quickAddModal) {
      return htmlString;
    }

    return htmlString.replaceAll(sourceSectionId, currentSectionId);
  }

  updateElementsAfterFetch(html) {
    const priceDestination = document.getElementById(
      `price-${this.dataset.section}`
    );
    const priceSource = html.getElementById(
      `price-${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    );

    if (priceSource && priceDestination)
      priceDestination.innerHTML = priceSource.innerHTML;
    if (priceDestination)
      priceDestination.classList.remove("visibility-hidden");

    const skuSource = html.getElementById(
      `Sku-${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    );
    const skuDestination = document.getElementById(
      `Sku-${this.dataset.section}`
    );
    const inventorySource = html.getElementById(
      `Inventory-${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    );
    const inventoryDestination = document.getElementById(
      `Inventory-${this.dataset.section}`
    );

    if (inventorySource && inventoryDestination)
      inventoryDestination.innerHTML = inventorySource.innerHTML;
    if (skuSource && skuDestination) {
      skuDestination.innerHTML = skuSource.innerHTML;
      skuDestination.classList.toggle(
        "visibility-hidden",
        skuSource.classList.contains("visibility-hidden")
      );
    }

    if (inventoryDestination)
      inventoryDestination.classList.toggle(
        "visibility-hidden",
        inventorySource.innerText === ""
      );

    const addButtonUpdated = html.getElementById(
      `ProductSubmitButton-${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    );

    if (productSlidersData.length > 0) {
      productSlidersData.forEach((swiper) => {
        swiper.destroy(true, true);
        swiper.update();
      });
    }

    // Update Info blocks and Modals
    this.updateProductInfoBlocks(html);

    const currentSectionId = this.dataset.section;
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    // Update elements for B2B quantity pricing https://help.shopify.com/en/manual/b2b/catalogs/quantity-pricing
    const quantityFormSource = html.getElementById(
      `Quantity-Form-${sourceSectionId}`
    );
    const quantityFormDestination = document.getElementById(
      `Quantity-Form-${currentSectionId}`
    );
    if (quantityFormSource && quantityFormDestination) {
      quantityFormDestination.innerHTML = this.getSectionScopedHtml(
        quantityFormSource.innerHTML,
        sourceSectionId,
        currentSectionId
      );
    }

    const b2bSource = html.getElementById(`ProductB2b-${sourceSectionId}`);
    const b2bDestination = document.getElementById(
      `ProductB2b-${currentSectionId}`
    );
    if (b2bSource && b2bDestination) {
      b2bDestination.innerHTML = this.getSectionScopedHtml(
        b2bSource.innerHTML,
        sourceSectionId,
        currentSectionId
      );
    } else if (b2bSource && !b2bDestination) {
      const buttonsDestination = document.getElementById(
        `ProductFormButtons-${currentSectionId}`
      );
      buttonsDestination?.insertAdjacentHTML(
        "afterbegin",
        this.getSectionScopedHtml(
          b2bSource.outerHTML,
          sourceSectionId,
          currentSectionId
        )
      );
    } else if (!b2bSource && b2bDestination) {
      b2bDestination.remove();
    }

    const buttonsWrapperSource = html.getElementById(
      `ProductFormButtons-${sourceSectionId}`
    );
    const buttonsWrapperDestination = document.getElementById(
      `ProductFormButtons-${currentSectionId}`
    );
    if (buttonsWrapperSource && buttonsWrapperDestination) {
      if (buttonsWrapperSource.dataset.hasQuantityPricing === "true") {
        buttonsWrapperDestination.dataset.hasQuantityPricing = "true";
      } else {
        delete buttonsWrapperDestination.dataset.hasQuantityPricing;
      }
    }

    // variant image swatches
    if (this.isHighVariantNeedUpdate !== true) {
      const variantSwatchesSource = html.querySelector(
        `#variant-radios-${sourceSectionId} [data-is-variant-image-swatch="true"]`
      );
      const variantSwatchesDestination = document.querySelector(
        `#variant-radios-${currentSectionId} [data-is-variant-image-swatch="true"]`
      );

      if (variantSwatchesSource && variantSwatchesDestination) {
        const quickViewModal = this.closest("quick-view-modal");
        if (quickViewModal) {
          variantSwatchesDestination.innerHTML =
            variantSwatchesSource.innerHTML.replaceAll(
              sourceSectionId,
              `quickview-${sourceSectionId}`
            );
        } else {
          variantSwatchesDestination.innerHTML =
            variantSwatchesSource.innerHTML;
        }
      }
    }

    // product media
    if (
      this.dataset?.variantMediaDisplay !== "show_all" ||
      this.isCombinedListingsNeedUpdate
    ) {
      const sourceSectionId = this.dataset.originalSection
        ? this.dataset.originalSection
        : this.dataset.section;
      const currentSectionId = this.dataset.section;

      const mediaSource = html.querySelector(
        `[data-section="product-media-${sourceSectionId}"]`
      );
      const mediaDestination = document.querySelector(
        `[data-section="product-media-${currentSectionId}"]`
      );

      if (mediaSource && mediaDestination) {
        mediaDestination.innerHTML = mediaSource.innerHTML;

        const parentQuickView = this.closest("quick-view-modal");
        if (parentQuickView) {
          if (typeof parentQuickView.removeDOMElements === "function") {
            parentQuickView.removeDOMElements(mediaDestination);
          }
          if (typeof parentQuickView.initSlider === "function") {
            parentQuickView.initSlider();
          }
        } else {
          const section = document.getElementById(
            `shopify-section-${currentSectionId}`
          );

          if (section && typeof initProductPage === "function") {
            initProductPage(section);
          }
        }
        if (document.querySelector(".js-media-list")) {
          if (currentSectionId.includes("quickadd")) {
            quickAddSlider_G();
          } else {
            subSliderInit(true);
            sliderInit(true);
          }
        }
      }
    }

    if (this.isCombinedListingsNeedUpdate) {
      const newVariantData = html.querySelector(
        "[data-selected-variant]"
      ).innerHTML;

      const selectedVariant = !!newVariantData
        ? JSON.parse(newVariantData)
        : null;

      let productTitle = selectedVariant?.name?.replace(
        `- ${selectedVariant?.title}`,
        ""
      );

      if (!productTitle) {
        productTitle = html.querySelector(".product__title")?.innerHTML
          ? html.querySelector(".product__title")?.innerHTML.trim()
          : "";
      }

      // product title
      const titleDestination = document.querySelectorAll(".product__title");
      if (titleDestination) {
        titleDestination.forEach((titleElem) => {
          titleElem.innerText = productTitle || "";
        });
      }

      //breadcrumb
      const breadcrumbDestination = document.querySelector(".breadcrumb span");
      if (breadcrumbDestination) {
        breadcrumbDestination.innerText = productTitle || "";
      }

      // text
      const textDestination = document.querySelector(
        ".product .product__info-wrapper .product__text"
      );

      if (textDestination) {
        textDestination.innerHTML =
          html.querySelector(".product .product__info-wrapper .product__text")
            ?.innerHTML || "";
      }

      // about
      const aboutDestination = document.querySelector(
        ".product .product__outer .about"
      );

      if (aboutDestination) {
        aboutDestination.innerHTML =
          html.querySelector(".product .product__outer .about")?.innerHTML ||
          "";
      }

      // product buttons
      const buttonsDestination = document.querySelectorAll(
        ".product .product__outer .product-form .form"
      );
      if (buttonsDestination) {
        buttonsDestination.forEach((titleElem) => {
          titleElem.innerHTML =
            html.querySelector(".product .product__outer .product-form .form")
              ?.innerHTML || "";
        });
      }
    }
  }

  updateProductInfoBlocks(html) {
    const sourceId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    const destId = this.dataset.section;

    this.infoBlocksList.forEach((block) => {
      const blockSource = html.getElementById(`${block}-${sourceId}`);

      const blockDestination = document.getElementById(`${block}-${destId}`);

      if (blockDestination) {
        blockDestination.innerHTML = blockSource?.innerHTML || "";

        // Check if the modal element exists and reinitialize it
        const isDialog = blockDestination.querySelector('[role="dialog"]');
        if (isDialog && typeof blockDestination?.reinit === "function") {
          blockDestination.reinit();
        }
      }
    });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelectorAll('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute("disabled", "disabled");

      if (text) {
        addButtonText.forEach((elem) => {
          elem.innerHTML = `${text}`;
        });
      }
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.forEach((elem) => {
        elem.innerHTML = `${window.variantStrings.addToCart}`;
      });
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelectorAll('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.forEach((elem) => {
      elem.innerHTML = `${window.variantStrings.unavailable}`;
    });
    if (price) price.classList.add("visibility-hidden");
    if (inventory) inventory.classList.add("visibility-hidden");
    if (sku) sku.classList.add("visibility-hidden");
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.classList.remove("disabled");
      } else {
        input.classList.add("disabled");
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked
      ).value;
    });
  }
}

customElements.define("variant-radios", VariantRadios);

class ProductModel extends DeferredMedia {
  constructor() {
    super();
  }

  loadContent() {
    super.loadContent();

    Shopify.loadFeatures([
      {
        name: "model-viewer-ui",
        version: "1.0",
        onLoad: this.setupModelViewerUI.bind(this),
      },
    ]);
  }

  setupModelViewerUI(errors) {
    if (errors) return;

    this.modelViewerUI = new Shopify.ModelViewerUI(
      this.querySelector("model-viewer")
    );

    const $this = this;

    this.querySelector(".shopify-model-viewer-ui__button").addEventListener(
      "click",
      function () {
        if (
          $this
            .closest(".swiper")
            .swiper.slides[
              $this.closest(".swiper").swiper.activeIndex
            ].querySelector("model-viewer")
        ) {
          if (
            !$this
              .closest(".swiper")
              .swiper.slides[
                $this.closest(".swiper").swiper.activeIndex
              ].querySelector("model-viewer")
              .classList.contains("shopify-model-viewer-ui__disabled")
          ) {
            if (
              $this
                .querySelector(".shopify-model-viewer-ui__button")
                .hasAttribute("hidden")
            ) {
              $this.closest(".swiper").swiper.params.noSwiping = true;
              $this.closest(".swiper").swiper.params.noSwipingClass =
                "swiper-slide";
            }
          }
        }
      }
    );

    this.querySelector(
      ".shopify-model-viewer-ui__controls-overlay"
    ).addEventListener("click", function () {
      if (
        !$this
          .querySelector(".shopify-model-viewer-ui__button")
          .hasAttribute("hidden")
      ) {
        $this.closest(".swiper").swiper.params.noSwiping = false;
      }
    });
  }
}
customElements.define("product-model", ProductModel);

// Product slider
const productSlidersData = [];

(function () {
  const productSlider = () => {
    const productSliders = Array.from(
      document.querySelectorAll(".products-slider")
    );
    if (productSliders.length === 0) return;
    productSliders.forEach((slider) => {
      const sectionId = slider.dataset.id;
      const perRow = slider.dataset.perRow;
      const mobileR = slider.dataset.mobile;
      const speed = slider.dataset.speed * 1000;
      const delay = slider.dataset.delay * 1000;
      const autoplay = toBoolean(slider.dataset.autoplay);
      const stopAutoplay = toBoolean(slider.dataset.stopAutoplay);
      const showArrows = toBoolean(slider.dataset.showArrows);
      let autoplayParm = {};
      let arrowsParm = {};
      if (autoplay) {
        autoplayParm = {
          autoplay: {
            delay: delay,
            pauseOnMouseEnter: stopAutoplay,
            disableOnInteraction: false,
          },
        };
      }
      if (showArrows) {
        arrowsParm = {
          navigation: {
            nextEl: `#${sectionId} .swiper-button-next`,
            prevEl: `#${sectionId} .swiper-button-prev`,
          },
          pagination: {
            el: `#${sectionId} .swiper-pagination`,
            clickable: true,
            type: "bullets",
            renderBullet: function (activeIndex, className) {
              return (
                '<span class="' +
                className +
                '">' +
                "<em>" +
                "</em>" +
                "</span>"
              );
            },
          },
        };
      }
      let swiperParms = {
        speed: speed,
        keyboard: true,
        slidesPerView: mobileR,
        spaceBetween: 16,
        breakpoints: {
          576: {
            slidesPerView: 2,
          },
          990: {
            slidesPerView: 3,
          },
          1100: {
            spaceBetween: 16,
            slidesPerView: perRow,
          },
        },
        ...arrowsParm,
        ...autoplayParm,
      };

      const swiper = new Swiper(`#${sectionId} .swiper`, swiperParms);
      productSlidersData.push(swiper);
    });
  };

  function toBoolean(string) {
    return string === "true" ? true : false;
  }
  if (document.querySelector("product-recommendations") !== null) {
    const initslider = setInterval(() => {
      if (
        document
          .querySelector("product-recommendations")
          .querySelector(".swiper") !== null
      ) {
        if (
          document
            .querySelector("product-recommendations")
            .querySelector(".swiper")
            .classList.contains("swiper-initialized")
        ) {
          clearInterval(initslider);
        }
        productSlider();
      }
    }, 100);
  }

  document.addEventListener("DOMContentLoaded", function () {
    productSlider();
    document.addEventListener("shopify:section:load", function () {
      productSlider();
    });
  });
})();

(function () {
  const hoverOpacity = () => {
    $("[data-hover-opacity]").hover(
      function () {
        const id = $(this).data("hover-opacity");
        $(`[data-hover-opacity=${id}]`).addClass("opacity");
        $(this).removeClass("opacity");
      },
      function () {
        const id = $(this).data("hover-opacity");
        $(`[data-hover-opacity=${id}]`).removeClass("opacity");
      }
    );
  };
  document.addEventListener("DOMContentLoaded", function () {
    hoverOpacity();
    document.addEventListener("shopify:section:load", function () {
      hoverOpacity();
    });
  });
})();

(function () {
  const onClickOpacity = () => {
    const dir = document.querySelector("html").getAttribute("dir");
    $("[data-click-action]").on("mouseenter", function () {
      const id = $(this).data("click-action");
      $(`[data-click-action=${id}]`).removeClass("active");
      $(this).addClass("active");
    });

    // make firts element active
    const lists = document.querySelectorAll(
      ".header-mega-submenu .mega-menu-list"
    );

    if (!lists.length) return;

    lists.forEach((list) => {
      const firstItem = list.querySelector("li[data-click-action]");
      if (firstItem) {
        firstItem.classList.add("active");
      }
    });
  };
  document.addEventListener("DOMContentLoaded", function () {
    onClickOpacity();
    document.addEventListener("shopify:section:load", function () {
      onClickOpacity();
    });
  });
})();

(function () {
  const sidebar = () => {
    let pageNav = $(".product-details");

    if (pageNav.length > 0) {
      let pageNavList = pageNav.find('.product-details-nav-item[href^="#"]');
      let adminBarHeight = 0;

      let headings = [];
      for (let i = 0; i < pageNavList.length; i++) {
        const targetSelector = $(pageNavList[i]).attr("href");
        headings[i] = targetSelector ? $(targetSelector) : $();
      }

      if (!pageNavList.length) return;

      $(pageNavList[0]).addClass("active");

      $(window)
        .off("scroll.productDetailsSidebar")
        .on("scroll.productDetailsSidebar", function () {
          for (let i = headings.length - 1; i >= 0; i--) {
            if (headings[i].length > 0) {
              if (
                headings[i].offset().top - 50 <=
                $(window).scrollTop() + adminBarHeight
              ) {
                if (!$(pageNavList[i]).hasClass("active")) {
                  let hasActiveItem = false;
                  for (let j = i; j < headings.length; j++) {
                    if ($(pageNavList[j]).hasClass("active")) {
                      hasActiveItem = true;
                    }
                  }

                  if (!hasActiveItem) {
                    $(pageNavList[i]).addClass("active");
                    if (
                      $(pageNavList[i]).hasClass("product-details-nav-item")
                    ) {
                    }

                    history.pushState(
                      null,
                      null,
                      window.location.origin +
                        window.location.pathname +
                        $(pageNavList[i]).attr("href")
                    );
                  }
                } else {
                  for (let j = 0; j < i; j++) {
                    $(pageNavList[j]).removeClass("active");
                  }
                }
              } else {
                if (i !== 0) {
                  $(pageNavList[i]).removeClass("active");
                }
              }
            }
          }
        });
    }
  };
  document.addEventListener("DOMContentLoaded", function () {
    sidebar();
    document.addEventListener("shopify:section:load", function () {
      sidebar();
    });
  });
})();

(function () {
  const imageAnimation = () => {
    const images = document.querySelectorAll("[animation-images]");
    observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        entry.isIntersecting &&
          (entry.target.classList.add("transition"),
          setTimeout(() => entry.target.classList.remove("clipped"), 5),
          observer.unobserve(entry.target));
      });
    });
    images.forEach((image) => {
      const wrapper = image.closest(".photowrapper");
      noClip = image.dataset.noclip;
      if (noClip != "true") {
        wrapper &&
          (wrapper.classList.add("clipped"), observer.observe(wrapper));
      } else {
        wrapper &&
          (wrapper.classList.add("clipped"),
          noClip && wrapper.classList.add("noclip"),
          observer.observe(wrapper));
      }
    });
  };
  document.addEventListener("DOMContentLoaded", function () {
    imageAnimation();
    document.addEventListener("shopify:section:load", function () {
      imageAnimation();
    });
  });
})();

(function () {
  const initDrawerAccordion = () => {
    $(".drawer__accordion-title").click(function () {
      if (!$(this).hasClass("active")) {
        $(".drawer__accordion-title.active").removeClass("active");
        $(this).addClass("active");
        $(".drawer__accordion-content").stop().slideUp(300);
        $(this)
          .siblings(".drawer__accordion-content")
          .eq($(this).index())
          .stop()
          .slideDown(300);
      } else {
        $(this).removeClass("active");
        $(this).siblings(".drawer__accordion-content").stop().slideUp(300);
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initDrawerAccordion();
    document.addEventListener("shopify:section:load", function () {
      initDrawerAccordion();
    });
  });
})();

(function () {
  const productTextAnimation = () => {
    const richTextSections = document.querySelectorAll(
      ".product-subheading-animation"
    );
    richTextSections.forEach((richTextSection) => {
      if (richTextSection.classList.contains("js-init")) {
        return "";
      }
      richTextSection.classList.add("js-init");
      const elem = richTextSection.querySelector(
        ".product__subheading-animation"
      );
      const text = elem.dataset.text;
      const delay = 100;

      let print_text = function (text, elem, delay) {
        if (text.length > 0) {
          elem.innerHTML += text[0];
          setTimeout(function () {
            print_text(text.slice(1), elem, delay);
          }, delay);
        }
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (elem.classList.contains("js-text-init")) {
              return "";
            }
            elem.classList.add("js-text-init");
            print_text(text, elem, delay);
            return;
          }
          //elem.innerHTML = "";
        });
      });
      observer.observe(elem);
    });
  };
  document.addEventListener("DOMContentLoaded", function () {
    productTextAnimation();
    document.addEventListener("shopify:section:load", function () {
      productTextAnimation();
    });
  });
})();

// dispatch cart:refresh

document.documentElement.addEventListener("cart:refresh", () => {
  const sectionsToUpdate = [
    { id: "cart-count-bubble", selector: "#cart-icon-bubble" },
    { id: "cart-drawer", selector: "#CartDrawer" },
    { id: "main-cart-items", selector: ".cart-items-wrapper" },
    { id: "main-cart-footer", selector: ".cart__footer" },
    { id: "main-cart-shipping", selector: ".cart-shipping" },
  ];

  sectionsToUpdate.forEach((section) => {
    fetch(`${routes.cart_url}?section_id=${section.id}`)
      .then((response) => response.text())
      .then((html) => {
        const parsedHTML = new DOMParser().parseFromString(html, "text/html");
        const sourceSection = parsedHTML.querySelector(section.selector);
        const destinationSection = document.querySelector(section.selector);
        if (sourceSection && destinationSection) {
          destinationSection.innerHTML = sourceSection.innerHTML;
        }
      })
      .catch((e) => console.error(`Error updating ${section.id}:`, e));
  });
});

// dispatch cart:refresh

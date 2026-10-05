if (!customElements.get("cart-remove-button")) {
  class CartRemoveButton extends HTMLElement {
    constructor() {
      super();

      this.addEventListener("click", (event) => {
        event.preventDefault();
        const cartItems =
          this.closest("cart-items") || this.closest("cart-drawer-items");
        cartItems.updateQuantity(this.dataset.index, 0);
      });
    }
  }

  customElements.define("cart-remove-button", CartRemoveButton);
}

//if (!customElements.get("cart-items")) {
  class CartItems extends HTMLElement {
    constructor() {
      super();
      this.lineItemStatusElement =
        document.getElementById("shopping-cart-line-item-status") ||
        document.getElementById("CartDrawer-LineItemStatus");

      const debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, ON_CHANGE_DEBOUNCE_TIMER);

      this.addEventListener("change", debouncedOnChange.bind(this));
    }

    cartUpdateUnsubscriber = undefined;

    connectedCallback() {
      this.cartUpdateUnsubscriber = subscribe(
        PUB_SUB_EVENTS.cartUpdate,
        (event) => {
          if (event.source === "cart-items") {
            return;
          }
          this.onCartUpdate();
        }
      );
    }

    disconnectedCallback() {
      if (this.cartUpdateUnsubscriber) {
        this.cartUpdateUnsubscriber();
      }
    }

    onChange(event) {
      this.updateQuantity(
        event.target.dataset.index,
        event.target.value,
        document.activeElement.getAttribute("name")
      );
    }

    onCartUpdate() {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const sourceQty = html.querySelector("cart-items");
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }

    getSectionsToRender() {
      return [
        {
          id: "main-cart-items",
          section: document.getElementById("main-cart-items").dataset.id,
          selector: ".js-contents",
        },
        {
          id: "cart-icon-bubble",
          section: "cart-icon-bubble",
          selector: ".shopify-section",
        },
        {
          id: "cart-live-region-text",
          section: "cart-live-region-text",
          selector: ".shopify-section",
        },
        {
          id: "main-cart-footer",
          section: document.getElementById("main-cart-footer").dataset.id,
          selector: ".js-contents",
        },
      ];
    }

    updateQuantity(line, quantity, name) {
      if (!this.validateQuantity(line)) {
        return;
      }

      this.enableLoading(line);
      this.querySelectorAll(".quantity__button").forEach((button) =>
        button.classList.add("disabled")
      );

      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      });

      fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);
          const quantityElement =
            document.getElementById(`Quantity-${line}`) ||
            document.getElementById(`Drawer-quantity-${line}`);
          const items = document.querySelectorAll(".cart-item");
          const currentItem = items[line - 1];
          if (parsedState.errors) {
            quantityElement.value = quantityElement.getAttribute("value");
            this.updateLiveRegions(line, parsedState.errors);

            // dispatch cart:error
            document.dispatchEvent(
              new CustomEvent("cart:error", {
                detail: {
                  source: this.dataset.source,
                  productVariantId: currentItem?.dataset.variantId || line,
                  errors: parsedState.errors,
                  message: parsedState.errors,
                },
              })
            );
            // dispatch cart:error

            return;
          }

          // dispatch line-item:change for the modified element
          document.dispatchEvent(
            new CustomEvent("line-item:change", {
              detail: {
                lineItem: parsedState.items[line - 1] || null,
                cart: parsedState,
                sectionId: this.dataset.source,
              },
            })
          );
          // dispatch line-item:change for the modified element

          this.classList.toggle("is-empty", parsedState.item_count === 0);

          // dispatch cart:change for the entire basket
          document.dispatchEvent(
            new CustomEvent("cart:change", {
              detail: {
                cart: parsedState,
                sectionId: this.dataset.source,
              },
            })
          );
          // dispatch cart:change for the entire basket

          const cartDrawerWrapper = document.querySelector("cart-drawer");
          const cartFooter = document.getElementById("main-cart-footer");

          if (cartFooter)
            cartFooter.classList.toggle(
              "is-empty",
              parsedState.item_count === 0
            );
          if (cartDrawerWrapper)
            cartDrawerWrapper.classList.toggle(
              "is-empty",
              parsedState.item_count === 0
            );

          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document
                .getElementById(section.id)
                .querySelector(section.selector) ||
              document.getElementById(section.id);
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
          });
          const updatedValue = parsedState.items[line - 1]
            ? parsedState.items[line - 1].quantity
            : undefined;
          let message = "";
          if (
            items.length === parsedState.items.length &&
            updatedValue !== parseInt(quantityElement.value)
          ) {
            if (typeof updatedValue === "undefined") {
              message = window.cartStrings.error;
            } else {
              message = window.cartStrings.quantityError.replace(
                "[quantity]",
                updatedValue
              );
            }
          }
          this.updateLiveRegions(line, message);

          const lineItem =
            document.getElementById(`CartItem-${line}`) ||
            document.getElementById(`CartDrawer-Item-${line}`);
          if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
            cartDrawerWrapper
              ? trapFocus(
                  cartDrawerWrapper,
                  lineItem.querySelector(`[name="${name}"]`)
                )
              : lineItem.querySelector(`[name="${name}"]`).focus();
          } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
            trapFocus(
              cartDrawerWrapper.querySelector(".drawer__inner-empty"),
              cartDrawerWrapper.querySelector("a")
            );
          } else if (
            document.querySelector(".cart-item") &&
            cartDrawerWrapper
          ) {
            trapFocus(
              cartDrawerWrapper,
              document.querySelector(".cart-item__name")
            );
          }
          publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
        })
        .catch(() => {
          const items = document.querySelectorAll(".cart-item");
          const currentItem = items[line - 1];
          this.querySelectorAll(".loading-overlay").forEach((overlay) =>
            overlay.classList.add("hidden")
          );
          this.querySelectorAll(".quantity__button").forEach((button) =>
            button.classList.remove("disabled")
          );
          const errors =
            document.getElementById("cart-errors") ||
            document.getElementById("CartDrawer-CartErrors");
          errors.textContent = window.cartStrings.error;

          // dispatch cart:error when fetch fail
          document.dispatchEvent(
            new CustomEvent("cart:error", {
              detail: {
                source: this.dataset.source,
                productVariantId: currentItem?.dataset.variantId || line,
                errors: window.cartStrings.error,
                message: window.cartStrings.error,
              },
            })
          );
          // dispatch cart:error when fetch fail
        })
        .finally(() => {
          this.querySelectorAll(".quantity__button").forEach((button) =>
            button.classList.remove("disabled")
          );
          this.disableLoading(line);
        });
    }

    validateQuantity(line) {
      const items = this.querySelectorAll(".cart-item");
      const input = items[line - 1]?.querySelector(".quantity__input");

      if (!input) {
        return false;
      }

      return input.reportValidity();
    }

    updateLiveRegions(line, message) {
      const lineItemError =
        document.getElementById(`Line-item-error-${line}`) ||
        document.getElementById(`CartDrawer-LineItemError-${line}`);
      if (lineItemError)
        lineItemError.querySelector(".cart-item__error-text").innerHTML =
          message;

      this.lineItemStatusElement.setAttribute("aria-hidden", true);

      const cartStatus =
        document.getElementById("cart-live-region-text") ||
        document.getElementById("CartDrawer-LiveRegionText");
      cartStatus.setAttribute("aria-hidden", false);

      setTimeout(() => {
        cartStatus.setAttribute("aria-hidden", true);
      }, 1000);
    }

    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector).innerHTML;
    }

    enableLoading(line) {
      const mainCartItems =
        document.getElementById("main-cart-items") ||
        document.getElementById("CartDrawer-CartItems");
      mainCartItems.classList.add("cart__items--disabled");

      const cartItemElements = this.querySelectorAll(
        `#CartItem-${line} .loading-overlay`
      );
      const cartDrawerItemElements = this.querySelectorAll(
        `#CartDrawer-Item-${line} .loading-overlay`
      );

      [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
        overlay.classList.remove("hidden")
      );

      document.activeElement.blur();
      this.lineItemStatusElement.setAttribute("aria-hidden", false);
    }

    disableLoading(line) {
      const mainCartItems =
        document.getElementById("main-cart-items") ||
        document.getElementById("CartDrawer-CartItems");
      mainCartItems.classList.remove("cart__items--disabled");

      const cartItemElements = this.querySelectorAll(
        `#CartItem-${line} .loading-overlay`
      );
      const cartDrawerItemElements = this.querySelectorAll(
        `#CartDrawer-Item-${line} .loading-overlay`
      );

      cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
      cartDrawerItemElements.forEach((overlay) =>
        overlay.classList.add("hidden")
      );
    }
  }

  customElements.define("cart-items", CartItems);
//}

if (!customElements.get("cart-note")) {
  customElements.define(
    "cart-note",
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          "input",
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, {
              ...fetchConfig(),
              ...{ body },
            });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}

if (!customElements.get("cart-discount-code")) {
  class CartDiscountCode extends HTMLElement {
    constructor() {
      super();

      /** @type {AbortController | null} */
      this.activeFetch = null;
    }

    connectedCallback() {
      this.#initRefs();
      this.form = this.querySelector("form");
      this.input = this.querySelector('input[name="discount"]');
      this.submitBtn = this.querySelector('button[type="submit"]');

      this.form?.addEventListener("submit", this.applyDiscount);
      this.addEventListener("click", this.removeDiscount);
    }

    disconnectedCallback() {
      this.form?.removeEventListener("submit", this.applyDiscount);
      this.removeEventListener("click", this.removeDiscount);

      if (this.activeFetch) {
        this.activeFetch.abort();
        this.activeFetch = null;
      }
    }

    #initRefs() {
      this.refs = {};
      for (const el of this.querySelectorAll("[ref]")) {
        const name = el.getAttribute("ref");
        if (name && el instanceof HTMLElement) this.refs[name] = el;
      }
    }

    #createAbortController() {
      if (this.activeFetch) {
        this.activeFetch.abort();
      }

      const abortController = new AbortController();
      this.activeFetch = abortController;
      return abortController;
    }

    /**
     * Handles applying a discount to the cart.
     * @param {SubmitEvent} event - The submit event on our form.
     */
    applyDiscount = async (event) => {
      const {
        cartDiscountError,
        cartDiscountErrorDiscountCode,
        cartDiscountErrorShipping,
      } = this.refs;

      event.preventDefault();
      event.stopPropagation();

      const form = event.target;

      if (
        !(form instanceof HTMLFormElement) ||
        !(this.input instanceof HTMLInputElement) ||
        typeof this.dataset.sectionId !== "string"
      ) {
        return;
      }

      const discountCodeValue = this.input.value.trim();
      if (!discountCodeValue) return;

      const abortController = this.#createAbortController();

      if (this.submitBtn) this.submitBtn.classList.add("loading");
      const btnLoader = this.submitBtn.querySelector(".button-loader");
      if (btnLoader) btnLoader.classList.remove("hidden");

      try {
        const existingDiscounts = this.#existingDiscounts();
        if (
          existingDiscounts.some(
            (code) => code.toUpperCase() === discountCodeValue.toUpperCase()
          )
        ) {
          return;
        }

        cartDiscountError.classList.add("hidden");
        cartDiscountErrorDiscountCode.classList.add("hidden");
        cartDiscountErrorShipping.classList.add("hidden");

        const body = JSON.stringify({
          discount: [...existingDiscounts, discountCodeValue].join(","),
          sections: this.#getSectionsToRequest(),
        });

        const response = await fetch(routes.cart_update_url, {
          ...fetchConfig(),
          ...{ body },
          signal: abortController.signal,
        });

        const data = await response.json();

        // If the discount code is not applicable, an error is displayed and the function stops
        if (!this.#checkApplicableCode(data.discount_codes, discountCodeValue)) {
          return;
        }

        const sourceSection = this.#getNewSectionHtml(data.sections);

        if (sourceSection) {
          // If the discount code applies to shipping, an error is displayed and the function stops
          if (
            !this.#checkShippingDiscountCode(
              data.discount_codes,
              discountCodeValue,
              sourceSection
            )
          ) {
            return;
          }

          this.#updateSectionHtml(sourceSection, data.sections);
        }
      } catch (error) {
        console.error("Failed to apply discount:", error);
      } finally {
        this.activeFetch = null;
        if (this.submitBtn) this.submitBtn.classList.remove("loading");
        if (btnLoader) btnLoader.classList.add("hidden");
      }
    };

    /**
     * Handles removing a discount from the cart.
     * @param {MouseEvent | KeyboardEvent} event - The mouse or keyboard event in our pill.
     */
    removeDiscount = async (event) => {
      if (
        !(event.target instanceof Element) ||
        typeof this.dataset.sectionId !== "string"
      ) {
        return;
      }

      const pill = event.target.closest(".cart-discount-code__pill");
      if (!(pill instanceof HTMLLIElement)) return;

      event.preventDefault();
      event.stopPropagation();

      const discountCode = pill.dataset.discountCode;
      if (!discountCode) return;

      const existingDiscounts = this.#existingDiscounts();
      const index = existingDiscounts.indexOf(discountCode);
      if (index === -1) return;

      existingDiscounts.splice(index, 1);

      const abortController = this.#createAbortController();

      if (this.submitBtn) this.submitBtn.classList.add("loading");
      const btnLoader = this.submitBtn.querySelector(".button-loader");
      if (btnLoader) btnLoader.classList.remove("hidden");

      try {
        const body = JSON.stringify({
          discount: existingDiscounts.join(","),
          sections: this.#getSectionsToRequest(),
        });

        const response = await fetch(routes.cart_update_url, {
          ...fetchConfig(),
          ...{ body },
          signal: abortController.signal,
        });

        const data = await response.json();

        const sourceSection = this.#getNewSectionHtml(data.sections);
        this.#updateSectionHtml(sourceSection, data.sections);
      } catch (error) {
        console.error("Failed to remove discount:", error);
      } finally {
        this.activeFetch = null;
        if (this.submitBtn) this.submitBtn.classList.remove("loading");
        if (btnLoader) btnLoader.classList.add("hidden");
      }
    };

    /**
     * Handles the discount error.
     * @param {'discount_code' | 'shipping'} type - The type of discount error.
     */
    #handleDiscountError(type) {
      const {
        cartDiscountError,
        cartDiscountErrorDiscountCode,
        cartDiscountErrorShipping,
      } = this.refs;

      const target =
        type === "discount_code"
          ? cartDiscountErrorDiscountCode
          : cartDiscountErrorShipping;
      cartDiscountError.classList.remove("hidden");
      target.classList.remove("hidden");
    }

    /**
     * Returns an array of existing discount codes.
     * @returns {string[]}
     */
    #existingDiscounts() {
      const discountCodes = [];
      const discountPills = this.querySelectorAll(".cart-discount-code__pill");
      for (const pill of discountPills) {
        if (
          pill instanceof HTMLLIElement &&
          typeof pill.dataset.discountCode === "string"
        ) {
          discountCodes.push(pill.dataset.discountCode);
        }
      }

      return discountCodes;
    }

    /**
     * Checks if a discount code is applicable.
     * @param {Array} cartDiscountCodes - The array of discount codes in the cart.
     * @param {string} discountCodeValue - The discount code to check.
     * Returns boolean indicating if the discount code is applicable.
     * @returns {boolean}
     */
    #checkApplicableCode(cartDiscountCodes, discountCodeValue) {
      if (
        cartDiscountCodes.find((discount) => {
          return (
            discount.code === discountCodeValue && discount.applicable === false
          );
        })
      ) {
        this.input.value = "";
        this.#handleDiscountError("discount_code");
        return false;
      }
      return true;
    }

    /**
     * Checks if a discount code is applicable.
     * @param {Array} cartDiscountCodes - The array of discount codes in the cart.
     * @param {string} discountCodeValue - The discount code to check.
     * @param {HTMLElement} sourceSection - The section element containing discount codes.
     * Returns boolean indicating if the discount code is applicable.
     * @returns {boolean}
     */
    #checkShippingDiscountCode(
      cartDiscountCodes,
      discountCodeValue,
      sourceSection
    ) {
      const discountCodes =
        sourceSection?.querySelectorAll(".cart-discount-code__pill") || [];
      const existingDiscounts = this.#existingDiscounts();

      const codes = Array.from(discountCodes)
        .map((element) =>
          element instanceof HTMLLIElement ? element.dataset.discountCode : null
        )
        .filter(Boolean);
      if (
        codes.length === existingDiscounts.length &&
        codes.every((code) => existingDiscounts.includes(code)) &&
        cartDiscountCodes.find((discount) => {
          return (
            discount.code === discountCodeValue && discount.applicable === true
          );
        })
      ) {
        this.#handleDiscountError("shipping");
        this.input.value = "";
        return false;
      }
      return true;
    }

    #getNewSectionHtml(cartSections) {
      const newHtml = cartSections[this.dataset.sectionId];
      const parsedHtml = new DOMParser().parseFromString(newHtml, "text/html");

      const sectionId =
        this.dataset.sectionId === "cart-drawer"
          ? "CartDrawer"
          : `shopify-section-${this.dataset.sectionId}`;
      const sourceSection = parsedHtml.getElementById(sectionId);

      return sourceSection;
    }

    #getSectionsToRequest() {
      const sections = [this.dataset.sectionId];
      if (this.dataset.sectionId !== "cart-drawer") {
        const cartItemsEl = document.getElementById("main-cart-items");
        if (cartItemsEl && cartItemsEl.dataset.id) {
          sections.push(cartItemsEl.dataset.id);
        }
      }
      return sections;
    }

    #updateSectionHtml(sourceSection, cartSections) {
      const sectionId = `shopify-section-${this.dataset.sectionId}`;
      const targetSection =
        this.dataset.sectionId === "cart-drawer"
          ? document.getElementById("CartDrawer")
          : document.getElementById(sectionId);
      if (sourceSection && targetSection) {
        targetSection.innerHTML = sourceSection.innerHTML;
      }

      if (this.dataset.sectionId !== "cart-drawer" && cartSections) {
        const cartItemsEl = document.getElementById("main-cart-items");
        const cartItemsSectionId = cartItemsEl && cartItemsEl.dataset.id;
        if (cartItemsSectionId && cartSections[cartItemsSectionId]) {
          const parsedHtml = new DOMParser().parseFromString(
            cartSections[cartItemsSectionId],
            "text/html"
          );
          const sourceItems = parsedHtml.querySelector(".js-contents");
          const targetItems = cartItemsEl && cartItemsEl.querySelector(".js-contents");
          if (sourceItems && targetItems) {
            targetItems.innerHTML = sourceItems.innerHTML;
          }
        }
      }
    }
  }

  customElements.define("cart-discount-code", CartDiscountCode);
}


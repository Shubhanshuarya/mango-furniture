(function () {
  const textAnimation = () => {
    const dir = document.querySelector("html").getAttribute("dir");
    const richTextSections = document.querySelectorAll(".rich-text-section");
    richTextSections.forEach((richTextSection) => {
      if (richTextSection.classList.contains("js-init")) {
        return "";
      }
      richTextSection.classList.add("js-init");
      const elem = richTextSection.querySelector(
        ".rich-text__subheading-animation"
      );
      let text = elem.dataset.text;
      if (dir === "rtl") {
        text = text.split("").reverse().join("");
      }
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
    textAnimation();
    document.addEventListener("shopify:section:load", function () {
      textAnimation();
    });
  });
})();

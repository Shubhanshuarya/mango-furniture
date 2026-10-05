(function () {
  const collectionTabs = () => {
    const tabsSections = document.querySelectorAll(".collection-tabs");
    tabsSections.forEach((tabSection) => {
      const tabs = tabSection.querySelectorAll("[data-tab-target]");
      const tabContents = tabSection.querySelectorAll("[data-tab-content]");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const target = tabSection.querySelector(tab.dataset.tabTarget);
          tabContents.forEach((tabContent) => {
            tabContent.classList.remove("active");
          });
          tabs.forEach((tab) => {
            tab.classList.remove("active");
          });
          tab.classList.add("active");
          target.classList.add("active");
        });
      });
    });
  };
  document.addEventListener("DOMContentLoaded", function () {
    collectionTabs();
    document.addEventListener("shopify:section:load", function () {
      collectionTabs();
    });
  });
})();

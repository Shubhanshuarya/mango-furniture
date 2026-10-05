if (!customElements.get("countdown-timer")) {
  class Countdown extends HTMLElement {
    constructor() {
      super();

      this.enableMockTimer =
        this.getAttribute("data-enable-mock-timer") === "true";

      if (!this.enableMockTimer) {
        this.userDate = this.getAttribute("data-date");
        this.userTime = this.getAttribute("data-time");
      } else {
        // get data for infinite mock timer
        const INFINITE_DAYS = this.getAttribute("data-enable-mock-picker-day")
          ? Number(this.getAttribute("data-enable-mock-picker-day"))
          : 2;
        const DIFF_HOURS = this.getAttribute("data-enable-mock-picker-hours")
          ? Number(this.getAttribute("data-enable-mock-picker-hours"))
          : 3;
        const now = new Date();
        const futureDate = new Date(
          now.getTime() + (INFINITE_DAYS * 24 + DIFF_HOURS) * 60 * 60 * 1000
        );
        const year = futureDate.getFullYear();
        const month = String(futureDate.getMonth() + 1).padStart(2, "0");
        const day = String(futureDate.getDate()).padStart(2, "0");
        const hours = String(futureDate.getHours()).padStart(2, "0");
        const minutes = String(futureDate.getMinutes()).padStart(2, "0");
        this.userDate = `${year}-${month}-${day}`;
        this.userTime = `${hours}:${minutes}`;
      }

      this.interval;
      this.setInterval(this.userDate, this.userTime);
    }

    onInit(userDate, userTime) {
      this.userTimeZone = this.getAttribute("data-timezone");
      this.completedCountdown = this.getAttribute("data-completed");
      this.countdown = this.querySelector(".countdown__body");
      this.wrapper = this.querySelector(".countdown__wrapper");
      this.countdownHeading = this.querySelector(".countdown__heading");
      this.daysEl = this.querySelector(".countdown__block__days");
      this.hoursEl = this.querySelector(".countdown__block__hours");
      this.minutesEl = this.querySelector(".countdown__block__minutes");
      this.secondsEl = this.querySelector(".countdown__block__seconds");
      this.section = this.closest(".shopify-section");
      // ----------------------------------------------------------------

      let date = new Date();
      let utcTime = date.getTime();
      let timezoneOffset = date.getTimezoneOffset();
      let offsetInMilliseconds = timezoneOffset * 60 * 1000;
      let targetTimezoneOffset = this.userTimeZone * 60;
      let targetOffsetInMilliseconds = targetTimezoneOffset * 60 * 1000;
      let targetTime =
        utcTime + offsetInMilliseconds + targetOffsetInMilliseconds;

      let targetDate = new Date(targetTime);

      // ----------------------------------------------------------------
      const countdownDate = new Date(`${userDate}T${userTime}`);
      const now = targetDate;
      const distance = countdownDate.getTime() - now.getTime();
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      // ----------------------------------------------------------------
      if (distance < 0 && this.completedCountdown === "hide_section") {
        clearInterval(this.interval);
        this.section.style.display = "none";
      } else if (distance < 0 && this.completedCountdown === "show_text") {
        clearInterval(this.interval);
        this.countdown.style.display = "none";
        this.countdownHeading.style.display = "flex";
        this.wrapper.classList.add("show_text");
      } else {
        if (String(days).length === 1) this.daysEl.textContent = "0" + days;
        else this.daysEl.textContent = days;

        if (String(hours).length === 1) this.hoursEl.textContent = "0" + hours;
        else this.hoursEl.textContent = hours;

        if (String(minutes).length === 1)
          this.minutesEl.textContent = "0" + minutes;
        else this.minutesEl.textContent = minutes;

        if (String(seconds).length === 1)
          this.secondsEl.textContent = "0" + seconds;
        else this.secondsEl.textContent = seconds;
      }
    }

    setInterval(userDate, userTime) {
      clearInterval(this.interval);
      this.interval = setInterval(
        this.onInit.bind(this, userDate, userTime),
        1000
      );
    }
  }
  customElements.define("countdown-timer", Countdown);
}

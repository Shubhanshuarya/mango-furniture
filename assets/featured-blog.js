(function () {
	const slideshow = () => {
		$(".section-featured-blog").each(function () {
			if ($(this).hasClass('slider_started')){
				return ''
			}
			$(this).addClass('slider_started');
			const id = $(this).attr("id");
			const box = $(this).find(".featured");
			const autoplay = box.data("autoplay");
			const stopAutoplay = box.data("stop-autoplay");
			const delay = box.data("delay") * 1000;
			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: delay,
						pauseOnMouseEnter: stopAutoplay,
						disableOnInteraction: false,
					},
				};
			} else {
				autoplayParm = {};
			}
			let swiperParms = {
				parallax: box.data("parallax"),
				effect: box.data("effect"),
				speed: box.data("speed") * 1000,
				slidesPerView:1,
				spaceBetween: 20,
				breakpoints: {
					// when window width is >= 990px
					576: {
						slidesPerView: 2
						
					},
					990: {
					
						spaceBetween: 25,
						slidesPerView: 3,
					}
					
				},
				creativeEffect: {
					prev: {
						shadow: true,
						translate: [0, 0, -400],
					},
					next: {
						translate: ["100%", 0, 0],
					},
				},
				coverflowEffect: {
					rotate: 50,
					stretch: 0,
					depth: 100,
					modifier: 1,
					slideShadows: true,
				},
				autoHeight: false,
				calculateHeight: false,
				keyboard: true,
				navigation: {
					nextEl: `#${id} .swiper-button-next`,
					prevEl: `#${id} .swiper-button-prev`,
				},
				pagination: {
					el: `#${id} .swiper-pagination`,
					clickable: true,
				},
				...autoplayParm,
			};
			const swiper = new Swiper(`#${id} .swiper`,swiperParms);
		});
	};

	document.addEventListener("DOMContentLoaded", function () {
		slideshow();
		document.addEventListener("shopify:section:load", function () {
			slideshow();
		});
	});
})();
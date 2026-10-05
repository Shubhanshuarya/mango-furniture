(function () {
	const brands = () => {
		$("[data-hover-opacity]").hover(
			function () {
				$(`[data-hover-opacity=${id}]`).addClass("opacity");
				$(this).removeClass("opacity");
			},
			function () {
				$(`[data-hover-opacity=${id}]`).removeClass("opacity");
			}
		);
	};
	document.addEventListener("shopify:section:load", function () {
		brands();
	});
	brands();
});

(function () {
	const facetsMenu = () => {
		$('html.js .no_submit').click(function(e){
			e.preventDefault();
		})
		$('.open_filters,.facets-menu__close,.facets__submit,.facets__reset,.form-menu__mask').click(function(){
			$('#open_filters_menu').toggleClass('show_menu');
			$('body').toggleClass('overflow-hidden');
		})
	};

	document.addEventListener("DOMContentLoaded", function () {
		facetsMenu();
	});
	document.addEventListener("shopify:section:load", function () {
		facetsMenu();
	});
})();
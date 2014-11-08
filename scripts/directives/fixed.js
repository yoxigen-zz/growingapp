app.directive("fixed", [function(){
	return {
		restrict: 'A',
		link: function postLink(scope, element, attrs) {
			var el = element[0];

			setTimeout(fixElement, 1000);

			window.addEventListener("resize", onResize);

			/**
			 * Get the current coordinates of the element on the screen and set its position as fixed to those coordinates
			 */
			function fixElement(){
				var elBox = el.getBoundingClientRect();

				el.style.position = "fixed";
				el.style.top = elBox.top + "px";
				el.style.left = elBox.left + "px";
			}

			function onResize(){
				el.removeAttribute("style");
				fixElement();
			}
		}
	}
}]);
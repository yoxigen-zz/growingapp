(function(){
	angular.module("Dialogs").factory("DialogDirective", ["$timeout", function($timeout){
		var TOGGLE_TIMEOUT = 300,
			TOGGLE_CLASS = "visible",
			TOGGLE_ACTIVE_CLASS = "active";

        /**
         * Constructor for different kinds of dialog directives. Supplies functionality that should be available to all dialogs.
         * @param templateUrl
         * @constructor
         */
		function DialogDirective(templateUrl){
			this.restrict = 'E';
			this.transclude = true;
			this.replace = true;
			this.scope = {
				title: "@",
				background: "@",
				icon: "@",
				show: "=",
				actions: "=",
                submitAction: "=",
				onShow: "&",
				onHide: "&",
				"class": "@"
			};
			this.templateUrl = templateUrl;
		}

        DialogDirective.prototype = {
			link: function postLink(scope, element, attrs) {
				var toggleTimeout,
					toggleElement = element[0],
					dialogIsOpen = false;

				scope.$watch("$destroy", function(){
					window.removeEventListener("keydown", onKeyDown);
				});

				scope.$watch("show", function(isVisible){
					if (!!isVisible == dialogIsOpen)
						return;

					$timeout.cancel(toggleTimeout);

					if (isVisible){
						element.addClass(TOGGLE_CLASS);

						toggleTimeout = $timeout(function(){
							toggleElement && toggleElement.classList.add(TOGGLE_ACTIVE_CLASS);
						}, 1);

						$timeout(function(){
							var autoFocusElement = toggleElement.querySelector("[data-auto-focus]");
							if (autoFocusElement) {
								autoFocusElement.focus();
								autoFocusElement.select && autoFocusElement.select();
							}
						}, 40);

						window.addEventListener("keydown", onKeyDown);
						scope.onShow && scope.onShow({ $event: { closeDialog: scope.closeDialog.bind(this, null), toggleId: attrs.show }});
						dialogIsOpen = true;
					}
					else{
						toggleElement && toggleElement.classList.remove(TOGGLE_ACTIVE_CLASS);

						toggleTimeout = $timeout(function(){
							element.removeClass(TOGGLE_CLASS);
						}, TOGGLE_TIMEOUT);

						window.removeEventListener("keydown", onKeyDown);
						scope.onHide && scope.onHide({ toggleId: attrs.show });
						dialogIsOpen = false;
					}
				});

				scope.closeDialog = function(e){
					if (!e || e.target === toggleElement || e.target.dataset.closesDialog)
						scope.show = false;
				};

				function onKeyDown(e){
					if (e.keyCode === 27) {
						scope.$apply(function(){
							scope.show = false;
						});
					}
				}
			}
		};

		return DialogDirective;
	}]);
})();
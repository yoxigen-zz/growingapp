define(["angular", "classes/data_object"], function(angular){
    "use strict";

    angular.module("DataObject").directive("dataobjectImage", function(){
        return {
            restrict: "A",
            scope: {
                dataobject: "="
            },
            link: function(scope, element, attrs){
                scope.$watch("dataobject", function(dataObject){
                    var thumbnailUrl = dataObject && dataObject.image && dataObject.image.url || "images/icons/add_photo.svg";
                    element[0].setAttribute("src", thumbnailUrl);
                });

                element.bind("click", function(){
                    scope.$apply(function(){
                        scope.dataobject.addPhoto().then(setImageToElement, function(error){
                            alert("Error adding photo: " + error);
                        });
                    });
                });

                function setImageToElement(image){
                    if (element[0].nodeName === "IMG")
                        element[0].src = image.url;
                    else
                        element[0].style.backgroundImage = "url(" + image.url + ")";
                }
            }
        }
    });
});
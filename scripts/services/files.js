angular.module("Files", ["Phonegap"]).factory("files", ["$q", "phonegap", function($q, phonegap){
    var methods = {
        download: phonegap.files.download
    };

    return methods;
}]);
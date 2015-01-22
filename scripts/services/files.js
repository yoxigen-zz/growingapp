angular.module("Files", ["Phonegap"]).factory("files", ["$q", "phonegap", function($q, phonegap){
    var methods = {
        download: phonegap.files.download,
        saveBase64ToFile: phonegap.files.saveBase64ToFile
    };

    return methods;
}]);
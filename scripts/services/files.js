define(["angular", "services/phonegap"], function(angular){
    angular.module("Files", ["Phonegap"]).factory("files", files);

    files.$inject = ["phonegap"];

    function files(phonegap){
        var methods = {
            download: phonegap.files.download,
            saveBase64ToFile: phonegap.files.saveBase64ToFile
        };

        return methods;
    }
});
define([
    "angular",
    "services/players",
    "classes/file_data",
    "services/dbconfig",
    "services/config",
    "services/images",
    "services/utils",
    "services/localization",
    "classes/entry_type",
    "services/messages",
    "classes/data_object_collection",
    "classes/eventbus_class",
    "modules/dialogs/dialogs"], function(angular){
    return angular.module("Entries", ["Players", "FileData", "DataObject", "DataObjectCollection", "DBConfig", "Config", "Images", "Utils", "xc.indexedDB", "Localization", "EntryType", "Messages", "Dialogs"]);
});

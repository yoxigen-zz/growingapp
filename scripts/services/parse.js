angular.module("Parse", ["Phonegap"]).factory("parse", ["$q", "$rootScope", "$http", "phonegap", function($q, $rootScope, $http, phonegap){
    var parseConfig = {
        appId: "5WepL2v5DjXU0RgKukUSlW3BeAuEOGqDOSgJtKeE",
        javascriptKey:"Pk4mymaX6wXccyywaQeMeuvvJLWeyqRpYLpzWdoX"
    };

    Parse.Object.prototype.getData = function(){
        var data = angular.copy(this.attributes);
        delete data.user;
        delete data.ACL;

        return data;
    };

    Parse.Object.prototype.update = function(){
        var data = angular.copy(this.getData());
        for(var property in data){
            this.set(property, data[property]);
        }

        this.save();
    };

    var defaultGetOptions = {
        forCurrentUser: true
    };

    var defaultSaveOptions = {
        setUser: true,
        isPrivate: true
    };

    function toParseObjects(className, data, options){
        options = angular.extend({}, defaultSaveOptions, options);

        var ObjType = Parse.Object.extend(className),
            objs = [],
            currentUser = options.setUser && Parse.User.current(),
            acl = options.isPrivate && new Parse.ACL(currentUser);

        data.forEach(function(item){
            var obj = new ObjType();
            if (currentUser)
                obj.set("user", currentUser);

            if (acl)
                obj.setACL(acl);

            for(var p in item){
                if (item.hasOwnProperty(p))
                    obj.set(p, item[p]);
            }

            objs.push(obj);
        });

        return objs;
    }

    function getHttpParams(){
        return {
            _ApplicationId: parseConfig.appId,
            _ClientVersion: Parse.VERSION,
            _InstallationId: Parse._installationId,
            _JavaScriptKey: parseConfig.javascriptKey,
            _SessionToken: Parse.User.current()._sessionToken
        }
    }

    var methods = {
        facebookLogin: function(){
            var deferred = $q.defer();
            if (!facebookUtilsInit){
                Parse.FacebookUtils.init();
                facebookUtilsInit = true;
            }

            Parse.FacebookUtils.logIn("", {
                success: function(user) {
                    // If it's a new user, let's fetch their name from FB
                    if (!user.existed()) {
                        // We make a graph request
                        FB.api('/me', function(response) {
                            if (!response.error) {
                                // We save the data on the Parse user
                                user.set("displayName", response.name);
                                user.save(null, {
                                    success: function(user) {
                                        $rootScope.$apply(function(){
                                            deferred.resolve(user);
                                        });
                                    },
                                    error: function(user, error) {
                                        $rootScope.$apply(function(){
                                            deferred.reject(error);
                                        });
                                    }
                                });
                            } else {
                                console.log("Oops something went wrong with facebook.");
                            }
                        });
                        // If it's an existing user that was logged in, we save the score
                    } else {
                        $rootScope.$apply(function(){
                            deferred.resolve(user);
                        });
                    }
                },
                error: function(user, error) {
                    $rootScope.$apply(function(){
                        deferred.reject(error);
                    });
                }
            });

            return deferred.promise;
        },
        get: function(className, options){
            var deferred = $q.defer();
            var ObjType = Parse.Object.extend(className),
                query = new Parse.Query(ObjType);

            options = angular.extend({}, defaultGetOptions, options);

            var onData = {
                success: function(results){
                    $rootScope.$apply(function(){
                        deferred.resolve(results)
                    });
                },
                error: function(error){
                    $rootScope.$apply(function(){
                        deferred.reject(error);
                    });
                }
            };

            if (options.forCurrentUser){
                query.equalTo("user", Parse.User.current());
            }

            query.find(onData);

            return deferred.promise;
        },
        getCurrentUser: function(){
            var parseUser = Parse.User.current();
            if (parseUser && parseUser.attributes.authData && parseUser.attributes.authData.facebook)
                parseUser.attributes.image = "http://graph.facebook.com/" + parseUser.attributes.authData.facebook.id + "/picture";

            return parseUser;
        },
        init: function(){
            Parse.initialize(parseConfig.appId, parseConfig.javascriptKey);
        },
        login: function(username, password){
            var deferred = $q.defer();

            return $q.when(Parse.User.logIn(username, password));
        },
        logout: function(){
            Parse.User.logOut();
        },
        query: function(className, constrains, options){
            options = options || {};
            var deferred = $q.defer();
            var ObjType = Parse.Object.extend(className),
                query = new Parse.Query(ObjType);

            if (options.forCurrentUser !== false){
                query.equalTo("user", Parse.User.current());
            }

            if (constrains) {
                if (angular.isArray(constrains)) {
                    angular.forEach(constrains, function (constrain) {
                        for (var method in constrain) {
                            query[method] && query[method].apply(query, angular.isArray(constrain[method]) ? constrain[method] : [constrain[method]]);
                        }
                    });
                }
                else {
                    for (var method in constrains) {
                        query[method] && query[method].apply(query, angular.isArray(constrains[method]) ? constrains[method] : [constrains[method]]);
                    }
                }
            }

            var onResults = {
                success: function(results){
                    $rootScope.$apply(function(){
                        deferred.resolve(results);
                    });
                },
                error: function(error){
                    $rootScope.$apply(function(){
                        deferred.reject(error);
                    });
                }
            };

            if (options.single)
                query.first(onResults);
            else
                query.find(onResults);

            return deferred.promise;
        },
        remove: function(className, data){
            if (angular.isArray(data))
                return this.removeAll(className, data, options);

            var obj = toParseObjects(className, [data], options)[0];
            return $q.when(obj.destroy());
        },
        removeAll: function(className, data){
            if (!angular.isArray(data)){
                data = [data];
            }

            var objs = toParseObjects(className, data, options);
            return $q.when(Parse.Object.destroyAll(objs));
        },
        runFunction: function(functionName, params){
            var deferred = $q.defer();

            Parse.Cloud.run(functionName, params || {}, {
                success: function(result) {
                    $rootScope.safeApply(function(){
                        deferred.resolve(result);
                    });
                },
                error: function(error) {
                    $rootScope.safeApply(function(){
                        deferred.reject(error);
                    });
                }
            });

            return deferred.promise;
        },
        /**
         * Saves a single object to Parse cloud
         * @param className Name of the class to save
         * @param data Object to save. Can also be an array of objects, in which case all are saved
         * @param options Object with options: 'setUser' - add a 'user' property with the currently signed in user to the saved object, 'isPrivate' - if true, adds ACL with permission for the current user only to the saved object.
         * @returns {Promise}
         */
        save: function(className, data, options){
            if (angular.isArray(data))
                return this.saveAll(className, data, options);

            var obj = toParseObjects(className, [data], options)[0];
            return $q.when(obj.save());
        },
        /**
         * Saves an array of objects to Parse cloud
         * @param className Name of the class to save
         * @param Array of objects to save. If a single object is specified, it's put inside an array
         * @param options Object with options: 'setUser' - add a 'user' property with the currently signed in user to the saved object, 'isPrivate' - if true, adds ACL with permission for the current user only to the saved object.
         * @returns {Promise}
         */
        saveAll: function(className, data, options){
            if (!angular.isArray(data)){
                data = [data];
            }

            var objs = toParseObjects(className, data, options);
            return $q.when(Parse.Object.saveAll(objs));
        },
        signUp: function(userDetails){
            var user = new Parse.User(userDetails),
                deferred = $q.defer();

            user.signUp(null, {
                success: function(user) {
                    $rootScope.$apply(function(){
                        deferred.resolve(user);
                    });
                },
                error: function(user, error) {
                    $rootScope.$apply(function(){
                        deferred.reject(error);
                    });
                }
            });

            return deferred.promise;
        },
        uploadBase64ToFile: function(dataUrl, filename, type){
            var file = new Parse.File(filename, { base64: dataUrl }, type);
            return $q.when(file.save());
        },
        uploadFile: function(fileUrl, filename, type){
            return phonegap.files.getFileByUrl(fileUrl).then(function(_file){
                var file = new Parse.File(filename, _file, type);

                return $q.when(file.save());
            });
        }
    };

    return methods;
}]);
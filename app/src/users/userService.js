(function() {
    'use strict';

    angular
        .module('openeApp')
        .factory('userService', userService);

    userService.$inject = ['$http', '$resource'];

    function userService($http, $resource) {
        var service = {
            getPerson: getPerson,
            getPeople: getPeople,
            getHome: getHome,
            getAuthorities: getAuthorities,
            getPreferences: getPreferences,
            setPreferences: setPreferences,
            createUser: createUser,
            updateUser: updateUser,
            changePassword: changePassword
        };
        return service;

        function getPerson(username) {
            return $http.get('/alfresco/service/api/people/' + username).then(function(response) {
                return response.data;
            });
        }

        function getHome() {
            return $http.get('/alfresco/service/api/nodelocator/userhome').then(function(response) {
                return response.data.data;
            });
        }

        function getAuthorities() {
            return $http.get('/alfresco/service/api/forms/picker/authority/children').then(function(response) {
                var items = response.data.data.items;
                return Object.keys(items).map(function(key) {
                    return items[key];
                });
            });
        }

        function getPreferences(username, params) {
            return $http.get('/alfresco/s/api/people/' + username + '/preferences', {
                params: params
            }).then(function(response) {
                return response.data;
            });
        }

        function setPreferences(username, preferences) {
            return $http.post('/alfresco/s/api/people/' + username + '/preferences', preferences).then(function(response) {
                return response.data;
            });
        }

        function createUser(userObj) {
            return $http.post('/alfresco/s/api/people',
               userObj
            ).then(function(response) {
                console.log("Return success");
                return response.data;
            });
        }

        function updateUser(userObj) {
            return $http.put('/alfresco/s/api/people/'+encodeURIComponent(userObj.userName),
               userObj
            ).then(function(response) {
                console.log("Return success");
                return response.data;
            });
        }

        function changePassword(user) {
            return $http.put("/api/person/changepassword/" + encodeURIComponent(user.userName),
               user
            ).then(function(response) {
                console.log("Changing Password");
                return response.data;
            });
        }

        function getPeople(filter) {
            return $http.get('/alfresco/s/api/people?filter='+filter).then(function(response) {
                return response.data;
            });
        }

        function getasdf(username) {
            return $http.get('/alfresco/s/api/people/' + username + '/preferences', {
                params: {pf : 'org.alfresco.share.documents.favourites'}
            }).then(function(response) {
                return response.data;
            });
        }
    }
})();


    angular
        .module('openeApp.users')
        .controller('UsersController', UsersController);

    /**
     * Main Controller for the system users module
     * @param $scope
     * @constructor
     */
    function UsersController($scope, $mdDialog, $mdToast, userService, $translate) {
        var vm = this;

        vm.createUser = createUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.showCSVUploadDialog = showCSVUploadDialog;
        vm.userExists = false;

        //For the search control filter
        vm.userSearchFilters = [
            {optionLabel:"First name", optionValue:"firstName"},
            {optionLabel:"Last name", optionValue:"lastName"},
            {optionLabel:"User name", optionValue:"userName"}
        ];
        vm.optionLabel = "optionLabel";
        vm.optionValue = "optionValue";
        vm.selectOptions = vm.userSearchFilters;

        vm.filterCallback = function (query) {
            console.log(query);
            getAllSystemUsers(query);
        };
    
        populateUsersList();
        function populateUsersList() {
            getAllSystemUsers();
        }

        function createUser(ev) {
            console.log('Creating a new user');
            return showUserDialog(ev, null);
        }

        function editUser(ev, user) {
            console.log('Editing user');
            return showUserDialog(ev, user);
        }

        function deleteUser(ev, user) {
            console.log('Deleting user');

            var confirm = $mdDialog.confirm()
                .title($translate.instant('COMMON.CONFIRM'))
                .content($translate.instant('USER.ARE_YOU_SURE_YOU_WANT_TO_DELETE_USER', {user: user.firstName +" "+user.lastName+" ("+user.userName+")"}))
                .ariaLabel('')
                .targetEvent(null)
                .ok($translate.instant('COMMON.YES'))
                .cancel($translate.instant('COMMON.CANCEL'));

            $mdDialog.show(confirm).then(function() {
                userService.deleteUser(user.userName).then(function(response){
                    var responseMessage = (Object.keys(response).length == 0) ? $translate.instant('USER.DELETE_USER_SUCCESS') : $translate.instant('USER.DELETE_USER_FAILURE');
                        getAllSystemUsers();
                        $mdToast.show(
                            $mdToast.simple()
                                .content(responseMessage)
                                .position('top right')
                                .hideDelay(3000)
                        );
                })
            });

        }   

        function showUserDialog(ev, user) {
            $mdDialog.show({
                controller: 'UserDialogController',
                controllerAs: 'ucd',
                locals : {
                    user : user
                },
                templateUrl: 'app/src/users/view/userCrudDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            }).then(function onUpdateOrCreate(user, isExistingUser) {
                console.log("Then callback, user updated or edited");
                if(isExistingUser) {
                    vm.allSystemUsers = [];
                    getAllSystemUsers();
                } else {
                    vm.allSystemUsers.push(user);
                }
            }, function onCancel() {
                // Do nothing
            });
        }

        function showCSVUploadDialog(){

            return $mdDialog.show({
                controller: userUploadCSVDialogController,
                templateUrl: 'app/src/users/view/usersUploadDialog.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                focusOnOpen: false
            }).then(function(){
                getAllSystemUsers();
            });
        }

        function getAllSystemUsers(query) {
            var filter = query ? query : "*";
            return userService.getPeople(filter).then(function (response) {
                vm.allSystemUsers = response.people;
                return response;
            });
        }

        function userUploadCSVDialogController($scope, $translate, $mdDialog, alfrescoUploadService) {

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.upload = function(){
                $mdDialog.hide();
                alfrescoUploadService.uploadUsersCSVFile($scope.fileToUpload).then(function(response){
                    console.log("THe csv user returns: \n"+response);
                    var returnedUsers = response.users;
                    var failedUsers, msg, dlgTitle;
                    var numOfFailedUsers = response.totalUsers - response.addedUsers;
                    if (numOfFailedUsers > 0){
                        dlgTitle = $translate.instant('COMMON.ERROR');
                        //accumulate the failed users into a separate array
                        failedUsers = returnedUsers.map(function(user){
                           var buffer = [];
                            if(user.uploadStatus.indexOf("@") == -1)
                                buffer.push(user);
                            return buffer;
                        });
                         msg = $translate.instant('USER.FAILED_TO_UPLOAD_MSG',{failedNumberOfUsers: numOfFailedUsers}) + '\n';
                        failedUsers.forEach(function(fUser){
                            msg+= fUser.username + ": "+fUser.uploadStatus+"\n";
                        });

                    }
                    else{
                        dlgTitle = $translate.instant('COMMON.SUCCESS');

                    }
                    $mdDialog.show(
                        $mdDialog.alert().clickOutsideToClose(true)
                            .title(dlgTitle)
                            .content(msg)
                            .ariaLabel('User upload csv response.')
                            .ok("OK")
                            .targetEvent()
                    );
                });
            };
        }

    }
(function () {
    'use strict';

    angular
        .module('openeApp.groups')
        .controller('GroupController', GroupController);

    GroupController.$inject = ['$scope', '$mdDialog', 'groupService', '$stateParams'];

    /**
     * Main Controller for the Groups module
     * @param $scope
     * @constructor
     */
    function GroupController($scope, $mdDialog, groupService, $stateParams) {
        var vm = this;
        vm.group = {};
        vm.groups = [];
        vm.createGroup = createGroup;
        vm.deleteGroup = deleteGroup;
        vm.addMembersToGroup = addMembersToGroup;

        if ($stateParams && $stateParams.shortName && $stateParams.shortName != 'ALL') {
            showGroup($stateParams.shortName);
            listMembers($stateParams.shortName);
            console.log("re-listing groups");
        } else {
            initList();
        }

        function initList() {
            //vm.groups.length = [];
            groupService.listAllSystemGroups().then(function (response) {
                vm.groups = response.data;
            }, function (error) {
                console.log(error);
            });
        }

        // Return an array of group objects
        function listGroups() {
            groupService.listAllSystemGroups().then(function (response) {
                vm.groups = response;
            }, function (error) {
                console.log(error);
            });
        }

        // !! Probably something that must be done with routes. !!
        // Display the group view and load it with one group object
        function showGroup(group_shortName) {
            groupService.getGroup(group_shortName).then(
                function (response) {
                    vm.group = response.data;
                },
                function (error) {
                    console.log(error)
                });
        }

        // Return an array of user and group objects belonging to this group
        function listMembers(group_shortName) {
            groupService.getGroupMembers(group_shortName).then(function(response){
                vm.groups = response.data;
            });
        }

        // Add a user or subgroup to group
        function addMembersToGroup(users) {
            var group_shortName = $stateParams.shortName;
            console.log("Adding following users to the group: ", group_shortName, users);
            // groupService.addUserToGroup(group_shortName, users).then(function (response) {
            //     console.log('Adding users to group');
            //     vm.groupExists = false;
            //     vm.group = {};

            //     if (isEmpty(response))
            //     //TODO Output notice here and/or go to view???
            //         alert(userName + " was successfully added to group (" + shortName + ").");
            // });
        }

        // Remove member from group
        function removeUserFromGroup(group_shortName, userName) {
            groupService.removeUserFromGroup(group_shortName, userName).then(function(response){
                if (isEmpty(response))
                //TODO Output notice here and/or go to view???
                    alert(userName + " was successfully removed from group (" + group_shortName + ").");
            });
        }

        function createGroup(ev) {
            console.log('Creating a new group');
            vm.groupExists = false;
            vm.group = {};

            $mdDialog.show({
                controller: GroupDialogController,
                controllerAs: 'vm',
                templateUrl: 'app/src/groups/view/groupCuDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }

        function deleteGroup(shortName, ev) {
            var confirmDel = $mdDialog.confirm()
                .title('Delete group')
                .content('Delete ' + shortName + '?')
                .ariaLabel('Delete group')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            $mdDialog.show(confirmDel).then(function() {
                groupService.deleteGroup(shortName).then(function (response) {
                    vm.group = response;
                    //TODO goto view
                });
                console.log('Deleted');
            }, function() {
                console.log('Cancelled');
            });
        }

        /**
         * Test if an object is empty ECMAScript 5+ compliant
         * @param obj
         * @returns {boolean}
         */
        function isEmpty(obj) {
            return Object.keys(obj).length === 0;
        }

        /**
         * THe controller for the cu (create/update) dialog(s)
         * @param $scope
         * @param $mdDialog
         * @param $mdToast
         * @param $animate
         * @param groupService
         * @constructor
         */
        function GroupDialogController($scope, $mdDialog, $mdToast, $animate, groupService) {
            var gdc = this;

            // Data from the user creation form
            $scope.group = vm.group;
            gdc.groupExists = vm.groupExists;
            gdc.cancel = cancel;
            gdc.update = update;
            gdc.getToastPosition = getToastPosition;

            // Cancel or submit form in dialog
            function cancel(form) {
                $mdDialog.cancel();
            }

            function update(u) {
                gdc.groupData = angular.copy(u);
                var createSuccess = (gdc.groupExists) ? groupService.updateGroup(gdc.groupData.shortName, gdc.groupData.displayName) : groupService.createGroup(gdc.groupData.shortName, gdc.groupData.displayName);
                console.log("Group created and returned:"+ createSuccess);
                debugger;
                $mdDialog.cancel();
                notifyUserSaved(createSuccess);
            }

            // When the form is submitted, show a notification:
            gdc.toastPosition = {
                bottom: false,
                top: true,
                left: false,
                right: true
            };

            function getToastPosition() {
                return Object.keys(gdc.toastPosition)
                    .filter(function (pos) {
                        return gdc.toastPosition[pos];
                    })
                    .join(' ');
            }

            function notifyUserSaved(cuSuccess) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(cuSuccess.message)
                        .position(gdc.getToastPosition())
                        .hideDelay(3000)
                );
                getAllSystemUsers();
            }
        }

    }

})();

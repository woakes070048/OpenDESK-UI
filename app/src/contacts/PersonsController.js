
    angular
        .module('openeApp.contacts')
        .controller('PersonsController', PersonsController);

    function PersonsController($mdDialog, $translate, contactsService, countriesService, PATTERNS, notificationUtilsService, VirtualRepeatLoader) {
        var vm = this;
        vm.showPersonEdit = showPersonEdit;
        vm.dataLoader = new VirtualRepeatLoader(contactsService.getPersons, error);

        function showPersonEdit(ev, person) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'app/src/contacts/view/personCrudDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    person: angular.copy(person)
                }
            }).then(function(response) {
            });
        }

        function DialogController($scope, $mdDialog, person) {
            $scope.person = person;
            $scope.countries = countriesService.getCountries();
            $scope.PATTERNS = PATTERNS;

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.delete = function(ev, person) {
                var confirm = $mdDialog.confirm()
                        .title($translate.instant('COMMON.CONFIRM'))
                        .textContent($translate.instant('CONTACT.ARE_YOU_SURE_YOU_WANT_TO_DELETE_PERSON_CONTACT', person))
                        .targetEvent(ev)
                        .ok($translate.instant('COMMON.YES'))
                        .cancel($translate.instant('COMMON.CANCEL'));
                $mdDialog.show(confirm).then(function() {
                    contactsService.deletePerson(person).then(function() {
                        refreshInfoAfterSuccessWithMsg($translate.instant("CONTACT.CONTACT_DELETED_SUCCESSFULLY", person));
                    }, error);
                });

            };

            $scope.save = function(personForm) {
                if (!personForm.$valid) {
                    notificationUtilsService.notify($translate.instant("COMMON.FILL_ALL_REQUIRED_FIELDS"));
                    return;
                }
                if ($scope.person.id) {
                    contactsService.updatePerson($scope.person)
                            .then(refreshInfoAfterSave, error);
                } else {
                    contactsService.createPerson($scope.person)
                            .then(refreshInfoAfterSave, error);
                }
            };

            function refreshInfoAfterSave(savedPerson) {
                refreshInfoAfterSuccessWithMsg($translate.instant("CONTACT.CONTACT_SAVED_SUCCESSFULLY", savedPerson));
            }

            function refreshInfoAfterSuccessWithMsg(msg) {
                notificationUtilsService.notify(msg);
                vm.dataLoader.refresh();
                $mdDialog.hide();
            }
        }

        function error(response) {
            notificationUtilsService.alert(response.data.message);
        }
    }
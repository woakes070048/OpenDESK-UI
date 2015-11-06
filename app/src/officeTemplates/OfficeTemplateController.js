
    angular
        .module('openeApp.officeTemplates')
        .controller('OfficeTemplateController', OfficeTemplateController);

    /**
     * Main Controller for the Cases module
     * @param $scope
     * @param cases
     * @constructor
     */
    function OfficeTemplateController($scope, officeTemplateService, FileSaver, Blob, $mdDialog) {
        var vm = this;

        vm.getTemplates = getTemplates;
        vm.getTemplate = getTemplate;
        vm.getThumbnail = getThumbnail;
        vm.fillTemplate = fillTemplate;
        vm.uploadNewTemplate = uploadTemplate;

        activate();

        function activate() {
            getTemplates();
        }

        function getTemplates() {
            return officeTemplateService.getTemplates().then(function(templates) {
                console.log("Templates: ", templates)
                vm.templates = templates;
            });
        }

        function getThumbnail(nodeRef) {
            var url = officeTemplateService.getCardViewThumbnail(nodeRef);
            return url;
        }

        function getTemplate(nodeRef) {
            return officeTemplateService.getTemplate(nodeRef).then(function(template) {
                return template;
            });
        }

        function fillTemplate(template, fieldData) {
            officeTemplateService.fillTemplate(template.nodeRef, fieldData).then(function (blob) {
                FileSaver.saveAs(
                    blob,
                    template.name.split('.').slice(0, -1).join(".") + ".pdf"
                );
            });
        }

        function uploadTemplate(){
            showDialog(NewCaseDocumentDialogController).then(function (response) {
                console.log("==> Response from dialog:"+response);
                officeTemplateService.uploadTemplate(response).then(function(response){
                    console.log("==> Response from dialog Service:"+response);
                });
            });
        }

        function showDialog(controller, locals){
            if(!locals){
                locals = {
                    newTemplateVersion: false
                };
            }
            return $mdDialog.show({
                controller: NewCaseDocumentDialogController,
                templateUrl: 'app/src/officeTemplates/view/uploadDialog.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                locals: locals,
                focusOnOpen: false
            });
        }

        function NewCaseDocumentDialogController($scope, $mdDialog) {

            $scope.templateProperties = {
                majorVersion: "false"
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.upload = function(){
                var response = {
                    fileToUpload: $scope.fileToUpload,
                    templateProperties: $scope.templateProperties
                };
                $mdDialog.hide(response);
            };
        }
  }
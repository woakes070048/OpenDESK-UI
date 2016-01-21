
angular
        .module('openeApp.office')
        .controller('OfficeController', OfficeController);

var document;

function OfficeController($stateParams, $window, $controller, $translate, officeService, caseService, sessionService,
        caseDocumentsService, notificationUtilsService, caseCrudDialogService) {
    var vm = this;

    if (typeof $window.external.getParameter1 !== 'undefined') {
        vm.document = JSON.parse($window.external.getParameter1());
    } else {
        vm.document = {};
        vm.document.Attachments = [];
    }

    vm.newCase = false;
    vm.selectedCase;
    vm.subject = vm.document.Subject;
    vm.title = vm.document.Title;
    vm.attachments = vm.document.Attachments;

    vm.saveEmailWithCase = saveEmailWithCase;
    vm.cancel = cancel;
    vm.saveOfficeDocWithCase = saveOfficeDocWithCase;
    vm.setPartial = setPartial;

    loadDocumentConstraints();

    if ($stateParams.alf_ticket) {
        sessionService.setUserInfo({ticket: $stateParams.alf_ticket});
    }

    function setPartial(caseType) {
        vm.formTemplateUrl = '';
        vm.newCase = false;
        vm.selectedCase = null;

        if (caseType) {
            vm.newCase = true;
            var caseInfo = {
                newCase: true,
                type: caseType
            };
            var caseController = $controller(caseCrudDialogService.getCaseControllerName(caseType), {caseInfo: caseInfo});
            caseController._afterCaseCreated = function(caseId) {
                return caseId;
            };

            angular.extend(this, caseController);
            vm.init();
        }
    }

    function saveEmailWithCase() {
        if (vm.newCase) {
            vm.save().then(function(caseId) {
                saveEmail(caseId);
            });
        } else {
            if (!vm.selectedCase) {
                notificationUtilsService.alert($translate.instant('CASE.CASE_NOT_FOUND'));
                return;
            }
            saveEmail(vm.selectedCase['oe:id']);
        }
    }

    function saveEmail(caseId) {
        officeService.saveEmail({
            caseId: caseId,
            name: vm.subject,
            email: vm.document
        }).then(function(response) {
            var metadata = {
                caseId: caseId,
                documentName: vm.subject,
                nodeRef: response.nodeRef
            };
            var atms = vm.attachments.filter(function(attachment) {
                return attachment.selected;
            });
            $window.external.SaveAsOpenEsdh(JSON.stringify(metadata), JSON.stringify(atms));
        }, function(response) {
            notificationUtilsService.alert(response.data.message);
        });
    }

    function cancel() {
        $window.external.CancelOpenEsdh();
    }
    
    function saveOfficeDocWithCase(form) {
        if (form.$invalid) {
            notificationUtilsService.alert("Fill all fields");
            return;
        }
        if (vm.newCase) {
            vm.save().then(function(caseId) {
                saveOfficeDocument(caseId);
            });
        } else {
            if (!vm.selectedCase) {
                notificationUtilsService.alert($translate.instant('CASE.CASE_NOT_FOUND'));
                return;
            }
            saveOfficeDocument(vm.selectedCase['oe:id']);
        }
    }

    function saveOfficeDocument(caseId) {
        var metadata = {
            newFolder: true,
            caseId: caseId,
            documentName: vm.title,
//            nodeRef: response.caseDocsFolderNodeRef,
            docType: vm.documentProperties.doc_type,
            docCategory: vm.documentProperties.doc_category
        };
        $window.external.SaveAsOpenEsdh(JSON.stringify(metadata), null);
    }

    /*
     * Autocomplete input
     */
    vm.querySearch = caseService.caseSearch;

    function loadDocumentConstraints() {
        caseDocumentsService.getCaseDocumentConstraints().then(function(documentConstraints) {
            vm.documentConstraints = documentConstraints;
        });
    }

}

// This function is called from the Office Add-In
window.loadDocument = function(payload) {
//        window.alert(payload);
//        document = JSON.parse(payload);
};

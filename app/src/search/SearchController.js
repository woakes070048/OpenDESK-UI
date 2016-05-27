
    angular
        .module('openDeskApp.search')
        .controller('SearchController', SearchController);

    /**
     * Main Controller for the Search module
     * @param $scope
     * @constructor
     */
    function SearchController($scope, $stateParams, searchService, documentPreviewService, alfrescoDownloadService) {
        var vm = this;

        $scope.searchResults = [];

        vm.getAutoSuggestions = function(term) {
            return searchService.getSearchSuggestions(term).then(function (val) {

                if (val != undefined) {
                    return val;
                }
                else {
                    return [];
                }
            });
        }

        vm.getSearchresults = function(term) {

            return searchService.getSearchResults(term).then(function (val) {

                if (val != undefined) {
                    $scope.searchResults = val;
                }
                else {
                    return [];
                }
            });
        }

        vm.previewDocument = function previewDocument(nodeRef){
            documentPreviewService.previewDocument(nodeRef);
        }

        vm.downloadDocument = function downloadDocument(nodeRef, name){
            alfrescoDownloadService.downloadFile(nodeRef, name);
        }


    }


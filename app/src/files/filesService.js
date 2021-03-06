
angular
        .module('openDeskApp.files')
        .factory('filesService', FilesService);

function FilesService($http, fileUtilsService, alfrescoNodeUtils) {

    return {
        getFileInfo: getFileInfo,
        getUserFiles: getUserFiles,
        getGroupFiles: getGroupFiles,
        uploadFiles: uploadFiles,
        deleteFile: deleteFile,
        moveFile: moveFile,
        addFileToCase: addFileToCase
    };

    /**
     * Lists all files assigned to current user
     * @returns {*}
     */
    function getUserFiles() {
        return $http.get('/api/opendesk/files')
                .then(_fileListResponse);
    }

    /**
     * Lists all files assigned to any group of user
     * @returns {*}
     */
    function getGroupFiles() {
        return $http.get('/api/opendesk/files/group')
                .then(_fileListResponse);
    }



    function _fileListResponse(response) {
        return response.data.map(function(file) {
            file.thumbNailURL = fileUtilsService.getFileIconByMimetype(file.cm.content.mimetype, 24);
            return file;
        });
    }

    function getFileInfo(nodeRef) {
        return $http.get('/api/opendesk/file/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri)
                .then(function(response) {
                    return response;
                });
    }

    /**
     * Uploads file and assigns it to specified user or group
     * @param owner - nodeRefId of user or group
     * @param files - multiple input files
     * @param comment - to be assigned to every file
     * @returns void
     */
    function uploadFiles(owner, files, comment) {
        var formData = new FormData();
        formData.append('owner', owner);
        if (comment) {
            formData.append('comment', comment);
        }
        angular.forEach(files, function(file) {
            formData.append('file', file);
        });
        return $http.post('/api/opendesk/files', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function(response) {
            return response.data;
        });
    }

    function deleteFile(nodeRef) {
        return $http.delete('/api/opendesk/file/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri)
                .then(function(response) {
                    return response;
                });
    }

    function moveFile(nodeRef, newOwner, comment) {
        return $http.put('/api/opendesk/file/assign',
                null, {params: {
                        nodeRef: nodeRef,
                        owner: newOwner,
                        comment: comment || ''
                    }})
                .then(function(response) {
                    return response;
                });
    }

    function addFileToCase(caseId, nodeRef, documentProperties) {
        return $http.put('/api/opendesk/case/' + caseId + '/addFile', null,
                {params: angular.extend(documentProperties, {nodeRef: nodeRef})})
                .then(function(response) {
                    return response;
                });
    }
}

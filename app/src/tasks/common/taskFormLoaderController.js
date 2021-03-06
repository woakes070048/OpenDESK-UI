
    angular.module('openDeskApp.tasks.common')
        .controller('taskFormLoaderController', taskFormLoaderController);
    
    function taskFormLoaderController($stateParams, taskFormConfigService, $controller) {
        var vm = this;
        vm.taskName = $stateParams.taskName;
        var taskFormConfig = taskFormConfigService.getTaskFormConfig(vm.taskName);
        
        if(taskFormConfig == null || taskFormConfig == undefined){
            return;
        }
        
        vm.taskTemplateUrl = taskFormConfig.templateUrl;
        
        if(taskFormConfig.controller != null && taskFormConfig.controller != undefined){
            vm.controller = function(){
                return $controller(taskFormConfig.controller, {});
            };    
        }
    }

    angular
        .module('openDeskApp.activitiParallelReview.tasks', ['openDeskApp.tasks.common'])
        .config(config);
    
    function config(taskFormConfigServiceProvider){
        
        // The "wf:activitiReviewTask" task form configuration is defined in the activitiReview.tasks module.
        // Here we define only missing task form configurations. 
        
        taskFormConfigServiceProvider.taskForm({
            taskName: 'wf:approvedParallelTask',
            templateUrl: 'app/src/tasks/activitiParallelReview/view/approvedRejectedParallelTask.html',
            controller: 'simpleTaskController'
        }).taskForm({
            taskName: 'wf:rejectedParallelTask',
            templateUrl: 'app/src/tasks/activitiParallelReview/view/approvedRejectedParallelTask.html',
            controller: 'simpleTaskController'
        });
    }
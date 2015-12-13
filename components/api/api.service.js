(function () {
	'use strict';
	angular.module('jsApi')
	.factory('jsApiService', function (Restangular) {

		var
		_endpoint = 'api/organizations';

		var _subtaskMixins = {
			addMaterial: function () {
				var newMaterial = {
					name: '',
					quantity: 1
				};
				this.materials.unshift(newMaterial);
				return newMaterial;
			},
			removeMaterial: function (material) {
				_.remove(this.materials, material);
				return material;
			}
		};

		var _taskMixins = {
			addSubtask: function () {
				var newSubtask = {
					name: '',
					description: '',
					complete: false,
					materials: []
				};
				_.mixin(newSubtask,_subtaskMixins);
				this.subtasks.unshift(newSubtask);
				return newSubtask;
			},
	      /**
	       * Remove a subtask from the array of tasks
	       * @param subtask
	       * @returns {Object} Returns the removed subtask.
	       */
	       removeSubtask: function (subtask) {
	       	_.remove(this.subtasks, subtask);
	       	return subtask;
	       }
	   };

	   var _jobMixins = {
	   	addTask: function () {
	   		var newTask = {
	   			name:'',
	   			description:'',
	   			subtasks: []
	   		};
	   		_.mixin(newTask,_taskMixins);
	   		this.tasks.unshift(newTask);
	   		return newTask;
	   	},
	      /**
	       * Remove a task from the array of tasks
	       * @param task
	       * @returns {Object} Returns the removed task.
	       */
	       removeTask: function (task) {
	       	_.remove(this.tasks, task);
	       	return task;
	       }
	   };

	   var _organizationMixins = {
	   	addJob: function () {
	   		var newJob = {
	   			name: 'New Job',
	   			description: '',
	          startDate: '', // TODO - use moment.js
	          contactName: '',
	          contactPhone: '',
	          contactEmail: '',
	          address1: '',
	          address2: '',
	          city: '',
	          state: '',
	          zip: '',
	          active: true,
	          tasks: []
	      };
	      _.mixin(newJob,_jobMixins);
	      this.jobs.unshift(newJob);
	      this.jobsCopy.unshift(newJob);
	      return newJob;
	  },
	      jobsCopy: [] // Copy of jobs list used for editing
	  };


	  Restangular.extendModel(_endpoint, function (model) {
	  	angular.extend(model, _organizationMixins);
	  	return model;
	  });


	  var
	  publicApi = {
	  	getOrgData: function (id) {
	  		return Restangular.one(_endpoint, id).get().then(function (orgData) {
	  			_.each(orgData.jobs, function (job) {
	  				_.mixin(job,_jobMixins);
	  				_.each(job.tasks, function (task) {
	  					_.mixin(task,_taskMixins);
	  					_.each(task.subtasks, function (subtask) {
	  						_.mixin(subtask,_subtaskMixins);
	  					})
	  				});
	  			});
	  			orgData.jobsCopy = _.cloneDeep(orgData.jobs);
	  			return orgData;
	  		});
	  	}
	  };

	  return publicApi;

	});
})();
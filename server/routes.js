/**
* Main app routes
*/
'use strict';

var express    = require('express');
var tasksModel = require('./models/tasks');
var taskUtils = require('./models/tasks.utils');
var mailer = require('./mailer');
module.exports = function(app){
//Routes for the API
var router = express.Router();

router.use(function(req, res, next) {
  next();
});

//general routes
router.get('/', function(req,res){
  res.json({
    microservice: 'taks-microservice',
    owner: 'Emmanuel'
  });
});
//API Tasks routes
  //Creates a new task for the user.
router.route('/tasks/:userId')
  .post(function(req, res){
    req.body.Owner = req.params.userId;
    tasksModel.create(req.body, function(err, task) {
      if(err) {
        return res.status(500).send(err);
      }
	  if(task.Daysbefore){
		var date = new Date(task.Duedate);
		 date.setDate(date.getDate()-task.Daysbefore);
		var datetemp=new Date(task.Time);
		date.setMinutes(datetemp.getMinutes());
		date.setHours(datetemp.getHours());
		
		// setup e-mail data with unicode symbols
		var mailOptions = {
			from: '"Tasks" <tasks@microservice.com>', // sender address
			to: task.Owner, // list of receivers
			subject: 'Reminder: ' + task.Title, // Subject line
			text: task.Description, // plaintext body
			html: '<b>'+ task.Description + '</b>' // html body
		};  
		
		mailer.schedule(date,mailOptions);
	 }
	
      return res.status(201).json(task);
    });
  });
  //Get all tasks for a specified user.
router.route('/tasks/user/:userId')
  .get(function(req, res){
    tasksModel.find( {Owner: req.params.userId },function(err, tasks){
      if(err){
        return res.status(500).send(err);
      }
      return res.status(200).json(tasks);
    });
  });
  

  //Delete all tasks for a specified user.
router.route('/tasks/user/:userId')
  .delete(function(req, res){
    tasksModel.remove({Owner: req.params.userId }, function (err) {
      if(err){
        return res.status(500).send(err);
      }
      return res.status(204).send('No Content');
    });
  });

  //Returns task information.
router.route('/tasks/:taskId')
  .get(function(req, res){
    tasksModel.findById( req.params.taskId,function(err, task){
      if(err){
        return res.status(500).send(err);
      }
      if(!task) {
        return res.status(404).send('Not Found');
      }
      return res.status(200).json(task);
    });
  });

  //Mark a task as done
  
router.route('/tasks/:taskId/:done')
	.patch(function (req, res){
	  tasksModel.findById( req.params.taskId,function(err, task){
      if(err){
        return res.status(500).send(err);
      }
      if(!task) {
        return res.status(404).send('Not Found');
      }
	  
		var complete = taskUtils.getDateValue(new Date(Date.now()), new Date(task.Duedate));
		task.Completed = (req.params.done=='true')? complete : 'NotYet';
		task.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.status(200).json(task);
      });
    });
		
		
		
		
   	});
  
  //Deletes a task.
router.route('/tasks/:taskId')
  .delete(function(req, res){
    tasksModel.findById(req.params.taskId, function (err, task) {
      if(err) {
        return res.status(500).send(err);
      }
      if(!task) {
        return res.status(404).send('Not Found');
      }
      task.remove(function(err) {
        if(err) {
          return res.status(500).send(err);
        }
        return res.status(200).json(task);
      });
    });
  });
  
  //Report of tasks.
  
router.route('/tasks/report/:userId')
  .get(function(req, res){
    tasksModel.find( {Owner: req.params.userId },function(err, tasks){
      if(err){
        return res.status(500).send(err);
      }
      //create Report
      var report = {
       CompletedTasks:
		{
		CompletedOnTime: 0,
		CompletedBeforeTime: 0,
		CompletedAfterDueDate: 0
		},
		AvailableTasks:
		{
		TasksOnReminderTime: 0,
		TaskToBeDone: 0,
		TasksForToday: 0
		}
      };
	  var available=[];
      tasks.forEach(function(task, index){
		switch(task.Completed){
			case 'Ontime':
			report.CompletedTasks.CompletedOnTime++;
			break;
			case 'Before':
			report.CompletedTasks.CompletedBeforeTime++;
			break;
			case 'Late':
			report.CompletedTasks.CompletedAfterDueDate++;
			break;
			case 'NotYet':
			available.push(task);
			
		}
		
      });
		report.TaskToBeDone= available.length;
		available.forEach(function(task, index){
			console.log(task.dueDate);
		switch(taskUtils.getDateValue(new Date(Date.now()), new Date(task.Duedate))){
			case 'Ontime':
			report.AvailableTasks.TasksForToday++;
			break;
			case 'Before':
			report.AvailableTasks.TasksOnReminderTime++;
			break;
			
		}
		
      });
		
	 
      return res.status(200).json(report);
    });
  });

  app.use('/api', router);
};

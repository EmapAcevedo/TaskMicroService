//Tests for Microservice routes
process.env.NODE_ENV = "debug"; //Tests must run on debug enviroment

var should = require('should');
require('should-http');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../server/config/enviroment');
var tasksModel = require('../server/models/tasks');
var tasksUtils = require('../server/models/tasks.utils');

describe('Task Microservice', function() {
  var url = 'http://localhost:'+config.port+'/api';
  var taskId;
  before(function(done) {
    // use the test db
    //add mock entries to DB here
    var arrTasks = [
      {
        Owner: 'foo.bar@mail',
	  Title: 'Hora',
	  Description: 'Shego El bigote',
	  Duedate: '2016-04-28T08:11:39.568Z',
	  Reminder:{
		   Daysbefore: 2,
		   Time: "05:35"
			}
			
      },
      {
        
        Owner: 'foo.bar@mail',
		Title: 'Hola',
		Description: 'Saludar a todos',
		Duedate: '2016-05-28T08:11:39.568Z',
		Reminder:{
		   Daysbefore: 5,
		   Time: "10:10"
			}
      },
      {
        Owner: 'foo.bar@mail',
		Title: 'Trabajo chilo',
		Description: 'Hacer cosas interesantes',
		Duedate: '2016-10-28T08:12:39.568Z',
		Reminder:{
		   Daysbefore: 7,
		   Time: "10:10"
			}
      },
      {
		  
		Owner: 'foo.bar@mail',
		Title: 'Gran proyecto',
		Description: 'Un gran proyecto para hacer',
		Duedate: '2016-03-26T08:12:39.568Z',
		
      }
    ];
    mongoose.connect(config.mongoDB.uri);
    //Remove and repopulate DB
    tasksModel.remove({}, function(err) {
    tasksModel.create(arrTasks, function (err, tasks) {
         if (err){throw err}
         done();
     });
    });
  });
  describe('Routes',function(){
    describe('Create', function() {
      it('should return error if missing Title', function (done){
        var task = {
			
		Owner: 'foo.bar@mail',
		// mising Title: 'Trabajo chilo',
		Description: 'Hacer cosas raras',
		Duedate: '2016-10-28T08:12:39.568Z',
        };
        request(url)
        .post('/tasks/foo.bar@mail')
        .send(task)
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
	  
	  });
       
    describe('Get All', function() {
      it('should return a list of objects', function (done){
        request(url)
        .get('/tasks/user/foo.bar@mail')
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body.should.be.Array();
          done();
        });
      });
    });
    describe('Get', function(){
       it('should return the specified task on success', function (done){
        var task = {
			Owner: "foo.bar@mail",
			Title: 'Trabajo chilo',
			Description: 'Hacer cosas interesantes',
			Duedate: '2016-10-28T08:12:39.568Z',
			Reminder:{
			   Daysbefore: 7,
			   Time: "10:10"
				}
        };
        request(url)
        .get('/tasks/'+taskId)
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body.should.have.property('_id');
          res.body.Owner.should.equal(task.Owner);
          res.body.Description.should.equal(task.Description);
          res.body.Title.should.equal(task.Title);
          done();
        });
      });
    });
    describe('Delete',function(){
      
      it('should return not found for unexisting id', function (done){
        request(url)
        .delete('/tasks/000000000000000000d00001')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(404);
          done();
        });
      });
      it('should delete and return the data on success',function(done){
        var task = { //expected
          Owner: 'foo.bar@mail',
		Title: 'Just Work',
		Description: 'Hacer alguna cosa',
		Duedate: '2016-10-28T08:12:39.568Z',
		Reminder:{
		   Daysbefore: 8,
		   Time: "11:11"
			}
        };
		
        request(url)
        .delete('/tasks/'+taskId)
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          request(url)
          .delete('/tasks/'+tasksId)
          .send()
          .end(function(err,res){
            res.should.have.status(404);
            done();
          });
        });
      });
    });
    describe('Report',function(){
      it('should return a report for the given user',function(done){
        
          done();
        });

      });
    });
    describe('Delete All', function(){
      it('should delete all entries for a user', function(done){
        request(url)
        .delete('/tasks/user/foo.bar@mail')
        .send()
        .expect(204) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          request(url)
          .get('/tasks/user/foo.bar@mail')
          .send()
          .expect('Content-Type', /json/)
          .expect(200) //Status Code
          .end(function(err,res){
            if(err){throw err;}
            res.body.should.be.Array();
            res.body.length.should.equal(0);
            done();
          });
        });
      });
    });
  });

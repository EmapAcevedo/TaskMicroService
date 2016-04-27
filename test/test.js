//Tests for Microservice routes
process.env.NODE_ENV = "debug"; //Tests must run on debug enviroment

var should = require('should');
require('should-http');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../server/config/enviroment');
var HabitModel = require('../server/models/habit');
var HabitUtils = require('../server/models/habit.utils');

describe('Habit Microservice', function() {
  var url = 'http://localhost:'+config.port+'/api';
  var habitId;
  before(function(done) {
    // use the test db
    //add mock entries to DB here
    var arrHabits = [
      {
        Owner: 'foo.bar@mail',
        Description: 'Excersice 20 minutes',
        Type: 'Both',
        Difficulty: 'Medium',
        Score: 5 //orange
      },
      {
        Owner: 'foo.bar@mail',
        Description: 'Eat healthy',
        Type: 'Both',
        Difficulty: 'Medium',
        Score: 43 //green
      },
      {
        Owner: 'foo.bar@mail',
        Description: 'Work on final projects',
        Type: 'Both',
        Difficulty: 'Hard',
        Score: 54 //blue
      },
      {
        Owner: 'foo.bar@mail',
        Description: 'Sleep 6 hours',
        Type: 'Both',
        Difficulty: 'Hard',
        Score: -7 //red
      }
    ];
    mongoose.connect(config.mongoDB.uri);
    //Remove and repopulate DB
    HabitModel.remove({}, function(err) {
     HabitModel.create(arrHabits, function (err, habits) {
         if (err){throw err}
         done();
     });
    });
  });
  describe('Utils',function(){
    describe('getRange',function(){
      it('should classify (-Inf,0) as Red', function(){
        HabitUtils.getRange({Score: -999}).should.equal('Red');
        HabitUtils.getRange({Score: -1}).should.equal('Red');
        HabitUtils.getRange({Score: 0}).should.not.equal('Red');
      });
      it('should classify [0,10) as Orange', function(){
        HabitUtils.getRange({Score: 0}).should.equal('Orange');
        HabitUtils.getRange({Score: 4}).should.equal('Orange');
        HabitUtils.getRange({Score: 10}).should.not.equal('Orange');
      });
      it('should classify [10,40) as Yellow', function(){
        HabitUtils.getRange({Score: 10}).should.equal('Yellow');
        HabitUtils.getRange({Score: 33}).should.equal('Yellow');
        HabitUtils.getRange({Score: 40}).should.not.equal('Yellow');
      });
      it('should classify [40,50) as Green', function(){
        HabitUtils.getRange({Score: 40}).should.equal('Green');
        HabitUtils.getRange({Score: 45}).should.equal('Green');
        HabitUtils.getRange({Score: 50}).should.not.equal('Green');
      });
      it('should classify [50,Inf) as Blue', function(){
        HabitUtils.getRange({Score: 50}).should.equal('Blue');
        HabitUtils.getRange({Score: 999}).should.equal('Blue');
      });
    });
    describe('getScoreOffset',function(){
      it('should return 2 for Easy', function(){
        HabitUtils.getScoreOffset({Difficulty: 'Easy'}).should.equal(2);
      });
      it('should return 4 for Medium', function(){
        HabitUtils.getScoreOffset({Difficulty: 'Medium'}).should.equal(4);
      });
      it('should return 6 for Hard', function(){
        HabitUtils.getScoreOffset({Difficulty: 'Hard'}).should.equal(6);
      });
    });
    describe('getScoreIncrement',function(){
      it('should return half points if range is Green',function(){
        HabitUtils.getScoreIncrement({Score:45, Difficulty:'Easy'}).should.equal(1);
        HabitUtils.getScoreIncrement({Score:45, Difficulty:'Medium'}).should.equal(2);
        HabitUtils.getScoreIncrement({Score:45, Difficulty:'Hard'}).should.equal(3);
      });
      it('should return 1 point if range is Blue',function(){
        HabitUtils.getScoreIncrement({Score:99, Difficulty:'Easy'}).should.equal(1);
        HabitUtils.getScoreIncrement({Score:99, Difficulty:'Medium'}).should.equal(1);
        HabitUtils.getScoreIncrement({Score:99, Difficulty:'Hard'}).should.equal(1);
      });
      it('should return default value otherwise',function(){
        //Red
        HabitUtils.getScoreIncrement({Score:-1, Difficulty:'Easy'}).should.equal(2);
        HabitUtils.getScoreIncrement({Score:-1, Difficulty:'Medium'}).should.equal(4);
        HabitUtils.getScoreIncrement({Score:-1, Difficulty:'Hard'}).should.equal(6);
        //Orange
        HabitUtils.getScoreIncrement({Score:3, Difficulty:'Easy'}).should.equal(2);
        HabitUtils.getScoreIncrement({Score:3, Difficulty:'Medium'}).should.equal(4);
        HabitUtils.getScoreIncrement({Score:3, Difficulty:'Hard'}).should.equal(6);
        //Yellow
        HabitUtils.getScoreIncrement({Score:13, Difficulty:'Easy'}).should.equal(2);
        HabitUtils.getScoreIncrement({Score:13, Difficulty:'Medium'}).should.equal(4);
        HabitUtils.getScoreIncrement({Score:13, Difficulty:'Hard'}).should.equal(6);
      });
    });
    describe('getScoreDecrement',function(){
      it('should return 1.5 times points if range is Orange',function(){
        HabitUtils.getScoreDecrement({Score:3, Difficulty:'Easy'}).should.equal(3);
        HabitUtils.getScoreDecrement({Score:3, Difficulty:'Medium'}).should.equal(6);
        HabitUtils.getScoreDecrement({Score:3, Difficulty:'Hard'}).should.equal(9);
      });
      it('should return 2 times points if range is Red',function(){
        HabitUtils.getScoreDecrement({Score:-1, Difficulty:'Easy'}).should.equal(4);
        HabitUtils.getScoreDecrement({Score:-1, Difficulty:'Medium'}).should.equal(8);
        HabitUtils.getScoreDecrement({Score:-1, Difficulty:'Hard'}).should.equal(12);
      });
      it('should return default value otherwise',function(){
        //Yellow
        HabitUtils.getScoreDecrement({Score:13, Difficulty:'Easy'}).should.equal(2);
        HabitUtils.getScoreDecrement({Score:13, Difficulty:'Medium'}).should.equal(4);
        HabitUtils.getScoreDecrement({Score:13, Difficulty:'Hard'}).should.equal(6);
        //Green
        HabitUtils.getScoreDecrement({Score:43, Difficulty:'Easy'}).should.equal(2);
        HabitUtils.getScoreDecrement({Score:43, Difficulty:'Medium'}).should.equal(4);
        HabitUtils.getScoreDecrement({Score:43, Difficulty:'Hard'}).should.equal(6);
        //Blue
        HabitUtils.getScoreDecrement({Score:99, Difficulty:'Easy'}).should.equal(2);
        HabitUtils.getScoreDecrement({Score:99, Difficulty:'Medium'}).should.equal(4);
        HabitUtils.getScoreDecrement({Score:99, Difficulty:'Hard'}).should.equal(6);
      });
    });
  });
  describe('Routes',function(){
    describe('Create', function() {
      it('should return error if missing Difficulty', function (done){
        var habit = {
          Description: "Test my APIs",
          Type: "Good"
          //missing Difficulty: "Hard"
        };
        request(url)
        .post('/habits/foo.bar@mail')
        .send(habit)
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return error if missing Type', function (done){
        var habit = {
          Description: "Test my APIs",
          //Missing Type: "Good",
          Difficulty: "Hard"
        };
        request(url)
        .post('/habits/foo.bar@mail')
        .send(habit)
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return error if missing Description', function (done){
        var habit = {
          //Missing Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Hard"
        };
        request(url)
        .post('/habits/foo.bar@mail')
        .send(habit)
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return error if Type is not valid (Good|Bad|Both)', function (done){
        var habit = {
          Description: "Test my APIs",
          Type: "Nice",
          Difficulty: "Hard"
        };
        request(url)
        .post('/habits/foo.bar@mail')
        .send(habit)
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return error if Difficulty is not valid (Easy|Medium|Hard)', function (done){
        var habit = {
          Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Extreme"
        };
        request(url)
        .post('/habits/foo.bar@mail')
        .send(habit)
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return the created object on success', function (done){
        var habit = {
          Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Hard"
        };
        request(url)
        .post('/habits/foo.bar@mail')
        .send(habit)
        .expect('Content-Type', /json/)
        .expect(201) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body.should.have.property('_id');
          habitId = res.body._id;
          res.body.Owner.should.equal('foo.bar@mail');
          res.body.Description.should.equal(habit.Description);
          res.body.Type.should.equal(habit.Type);
          res.body.Difficulty.should.equal(habit.Difficulty);
          res.body.Score.should.equal(0);
          done();
        });
      });
    });
    describe('Get All', function() {
      it('should return a list of objects', function (done){
        request(url)
        .get('/habits/user/foo.bar@mail')
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
      it('should return an error for invalid id', function (done){
        request(url)
        .get('/habits/foo.bar@mail')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return not found for unexisting id', function (done){
        request(url)
        .get('/habits/000000000000000000d00001')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(404);
          done();
        });
      });
      it('should return the specified habit on success', function (done){
        var habit = {
          Owner: "foo.bar@mail",
          Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Hard",
          Score: 0
        };
        request(url)
        .get('/habits/'+habitId)
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body.should.have.property('_id');
          res.body.Owner.should.equal(habit.Owner);
          res.body.Description.should.equal(habit.Description);
          res.body.Type.should.equal(habit.Type);
          res.body.Difficulty.should.equal(habit.Difficulty);
          res.body.Score.should.equal(habit.Score);
          done();
        });
      });
    });
    describe('Increment',function(){
      it('should return an error for invalid id', function (done){
        request(url)
        .post('/habits/increment/foo.bar@mail')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return not found for unexisting id', function (done){
        request(url)
        .post('/habits/increment/000000000000000000d00001')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(404);
          done();
        });
      });
      it('should increment and return new data on success',function(done){
        var habit = { //expected
          Owner: "foo.bar@mail",
          Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Hard",
          Score: 6
        };
        request(url)
        .post('/habits/increment/'+habitId)
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body._id.should.equal(habitId);
          res.body.Owner.should.equal(habit.Owner);
          res.body.Description.should.equal(habit.Description);
          res.body.Type.should.equal(habit.Type);
          res.body.Difficulty.should.equal(habit.Difficulty);
          res.body.Score.should.equal(habit.Score);
          done();
        });
      });
    });
    describe('Decrement',function(){
      it('should return an error for invalid id', function (done){
        request(url)
        .post('/habits/increment/foo.bar@mail')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return not found for unexisting id', function (done){
        request(url)
        .post('/habits/increment/000000000000000000d00001')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(404);
          done();
        });
      });
      it('should decrement and return new data on success',function(done){
        var habit = { //expected
          Owner: "foo.bar@mail",
          Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Hard",
          Score: -3
        };
        request(url)
        .post('/habits/decrement/'+habitId)
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body._id.should.equal(habitId);
          res.body.Owner.should.equal(habit.Owner);
          res.body.Description.should.equal(habit.Description);
          res.body.Type.should.equal(habit.Type);
          res.body.Difficulty.should.equal(habit.Difficulty);
          res.body.Score.should.equal(habit.Score);
          done();
        });
      });
    });
    describe('Delete',function(){
      it('should return an error for invalid id', function (done){
        request(url)
        .delete('/habits/foo.bar@mail')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(500);
          done();
        });
      });
      it('should return not found for unexisting id', function (done){
        request(url)
        .delete('/habits/000000000000000000d00001')
        .send()
        .end(function(err,res){
          if(err){throw err;}
          res.should.have.status(404);
          done();
        });
      });
      it('should delete and return the data on success',function(done){
        var habit = { //expected
          Owner: "foo.bar@mail",
          Description: "Test my APIs",
          Type: "Good",
          Difficulty: "Hard",
          Score: -3
        };
        request(url)
        .delete('/habits/'+habitId)
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          res.body._id.should.equal(habitId);
          res.body.Owner.should.equal(habit.Owner);
          res.body.Description.should.equal(habit.Description);
          res.body.Type.should.equal(habit.Type);
          res.body.Difficulty.should.equal(habit.Difficulty);
          res.body.Score.should.equal(habit.Score);
          request(url)
          .delete('/habits/'+habitId)
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
        var expected = {
          Range: {
            Red : 1,
            Orange : 1,
            Yellow : 0,
            Green : 1,
            Blue : 1
          },
          Best: {
            Owner: 'foo.bar@mail',
            Description: 'Work on final projects',
            Type: 'Both',
            Difficulty: 'Hard',
            Score: 54 //blue
          },
          Worst:{
            Owner: 'foo.bar@mail',
            Description: 'Sleep 6 hours',
            Type: 'Both',
            Difficulty: 'Hard',
            Score: -7 //red
          }
        };
        request(url)
        .get('/habits/report/foo.bar@mail')
        .send()
        .expect('Content-Type', /json/)
        .expect(200) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          //Range
          res.body.Range.Red.should.equal(expected.Range.Red);
          res.body.Range.Orange.should.equal(expected.Range.Orange);
          res.body.Range.Yellow.should.equal(expected.Range.Yellow);
          res.body.Range.Green.should.equal(expected.Range.Green);
          res.body.Range.Blue.should.equal(expected.Range.Blue);
          //Best
          res.body.Best.should.have.property('_id');
          res.body.Best.Owner.should.equal(expected.Best.Owner);
          res.body.Best.Description.should.equal(expected.Best.Description);
          res.body.Best.Type.should.equal(expected.Best.Type);
          res.body.Best.Difficulty.should.equal(expected.Best.Difficulty);
          res.body.Best.Score.should.equal(expected.Best.Score);
          //Worst
          res.body.Worst.should.have.property('_id');
          res.body.Worst.Owner.should.equal(expected.Worst.Owner);
          res.body.Worst.Description.should.equal(expected.Worst.Description);
          res.body.Worst.Type.should.equal(expected.Worst.Type);
          res.body.Worst.Difficulty.should.equal(expected.Worst.Difficulty);
          res.body.Worst.Score.should.equal(expected.Worst.Score);
          done();
        });

      });
    });
    describe('Delete All', function(){
      it('should delete all entries for a user', function(done){
        request(url)
        .delete('/habits/user/foo.bar@mail')
        .send()
        .expect(204) //Status Code
        .end(function(err,res){
          if(err){throw err;}
          request(url)
          .get('/habits/user/foo.bar@mail')
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
});

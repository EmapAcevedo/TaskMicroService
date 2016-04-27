/**
*  Main app file
*/
'use strict';

//dependencies

var express  = require ('express');
var mongoose = require ('mongoose');
var config   = require ('./config/enviroment');
var os = require( 'os' );
var _ = require('lodash');
//connect to MongoDB
console.log("Connecting to DB: ", config.mongoDB.uri);
mongoose.connect(config.mongoDB.uri, config.mongoDB.options);
mongoose.connection.on('error', function(err){
  console.log('MongoDB connection error: ' + err);
  process.exit(-1);
});
console.log('Connected to DB');

//setup server
console.log('Starting server...');
var app = express();
require ('./config/express')(app);
require ('./routes') (app);

app.listen(config.port);
console.log('Server listening on port: ' + config.port);

//Get Own Network IP
var ip = _.chain(os.networkInterfaces())
  .values()
  .flatten()
  .filter(function(val) {
    return (
      val.family == 'IPv4' &&
      val.internal == false &&
      !/^00:50:56:/.test(val.mac) &&
      val.mac != '00:00:00:00:00:00'
    );
  })
  .map('address')
  .first()
  .value();
var Firebase = require('firebase');
console.log('Address: ', ip);
//Push data to service discovery
var dataRef = new Firebase(config.firebase.uri);
dataRef.set({host:ip, port: config.port});

module.exports = app;
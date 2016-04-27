'use strict';

//dependencies
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

//define Schema
var tasksSchema = new Schema ({
  Title: { type: String, required: true},
  Description: { type: String, required: true},
  Duedate: { type: String, required: true},
  Daysbefore:{ type: Number},
  Time: { type: String},
  Owner: { type: String, required: true},
  Completed:    { type: String, enum:
  ['Ontime', 'Before', 'Late', 'NotYet'],  default: 'NotYet' }
  
});

module.exports = mongoose.model('tasks', tasksSchema);

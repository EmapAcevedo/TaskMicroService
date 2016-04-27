'use strict'

var _ = require('lodash');

//All configurations will extend these options

var all = {
  env: process.env.NODE_ENV,
  port: process.env.port || 9000,
  mongoDB: {
    options: {
      db: {
        safe:true
      }
    }
  }
};

//export the config object based on the NODE_ENV
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {}
);

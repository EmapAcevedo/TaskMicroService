var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var config = require ('./config/enviroment');
  
  module.exports.transporter = nodemailer.createTransport(config.mail.uri);
  module.exports.schedule= function(date,mailOptions){
	  console.log(date);
	  console.log(mailOptions);
	var j = schedule.scheduleJob(date, function(){
	console.log('Sending Mail!');
	console.log((new Date(Date.now())).toISOString());
	 //Send mail
	 // send mail with defined transport object
	 module.exports.transporter.sendMail(mailOptions, function(error, info){
	 if(error){
			  return console.log(error);
		  }
		  console.log('Message sent: ' + info.response);
	  });
	});
  }
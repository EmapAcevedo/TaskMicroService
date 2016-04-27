module.exports.getDateValue = function(today, due){
	console.log(today.toISOString());
	console.log(due.toISOString());
  if(today>due){
	  
	  return 'Late';
	  
  }
  
  else if(today<due){
	  console.log(today.toDateString());
	  console.log(due.toDateString());
		  
	  if(today.toDateString()==due.toDateString()){
		  return 'Ontime';
		  
	  }
	  
	  return 'Before';
  }
}
var hangoutsBot = require("hangouts-bot");
var bot = new hangoutsBot("user", "pass");
var AWS = require('aws-sdk');
 
AWS.config.loadFromPath('./config.json');

bot.on('online', function() {
	console.log('online');
});


// Create EC2 service object
ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

var params = {
  InstanceIds: [''],
  DryRun: false
};

console.log('Hangout-bot server started...');


bot.on('message', function(from, message) {
	console.log(from + ">> " + message);

	switch (message) {
		case "help":
			bot.sendMessage(from, "The commands are:  \n /status - Get the status of the instance \n /start - Turn on the Instance \n /stop - Turn Off Instance");
			break;
		case "/status":
			status(from);
			break;
		case "/start":
			start(from);
			break;
		case "/stop":
			stop(from);
			break;				
	}
});

var start = function(from) {
	ec2.describeInstanceStatus(params, function(err,data) {
		if(err){
			console.log(err, err.stack);
		} else{
      console.log(data.InstanceStatuses[0]);
      if(data.InstanceStatuses[0] === undefined ){
        console.log('se procede a encender el server');
        ec2.startInstances(params, function(err, data) {
          if (err && err.code === 'DryRunOperation') {
            params.DryRun = false;
            ec2.startInstances(params, function(err, data) {
              if (err) {
                console.log("Error", err);
              } else if (data) {
                console.log("Success", data.StartingInstances);
              }
            });
          } else {
            console.log("You don't have permission to start instances.");
          }
        });
        bot.sendMessage(from, 'Minecraft-Bot: Starting Instance');
      }else if(data.InstanceStatuses[0].InstanceState.Name){
      	bot.sendMessage(from, 'Minecraft-Bot: The Server already running');
      }
    }
  });
}
var stop = function(from){
	  ec2.describeInstanceStatus(params, function(err,data) {
    if(err){
      console.log(err, err.stack);
    } else{
      console.log(data.InstanceStatuses[0]);
      if(data.InstanceStatuses[0] === undefined){
        bot.sendMessage(from, 'Minecraft-Bot: The Server already Stoped, Nothing to do');
      } else{
        ec2.stopInstances(params, function(err, data) {
          if (err && err.code === 'DryRunOperation') {
            params.DryRun = false;
            ec2.stopInstances(params, function(err, data) {
              if (err) {
                console.log("Error", err);
              } else if (data) {
                console.log("Success", data.StoppingInstances);
              }
            });
          } else {
            console.log("You don't have permission to stop instances");
          }
        });
        bot.sendMessage(from, 'Minecraft-Bot: Stoping Instance');
      }
    }
  });
}

var status = function(from){
  ec2.describeInstanceStatus(params, function(err,data){
    if(err){
      console.log(err, err.stack);
    } else{
      if(data.InstanceStatuses[0] === undefined){
        bot.sendMessage(from, 'Minecraft-Bot: The Server is Stoped');
      } else{
        bot.sendMessage(from, 'Minecraft-Bot: The Server is Running');
      }
    }
  });
}

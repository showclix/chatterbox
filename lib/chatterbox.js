var inquirer = require('inquirer');
var chalk = require('chalk');

var Broadcast = require('./com/broadcast');

// Main entry point
var create = function create(servers, auth, callback) {

  var questions = [];

  if (auth.user === true) {
    questions.push({
      name: 'user',
      message: 'User'
    });
  }

  if (auth.password === true) {
    questions.push({
      type: 'password',
      name: 'password',
      message: 'Password'
    });
  }

  // Optionally prompt for username and password
  if (questions.length > 0) {
    inquirer.prompt(questions, function(answers) {
      start(servers, answers.user || auth.user, answers.password || auth.password, callback);
    });
  } else {
    start(servers, auth.user, auth.password, callback);
  }

};

var start = function start(servers, user, pass, callback) {
  var broadcast = new Broadcast(servers, user, pass);
  callback.call(broadcast);
  broadcast.closeOnComplete();
};

// Helper methods
create.print = function(err, std, status) {
    std.out && console.log(chalk.green(this.host + ': ') + std.out.trim());
    std.err && console.log(chalk.red(this.host + ': ') + std.out.trim());
};

module.exports = create;

// // Thoughts
// connection(group, user)
//     .remote('uptime') // run uptime on the remote server(s)
//     .remote(function(data) {
//         return 'echo ' + data + data; // run custom command based on previous commands result
//     })
//     .remote(true, function(data, next) {
//         // allow something more like streaming.  note next can only be called once.
//         if (data === null) next('whoami');
//         else console.log('got new data: ' + data);
//     })
//     .remote(duplexStreamObject) // allow actual streaming object ??
//     .local('date') // run local command
//     .close();

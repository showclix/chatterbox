// Can.js
var SSH = require('ssh2');
var sc = require('simplecrypt')();
var chalk = require('chalk');

var REMOTE = 1,
    SUDO = 2,
    LOCAL = 3,
    SUDO_LOCAL = 4, // needed?
    CLOSE = 5;

var Connection = function Connection(host, user, pass) {
  this.commands = [];
  this.log = [];
  this.streams = [];
  this.results = [];
  this.connect(host, user, pass);
};
// get or set password to use for sudo-ing
Connection.prototype.pw = function (password) {
  // Not crazy about keeping a password in memory
  // in plain text for many reasons (accidental dumps,
  // logs, virtual memory hitting disk, etc.).  To *slightly*
  // improve this, we encrypt decrypt with a random key.
  // Not perfect, but far better than the alternative.
  if (password) {
    this.digest = sc.encrypt(password);
  }
  return sc.decrypt(this.digest);
};
Connection.prototype.connect = function(host, user, pass, opts) {
    this.host = host;
    this.pass = this.pw(pass); // todo remove this as an attribute... scary for dumps
    opts = opts ? opts : {}; // todo merge with a default opts
    this.c = new SSH();
    this.c.on('connect', function() {
      console.log(chalk.grey('Connected to ' + host));
    });
    this.c.on('ready', function() {
      this._begin();
    }.bind(this));
    this.c.on('error', function(err) {
      // todo handling throw Error ?
    });
    this.c.on('end', function() {});
    this.c.on('close', function(err) {
      console.log(chalk.grey('Disconnected from ' + host));
    });

    // todo support key based auth
    this.c.connect({
      host: host,
      port: opts.port || 22,
      username: user,
      password: pass
    });
};
Connection.prototype._begin = function() {
  this.connected = true;
  this._call();
};
Connection.prototype.remote = function(cmd, callback) {
  this.commands.push([REMOTE, cmd, callback]);
};
Connection.prototype.sudo = function(cmd, callback) {
  this.commands.push([SUDO, cmd, callback]);
};
Connection.prototype.local = function(cmd, callback) {
  // this.commands.push([LOCAL, cmd, callback]); // todo denote a local call
};
Connection.prototype.close = function() {
  this.commands.push([CLOSE, null, false]);
};
Connection.prototype.closeImmediately = function() {
  this.c.end();
};
// Makes a call to the remote server
Connection.prototype._call = function() {
  var that = this; // yuck
  var cmd, type, cb;
  cmd = this.commands.shift(); // todo no mutating + add in streams

  if (!cmd) {
    return;
  }

  type = cmd[0];
  cb = cmd[2];
  cmd = cmd[1];

  if (type === CLOSE) {
    this.closeImmediately();
    return;
  }

  if (typeof cmd === 'function') {
    cmd = cmd(this);
  }

  that.log.push(cmd);
  this.c.exec(cmd, {pty: true}, function(err, stream) {
    if (err) throw err;
    var buffer = {err: '', out: ''};
    var pwSent = false, b = '';

    stream.on('data', function(data, extended) {
      output = data.toString();

      if (type === SUDO && !pwSent) {
        b += output;
        if (b.substr(-2) === ': ') {
          pwSent = true;
          stream.write(that.pw() + '\n');
          b = '';
          output = ''; // clear output
        }
      }

      buffer[extended === 'stderr' ? 'err' : 'out'] += output;
    });
    // stream.pipe(process.stdout);
    stream.on('end', function() {
        typeof cb === 'function' && cb.call(that, buffer.code !== 0, buffer, buffer.code);
        that.results.push(buffer);
        that._call();
    });
    stream.on('error', function() {
      // todo throw Error
      console.log('something went wrong');
    });
    stream.on('close', function() {
    });
    stream.on('exit', function(code, signal) {
        buffer.code = code;
    });
  });
};

module.exports = Connection;
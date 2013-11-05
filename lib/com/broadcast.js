// Broadcast.js
var Connection = require('./connection');

var Broadcast = function (servers, user, pass) {
  this.connections = [];
  this.servers = servers;
  servers.forEach(function(host) {
      this.connections.push(new Connection(host, user, pass));
      // todo test for successful connection, etc.
  }.bind(this));
};

Broadcast.prototype._each = function(cmd, method, callback) {
  this.connections.forEach(function(conn) {
    conn[method](cmd, callback);
  });
};

Broadcast.prototype.remote = function(cmd, callback) {
  this._each(cmd, 'remote', callback);
};

Broadcast.prototype.local = function(cmd, callback) {
  this._each(cmd, 'local', callback);
};

Broadcast.prototype.sudo = function(cmd, callback) {
  this._each(cmd, 'sudo', callback);
};

Broadcast.prototype.closeOnComplete = function() {
  this._each(undefined, 'close');
};

module.exports = Broadcast;
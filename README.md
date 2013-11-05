# Chatterbox

Chat with your boxes.  Node.js library for working with and deploying to remote servers.

## Example

```javascript
var chatterbox = require('chatterbox');

var servers = [
    '10.1.10.100',
    '10.1.10.101'
];

chatterbox(servers, {user: true, password: true}, function() {
    this.remote('uptime', chatterbox.print);
    this.remote('whoami', chatterbox.print);
    this.sudo('sudo whoami', chatterbox.print);
});
```

## API

## TODO

 - Better support for other ssh auth options
 - Local support
 - Better sudo support
 - Possibility of shell stuff like `cd`
 - Functions for commands
 - Better logging support
 - Better support for managing the connection status of servers

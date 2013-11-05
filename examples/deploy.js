var chatterbox = require('../lib/chatterbox');

var roles = {
    loadbalancers: [
        '10.1.10.100',
        '10.1.10.101'
    ]
};

chatterbox(roles.loadbalancers, {user: true, password: true}, function() {
    this.remote('uptime', chatterbox.print);
    this.remote('whoami', chatterbox.print);
    this.sudo('sudo whoami', chatterbox.print);
});
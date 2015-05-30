var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var check = require('./check');

var ImapQuery = function(config, criteria){
    var self = this;
    self._config = _.assign({}, ImapQuery.defaults, config);
    self._box = self._config.box || "INBOX";
    delete self._config.box;
    self._debug = self._config.debug || 0;
    self._config.debug = function(data){
        self._log(2, 'Imap: ', data);
    };
    self._criteria = _.clone(criteria, true);
    self._messages = {};
};
ImapQuery.defaults = {
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    keepalive: false
};
ImapQuery.prototype = _.create(EventEmitter.prototype);
ImapQuery.prototype.messages = function(){
    var self = this;
    return _.clone(self._messages);
};
ImapQuery.prototype.check = function(){
    var self = this;
    if (!self._check){
        self._check = check(self);
        var clear = function(){delete self._check};
        self._check.then(clear, clear);
    }
    return self._check;
};
ImapQuery.prototype._log = function(level, text){
    var self = this;
    if (self._debug >= level){
        console.log.apply(console, ['ImapQuery: '+text, Array.prototype.slice.call(arguments, 2)]);
    }
};

module.exports = ImapQuery;
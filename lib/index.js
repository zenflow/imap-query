var events = require('events');
var util = require('util');
var Imap = require('imap');
var findWhere = require('./util/findWhere');
var fetchEmail = require('./util/fetchEmail');

var ImapQuery = function(mailbox, criteria){
    var self = this;
    self._account = mailbox;
    self._criteria = criteria;
    self._messages = [];
};

util.inherits(ImapQuery, events.EventEmitter);

ImapQuery.prototype.messages = function(){
    return this._messages.slice();
};

ImapQuery.prototype.check = function(cb){
    var self = this;
    var imap = new Imap({
        host: self._account.host,
        port: self._account.port,
        user: self._account.user,
        password: self._account.pass,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    });
    var returned = false;
    var _cb = function(error, result){
        if (returned){return;}
        returned = true;
        imap.end();
        if (typeof cb=='function'){
            cb.apply(null, arguments);
        }
    };
    imap.once('ready', function(){
        imap.openBox(self._account.box, true, function(error, box){
            if (error){return cb(error);}
            imap.search(self._criteria, function(error, uids){
                //console.log('imap.search (error, uids)', error, uids);
                if (error){return _cb(error);}
                var old_messages = self._messages.filter(function(message){
                    return uids.indexOf(message.uid)==-1;
                });
                var new_uids = uids.filter(function(uid){
                    return !findWhere(self._messages, {uid: uid});
                });
                fetchEmail(imap, new_uids, function(error, new_messages){
                    if (error){return _cb(error);}
                    old_messages.forEach(function(message){
                        self._messages.splice(self._messages.indexOf(message), 1);
                        self.emit('delete', message);
                    });
                    new_messages.forEach(function(message){
                        self._messages.push(message);
                        self.emit('add', message);
                    });
                    _cb(null, (old_messages.length>0)||(new_messages.length>0));
                });
            });
        });
    });
    imap.once('error', function(error) {
        _cb(error);
    });
    imap.connect();
};

module.exports = ImapQuery;
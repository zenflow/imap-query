var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var Imap = require('imap');
var imapFetch = require('./util/imapFetch');
var check = function (self){
    return new Promise(function(resolve, reject){
        var imap = new Imap(self._config);
        imap.once('ready', function(){
            imap.openBox(self._box, function (error, box) {
                if (error){return reject(error);}
                imap.search(self._criteria, function(error, uids){
                    if (error){return reject(error);}
                    var current_uids = _.keys(self._messages);
                    var new_uids = _.difference(uids, current_uids);
                    var old_uids = _.difference(current_uids, uids);
                    imapFetch(imap, new_uids, function(error, new_messages){
                        imap.end();

                        if (error){return reject(error);}
                        var old_messages = {};
                        _.forEach(old_uids, function(uid){
                            old_messages[uid] = self._messages[uid];
                            delete self._messages[uid];
                        });
                        _.assign(self._messages, new_messages);

                        var changes = null;
                        if (new_uids.length || old_uids.length){
                            changes = {};
                            if (old_uids.length){changes.old_messages = old_messages;}
                            if (new_uids.length){changes.new_messages = new_messages;}
                        }
                        self.emit('changes', changes);
                        resolve(changes);
                    });
                });
            })
        });
        imap.once('error', reject);
        imap.connect();
    });
};
module.exports = check;
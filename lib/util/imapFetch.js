var _ = require('lodash');
var Imap_parseHeader = require('imap').parseHeader;
var streamToString = require('./streamToString');
var parseMessage = require('./parseMessage');
function imapFetch(imap, uids, cb){
    if (!uids.length){
        process.nextTick(function(){
            cb(null, {});
        });
        return;
    }
    var result = {};
    var returned = false;
    var _cb = function(){
        if (!returned){
            returned = true;
            cb.apply(null, arguments);
        }
    };
    var fetch = imap.fetch(uids, {bodies: ['HEADER', 'TEXT']});
    fetch.on('message', function(message){
        var uid, header, text;
        message.on('attributes', function(attributes){
            uid = attributes.uid;
        });
        message.on('body', function(body_stream, body_info){
            streamToString(body_stream, function(error, string){
                if (error){return _cb(error);}
                switch (body_info.which){
                    case 'HEADER': header = Imap_parseHeader(string); break;
                    case 'TEXT': text = string; break;
                    default: _cb(new Error('did not recognize body type'));
                }
            });
        });
        message.on('end', function(){
            if (!uid || !header || !text){return _cb(new Error('did not read one or more of uid header or text'));}
            var error = null;
            try {result[uid] = parseMessage(uid, header, text);}
            catch (_error) {error = _error}
            if (error) {_cb(error);}
        });
    });
    fetch.once('error', _cb);
    fetch.once('end', function(){
        if (_.keys(result).length != uids.length){return _cb(new Error('did not read right number of messages'))}
        _cb(null, result);
    });
}
module.exports = imapFetch;
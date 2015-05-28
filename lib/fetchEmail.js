var Imap_parseHeader = require('imap').parseHeader;
var streamToString = require('./util/streamToString');
var parseEmail = require('./util/parseEmail');

var body_names = ['HEADER'/*.FIELDS (FROM TO SUBJECT DATE CONTENT-TYPE CONTENT-TRANSFER-ENCODING CONTENT-DISPOSITION)'*/, 'TEXT'];
var fetchEmail = function(imap, uids, cb){
    var result = [];
    var returned = false;
    var _cb = function(error){
        if (returned){return;}
        if (error){
            returned = true;
            return cb(error);
        }
        if (result.length==uids.length){
            returned = true;
            return cb(null, result)
        }
    };

    var fetch = imap.fetch(uids, {
        bodies: body_names
    });
    fetch.on('message', function(message){
        var uid = null;
        var header = null;
        var text = null;
        message.on('attributes', function(attributes){
            uid = attributes.uid;
        });
        message.on('body', function(body_stream, body_info) {
            var body_index = body_names.indexOf(body_info.which);
            if (body_index==-1){
                return _cb(new Error('ImapQuery: Unknown email body "'+body_info.which+'"'));
            }
            streamToString(body_stream, function(error, body_string){
                if (error){return _cb(error);}
                switch (body_index){
                    case 0: header = Imap_parseHeader(body_string); break;
                    case 1: text = body_string; break;
                }
            });
        });
        message.on('end', function(){
            if (!uid || !header || !text){
                return _cb(new Error('ImapQuery: premature end of message'));
            }

            var params = {};
            ['Content-Type', 'Content-Transfer-Encoding', 'Content-Disposition'].forEach(function(param_key){
                var key = param_key.toLowerCase();
                if (key in header){
                    params[param_key] = header[key][0];
                }
            });

            var body = null;
            try {body = parseEmail(text, params);}
            catch (error) {return _cb(error);}

            var email_text = null;
            var email_html = null;
            var attachments = [];

            var search_part = function(part){
                if (part.parts){
                    part.parts.forEach(search_part);
                } else {
                    switch(part.type.split('; ')[0]){
                        case 'text/plain':
                            if (!email_text){
                                email_text = part.content;
                            }
                            break;
                        case 'text/html':
                            if (!email_html){
                                email_html = part.content;
                            }
                            break;
                    }
                    if (part.disposition && (part.disposition.split(';')[0]=='attachment')){
                        attachments.push(part);
                    }
                }
            };
            search_part(body);

            result.push({
                uid: uid,
                from: header.from[0],
                to: header.to,
                subject: header.subject[0],
                date: header.date[0],
                text: email_text,
                html: email_html,
                attachments: attachments
            });

            _cb(null);
        });
    });
    fetch.once('error', function(error) {
        _cb(error);
    });
};

module.exports = fetchEmail;
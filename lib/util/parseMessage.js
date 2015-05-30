var _ = require('lodash');
var mimelib = require('mimelib');

function parseMessage(uid, header, text){
    var params = {};
    _.forEach(['Content-Type', 'Content-Transfer-Encoding', 'Content-Disposition'], function(param_key){
        var lower_case_key = param_key.toLowerCase();
        if (header[lower_case_key]){
            params[param_key] = header[lower_case_key][0];
        }
    });
    var body = parse(text, params);

    var plaintext = '';
    var html = '';
    var attachments = [];
    var search_part = function(part){
        if (part.parts){
            part.parts.forEach(search_part);
        } else {
            switch(part.type.split('; ')[0]){
                case 'text/plain':
                    if (!plaintext){
                        plaintext = part.content;
                    }
                    break;
                case 'text/html':
                    if (!html){
                        html = part.content;
                    }
                    break;
            }
            if (part.disposition && (part.disposition.split(';')[0]=='attachment')){
                attachments.push(part);
            }
        }
    };
    search_part(body);
    return {
        uid: uid,
        from: header.from[0],
        to: header.to[0],
        subject: header.subject[0],
        plaintext: plaintext,
        html: html,
        attachments: attachments
    };
}

function parse(text, params){
    var type = params['Content-Type'];
    if (type.split('/')[0]=='multipart'){
        var separator = trimStrByChar(type.split('=').slice(-1)[0], '"');
        var parts = text.split('--'+separator).slice(1,-1).map(function(part_string){
            part_string = part_string.trim();

            var sep_start = part_string.indexOf('\r\n\r\n');
            var sep_end = sep_start + 4;
            var params_string = part_string.substr(0, sep_start);
            var content_string = part_string.substr(sep_end);

            var params = {};
            var key = null;
            params_string.split('\r\n').forEach(function(line){
                if (line.substr(0, 1)=='\t'){
                    params[key] += ' ' + line.substr(1);
                } else {
                    var parts = line.split(': ');
                    key = parts[0];
                    params[key] = parts[1];
                }
            });

            return parse(content_string, params);
        });
        return {
            type: type,
            parts: parts
        };

    } else {
        var content = null;
        switch(params['Content-Transfer-Encoding']){
            case 'quoted-printable': content = mimelib.decodeQuotedPrintable(text); break;
            case '7bit': content = text; break;
            default: content = 'Unsupported Content-Transfer-Encoding "'+params['Content-Transfer-Encoding']+'". Nudge zenflow87@hotmail.com to add this.';
        }
        var disposition = params['Content-Disposition'];
        return {
            type: type,
            content: content,
            disposition: disposition
        };
    }
}

function trimStrByChar(str, char){
    for (var start = 0; (str[start]==char) && (start < str.length); start++){}
    for (var end = start; (str[end]!=char) && (end < str.length); end++){}
    return str.substring(start, end);
}

module.exports = parseMessage;
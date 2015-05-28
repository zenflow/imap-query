var mimelib = require('mimelib');
var trimStrByChar = function (str, char){
    for (var start = 0; str[start]==char; start++){}
    for (var end = start; str[end]!=char; end++){}
    return str.substring(start, end);
};
var parseEmail = function(text, params){
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

            return parseEmail(content_string, params);
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
};

module.exports = parseEmail;
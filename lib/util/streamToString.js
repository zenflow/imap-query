var Readable = require('stream').Readable;
var Buffer = require('buffer').Buffer;

var streamToString = function(stream, cb){
    if (!(stream instanceof Readable)){
        throw new Error('input stream must be instance of stream.Readable');
    }
    var returned = false;
    var _cb = function(error, result){
        if (returned){return;}
        returned = true;
        cb.apply(null, arguments);
    };
    var strings = [];
    stream.on('data', function (chunk) {
        if (!(chunk instanceof Buffer)){
            return _cb(new Error('chunk is not a buffer'))
        }
        strings.push(chunk.toString('utf8'));
    });
    stream.once('end', function() {
        _cb(null, strings.join(''));
    });
};
module.exports = streamToString;
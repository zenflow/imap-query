var trimStrByChar = function (str, char){
    for (var start = 0; str[start]==char; start++){}
    for (var end = start; str[end]!=char; end++){}
    return str.substring(start, end);
};
module.exports = trimStrByChar;
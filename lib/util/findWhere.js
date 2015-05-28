var findWhere = function(list, properties){
    for (var i = 0; i < list.length; i++){
        var is_match = true;
        for (var key in properties){
            if (list[i][key]!=properties[key]){
                is_match = false;
                break;
            }
        }
        if (is_match){
            return list[i];
        }
    }
    return undefined;
};
module.exports = findWhere;
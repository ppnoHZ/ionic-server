/**
 * Created by Administrator on 2015/11/5.
 */

categoryParam = {
    COAL_SULFUR_HIGH: {
        v1 : 0,
        v2 : 0,
        v3 : 0,
        v4 : 0,
        v5 : 0,
        v6 : 0
    },
    COAL_COKE: {
        v1 : 1,
        v2 : 1,
        v3 : 1,
        v4 : 1,
        v5 : 1,
        v6 : 1
    },
    COAL_SMOKE: {
        v1 : 2,
        v2 : 2,
        v3 : 2,
        v4 : 2,
        v5 : 2,
        v6 : 2
    },
    COAL_SMOKE_NO: {
        v1 : 3,
        v2 : 3,
        v3 : 3,
        v4 : 3,
        v5 : 3,
        v6 : 3
    }
};

categoryParam.create = function(type, obj){
    var data = _.clone(categoryParam[type]); //货物参数描述
    for(var key in data){
        if(obj[key]){
            data[key] = obj[key];
        }
    }
    return data;
};

categoryParam.edit = function(type, oldData, newData){
    for(var key in categoryParam[type]){
        if(newData[key]){
            oldData[key] = newData[key];
        }
    }
    return oldData;
};
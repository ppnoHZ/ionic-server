/**
 * Created by Administrator on 2015/11/5.
 */
var jwt = Npm.require('jwt-simple');
token = {};
token.encode = function (obj, secret) {
    return jwt.encode(obj, secret);
};
token.decode = function (token, secret) {
    try{
        return jwt.decode(token, secret);
    }catch(err){
        return null;
    }
};
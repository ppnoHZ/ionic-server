/**
 * Created by Administrator on 2015/11/16.
 */
var config_server = require('../configs/config_server');
module.exports = function(){
    return function(req, res, next){
        if(config_server.env == 'dev'){
            console.log('==========================receive=========================');
            console.log('req.body');
            console.log(JSON.stringify(req.body));
            next();
        }else{
            next();
        }
    }
};
/**
 * Created by Administrator on 2015/11/16.
 */
var config_server = require('../configs/config_server');

module.exports = function(){
    return function (err, req, res, next){
        var data;
        if(err == 'success'){
            if(config_server.env == 'dev'){
                data = ({status: 'success', data: req.result});
            }else{
                data = ({status: 'success', data: req.result});
            }
        }else{
            if(config_server.env == 'dev'){
                data = ({status: 'err', msg: err});
            }else{
                data = ({status: 'err'});
            }
        }
        console.log('===========================send===========================');
        console.log(data);
        res.send(data);
    }
};
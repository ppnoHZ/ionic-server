/**
 * Created by ZHR on 2015/11/26 0026.
 */
var jwt = require('jsonwebtoken');
var config_common = require('./config_common');

module.exports =
{
    verifyUser:function(req,res,next)
    {
        var token = req.headers['x-access-token'];
        if(token)
        {
            jwt.verify(token, config_common.secret_keys.user, function(err, decoded)
            {
                if(err)
                {
                    return res.send({status:'auth_failed'});
                }
                req.decoded = decoded;
                next();
            });
        } else
        {
            res.send({status:'no_token'});
        }
    },
    sendData:function(res,status,result)
    {
        res_obj = {status:status};
        if(status === 'err')
        {
            if(config_common.status === 'dev')
            {
                res_obj.data = result;
            }
        }
        else
        {
            res_obj.data = result;
        }
        res.setHeader('x-powered-by','Chris Brosnan');
        res.send(res_obj);
    },
    sendSMS:function(res,result)
    {
        // TODO: 向SMS服务器发出申请，并且接受返回值
        result.msg = 'Still in development, not on line now.';
        res.send({status:'success',data:result});
    }
};
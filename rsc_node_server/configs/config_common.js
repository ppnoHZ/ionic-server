/**
 * Created by Administrator on 2015/11/6 0006.
 */
module.exports =
{
    db:'mongodb://root:root123456@ds049864.mongolab.com:49864/rsc',
    status:'dev',

    checkCommonString:function(input)
    {
        var reg = /^[\s\S]{2,40}$/;
        return reg.test(input);
    },

    checkPassword:function(input)
    {
        var reg = /^[a-zA-Z0-9]{6,16}$/;
        return reg.test(input);
    },

    checkRealName:function(input)
    {
        var reg = /^$[a-zA-Z\u4e00-\u9fa5\s]{2,40}/;
        return reg.test(input);
    },

    checkPhone:function(input)
    {
        var reg = /^(13[0-9]{9})|(15[0-9]{9})|(17[0-9]{9})|(18[012356789][0-9]{8})$/;
        return reg.test(input);
    },

    verify_codes : ['0','1','2','3','4','5','6','7','8','9','0'],
    secret_keys:
    {
        user:'saephnmlkj4l2d9ofjlkjsdfjlkjSLDKJLjlejJDLFlklw'
    },

    user_roles :
    {
        'TRADE_ADMIN':'TRADE_ADMIN',
        'TRADE_PURCHASE':'TRADE_PURCHASE',
        'TRADE_SALE':'TRADE_SALE',
        'TRADE_MANUFACTURE':'TRADE_MANUFACTURE',
        'TRADE_FINANCE':'TRADE_FINANCE',
        'TRAFFIC_ADMIN':'TRAFFIC_ADMIN',
        'TRAFFIC_DRIVER':'TRAFFIC_DRIVER'
    },

    company_category:
    {
        'TRADE':'TRADE',
        'TRAFFIC':'TRAFFIC'
    },

    verification_phase:
    {
        'NO':'NO',
        'PROCESSING':'PROCESSING',
        'SUCCESS':'SUCCESS',
        'FAILED':'FAILED'
    }
};
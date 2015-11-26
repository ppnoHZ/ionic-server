/**
 * Created by Administrator on 2015/11/16 0016.
 */
module.exports =
{
    status:'dev',
    db:'mongodb://root:root123456@ds049864.mongolab.com:49864/rsc',
    entry_per_page:10,
    secret_keys:
    {
        user:'user',
        invite:'invite'
    },
    user_roles : {
        'TRADE_ADMIN':'TRADE_ADMIN',
        'TRADE_PURCHASE':'TRADE_PURCHASE',
        'TRADE_SALE':'TRADE_SALE',
        'TRADE_MANUFACTURE':'TRADE_MANUFACTURE',
        'TRADE_FINANCE':'TRADE_FINANCE',
        'TRADE_STORAGE':'TRADE_STORAGE',
        'TRAFFIC_ADMIN':'TRAFFIC_ADMIN',
        'TRAFFIC_DRIVER':'TRAFFIC_DRIVER'
    },
    company_category:
    {
        'TRADE':'TRADE',
        'TRAFFIC':'TRAFFIC'
    },

    checkDateString :function(input)
    {
        var reg = /^20[1-9][0-9]\/((0[1-9])|(1[0-2]))\/((0[1-9])|([1-2][0-9])|(3[0-1]))$/;
        return reg.test(input);
    },

    checkCommonString : function(input)
    {
        var reg = /^[\s\S]{2,40}$/;
        return reg.test(input);
    },

    checkCommonArray : function(input)
    {
        var total_count = 0;
        var item_count = 0;
        for(var index in input)
        {
            item_count = 0;
            for(var sub_index in input[index])
            {
                item_count += 1;
                if(item_count > 5)
                {
                    return false;
                }
            }
            total_count += 1;
            if(total_count > 40)
            {
                return false;
            }
        }
        return true;
    },

    payment_style:
    {
        'CIF':{eng:'CIF',chn:'到岸价'},
        'FOB':{eng:'FOB',chn:'出厂价'}
    },
    payment_choice:
    {
        url:{eng:'url',chn:'使用凭证'},
        credit:{eng:'credit',chn:'使用信用额'}
    },
    order_status:
    {
        'ineffective':{eng:'ineffective',chn:'未生效'},
        'effective':{eng:'effective',chn:'已生效'},
        'complete':{eng:'complete',chn:'完成'},
        'cancelled':{eng:'cancelled',chn:'取消'}
    },
    goods:
    {
        'coal':
        {
            eng:'coal',
            chn:'煤炭',
            desc:
            {
                'c_001':'标准：#%',
                'c_002':'标准：#%'
            },
            att_product:
            {
                'c_001':'根据标准为：#%。低于标准#%,金额扣除#元。',
                'c_002':'根据标准为：#%。低于标准#%,金额扣除#元。'
            },
            att_traffic:
            {
                'c_001':'货物少#吨，扣除#元。'
            }
        }
    }
};
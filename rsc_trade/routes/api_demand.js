/**
 * Created by Administrator on 2015/11/25 0025.
 */
var jwt = require('jsonwebtoken');
var Demand = require('../models/Demand');
var DemandOffer = require('../models/DemandOffer');
var DemandOrder = require('../models/DemandOrder');
var config_common = require('../configs/config_common');
var mw = require('../configs/middleware');

function createToken(user)
{
    var token = jwt.sign(
        {
            id:user.id,
            company_id :user.company_id,
            role:user.role,
            real_name:user.real_name,
            company_name:user.company_name
        },
        config_common.secret_keys.user,
        {
            expiresIn: 60 *60 * 24 *7
        }
    );
    return token;
}

module.exports = function(app,express)
{
    var api = express.Router();

    // 获得token的测试路由，仅供测试使用
    api.post('/token',function(req,res)
    {
        if(config_common.status !== 'dev')
        {
            return mw.sendData(res,'not_authorized',null);
        }
        if(req.body.id === undefined || req.body.company_id === undefined || req.body.role === undefined
        || req.body.real_name === undefined || req.body.company_name === undefined)
        {
            return mw.sendData(res,'invalid_input',null);
        }

        var user =
        {
            id: req.body.id,
            company_id:req.body.company_id,
            role:req.body.role,
            real_name : req.body.real_name,
            company_name: req.body.company_name
        };

        var token = createToken(user);
        mw.sendData(res,'success',{token:token});
    });

    // 测试日期
    api.post('/test_date',function(req,res)
    {
        if(!config_common.checkDateString(req.body.s_time))
        {
            return res.send({status:'invalid_format'});
        }
        var date = new Date(req.body.s_time);
        res.send({status:'success',date:date,str:req.body.s_time});
    });

    api.use(function(req,res,next)
    {
        mw.verifyUser(req,res,next);
    });

    // 测试解析TOKEN后的数据
    api.get('/verify_token',function(req,res)
    {
        mw.sendData(res,'success',req.decoded)
    });

    // 获得某类型的挂单列表
    api.get('/demand_list/:category/:order/:page',function(req,res)
    {
        var page_num = parseInt(req.params.page);
        if(isNaN(page_num) || page_num <= 0)
        {
            return mw.sendData(res,'invalid_format',null);
        }

        // 权限检查
        if(req.decoded.role == config_common.user_roles.TRADE_FINANCE || req.decoded.role == config_common.user_roles.TRADE_MANUFACTURE ||
            req.decoded.role == config_common.user_roles.TRADE_STORAGE || req.decoded.role == config_common.user_roles.TRAFFIC_ADMIN ||
            req.decoded.role == config_common.user_roles.TRAFFIC_DRIVER)
        {
            return mw.sendData(res,'not_allow',null);
        }
        var order_obj = {};
        switch(req.params.order)
        {
            case 'date':
            {
                order_obj = {'time_creation':-1};
                break;
            }
            case 'amount':
            {
                order_obj = {'amount':-1};
                break;
            }
            default:
            {
                order_obj = {'time_creation':-1};
                break;
            }
        }
        var query = {};
        if(req.params.category !== 'all')
        {
            query.category = req.params.category;
        }
        Demand.find(query)
            .sort(order_obj)
            .skip((page_num - 1) * config_common.entry_per_page).limit(config_common.entry_per_page)
            .exec(function(err,list)
            {
                if(err)
                {
                    return mw.sendData(res,'err', {err:err});
                }
                mw.sendData(res,'success',list);
            });
    });

    //  查看采购挂单详细内容
    api.get('/demand_detail/:id',function(req,res)
    {
        // 权限检查
        if(req.decoded.role == config_common.user_roles.TRADE_FINANCE || req.decoded.role == config_common.user_roles.TRADE_MANUFACTURE ||
           req.decoded.role == config_common.user_roles.TRADE_STORAGE || req.decoded.role == config_common.user_roles.TRAFFIC_ADMIN ||
           req.decoded.role == config_common.user_roles.TRAFFIC_DRIVER)
        {
            return mw.sendData(res,'not_allow',null);
        }
        Demand.findById(req.params.id,function(err,entry)
        {
            if(err)
            {
                return mw.sendData(res,'err',{err:err});
            }

            if(entry)   // 找到单据
            {
                // 判断当前查看人是否发布挂单单据的人,或者发布单据的公司的管理员，如果不是，所有挂单下的抢单均匿名显示。
                var anonymous = !((req.decoded.id === entry.user_id) || (req.decoded.role == 'TRADE_ADMIN' && req.decoded.company_id === entry.company_id));
                mw.sendData(res,'success',{entry:entry,anonymouse:anonymous})
            }
            else    // 未找到单据
            {
                mw.sendData(res,'not_found',null)
            }
        });
    });

    // 查看自己发布或自己公司发布的采购挂单列表
    api.get('/demand_list_self/:entity/:status/:page',function(req,res)
    {
        var page_num = parseInt(req.params.page);
        if(isNaN(page_num) || page_num <= 0)
        {
            return mw.sendData(res,'invalid_format',null);
        }
        var query = {};
        if(req.params.entity == 'self')
        {
            query.user_id = req.decoded.id;
        }
        else
        {
            if(req.decoded.role != config_common.user_roles.TRADE_ADMIN)
            {
                return mw.sendData(res,'not_allow',null)
            }
            query.company_id = req.decoded.company_id;
        }
        query = {user_id:req.decoded.id};
        switch(req.params.status.toLowerCase())
        {
            case 'valid':
            {
                query.validity = true;
                break;
            }
            case 'invalid':
            {
                query.validity = false;
                break;
            }
            default:
            {
                break;
            }
        }
        Demand.find(query).sort({time_creation:-1})
            .skip((page_num - 1) * config_common.entry_per_page).limit(config_common.entry_per_page)
            .exec(function(err,list)
            {
                if(err)
                {
                    return mw.sendData(res,'err',{err:err});
                }
                mw.sendData(res,'success',list);
            });
    });

    // 生成采购挂单
    api.post('/demand_new',function(req,res)
    {
        if(req.decoded.role == config_common.user_roles.TRADE_ADMIN || req.decoded.role == config_common.user_roles.TRADE_SALE)
        {
            var amount = parseFloat(req.body.amount);
            var payment_advance = parseFloat(req.body.payment_advance);
            // 判断输入是否有效
            if(config_common.payment_style[req.body.payment_style] === undefined || config_common.goods[req.body.category] === undefined ||
            isNaN(amount)|| isNaN(payment_advance) || !config_common.checkCommonString(req.body.location) || req.body.can_join === undefined ||
                    !config_common.checkDateString(req.body.time_traffic) || !config_common.checkDateString(req.body.time_validity) ||
                !config_common.checkCommonArray(req.body.desc) || !config_common.checkCommonArray(req.body.att_product) ||
                !config_common.checkCommonArray(req.body.att_traffic))
            {
                return mw.sendData(res,'invalid_format',null)
            }

            // 生成新的数据并存储
            var demand_entry = new Demand(
                {
                    user_id :req.decoded.id,
                    company_id : req.decoded.company_id,
                    company_name:req.decoded.company_name,
                    category : config_common.goods[req.body.category].eng,
                    category_chn:config_common.goods[req.body.category].chn,
                    amount:amount,
                    desc:req.body.desc,
                    time_traffic: new Date(req.body.time_traffic),
                    location_storage:req.body.location,
                    payment_advance:payment_advance,
                    payment_style: config_common.payment_style[req.body.payment_style].eng,
                    validity:true,
                    time_validity: new Date(req.body.time_validity),
                    can_join : req.body.can_join,
                    att_product: req.body.att_product,
                    att_traffic:req.body.att_traffic,
                    att_liability:req.body.att_liability,
                    time_creation:Date.now()
                }
            );

            demand_entry.save(function(err)
            {
                if(err)
                {
                    return mw.sendData(res,'err',{err:err});
                }
                mw.sendData(res,'success',{id:demand_entry._id})
            });
        }
        else
        {
            mw.sendData(res,'not_allow',null);
        }
    });

    // 获得某采购挂单的抢单数据，以价格升序排序
    api.get('/demand_offer_list/:id/:page',function(req,res)
    {
        // 权限检查
        if(req.decoded.role == config_common.user_roles.TRADE_FINANCE || req.decoded.role == config_common.user_roles.TRADE_MANUFACTURE ||
            req.decoded.role == config_common.user_roles.TRADE_STORAGE || req.decoded.role == config_common.user_roles.TRAFFIC_ADMIN ||
            req.decoded.role == config_common.user_roles.TRAFFIC_DRIVER)
        {
            return mw.sendData(res,'not_allow',null);
        }

        var page_num = parseInt(req.params.page);
        if(isNaN(page_num) || page_num <= 0)
        {
            return mw.sendData(res,'invalid_format',null);
        }
        DemandOffer.find({demand_id:req.params.id})
            .sort({price:1})
            .skip((page_num - 1) * config_common.entry_per_page).limit(config_common.entry_per_page)
            .exec(function(err,list)
            {
                if(err)
                {
                    return mw.sendData(res,'err', {err:err});
                }
                mw.sendData(res,'success',list);
            });
    });

    // 查看采购抢单详细内容
    //api.get('/demand_offer_detail/:id',function(req,res)
    //{
    //    DemandOffer.findById(req.params.id,function(err,entry)
    //    {
    //        if(err)
    //        {
    //            return mw.sendData(res,'err',{err:err});
    //        }
    //        if(entry)
    //        {
    //            var auth = false;
    //            if(req.decoded.id == entry.user_id || req.decoded.id == entry.demand_user_id)
    //            {
    //                auth = true;
    //            }
    //            else if(req.decoded.role == config_common.user_roles.TRADE_ADMIN && (req.decoded.company_id == entry.company_id || req.decoded.company_id == entry.demand_company_id))
    //            {
    //                auth = true;
    //            }
    //
    //            if(auth)
    //            {
    //                mw.sendData(res,'success',{entry:entry});
    //            }
    //            else
    //            {
    //                mw.sendData(res,'not_allow',null);
    //            }
    //        }
    //        else
    //        {
    //            mw.send(res,'not_found',null);
    //        }
    //    });
    //});

    // 查看自己或本公司发过的所有抢单内容
    api.get('/demand_offer_self/:entity/:target/:page',function(req,res)
    {
        var page_num = parseInt(req.params.page);
        if(isNaN(page_num) || page_num <= 0)
        {
            return mw.sendData(res,'invalid_format',null);
        }

        var query = {};
        if(req.params.entity == 'self')
        {
            query.user_id = req.decoded.id;
        }
        else
        {
            if(req.decoded.role != config_common.user_roles.TRADE_ADMIN)
            {
                return mw.sendData(res,'not_allow',null)
            }
            query.company_id = req.decoded.company_id;
        }

        if(req.params.target != 'all')
        {
            query.demand_id = req.params.target;
        }

        DemandOffer.find(query).sort({time_creation:-1})
            .skip((page_num-1)*config_common.entry_per_page).limit(config_common.entry_per_page)
            .exec(function(err,list)
            {
                if(err)
                {
                    return mw.sendData(res,'err',{err:err});
                }
                mw.sendData(res,'success',list);
            });
    });

    // 针对某个采购单发起抢单
    api.post('/demand_offer_new/:target',function(req,res)
    {
        if(req.decoded.role == config_common.user_roles.TRADE_ADMIN || req.decoded.role == config_common.user_roles.TRADE_PURCHASE)
        {
            Demand.findById(req.params.target,function(err,entry)
            {
                if(err)
                {
                    return mw.sendData(res,'err',{err:err})
                }
                if(entry)
                {
                    // TODO: 等待加入新建抢单功能
                }
                else
                {
                    mw.sendData(res,'not_found',null);
                }
            });
        }
        else
        {
            mw.sendData(res,'not_allow',null);
        }
    });



    return api;
};
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

    // 获得token的测试路由，仅供####测试####使用
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

    // ####测试####日期
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

    // ####测试#### 解析TOKEN后的数据
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
    api.get('/offer_list/:id/:page',function(req,res)
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
    api.get('/offer_detail/:id',function(req,res)
    {
        DemandOffer.findById(req.params.id,function(err,entry)
        {
            if(err)
            {
                return mw.sendData(res,'err',{err:err});
            }
            if(entry)
            {
                var auth = false;
                if(req.decoded.id == entry.user_id || req.decoded.id == entry.demand_user_id)
                {
                    auth = true;
                }
                else if(req.decoded.role == config_common.user_roles.TRADE_ADMIN && (req.decoded.company_id == entry.company_id || req.decoded.company_id == entry.demand_company_id))
                {
                    auth = true;
                }

                if(auth)
                {
                    mw.sendData(res,'success',{entry:entry});
                }
                else
                {
                    mw.sendData(res,'not_allow',null);
                }
            }
            else
            {
                mw.send(res,'not_found',null);
            }
        });
    });

    // 查看自己或本公司发过的所有抢单内容
    api.get('/offer_self/:entity/:target/:page',function(req,res)
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

    // 修改抢单数据
    api.post('/offer_edit/:id',function(req,res)
    {
        if(req.decoded.role == config_common.user_roles.TRADE_ADMIN || req.decoded.role == config_common.user_roles.TRADE_PURCHASE)
        {
            DemandOffer.findById(req.params.id,function(err,entry)
            {
                if(err)
                {
                    return mw.sendData(res,'err',{err:err});
                }
                if(entry)
                {
                    // 确认修改权限，以及是否已经修改过3次。
                    if((req.decoded.role == config_common.user_roles.TRADE_ADMIN && req.decoded.company_id != entry.company_id) ||
                        (req.decoded.role == config_common.user_roles.TRADE_PURCHASE && req.decoded.id != entry.user_id) ||
                        entry.change_remain <= 0)
                    {
                        return mw.sendData(res,'not_allow',null);
                    }

                    // 确认修改的项目并进行存储
                    if(req.body.price)
                    {
                        var price = parseFloat(req.body.price);
                        if(!isNaN(price))
                        {
                            entry.price = price;
                        }
                    }
                    if(req.body.amount)
                    {
                        var amount = parseFloat(req.body.amount);
                        if(!isNaN(amount))
                        {
                            entry.amount = amount;
                        }
                    }
                    if(req.body.payment_advance)
                    {
                        var payment_advance = parseFloat(req.body.payment_advance);
                        if(!isNaN(payment_advance) && payment_advance >=0 && payment_advance <= 100)
                        {
                            entry.payment_advance = payment_advance;
                        }
                    }
                    if(req.body.time_transaction && config_common.checkDateString(req.body.time_transaction))
                    {
                        entry.time_transaction = new Date(req.body.time_transaction);
                        entry.markModified('time_transaction');
                    }

                    entry.change_remain -= 1;

                    entry.save(function(err)
                    {
                        if(err)
                        {
                            return mw.sendData(res,'err',{err:err});
                        }
                        mw.sendData(res,'success', {offer_id:entry._id,demand_id:entry.demand_id});
                    });
                }
                else
                {
                    return mw.sendData(res,'not_found',null);
                }
            });
        }
        else
        {
            mw.sendData(res,'not_allow',null);
        }
    });

    // 针对某个采购单发起抢单
    api.post('/offer_new/:target',function(req,res)
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
                    // 检验抢单发起方的公司ID与采购单的公司ID是否相同
                    // 相同的话不能发起采购单
                    if(req.decoded.company_id == entry.company_id)
                    {
                        return mw.sendData(res,'not_allow',null);
                    }

                    // 各项信息VALIDATY检查
                    var price = parseFloat(req.body.price);
                    var amount = parseFloat(req.body.amount);
                    var payment_advance = parseFloat(req.body.payment_advance);

                    if(isNaN(price) || isNaN(amount) || (isNaN(payment_advance)&& payment_advance >=0 && payment_advance <= 100) ||
                        !config_common.checkDateString(req.body.time_transaction) ||
                        !config_common.checkCommonString(req.body.location_storage))
                    {
                        return mw.sendData(res,'invalid_format',null);
                    }

                    // 生成新的OFFER数据对象并存储
                    var entry_offer = new DemandOffer(
                        {
                            user_id :req.decoded.id,
                            company_id : req.decoded.company_id,
                            company_name:req.decoded.company_name,
                            demand_id:entry._id,
                            demand_user_id:entry.user_id,
                            demand_company_id:entry.company_id,
                            demand_company_name:entry.company_name,
                            price:price,
                            payment_advance:payment_advance,
                            time_transaction:new Date(req.body.time_transaction),
                            location_storage:req.body.location_storage,
                            amount:amount,
                            change_remain:3,
                            time_creation:Date.now()
                        });

                    entry_offer.save(function(err)
                    {
                        if(err)
                        {
                            return mw.sendData(res,'err',{err:err});
                        }
                        mw.sendData(res,'success', {offer_id:entry_offer._id,demand_id:entry._id});
                    });
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

    // 生成采购订单
    api.get('/order_new/:source/:target',function(req,res)
    {
        Demand.findById(req.params.source,function(err,entry_demand)
        {
            if(err)
            {
                return mw.sendData(res,'err',{err:err});
            }
            if(entry_demand)
            {
                if(req.decoded.id != entry_demand.user_id)
                {
                    return mw.sendData(res,'not_allow',null);
                }
                DemandOffer.findById(req.params.target,function(err,entry_offer)
                {
                    if(err)
                    {
                        return mw.sendData(res,'err',{err:err});
                    }
                    if(entry_offer)
                    {
                        if(entry_offer.demand_id != entry_demand._id)
                        {
                            return mw.sendData(res,'not_allow',null);
                        }
                        DemandOrder.count({demand_id:entry_demand._id, offer_id:entry_offer._id},function(err,count)
                        {
                            if(err)
                            {
                                return mw.sendData(res,'err',{err:err});
                            }
                            if(count>0)
                            {
                                mw.sendData(res,'already_exist',null)
                            }
                            else
                            {
                                var entry_order = new DemandOrder(
                                    {
                                        company_demand_id:entry_demand.company_id,
                                        company_demand_name:entry_demand.company_name,
                                        company_supply_id:entry_offer.company_id,
                                        company_supply_name:entry_offer.company_name,
                                        user_demand_id:entry_demand.user_id,
                                        user_supply_id:entry_offer.user_id,
                                        demand_id:entry_demand._id,
                                        offer_id:entry_offer._id,
                                        category:entry_demand.category,
                                        category_chn:entry_demand.category_chn,
                                        amount:entry_offer.amount,
                                        price_unit:entry_offer.price,
                                        desc:entry_demand.desc,
                                        time_traffic:entry_demand.time_traffic,
                                        location_depart:entry_offer.location_storage,
                                        location_arrival:entry_demand.location_storage,
                                        payment_advance:entry_offer.payment_advance,
                                        payment_style: entry_demand.payment_style,
                                        check_product:[],
                                        att_product: entry_demand.att_product,
                                        att_traffic:entry_demand.att_traffic,
                                        att_liability:entry_demand.att_liability,
                                        traffic_orders:[],
                                        time_creation:Date.now(),
                                        status:config_common.order_status.ineffective.eng,
                                        step:1,
                                        time_current_step:Date.now(),
                                        url_advanced_payment:'',
                                        url_final_payment:'',
                                        style_advanced_payment:'',
                                        style_final_payment:''
                                    });
                                entry_order.save(function(err)
                                {
                                    if(err)
                                    {
                                        return mw.sendData(res,'err',{err:err});
                                    }
                                    mw.sendData(res,'success',{id:entry_order._id});
                                });
                            }
                        });
                    }
                    else
                    {
                        mw.sendData(res,'not_found',null)
                    }
                });
            }
            else
            {
                mw.sendData(res,'not_found',null)
            }
        });
    });

    // 查看采购订单列表 -- 只能查自己的或者本公司的
    api.get('/order_list/:side/:category/:entity/:page',function(req,res)
    {
        var page_num = parseInt(req.params.page);
        if(isNaN(page_num) || page_num <= 0)
        {
            return mw.sendData(res,'invalid_format',null);
        }
        var query = {};
        if(req.params.category !== 'all')
        {
            query.category = req.params.category;
        }
        if(req.params.side == 'demand')
        {
            if(req.params.entity == 'self')
            {
                query.user_demand_id = req.decoded.id;
            }
            else
            {
                if(req.decoded.role !== config_common.user_roles.TRADE_ADMIN)
                {
                    return mw.sendData(res,'not_allow',null);
                }
                query.company_demand_id = req.decoded.company_id;
            }
        }
        else
        {
            if(req.params.entity == 'self')
            {
                query.user_supply_id = req.decoded.id;
            }
            else
            {
                if(req.decoded.role !== config_common.user_roles.TRADE_ADMIN)
                {
                    return mw.sendData(res,'not_allow',null);
                }
                query.company_supply_id = req.decoded.company_id;
            }
        }

        DemandOrder.find(query).sort({'time_creation':-1})
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

    // 查看采购订单细节
    api.get('/order_detail/:id',function(req,res)
    {
        // 权限检查--弱
        if(req.decoded.role !== config_common.user_roles.TRADE_ADMIN && req.decoded.role !== config_common.user_roles.TRADE_PURCHASE &&
           req.decoded.role !== config_common.user_roles.TRADE_SALE)
        {
            return mw.sendData(res,'not_allow',null);
        }
        DemandOrder.findById(req.params.id,function(err,entry)
        {
            if(err)
            {
                return mw.sendData(res,'err',{err:err});
            }
            if(entry)
            {
                // 权限检查--强
                if((req.decoded.id == entry.user_demand_id || req.decoded.id == entry.user_supply_id) ||
                    (req.decoded.role === config_common.user_roles.TRADE_ADMIN && (req.decoded.company_id == entry.company_demand_id || req.decoded.company_id == entry.company_supply_id)))
                {
                    mw.sendData(res,'success',entry);
                }
                else
                {
                    mw.sendData(res,'not_allow',null);
                }
            }
            else
            {
                mw.sendData(res,'not_found',null);
            }
        });
    });



    return api;
};
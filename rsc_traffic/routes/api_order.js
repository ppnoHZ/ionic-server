/**
 * Created by Administrator on 2015/11/25.
 */
var async = require('async');
var _ = require('underscore');
var express = require('express');
var TrafficOrder = require('../models/TrafficOrder');
var TrafficRoute = require('../models/TrafficRoute');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    //物流公司获取订单
    api.post('/traffic_get', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
            return next('not allow');
        }
        TrafficOrder.find({company_traffic_id:req.decoded.company_id}, function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    //交易公司获取订单
    api.post('/trade_get', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE){
            return next('not_allow');
        }
        TrafficOrder.find({company_demand_id:req.decoded.company_id}, function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    //买房确认订单
    api.post('/1_confirm', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE){
            return next('not_allow');
        }
        TrafficOrder.findById(req.body.order_id, function(err, order){
            if(err){
                return next(err);
            }
            if(!order){
                return next('not_found');
            }
            if((req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
                req.decoded.id != order.user_demand_id) ||
                (req.decoded.role == config_common.user_roles.TRADE_ADMIN &&
                req.decoded.company_id != trafficOffer.company_demand_id)){
                return cb('not_allow');
            }
            if(order.step != 1){
                return cb('not_allow');
            }
            order.step = 2;
            order.save(function(err){
                if(err){
                    return next(err);
                }
                config_common.sendData(req, order, next);
            });
        });
    });

    //买方预付款
    api.post('/2_upload_payment', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE){
            return next('not_allow');
        }
        TrafficOrder.findById(req.body.order_id, function(err, order){
            if(err){
                return next(err);
            }
            if(!order){
                return next('not_found');
            }
            if((req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
                req.decoded.id != order.user_demand_id) ||
                (req.decoded.role == config_common.user_roles.TRADE_ADMIN &&
                req.decoded.company_id != trafficOffer.company_demand_id)){
                return cb('not_allow');
            }
            if(order.step != 2){
                return cb('not_allow');
            }
            //TODO 检查付款方式
            //TODO 上传凭证方式需要
            order.orderurl_advanced_payment = req.body.url;
            //TODO 信用方式需要通知账号服务器检查改变信用度
            order.step = 2.5;
            order.orderurl_advanced_payment = req.body.url;
            order.style_advanced_payment = req.body.url;
            order.save(function(err){
                if(err){
                    return next(err);
                }
                config_common.sendData(req, order, next);
            });
        });
    });

    //物流方确认
    api.post('/2.5_confirm', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
            return next('not_allow');
        }
        TrafficOrder.findById(req.body.order_id, function(err, order){
            if(err){
                return next(err);
            }
            if(!order){
                return next('not_found');
            }
            if(order.step != 2.5){
                return cb('not_allow');
            }
            order.step = 3;
            //TODO 短信通知司机信息
            order.save(function(err){
                if(err){
                    return next(err);
                }
                config_common.sendData(req, order, next);
            });
        });
    });

    //司机申请提货
    api.post('/3_application_get', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRAFFIC_DRIVER){
            return next('not_allow');
        }
        TrafficOrder.findById(req.body.order_id, function(err, order){
            if(err){
                return next(err);
            }
            if(!order){
                return next('not_found');
            }
            if(order.step != 3){
                return cb('not_allow');
            }
            var truckRoute;
            for(var i = 0; i < order.v_info.length; i++){
                if(order.v_info[i].user_id == req.decoded.id){
                    truckRoute = order.v_info[i];
                    break;
                }
            }
            if(!truckRoute || truckRoute.route_id){
                return cb('not_allow');
            }
            var route = new TrafficRoute({
                order_id: order._id+''
            });
            truckRoute.route_id = route._id+'';
            order.save(function(err){
                if(err){
                    return next(err);
                }
                config_common.sendData(req, order, next);
            });
        });
    });

    //卖方仓库管理员过磅
    api.post('/3_sell_weigh', function(req, res, next){

    });

    return api;
};
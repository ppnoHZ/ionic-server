/**
 * Created by Administrator on 2015/11/25.
 */
var http = require('http');
var async = require('async');
var _ = require('underscore');
var express = require('express');
var jwt = require('jsonwebtoken');
var querystring = require('querystring');
var TrafficOrder = require('../models/TrafficOrder');
var TrafficOffer = require('../models/TrafficOffer');
var TrafficDemand = require('../models/TrafficDemand');
var config_server = require('../configs/config_server');
var config_common = require('../configs/config_common');

//创建与user服务器通讯token防止其它请求
function createTokenServer() {
    return jwt.sign({
            status:'success'
        },
        config_common.secret_keys.server_traffic,
        {
            expiresIn: config_common.token_server_traffic_timeout
        });
}

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());
    //增加抢单
    api.post('/add', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
            return next('not_allow');
        }
        req.body.amount = parseInt(req.body.amount);
        req.body.price = parseInt(req.body.price);
        req.body.style_payment = parseInt(req.body.style_payment);
        if(!config_common.checkNumberBiggerZero(req.body.amount) ||
            !config_common.checkPaymentStyle(req.body.style_payment) ||
            !config_common.checkNumberBiggerZero(req.body.price) ||
            !req.body.demand_id){
            return next('invalid_format');
        }
        async.waterfall([
            function(cb){
                //查找需求单
                TrafficDemand.findById(req.body.demand_id, function(err, trafficDemand){
                    if(err){
                        return cb(err);
                    }
                    if(!trafficDemand){
                        return cb('not_found');
                    }
                    //检查该单可否拼单
                    if((!trafficDemand.can_join && req.body.amount < trafficDemand.amount) ||
                        (req.body.amount > trafficDemand.amount)){
                        return cb('invalid_amount');
                    }
                    if(trafficDemand.time_validity.getTime() <= Date.now()){
                        return cb('timeout');
                    }
                    cb(null, trafficDemand);
                });
            },
            function(trafficDemand, cb){
                //检查该公司是否已经存在该需求单的抢单
                TrafficOffer.count({company_id:req.decoded.company_id, demand_id:trafficDemand._id}, function(err, countRes){
                    if(err){
                        return next(err);
                    }
                    if(countRes > 0){
                        return cb('company is exist offer');
                    }else{
                        return cb(null, trafficDemand);
                    }
                });
            },
            function(trafficDemand, cb){
                //向user服务器进行检查，查看车辆和人是否已经被使用
                var postData = querystring.stringify({
                    v_info : req.body.v_info,
                    traffic_token: createTokenServer()
                });
                var options = {
                    hostname: config_server.user_server_ip,
                    port: config_server.user_server_port,
                    path: config_server.user_server_check_v_info,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': req.headers['x-access-token']
                    }
                };
                var request = http.request(options, function(result) {
                    result.setEncoding('utf8');
                    result.on('data', function (chunk) {
                        if(JSON.parse(chunk).status == 'success'){
                            return cb(null, trafficDemand);
                        }else{
                            return cb(JSON.parse(chunk).msg);
                        }
                    });
                });
                request.on('error', function(e) {
                    return cb(e.message);
                });
                request.write(postData);
                request.end();
            },
            function(trafficDemand, cb){
                var trafficOffer = new TrafficOffer({
                    user_id: req.decoded.id,
                    company_id: req.decoded.company_id,
                    price: req.body.price,
                    demand_id: req.body.demand_id,
                    style_payment: req.body.style_payment,
                    amount: req.body.amount,
                    v_info: JSON.parse(req.body.v_info),
                    time_edit: new Date(),
                    time_creation: new Date()
                });
                trafficOffer.save(cb);
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });
    //按页数获取挂单
    api.get('/get/:demand_id/:page', function(req, res, next){
        req.params.page = parseInt(req.params.page);
        if(!config_common.checkNumberBiggerZero(req.params.page)){
            return next('invalid_format');
        }
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE &&
            req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
            return next('not_allow');
        }
        TrafficOffer.find({demand_id:req.params.demand_id}, function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        }).skip((req.params.page-1)*config_common.entry_per_page).limit(config_common.entry_per_page);
    });
    //修改挂单
    api.post('/edit', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
            return next('not_allow');
        }
        req.body.amount ? req.body.amount = parseInt(req.body.amount) : 0;
        req.body.price ? req.body.price = parseInt(req.body.price) : 0;
        req.body.style_payment ? req.body.style_payment = parseInt(req.body.style_payment) : 0;
        if((req.body.amount && !config_common.checkNumberBiggerZero(req.body.amount)) ||
            (req.body.style_payment && !config_common.checkPaymentStyle(req.body.style_payment)) ||
            (req.body.price && !config_common.checkNumberBiggerZero(req.body.price))){
            return next('invalid_format');
        }
        async.waterfall([
            function(cb){
                //检查挂单
                TrafficOffer.findById(req.body.offer_id, function(err, trafficOffer){
                    if(err){
                        return cb(err);
                    }
                    if(!trafficOffer){
                        return cb('not_found');
                    }
                    if((req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
                        req.decoded.id != trafficOffer.user_id) ||
                        (req.decoded.role == config_common.user_roles.TRADE_ADMIN &&
                        req.decoded.company_id != trafficOffer.company_id)){
                        return cb('not_allow');
                    }
                    if(trafficOffer.modify_count <= 0){
                        return cb('modify_count_max');
                    }
                    cb(null, trafficOffer);
                });
            },
            function(trafficOffer, cb){
                //检查需求单
                TrafficDemand.findById(trafficOffer.demand_id, function(err, trafficDemand){
                    if(err){
                        return cb(err);
                    }
                    if(!trafficDemand){
                        return cb('not_found');
                    }
                    if(req.body.amount){
                        if((!trafficDemand.can_join && req.body.amount < trafficDemand.amount) ||
                            (req.body.amount > trafficDemand.amount)){
                            return cb('invalid_amount');
                        }
                    }
                    if(trafficDemand.time_validity.getTime() <= Date.now()){
                        return cb('timeout');
                    }
                    cb(null, trafficOffer)
                });
            },
            function(trafficOffer, cb){
                if(req.body.v_info){
                    //检查卡车和司机信息
                    var postData = querystring.stringify({v_info : req.body.v_info});
                    var options = {
                        hostname: config_server.user_server_ip,
                        port: config_server.user_server_port,
                        path: config_server.user_server_check_v_info,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'x-access-token': req.headers['x-access-token']
                        }
                    };
                    var request = http.request(options, function(result) {
                        result.setEncoding('utf8');
                        result.on('data', function (chunk) {
                            if(JSON.parse(chunk).status == 'success'){
                                return cb(null, trafficOffer);
                            }else{
                                return cb('v_info err');
                            }
                        });
                    });
                    request.on('error', function(e) {
                        return cb(e.message);
                    });
                    request.write(postData);
                    request.end();
                }else{
                    cb(null, trafficOffer);
                }
            },
            function(trafficOffer, cb){
                req.body.price ? trafficOffer.price = req.body.price : 0;
                req.body.style_payment ? trafficOffer.style_payment = req.body.style_payment : 0;
                req.body.amount ? trafficOffer.amount = req.body.amount : 0;
                req.body.v_info ? trafficOffer.v_info = JSON.parse(req.body.v_info) : 0;
                trafficOffer.time_edit = new Date();
                trafficOffer.modify_count--;
                trafficOffer.save(cb);
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });
    //选择抢单生成订单
    api.get('/select/:offer_id', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE){
            return next('not_allow');
        }
        async.waterfall([
            function(cb){
                //检查是否已经有改抢单的订单（就是不能重复选择一个抢单）
                TrafficOrder.count({offer_id: req.params.offer_id}, function(err, count){
                    if(err){
                        return cb(err);
                    }
                    if(count){
                        return cb('offer is selected');
                    }
                    cb();
                });
            },
            function(cb){
                //检查抢单
                TrafficOffer.findById(req.params.offer_id, function(err, trafficOffer){
                    if(err){
                        return cb(err);
                    }
                    if(!trafficOffer){
                        return cb('offer_not_found');
                    }
                    cb(null, trafficOffer);
                });
            },
            function(trafficOffer, cb){
                //检查需求单
                TrafficDemand.findById(trafficOffer.demand_id, function(err, trafficDemand){
                    if(err){
                        return cb(err);
                    }
                    if(!trafficDemand){
                        return cb('demand_not_found');
                    }
                    if((req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
                        req.decoded.id != trafficDemand.user_id) ||
                        (req.decoded.role == config_common.user_roles.TRADE_ADMIN &&
                        req.decoded.company_id != trafficDemand.company_id)){
                        return cb('not_allow');
                    }
                    cb(null, trafficDemand, trafficOffer);
                });
            },
            function(trafficDemand, trafficOffer, cb){
                //生成临时订单结构，之后把订单id及相应信息去user服务器进行检查
                var order = new TrafficOrder({
                    user_demand_id: trafficDemand.user_id,
                    company_demand_id: trafficDemand.company_id,
                    user_traffic_id: trafficOffer.user_id,
                    company_traffic_id: trafficOffer.company_id,
                    amount: trafficOffer.amount,
                    category: trafficDemand.category,
                    category_chn: trafficDemand.category_chn,
                    price_unit: trafficOffer.price,
                    time_arrival: trafficDemand.time_arrival,
                    location_arrival: trafficDemand.location_arrival,
                    time_depart: trafficDemand.time_depart,
                    location_depart: trafficDemand.location_depart,
                    payment_advance: Math.min(trafficDemand.style_payment, trafficOffer.style_payment),
                    att_traffic: trafficDemand.att_traffic,
                    att_liability: trafficDemand.att_liability,
                    time_creation: new Date(),
                    status: config_common.order_status.ineffective.eng,
                    step: 1,
                    time_current_step: new Date(),
                    insurance: trafficDemand.insurance,
                    v_info: trafficOffer.v_info,
                    offer_id: trafficOffer._id,
                    demand_id: trafficDemand._id
                });
                var postData = querystring.stringify({
                    v_info : JSON.stringify(trafficOffer.v_info),
                    order_id: order._id+'',
                    traffic_token: createTokenServer()
                });
                var options = {
                    hostname: config_server.user_server_ip,
                    port: config_server.user_server_port,
                    path: config_server.user_server_use_v_info,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': req.headers['x-access-token']
                    }
                };
                var request = http.request(options, function(result) {
                    result.setEncoding('utf8');
                    result.on('data', function (chunk) {
                        if(JSON.parse(chunk).status == 'success'){
                            return cb(null, order);
                        }else{
                            return cb(JSON.parse(chunk).msg);
                        }
                    });
                });
                request.on('error', function(e) {
                    return cb(e.message);
                });
                request.write(postData);
                request.end();
            },
            function(order, cb){
                order.save(function(err, trafficOrder){
                    if(err){
                        return cb(err);
                    }
                    cb(null, trafficOrder);
                });
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    return api;
};
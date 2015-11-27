/**
 * Created by Administrator on 2015/11/19.
 */
var _ = require('underscore');
var express = require('express');
var TrafficDemand = require('../models/TrafficDemand');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    api.post('/add', function(req, res, next){
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE){
            return next('not_allow');
        }
        req.body.amount = parseInt(req.body.amount);
        req.body.style_payment = parseInt(req.body.style_payment);
        req.body.can_join = req.body.can_join ? true : false;
        req.body.insurance = req.body.insurance ? true : false;
        req.body.att_traffic = JSON.parse(req.body.att_traffic);
        if(!config_common.checkNumberBiggerZero(req.body.amount) ||
            !config_common.checkGoods(req.body.category) ||
            !config_common.checkTime(req.body.time_arrival) ||
            !config_common.checkTime(req.body.time_depart) ||
            !config_common.checkPaymentStyle(req.body.style_payment) ||
            !config_common.checkCommonString(req.body.location_arrival) ||
            !config_common.checkCommonString(req.body.location_depart) ||
            !config_common.checkTime(req.body.time_validity) ||
            !config_common.checkAttTraffic(req.body.category, req.body.att_traffic)){
            return next('invalid_format');
        }
        var demand = new TrafficDemand({
            user_id: req.decoded.id,
            company_id: req.decoded.company_id,
            category: req.body.category,
            category_chn: config_common.goods[req.body.category].chn,
            amount: req.body.amount,
            time_arrival: new Date(req.body.time_arrival),
            location_arrival: req.body.location_arrival,
            time_depart: new Date(req.body.time_depart),
            location_depart: req.body.location_depart,
            style_payment: req.body.style_payment,
            time_validity: new Date(req.body.time_validity),
            can_join: req.body.can_join,
            insurance: req.body.insurance,
            att_traffic: req.body.att_traffic,
            att_liability: config_common.att_liability,
            time_creation: new Date()
        });
        demand.save(function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    api.get('/getList/:category/:order/:page', function(req, res, next){
        req.params.page = parseInt(req.params.page);
        if((req.params.category != 'ALL' && !config_common.checkGoods(req.params.category)) ||
            !config_common.checkNumberBiggerZero(req.params.page)){
            return next('invalid_format');
        }
        if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role != config_common.user_roles.TRADE_SALE &&
            req.decoded.role != config_common.user_roles.TRADE_PURCHASE &&
            req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
            return next('not_allow');
        }
        var cond = config_common.getFindDemandCondition(req.params.category);
        TrafficDemand.find(cond, function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);})
            .skip((req.params.page-1)*config_common.entry_per_page)
            .limit(config_common.entry_per_page)
            .sort(config_common.getSortDemandCondition(req.params.order));
    });

    //api.get('get/:demand_id', function(req, res, next){
    //    req.params.page = parseInt(req.params.page);
    //    if((req.params.category != 'ALL' && !config_common.checkGoods(req.params.category)) ||
    //        !config_common.checkNumberBiggerZero(req.params.page)){
    //        return next('invalid_format');
    //    }
    //    if(req.decoded.role != config_common.user_roles.TRADE_ADMIN &&
    //        req.decoded.role != config_common.user_roles.TRADE_SALE &&
    //        req.decoded.role != config_common.user_roles.TRADE_PURCHASE &&
    //        req.decoded.role != config_common.user_roles.TRAFFIC_ADMIN){
    //        return next('not_allow');
    //    }
    //    TrafficDemand.findById(req.params.demand_id, function(err, result){
    //        if(err){
    //            return next(err);
    //        }
    //        if(!result){
    //            return next('not_found');
    //        }
    //        config_common.sendData(req, result, next);
    //    }).skip((req.params.page-1)*config_common.entry_per_page).limit(config_common.entry_per_page);
    //});
    return api;
};
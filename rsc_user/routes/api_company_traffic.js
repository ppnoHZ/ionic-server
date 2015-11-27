/**
 * Created by Administrator on 2015/11/23.
 */
var _ = require('underscore');
var async  = require('async');
var express = require('express');
var jwt = require('jsonwebtoken');
var Truck = require('../models/Truck');
var UserTraffic = require('../models/User_traffic');
var Company = require('../models/Company_traffic');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    api.post('/authentication',function(req, res, next) {
        req.body.currency = parseInt(req.body.currency);
        if(!req.body.nickName ||
            !req.body.licenseURL ||
            !config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkNumberBiggerZero(req.body.currency) ||
            !config_common.checkCommonString(req.body.nickName) ||
            !config_common.checkCommonString(req.body.licenseURL)) {
            return next('invalid_format');
        }
        Company.findOne({_id: req.decoded.company_id}, function(err, company) {
            if(err) {
                return next(err);
            }
            if(!company){
                next('not_found');
            }
            if(company.verify_phase == config_common.verification_phase.NO ||
                company.verify_phase == config_common.verification_phase.FAILED){
                company.verify_phase = config_common.verification_phase.PROCESSING;
                company.url_yingyezhizhao = req.body.licenseURL;
                company.currency = req.body.currency;
                company.nick_name = req.body.nickName;
                company.save(function(err){
                    if(err){
                        return next(err);
                    }
                    config_common.sendData(req, {}, next);
                });
            }else{
                next('not_allow');
            }
        });
    });

    api.post('/check_v_info',function(req, res, next) {
        req.body.v_info = JSON.parse(req.body.v_info);
        if(!_.isArray(req.body.v_info)){
            return next('invalid_format');
        }
        var userObj = {};
        var truckObj = {};
        async.each(req.body.v_info, function(data, cb){
            if(!data.user_id || !data.truck_id){
                return cb('invalid_format');
            }
            async.waterfall([
                function(callback){
                    if(userObj[data.user_id]){
                        return callback('user_used_repeat');
                    }
                    UserTraffic.findById(data.user_id, function(err, findRes){
                        if(err){
                            return callback(err);
                        }
                        if(!findRes){
                            return callback('user_not_found');
                        }
                        if(findRes.company_id.indexOf(req.decoded.company_id) < 0){
                            return callback('user_not_allow');
                        }
                        if(findRes.use){
                            return callback('user_is_using');
                        }
                        userObj[findRes._id] = true;
                        callback(null, findRes);
                    });
                },
                function(user, callback){
                    if(truckObj[data.truck_id]){
                        return callback('truck_used_repeat');
                    }
                    Truck.findById(data.truck_id, function(err, findRes){
                        if(err){
                            return callback(err);
                        }
                        if(!findRes){
                            return callback('truck_not_found');
                        }
                        if(findRes.user_id.indexOf(user._id) < 0 &&
                            findRes.user_id.indexOf(req.decoded.id) < 0){
                            return callback('truck_not_allow');
                        }
                        if(findRes.use){
                            return callback('truck_is_using');
                        }
                        truckObj[findRes._id] = true;
                        callback();
                    });
                }
            ],function(err, result){
                if(err){
                    return cb(err);
                }
                cb();
            });
        },function(err){
            if(err){
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    api.post('/use_v_info',function(req, res, next) {
        jwt.verify(req.body.traffic_token, config_common.secret_keys.server_traffic, function(err, decoded) {
            if(err || decoded.status != 'success') {
                return next('auth_failed');
            }
            req.body.v_info = JSON.parse(req.body.v_info);
            if(!_.isArray(req.body.v_info)){
                return next('invalid_format');
            }
            var userArr = [];
            var truckArr = [];
            for(var i = 0;i < req.body.v_info.length; i++){
                var data = req.body.v_info[i];
                if(data) {
                    data.user_id ? userArr.push(data.user_id) : 0;
                    data.truck_id ? truckArr.push(data.truck_id) : 0;
                }
            }
            UserTraffic.update({_id:{$in:userArr}},{use: true}, function(err, result){
                Truck.update({_id:{$in:truckArr}},{use: true}, function(err, result){
                    config_common.sendData(req, {}, next);
                });
            });
        });
    });

    api.post('/add_order_id',function(req, res, next) {
        jwt.verify(req.body.traffic_token, config_common.secret_keys.server_traffic, function(err, decoded) {
            if(err || decoded.status != 'success') {
                return next('auth_failed');
            }
            req.body.v_info = JSON.parse(req.body.v_info);
            if(!_.isArray(req.body.v_info)){
                return next('invalid_format');
            }
            var userArr = [];
            for(var i = 0;i < req.body.v_info.length; i++){
                var data = req.body.v_info[i];
                if(data) {
                    data.user_id ? userArr.push(data.user_id) : 0;
                }
            }
            UserTraffic.update({_id:{$in:userArr}},{order_id: req.decoded.order_id}, function(err, result){
                config_common.sendData(req, {}, next);
            });
        });
    });

    return api;
};
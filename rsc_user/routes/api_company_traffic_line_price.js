/**
 * Created by Administrator on 2015/11/23.
 */
var async = require('async');
var express = require('express');
var Line = require('../models/Line');
var LinePrice = require('../models/Line_price');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    api.post('/add',function(req, res, next) {
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right add line price');
        }
        req.body.money = parseInt(req.body.money);
        if(!config_common.checkTruckType(req.body.type) ||
            !config_common.checkNumberBiggerZero(req.body.money) ||
            !req.body.line_id){
            return next('invalid_format');
        }
        Line.findById(req.body.line_id, function(err, line){
            if(err){
                return next(err);
            }
            if(!line){
                return next('line not found');
            }
            if(line.company_id != req.decoded.company_id){
                return next('Have no right dec line');
            }
            var linePriceData = new LinePrice({
                line_id: req.body.line_id, //所属线路id
                type: req.body.type,    //车辆类型
                money: req.body.money,
                company_id: req.decoded.company_id[0]
            });
            linePriceData.save(function(err, saveRes){
                if(err) {
                    return next(err);
                }
                config_common.sendData(req, saveRes, next);
            });
        });
    });

    api.post('/get',function(req, res, next) {
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role) ||
            !req.body.line_id){
            return next('Have no right dec linePrice');
        }
        LinePrice.find({line_id: req.body.line_id}, function(err, lineArr) {
            if(err) {
                return next(err);
            }
            config_common.sendData(req, lineArr, next);
        });
    });

    api.post('/dec',function(req, res, next) {
        if(!req.body.lind_price_id) {
            return next('invalid_format');
        }
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec linePrice');
        }
        async.waterfall([
            function(cb){
                LinePrice.findById(req.body.lind_price_id, function(err, linePrice) {
                    if(err) {
                        return next(err);
                    }
                    if(!linePrice){
                        return next('not_found');
                    }
                    if(linePrice.company_id != req.decoded.company_id){
                        next('Have no right dec linePrice');
                    }
                    cb(null, linePrice);
                });
            },
            function(linePrice, cb){
                linePrice.remove(cb);
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    api.post('/edit',function(req, res, next) {
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec line');
        }
        req.body.money = parseInt(req.body.money);
        if(!config_common.checkTruckType(req.body.type) ||
            !config_common.checkNumberBiggerZero(req.body.money) ||
            !req.body.lind_price_id){
            return next('invalid_format');
        }
        async.waterfall([
            function(cb){
                LinePrice.findById(req.body.lind_price_id, function(err, line) {
                    if(err) {
                        return cb(err);
                    }
                    if(!line){
                        return cb('not_found');
                    }
                    if(line.company_id != req.decoded.company_id){
                        return cb('Have no right dec line');
                    }
                    cb(null, line);
                });
            },
            function(line, cb){
                req.body.money ? line.money = req.body.money : 0;
                req.body.type ? line.type = req.body.type : 0;
                cb(null, line);
            },
            function(line, cb){
                line.save(cb);
            }
        ],function(err, line){
            if(err){
                return next(err);
            }
            config_common.sendData(req, line, next);
        });
    });

    return api;
};
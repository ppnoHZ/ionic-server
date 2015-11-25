/**
 * Created by Administrator on 2015/11/23.
 */

var async = require('async');
var express = require('express');
var Truck = require('../models/Truck');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    api.post('/add',function(req, res, next) {
        if(!config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right add truck');
        }
        //TODO 先只做货车
        req.body.type = config_common.truck_types.HUO;
        if(!config_common.checkTruckType(req.body.type) ||
            !config_common.checkTruckVolume(req.body.volume) ||
            !config_common.checkTruckLong(req.body.long) ||
            !config_common.checkTruckWeight(req.body.weight) ||
            !req.body.number){
            return next('truck err');
        }
        Truck.findOne({number:req.body.number, type:req.body.type}, function(err, truck){
            if(err){
               return next(err);
            }
            if(truck){
                truck.user_id.push(req.decoded.id);
            }else{
                truck = new Truck({
                    number: req.body.number,
                    weight: req.body.weight,
                    type: req.body.type,
                    volume: req.body.volume,
                    long: req.body.long,
                    user_id: req.decoded.id
                });
            }
            truck.save(function(err, saveRes){
                if(err) {
                    return next(err);
                }
                config_common.sendData(req, saveRes, next);
            });
        });
    });

    api.post('/dec',function(req, res, next) {
        if(!req.body.truck_id) {
            return next('invalid_format');
        }
        if(!config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec truck');
        }
        async.waterfall([
            function(cb){
                Truck.findById(req.body.truck_id, function(err, truck) {
                    if(err) {
                        return cb(err);
                    }
                    if(!truck){
                        return cb('not_found');
                    }
                    if(truck.user_id.indexOf(req.decoded.id) < 0){
                        return cb('Have no right dec truck');
                    }
                    if(truck.user_id.length <= 1){
                        truck.remove(cb);
                    }else{
                        truck.user_id = _.without(truck.user_id, req.decoded.id);
                        truck.save(cb);
                    }
                });
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    api.post('/get',function(req, res, next) {
        if(!config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right get truck');
        }
        Truck.find({user_id: req.decoded.id}, function(err, lineArr) {
            if(err) {
                return next(err);
            }
            config_common.sendData(req, lineArr, next);
        });
    });

    api.post('/edit',function(req, res, next) {
        if(!req.body.truck_id ||
            (!req.body.type && !req.body.volume && !req.body.long && !req.body.weight)) {
            return next('invalid_format');
        }
        if(!config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec truck');
        }
        req.body.type = req.body.type ? config_common.truck_types.HUO : null;
        if((req.body.type && !config_common.checkTruckType(req.body.type)) ||
            (req.body.volume && !config_common.checkTruckVolume(req.body.volume)) ||
            (req.body.long && !config_common.checkTruckLong(req.body.long)) ||
            (req.body.weight && !config_common.checkTruckWeight(req.body.weight))){
            return next('truck err');
        }
        async.waterfall([
            function(cb){
                Truck.findById(req.body.truck_id, function(err, truck) {
                    if(err) {
                        return cb(err);
                    }
                    if(!truck){
                        return cb('not_found');
                    }
                    if(truck.user_id.indexOf(req.decoded.id) < 0){
                        return cb('Have no right dec truck');
                    }
                    cb(null, truck);
                });
            },
            function(truck, cb){
                req.body.type ? truck.type = req.body.type : 0;
                req.body.volume ? truck.volume = req.body.volume : 0;
                req.body.long ? truck.long = req.body.long : 0;
                req.body.weight ? truck.weight = req.body.weight : 0;
                req.body.number ? truck.number = req.body.number : 0;
                truck.save(cb);
            }
        ],function(err, truck){
            if(err){
                return next(err);
            }
            config_common.sendData(req, truck, next);
        });
    });

    return api;
};
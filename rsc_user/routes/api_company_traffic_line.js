/**
 * Created by Administrator on 2015/11/23.
 */
var async = require('async');
var express = require('express');
var Line = require('../models/Line');
var LinePrice = require('../models/Line_price');
var configCity = require('../configs/config_city');
var configProvince = require('../configs/config_province');
var configDistrict = require('../configs/config_district');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    api.post('/add',function(req, res, next) {
        if(!req.body.start_province ||
            !req.body.start_city ||
            !req.body.end_province ||
            !req.body.end_city) {
            return next('invalid_format');
        }
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right add line');
        }
        if(!config_common.checkProvince(req.body.start_province) ||
            !config_common.checkProvince(req.body.end_province) ||
            !config_common.checkCity(req.body.start_province, req.body.start_city) ||
            !config_common.checkCity(req.body.end_province, req.body.end_city) ||
            !config_common.checkDistrict(req.body.start_city, req.body.start_district) ||
            !config_common.checkDistrict(req.body.end_city, req.body.end_district)){
            return next('address err');
        }
        var startProvince = configProvince[req.body.start_province];
        var startCity = configCity[req.body.start_province][req.body.start_city];
        var startDistrict = configDistrict[req.body.start_city][req.body.start_district];
        var endProvince = configProvince[req.body.end_province];
        var endCity = configCity[req.body.end_province][req.body.end_city];
        var endDistrict = configDistrict[req.body.end_city][req.body.end_district];
        var line = new Line({
            start_province: startProvince.name,
            start_city: startCity.name,
            start_district: startDistrict ? startDistrict.name : '',
            start_detail: req.body.start_detail || '',
            end_province: endProvince.name,
            end_city: endCity.name,
            end_district: endDistrict ? endDistrict.name : '',
            end_detail: req.body.end_detail || '',
            company_id: req.decoded.company_id[0]
        });
        line.save(function(err, saveRes){
            if(err) {
                return next(err);
            }
            config_common.sendData(req, saveRes, next);
        });
    });

    api.post('/dec',function(req, res, next) {
        if(!req.body.line_id) {
            return next('invalid_format');
        }
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec line');
        }
        async.waterfall([
            function(cb){
                Line.findOne({_id: req.body.line_id}, function(err, line) {
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
                LinePrice.remove({line_id: line._id}, function(err, removeRes){
                    if(err){
                        return cb(err);
                    }
                    cb(null, line);
                });
            },
            function(line, cb){
                line.remove(cb);
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    api.post('/get',function(req, res, next) {
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec line');
        }
        Line.find({company_id: req.decoded.company_id}, function(err, lineArr) {
            if(err) {
                return next(err);
            }
            config_common.sendData(req, lineArr, next);
        });
    });

    api.post('/edit',function(req, res, next) {
        if(!req.body.line_id) {
            return next('invalid_format');
        }
        if(!config_common.checkAdmin(req.decoded.role) ||
            !config_common.checkTrafficCompanyByRole(req.decoded.role)){
            return next('Have no right dec line');
        }
        if(!config_common.checkProvince(req.body.start_province) ||
            !config_common.checkProvince(req.body.end_province) ||
            !config_common.checkCity(req.body.start_province, req.body.start_city) ||
            !config_common.checkCity(req.body.end_province, req.body.end_city) ||
            !config_common.checkDistrict(req.body.start_city, req.body.start_district) ||
            !config_common.checkDistrict(req.body.end_city, req.body.end_district)){
            return next('address err');
        }
        async.waterfall([
            function(cb){
                Line.findById(req.body.line_id, function(err, line) {
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
                var startProvince = configProvince[req.body.start_province];
                var startCity = configCity[req.body.start_province][req.body.start_city];
                var startDistrict = configDistrict[req.body.start_city][req.body.start_district];
                var endProvince = configProvince[req.body.end_province];
                var endCity = configCity[req.body.end_province][req.body.end_city];
                var endDistrict = configDistrict[req.body.end_city][req.body.end_district];
                req.body.start_province ? line.start_province = startProvince.name : 0;
                req.body.start_city ? line.start_city = startCity.name : 0;
                req.body.start_district ? (line.start_district = startDistrict ? startDistrict.name : '') : 0;
                req.body.start_detail ? line.start_detail = req.body.start_detail : 0;
                req.body.end_province ? line.end_province = endProvince.name : 0;
                req.body.end_city ? line.end_city = endCity.name : 0;
                req.body.end_district ? (line.end_district = endDistrict ? endDistrict.name : '') : 0;
                req.body.end_detail ? line.end_detail = req.body.end_detail : 0;
                req.body.users ? line.users = req.body.users : 0;
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
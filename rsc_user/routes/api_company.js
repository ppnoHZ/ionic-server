/**
 * Created by Administrator on 2015/11/18.
 */
var express = require('express');
var Company = require('../models/Company');
var config_common = require('../configs/config_common');

module.exports = function() {
    var api = express.Router();

    api.use(require('../middlewares/mid_verify_user')());

    api.post('/authentication',function(req, res, next) {
        if(!req.body.currency ||
            !req.body.nickName ||
            !req.body.licenseURL ||
            !config_common.checkAdmin(req.decoded.role) ||
            req.body.currency <= 0 ||
            !config_common.checkCommonString(req.body.nickName) ||
            !config_common.checkCommonString(req.body.licenseURL)) {
            return next('invalid_format');
        }
        Company.findOne({_id: req.decoded.company_id}, function(err, company) {
            if(err) {
                return next(err);
            }
            if(company) {
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
            } else {
                next('not_found');
            }
        });
    });

    return api;
};
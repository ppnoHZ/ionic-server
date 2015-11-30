/**
 * Created by Administrator on 2015/11/23.
 */

var async = require('async');
var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../models/User_traffic');
var Company = require('../models/Company_traffic');
var Invitation = require('../models/Invitation');
var VerifyCode = require('../models/VerifyCode');
var config_common = require('../configs/config_common');

function createTokenUser(user) {
    return jwt.sign({
            id:user._id,
            company_id :user.company_id,
            role:user.role
        },
        config_common.secret_keys.user,
        {
            expiresIn: config_common.token_user_timeout
        });
}

module.exports = function() {
    var api = express.Router();

    api.post('/signup', function(req, res, next) {
        if(!config_common.checkCommonString(req.body.full_name) ||
            !config_common.checkPassword(req.body.password) ||
            !config_common.checkPhone(req.body.phone) ||
            !config_common.checkRealName(req.body.real_name) ||
            req.body.type != config_common.company_category.TRAFFIC) {
            return next('invalid_format');
        }
        async.waterfall([
            function(cb){
                VerifyCode.findOne({phone:req.body.phone}, function(err, v_code) {
                    if(err) {
                        return cb(err);
                    }
                    if(!v_code){
                        return cb('not_found');
                    }
                    if(v_code.code != req.body.verify_code){
                        return cb('invalid_verify_code');
                    }
                    if(v_code.companyType){
                        return cb('phone_is_used');
                    }
                    if(Date.now() - v_code.time.getTime() >= config_common.verify_codes_timeout){
                        return cb('verify_code_timeout');
                    }
                    v_code.companyType = req.body.type;
                    v_code.save(cb);
                });
            },
            function(v_code, count, cb){
                var company = new Company({
                    full_name:req.body.full_name,
                    type:req.body.type
                });
                company.save(cb);
            },
            function(company, count, cb){
                var user = new User({
                    phone:req.body.phone,
                    password:req.body.password,
                    role:config_common.user_roles[req.body.type+'_ADMIN'],
                    real_name:req.body.real_name,
                    gender:req.body.gender,
                    company_id:company._id+''
                });
                user.save(function(err, userData){
                    if(err){
                        company.has_admin = false;
                        company.save();
                        return cb(err);
                    }
                    cb(null, userData, company);
                });
            }
        ],function(error, user, company){
            if(error){
                return next(error);
            }
            var data = {user_id: user._id, company_id: company._id, token: createTokenUser(user)};
            config_common.sendData(req, data, next);
        });
    });

    api.use(require('../middlewares/mid_verify_user')());

    api.get('/me', function(req, res, next) {
        User.findById(req.decoded.id,function(err, user) {
            if(err) {
                return next(err);
            }
            config_common.sendData(req, {user:user}, next);
        });
    });

    api.post('/modify_self', function(req, res, next) {
        if(!req.body.phone &&
            !req.body.real_name &&
            !req.body.gender &&
            !req.body.photo_url){
            return next('invalid_format');
        }
        if((req.body.phone && !config_common.checkPhone(req.body.phone) && req.body.verify_code) ||
            (req.body.real_name && !config_common.checkRealName(req.body.real_name)) ||
            (req.body.gender && !config_common.checkGender(req.body.gender))) {
            return next('invalid_format');
        }
        var edit = false;
        async.waterfall([
            function(cb){
                User.findById(req.decoded.id, cb);
            },
            function(user, cb){
                if(!user){
                    return cb('not_found');
                }
                if(req.body.phone && req.body.phone != user.phone){
                    VerifyCode.findOne({phone:req.body.phone}, function(err, result){
                        if(err){
                            return cb(err);
                        }
                        if(!result){
                            return cb('not_found');
                        }
                        if(result.companyType){
                            return cb('phone_is_used');
                        }
                        if(result.code != req.body.verify_code){
                            return cb('invalid_verify_code');
                        }
                        result.companyType = config_common.getCompanyTypeByRole(req.decoded.role);
                        result.save(function(err, saveRes){
                            if(err){
                                return cb(err);
                            }
                            VerifyCode.remove({phone: user.phone}, function(err, removeRes){
                                if(err){
                                    return cb(err);
                                }
                                user.phone = req.body.phone;
                                edit = true;
                                cb(null, user);
                            });
                        });
                    });
                }else{
                    cb(null, user);
                }
            },
            function(user, cb){
                if(req.body.real_name && req.body.real_name != user.real_name){
                    user.real_name = req.body.real_name;
                    edit = true;
                }
                if(req.body.gender && req.body.gender != user.gender) {
                    user.gender = req.body.gender;
                    edit = true;
                }
                if(req.body.photo_url && req.body.photo_url != user.photo_url) {
                    user.photo_url = req.body.photo_url;
                    edit = true;
                }
                if(edit){
                    user.save(cb);
                }else{
                    cb(null, user);
                }
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    api.post('/modify_other',function(req, res, next) {
        if (!req.body.id) {
            return next('invalid_id');
        }
        if (!config_common.checkAdmin(req.decoded.role)) {
            return next('not_authorized');
        }
        if (!req.body.phone &&
            !req.body.real_name &&
            !req.body.gender &&
            !req.body.role) {
            return next('invalid_format');
        }
        if ((req.body.phone && !config_common.checkPhone(req.body.phone)) ||
            (req.body.real_name && !config_common.checkRealName(req.body.real_name)) ||
            (req.body.gender && !config_common.checkGender(req.body.gender) ||
            (req.body.role && !config_common.checkRoleType(req.body.role)))) {
            return next('invalid_format');
        }
        var edit = false;
        async.waterfall([
            function (cb) {
                User.findById(req.body.id, cb);
            },
            function (user, cb) {
                if(!user){
                    return cb('not_found');
                }
                if (config_common.checkAdmin(user.role) ||
                    user.company_id != req.decoded.company_id) {
                    return cb('not_authorized');
                }
                if (req.body.phone && req.body.phone != user.phone) {
                    VerifyCode.findOne({phone:req.body.phone}, function(err, result){
                        if(err){
                            return cb(err);
                        }
                        if(!result){
                            return cb('not_found');
                        }
                        if(result.companyType){
                            return cb('phone_is_used');
                        }
                        if(result.code != req.body.verify_code){
                            return cb('invalid_verify_code');
                        }
                        result.companyType = config_common.getCompanyTypeByRole(req.decoded.role);
                        result.save(function(err, saveRes){
                            if(err){
                                return cb(err);
                            }
                            VerifyCode.remove({phone: user.phone}, function(err, removeRes){
                                if(err){
                                    return cb(err);
                                }
                                user.phone = req.body.phone;
                                edit = true;
                                cb(null, user);
                            });
                        });
                    });
                } else {
                    cb(null, user);
                }
            },
            function (user, cb) {
                if (req.body.real_name && req.body.real_name != user.real_name) {
                    user.real_name = req.body.real_name;
                    edit = true;
                }
                if (req.body.gender && req.body.gender != user.gender) {
                    user.gender = req.body.gender;
                    edit = true;
                }
                if (req.body.role && req.body.role != user.role) {
                    user.role = req.body.role;
                    edit = true;
                }
                if (edit) {
                    user.save(cb);
                } else {
                    cb(null, user);
                }
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    return api;
};
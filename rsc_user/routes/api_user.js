/**
 * Created by Administrator on 2015/11/6 0006.
 */
var async = require('async');
var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var Company = require('../models/Company');
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

function createTokenInvite(companyId, companyName, role, inviteId) {
    return jwt.sign({
            name: companyName,
            companyId :companyId,
            inviteId: inviteId,
            role:role
        },
        config_common.secret_keys.invite,
        {
            expiresIn: config_common.token_invite_timeout
        });
}

module.exports = function() {
    var api = express.Router();

    api.get('/exist/:phone',function(req, res, next) {
        if(!config_common.checkPhone(req.params.phone)) {
            return next('invalid_format');
        }
        User.count({phone: req.params.phone},function(err, count) {
           if(err) {
               return next(err);
           }
           config_common.sendData(req, {conut: count}, next);
        });
    });

    api.post('/signup', function(req, res, next) {
        if(!config_common.checkCommonString(req.body.full_name) ||
            !config_common.checkPassword(req.body.password) ||
            !config_common.checkPhone(req.body.phone) ||
            !config_common.checkRealName(req.body.real_name) ||
            !config_common.checkCompanyType(req.body.type)) {
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
                    if(Date.now() - v_code.time.getTime() >= config_common.verify_codes_timeout){
                        return cb('verify_code_timeout');
                    }
                    v_code.remove(cb);
                });
            },
            function(result, cb){
                User.count({phone: req.body.phone}, function(err, count) {
                    if(err) {
                        return cb(err);
                    }
                    if(count > 0){
                        return cb('phone_is_used');
                    }
                    cb();
                });
            },
            function(cb){
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
                    company_id:company._id
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

    api.post('/signup_by_invitation',function(req, res, next) {
        if( !config_common.checkPassword(req.body.password) ||
            !config_common.checkPhone(req.body.phone) ||
            !config_common.checkRealName(req.body.real_name)) {
            return next('invalid_format');
        }
        Invitation.findById(req.body.id, function(err, invitation) {
            if(err) {
                return next(err);
            }
            if(invitation) {
                VerifyCode.findOne({phone: req.body.phone},function(err, v_code) {
                    if(err) {
                        return next(err);
                    }
                    if(v_code) {
                        if(v_code.code == req.body.verify_code) {
                            var user = new User({
                                    phone: req.body.phone,
                                    password: req.body.password,
                                    role: invitation.role,
                                    real_name: req.body.real_name,
                                    gender: req.body.gender,
                                    company_id: invitation.company_id
                                });
                            user.save(function(err) {
                                if(err) {
                                    return next(err);
                                }
                                v_code.remove(function(){});
                                invitation.remove(function(){});
                                config_common.sendData(req, {user_id: user._id, company_id: user.company_id, token: createTokenUser(user)}, next);
                            });
                        } else {
                            next('invalid_verify_code');
                        }
                    } else {
                        next('verifyCode_not_found');
                    }
                });
            } else {
                next('invite_not_found');
            }
        });
    });

    api.post('/login',function(req, res, next) {
        if(!config_common.checkPhone(req.body.phone) ||
            !config_common.checkPassword(req.body.password)) {
            return next('invalid_format');
        }
        User.findOne({phone:req.body.phone})
            .select('password company_id role')
            .exec(function(err, user) {
            if(err) {
                return next(err);
            }
            if(!user){
                return next('user_not_found');
            }
            if(!user.comparePassword(req.body.password)){
                return next('password_err');
            }
            var token = createTokenUser(user);
            config_common.sendData(req, {token:token}, next);
        });
    });

    api.get('/get_verify_code/:phone',function(req, res, next) {
        if(!config_common.checkPhone(req.params.phone)) {
            return next('invalid_format');
        }
        async.waterfall([
            function(cb){
                User.count({phone: req.params.phone}, function(err, count) {
                    if(err) {
                        return cb(err);
                    }
                    if(count > 0){
                        return cb('phone_is_used');
                    }
                    cb();
                });
            },
            function(cb){
                VerifyCode.findOne({phone: req.params.phone}, cb);
            },
            function(codeData, cb){
                if(!codeData){
                    var verify_code = new VerifyCode({code:config_common.getVerifyCode(), phone:req.params.phone});
                    verify_code.save(cb);
                }else{
                    if(Date.now() - codeData.time.getTime() < config_common.verify_codes_resend) {
                        cb('too_frequent');
                    } else {
                        codeData.code = config_common.getVerifyCode();
                        codeData.time = new Date();
                        codeData.markModified('time');
                        codeData.save(cb);
                    }
                }
            }
        ],function(err, result){
            if(err){
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    api.use(function(req, res, next) {
        var token = req.body.token || req.params.token || req.headers['x-access-token'];
        if(token) {
            jwt.verify(token, config_common.secret_keys.user, function(err, decoded) {
                if(err) {
                    return next('auth_failed');
                }
                req.decoded = decoded;
                next();
            });
        } else {
            next('no_token');
        }
    });

    api.get('/invite/:role',function(req, res, next) {
        if(!config_common.checkRoleType(req.params.role) ||
            !config_common.checkAdmin(req.decoded.role)) {
            return next('invalid_role');
        }
        Company.findById(req.decoded.company_id)
            .select('full_name type')
            .exec(function(err, company) {
            if(err) {
                return next(err);
            }
            if(company) {
                if(req.params.role.indexOf(company.type) == -1){
                    return next('invalid_role_type');
                }
                var invitation = new Invitation({
                        company_name:company.full_name,
                        company_id:company._id,
                        role:req.params.role
                    });
                invitation.save(function(err, result) {
                    if(err) {
                        return next(err);
                    }
                    config_common.sendData(req, createTokenInvite(company._id, company.full_name, req.params.role, result._id), next);
                });
            } else {
                next('not_found');
            }
        });
    });

    api.route('/me')
        .get(function(req, res, next) {
            User.findById(req.decoded.id,function(err, user) {
                if(err) {
                    return next(err);
                }
                config_common.sendData(req, {user:user}, next);
            });
        })
        .post(function(req, res, next) {
            if(!req.body.phone &&
                !req.body.real_name &&
                !req.body.gender &&
                !req.body.photo_url){
                return next('invalid_format');
            }
            if((req.body.phone && !config_common.checkPhone(req.body.phone)) ||
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
                    if(req.body.phone && req.body.phone != user.phone){
                        User.count({phone:req.body.phone}, function(err, count){
                            if(err){
                                return cb(err);
                            }
                            if(count > 0){
                                return cb('phone_is_used');
                            }
                            user.phone = req.body.phone;
                            edit = true;
                            cb(null, user);
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

    api.post('/modify',function(req, res, next) {
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
                if (config_common.checkAdmin(user.role) ||
                    user.company_id != req.decoded.company_id) {
                    return next('not_authorized');
                }
                if (req.body.phone && req.body.phone != user.phone) {
                    User.count({phone: req.body.phone}, function (err, count) {
                        if (err) {
                            return cb(err);
                        }
                        if (count > 0) {
                            return cb('phone_is_used');
                        }
                        user.phone = req.body.phone;
                        edit = true;
                        cb(null, user);
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
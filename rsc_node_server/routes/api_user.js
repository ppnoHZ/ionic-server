/**
 * Created by Administrator on 2015/11/6 0006.
 */
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var Company = require('../models/Company');
var Invitation = require('../models/Invitation');
var VerifyCode = require('../models/VerifyCode');
var config_common = require('../configs/config_common');

function createTokenUser(user)
{
    var token = jwt.sign(
        {
            id:user._id,
            company_id :user.company_id,
            role:user.role
        },
        config_common.secret_keys.user,
        {
            expiresIn: 60*60*24*7
        }
    );
    return token;
}

module.exports = function(app,express)
{
    var api = express.Router();

    api.get('/exist/:phone',function(req,res)
    {
       User.count({phone:req.params.phone},function(err,count)
       {
           if(err)
           {
               if(config_common.status == 'dev')
               {
                   res.send({status:'err',msg:err});
               }
               else
               {
                   res.send({status:'err'});
               }
               return;
           }
           res.send({status:'success',count:count});
       });
    });

    api.post('/signup',function(req,res)
    {
        if(!config_common.checkCommonString(req.body.full_name) || !config_common.checkPassword(req.body.password) ||
            !config_common.checkPhone(req.body.phone) || !config_common.checkRealName(req.body.real_name))
        {
            res.send({status:'invalid_format'});
            return;
        }
        var company = new Company(
            {
                full_name:req.body.full_name,
                type:req.body.type
            }
        );
        company.save(function(err)
        {
            if(err)
            {
                if(config_common.status == 'dev')
                {
                    res.send({status:'err',msg:err});
                }
                else
                {
                    res.send({status:'err'});
                }
                return;
            }
            VerifyCode.findById(req.body.verify_id,function(err,v_code)
            {
                if(err)
                {
                    if(config_common.status == 'dev')
                    {
                        res.send({status:'err',msg:err});
                    }
                    else
                    {
                        res.send({status:'err'});
                    }
                    return;
                }
                if(v_code)
                {
                    if(v_code.code == req.body.verify_code)
                    {
                        var user = new User(
                            {
                                phone:req.body.phone,
                                password:req.body.password,
                                role:req.body.role,
                                real_name:req.body.real_name,
                                gender:req.body.gender,
                                company_id:company._id
                            }
                        );

                        var u_id = '';
                        for(var i = 0; i < 4; i++)
                        {
                            var index = Math.floor(Math.random() * 10);
                            u_id += config_common.verify_codes[index];
                        }
                        user.u_id = u_id;

                        user.save(function(err)
                        {
                            if(err)
                            {
                                if(config_common.status == 'dev')
                                {
                                    res.send({status:'err',msg:err});
                                }
                                else
                                {
                                    res.send({status:'err'});
                                }
                                return;
                            }
                            var token = createTokenUser(user);
                            res.send({status:'success',user_id:user._id,company_id:company._id,token:token});
                        });
                    }
                    else
                    {
                        res.send({status:'invalid_verify_code'});
                    }
                }
                else
                {
                    res.send({status:'not_found'});
                }
            });
        });
    });

    api.post('/signup_by_invitation/:id',function(req,res)
    {
        if( !config_common.checkPassword(req.body.password) ||
            !config_common.checkPhone(req.body.phone) || !config_common.checkRealName(req.body.real_name))
        {
            res.send({status:'invalid_format'});
            return;
        }
        Invitation.findById(req.params.id,function(err,invitation)
        {
            if(err)
            {
                if(config_common.status == 'dev')
                {
                    res.send({status:'err',msg:err});
                }
                else
                {
                    res.send({status:'err'});
                }
                return;
            }
            if(invitation)
            {
                VerifyCode.findById(req.body.verify_id,function(err,v_code)
                {
                    if(err)
                    {
                        if(config_common.status == 'dev')
                        {
                            res.send({status:'err',msg:err});
                        }
                        else
                        {
                            res.send({status:'err'});
                        }
                        return;
                    }
                    if(v_code)
                    {
                        if(v_code.code == req.body.verify_code)
                        {
                            var user = new User(
                                {
                                    phone:req.body.phone,
                                    password:req.body.password,
                                    role:invitation.role,
                                    real_name:req.body.real_name,
                                    gender:req.body.gender,
                                    company_id:invitation.company_id
                                }
                            );

                            var u_id = '';
                            for(var i = 0; i < 4; i++)
                            {
                                var index = Math.floor(Math.random() * 10);
                                u_id += config_common.verify_codes[index];
                            }
                            user.u_id = u_id;
                            user.save(function(err)
                            {
                                if(err)
                                {
                                    if(config_common.status == 'dev')
                                    {
                                        res.send({status:'err',msg:err});
                                    }
                                    else
                                    {
                                        res.send({status:'err'});
                                    }
                                    return;
                                }
                                var token = createTokenUser(user);
                                var query = VerifyCode.Remove({_id:v_code._id});
                                query.exec();
                                res.send({status:'success',token:token});
                            });
                        }
                        else
                        {
                            res.send({status:'invalid_verify_code'});
                        }
                    }
                    else
                    {
                        res.send({status:'not_found'});
                    }
                });
            }
            else
            {
                res.send({status:'not_found'});
            }
        });
    });

    api.post('/login',function(req,res)
    {
        User.findOne({phone:req.body.phone},function(err,user)
        {
            if(err)
            {
                if(config_common.status == 'dev')
                {
                    res.send({status:'err',msg:err});
                }
                else
                {
                    res.send({status:'err'});
                }
                return;
            }
            var token = createTokenUser(user);
            res.send({status:'success',token:token});
        });
    });

    api.get('/get_verify_code/:phone',function(req,res)
    {
        if(!config_common.checkPhone(req.params.phone))
        {
            res.send({status:'invalid_format'});
            return;
        }
        VerifyCode.findOne(req.params.phone,function(err,v_code)
        {
            if(err)
            {
                if(config_common.status == 'dev')
                {
                    res.send({status:'err',msg:err});
                }
                else
                {
                    res.send({status:'err'});
                }
                return;
            }
            if(v_code)
            {
                var t_now = new Date();
                var ms_now = t_now.getTime();
                var diff = ms_now - v_code.time.getTime();
                if(diff <= 1000 * 60 * 5)
                {
                    res.send({status:'too_frequent'});
                }
                else
                {
                    var s_code = '';
                    for(var i = 0; i < 6; i++)
                    {
                        var index = Math.floor(Math.random() * 10);
                        s_code += config_common.verify_codes[index];
                    }
                    v_code.code = s_code;
                    v_code.time = t_now;
                    v_code.markModified('time');
                    v_code.save(function(err)
                    {
                        if(err)
                        {
                            if(config_common.status == 'dev')
                            {
                                res.send({status:'err',msg:err});
                            }
                            else
                            {
                                res.send({status:'err'});
                            }
                            return;
                        }
                        res.send({status:'success',code:s_code,id:v_code._id});
                    });
                }
            }
            else
            {
                var s_code = '';
                for(var i = 0; i < 6; i++)
                {
                    var index = Math.floor(Math.random() * 10);
                    s_code += config_common.verify_codes[index];
                }
                var verify_code = new VerifyCode(
                    {
                        code:s_code
                    });

                verify_code.save(function(err)
                {
                    if(err)
                    {
                        if(config_common.status == 'dev')
                        {
                            res.send({status:'err',msg:err});
                        }
                        else
                        {
                            res.send({status:'err'});
                        }
                        return;
                    }
                    res.send({status:'success',code:s_code,id:verify_code._id});
                });
            }
        });
    });

    api.use(function(req,res,next)
    {
        var token = req.body.token || req.params.token || req.headers['x-access-token'];
        if(token)
        {
            jwt.verify(token, config_common.secret_keys.user,function(err,decoded)
            {
                if(err)
                {
                    res.status(403).send({status:'auth_failed'});
                    return;
                }
                req.decoded = decoded;
                next();
            });
        }
        else
        {
            res.status(403).send({status:'no_token'});
        }
    });

    api.get('/invite/:role',function(req,res)
    {
        var s_role = config_common.user_roles[req.params.role];
        if(s_role === undefined || s_role === config_common.user_roles.TRADE_ADMIN || s_role === config_common.user_roles.TRAFFIC_ADMIN)
        {
            res.send({status:'invalid_role'});
            return;
        }
        Company.findById(req.decoded.company_id).select('full_name').exec(function(err,company)
        {
            if(err)
            {
                if(config_common.status == 'dev')
                {
                    res.send({status:'err',msg:err});
                }
                else
                {
                    res.send({status:'err'});
                }
                return;
            }
            if(company)
            {
                var invitation = new Invitation(
                    {
                        company_name:company.full_name,
                        company_id:company._id,
                        role:s_role
                    }
                );
                invitation.save(function(err)
                {
                    if(err)
                    {
                        if(config_common.status == 'dev')
                        {
                            res.send({status:'err',msg:err});
                        }
                        else
                        {
                            res.send({status:'err'});
                        }
                        return;
                    }
                    res.send({status:'success',company_id:company._id,company_name:company.full_name,role:s_role});
                });
            }
            else
            {
                res.send({status:'not_found'});
            }
        });
    });

    api.route('/me')
        .get(function(req,res)
        {
            User.findById(req.decoded.id,function(err,user)
            {
                if(err)
                {
                    if(config_common.status == 'dev')
                    {
                        res.send({status:'err',msg:err});
                    }
                    else
                    {
                        res.send({status:'err'});
                    }
                    return;
                }
                res.send({status:'success',user:user});
            });
        })
        .post(function(req,res)
        {
            if(!config_common.checkPhone(req.body.phone))
            {
                res.send('invalid_format');
                return;
            }
            User.count({phone:req.body.phone},function(err,count)
            {
                if(err)
                {
                    if(config_common.status == 'dev')
                    {
                        res.send({status:'err',msg:err});
                    }
                    else
                    {
                        res.send({status:'err'});
                    }
                    return;
                }
                if(count>0)
                {
                    res.send({status:'already_exist'});
                }
                else
                {
                    User.findById(req.decoded.id,function(err,user)
                    {
                        if(err)
                        {
                            if(config_common.status == 'dev')
                            {
                                res.send({status:'err',msg:err});
                            }
                            else
                            {
                                res.send({status:'err'});
                            }
                            return;
                        }
                        user.phone = req.body.phone;
                        if(req.body.real_name)
                        {
                            if(config_common.checkRealName(req.body.real_name))
                            {
                                user.real_name = req.body.real_name;
                            }
                        }
                        if(req.body.gender)
                        {
                            if(config_common.checkCommonString(req.body.gender))
                            {
                                user.gender = req.body.gender;
                            }
                        }
                        user.save(function(err)
                        {
                            if(err)
                            {
                                if(config_common.status == 'dev')
                                {
                                    res.send({status:'err',msg:err});
                                }
                                else
                                {
                                    res.send({status:'err'});
                                }
                                return;
                            }
                            res.send({status:'success'});
                        });
                    });
                }
            });
        });

    api.post('/modify/:id',function(req,res)
    {
        var s_role = config_common.user_roles[req.body.role];
        if(!config_common.checkRealName(req.body.real_name) || !config_common.checkPhone(req.body.phone) || s_role === undefined)
        {
            res.send({status:'invalid_format'});
            return;
        }

        if((req.decoded.role!=config_common.user_roles.TRADE_ADMIN&&req.decoded.role!=config_common.user_roles.TRAFFIC_ADMIN)||
            (s_role === config_common.user_roles.TRADE_ADMIN && s_role === config_common.user_roles.TRAFFIC_ADMIN))
        {
            res.send({status:'not_authorized'});
            return;
        }

        User.findById(req.params.id,function(err,user)
        {
            if(err)
            {
                if(config_common.status == 'dev')
                {
                    res.send({status:'err',msg:err});
                }
                else
                {
                    res.send({status:'err'});
                }
                return;
            }
            if(user)
            {
                if(user.role === config_common.user_roles.TRADE_ADMIN || user.role === config_common.user_roles.TRAFFIC_ADMIN)
                {
                    res.send({status:'not_authorized'});
                    return;
                }
                User.count({phone: req.body.phone},function(err,count)
                {
                    if(err)
                    {
                        if(config_common.status == 'dev')
                        {
                            res.send({status:'err',msg:err});
                        }
                        else
                        {
                            res.send({status:'err'});
                        }
                        return;
                    }
                    if(count == 0)
                    {
                        user.phone = req.body.phone;
                        user.real_name = req.body.real_name;
                        user.role = s_role;
                        user.save(function(err)
                        {
                            if(err)
                            {
                                if(config_common.status == 'dev')
                                {
                                    res.send({status:'err',msg:err});
                                }
                                else
                                {
                                    res.send({status:'err'});
                                }
                            }
                            res.send({status:'success'});
                        });
                    }
                    else
                    {
                        res.send({status:'already_exist'});
                    }
                });
            }
            else
            {
                res.send({status:'not_found'});
            }
        });
    });

    return api;
};
/**
 * Created by Administrator on 2015/11/23.
 */
var express = require('express');
var jwt = require('jsonwebtoken');
var Company = require('../models/Company_traffic');
var Invitation = require('../models/Invitation');
var config_common = require('../configs/config_common');

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

    api.use(require('../middlewares/mid_verify_user')());

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
                        role:req.params.role,
                        type: config_common.company_category.TRAFFIC,
                        time_create:new Date()
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

    return api;
};
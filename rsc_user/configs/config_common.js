/**
 * Created by Administrator on 2015/11/6 0006.
 */
var _ = require('underscore');
var configCity = require('./config_city');
var configProvince = require('./config_province');
var configDistrict = require('./config_district');

module.exports = {
    verify_codes_timeout: 10*60*1000,   //验证码超时时间
    verify_codes_resend: 3*60*1000,     //验证码重发时间
    token_user_timeout: 60*60*24*7,     //用户秘钥超时时间
    token_invite_timeout: 60*60*1000,   //用户秘钥超时时间

    verify_codes : ['0','1','2','3','4','5','6','7','8','9'],
    secret_keys: {
        user:'user',
        invite:'invite',
        server_traffic:'server_traffic'
    },

    user_roles : {
        'TRADE_ADMIN':'TRADE_ADMIN',
        'TRADE_PURCHASE':'TRADE_PURCHASE',
        'TRADE_SALE':'TRADE_SALE',
        'TRADE_MANUFACTURE':'TRADE_MANUFACTURE',
        'TRADE_FINANCE':'TRADE_FINANCE',
        'TRADE_STORAGE':'TRADE_STORAGE',
        'TRAFFIC_ADMIN':'TRAFFIC_ADMIN',
        'TRAFFIC_DRIVER':'TRAFFIC_DRIVER'
    },

    truck_types : {
        'HUO':'HUO',
        'ZI_XIE':'ZI_XIE',
        'LENG_CANG':'LENG_CANG',
        'YOU_GUAN':'YOU_GUAN',
        'BAO_WEN':'BAO_WEN',
        'QI_ZHONG':'QI_ZHONG',
        'ZHONG_XING_GUAN':'ZHONG_XING_GUAN',
        'TIE_LONG':'TIE_LONG',
        'BU_XIU_GANG_DA_CAO_GUAN':'BU_XIU_GANG_DA_CAO_GUAN'
    },

    truck_volumes : {
        'GAO_LAN':'GAO_LAN',
        'QIAN_SI_HOU_BA':'QIAN_SI_HOU_BA',
        'BAN_GUA':'BAN_GUA',
        'XIANG_SHI':'XIANG_SHI',
        'DAN_QIAO':'DAN_QIAO',
        'SI_QIAO':'SI_QIAO',
        'DI_LAN':'DI_LAN',
        'SAN_QIAO':'SAN_QIAO',
        'HOU_BA_LUN':'HOU_BA_LUN',
        'CHANG_PENG':'CHANG_PENG',
        'QUAN_GUA':'QUAN_GUA',
        'ZHONG_LAN':'ZHONG_LAN',
        'JIA_CHANG_GUA':'JIA_CHANG_GUA'
    },

    truck_longs : {
        '2_5':'2_5',
        '6_8':'6_8',
        '9_10':'9_10',
        '11_12':'11_12',
        '13_15':'13_15',
        '16_17.5':'16_17',
        '17.5_':'17.5_'
    },

    truck_weights : {
        '2_5':'2_5',
        '6_10':'6_10',
        '11_15':'11_15',
        '16_20':'16_20',
        '21_25':'21_25',
        '26_30':'26_30',
        '31_35':'31_35',
        '36_40':'36_40'
    },

    company_category: {
        'TRADE':'TRADE',
        'TRAFFIC':'TRAFFIC'
    },

    verification_phase: {
        'NO':'NO',
        'PROCESSING':'PROCESSING',
        'SUCCESS':'SUCCESS',
        'FAILED':'FAILED'
    },

    checkCommonString:function(input) {
        var reg = /^[\s\S]{2,40}$/;
        return reg.test(input);
    },

    checkPassword:function(input) {
        var reg = /^[a-zA-Z0-9]{6,16}$/;
        return reg.test(input);
    },

    checkRealName:function(input) {
        var reg = /^[a-zA-Z\u4e00-\u9fa5\s]{2,40}$/;
        return reg.test(input);
    },

    checkGender:function(gender) {
        return gender == 'FEMALE' || gender == 'MALE';
    },

    checkPhone:function(input) {
        var reg = /(^13[0-9]{9}$)|(^15[0-9]{9}$)|(^17[0-9]{9}$)|(^18[012356789][0-9]{8}$)/;
        return reg.test(input);
    },

    checkCompanyType:function(type) {
        return !!(this.company_category[type]);
    },

    checkAdmin:function(role) {
        return role.indexOf('ADMIN') >= 0;
    },

    checkDriver:function(role) {
        return role.indexOf('DRIVER') >= 0;
    },

    checkTrafficCompanyByRole:function(role) {
        return role.indexOf(this.company_category.TRAFFIC) >= 0;
    },

    checkRoleType:function(type) {
        return !!(this.user_roles[type]);
    },

    checkTruckType:function(type) {
        return !!(this.truck_types[type]);
    },

    checkTruckVolume:function(type) {
        return !!(this.truck_volumes[type]);
    },

    checkTruckLong:function(type) {
        return !!(this.truck_longs[type]);
    },

    checkTruckWeight:function(type) {
        return !!(this.truck_weights[type]);
    },

    checkProvince:function(data) {
        return !!(configProvince[data]);
    },

    checkCity:function(pro, city) {
        return !!(configCity[pro][city]);
    },

    checkDistrict:function(city, dis) {
        if(dis){
            return !!(configDistrict[city][dis]);
        }else{
            return true;
        }
    },

    checkNumberBiggerZero:function(num) {
        return !(!num || !_.isNumber(num) || num <= 0);
    },

    sendData:function(req, data, next) {
        req.result = data;
        next('success');
    },

    getVerifyCode:function(){
        var s_code = '';
        for(var i = 0; i < 6; i++) {
            var index = Math.floor(Math.random() * this.verify_codes.length);
            s_code += this.verify_codes[index];
        }
        return s_code;
    },

    getCompanyTypeByRole:function(role){
        return role.split('_')[0];
    }
};
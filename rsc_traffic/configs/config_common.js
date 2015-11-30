/**
 * Created by Administrator on 2015/11/16 0016.
 */
var _ = require('underscore');

module.exports = {
    entry_per_page:10,                      //采购单每页给十个
    token_server_traffic_timeout: 10,    //物流服务器通知其他服务器秘钥时间
    secret_keys: {
        user:'user',
        invite:'invite',
        server_traffic:'server_traffic'
    },

    order_status: {
        'ineffective':{eng:'ineffective',chn:'未生效'},
        'effective':{eng:'effective',chn:'已生效'},
        'complete':{eng:'complete',chn:'完成'},
        'cancelled':{eng:'cancelled',chn:'取消'}
    },

    route_status: {
        'ready': 'ready',
        'driving':'driving',
        'finish':'finish',
        'cancelled':'cancelled'
    },

    goods: {
        coal: {
            eng:'coal',chn:'煤炭',
            att_traffic: {
                c_001: '运输到目的地，+-#吨为正常耗损，不涉及违约',
                c_002: '如超过#吨，没减少#吨，减少#元。',
                c_003: '延期运送到目的地，每延期#天扣#元。'
            }
        }
    },

    payment_choice: {
        url:{eng:'url',chn:'使用凭证'},
        credit:{eng:'credit',chn:'使用信用额'}
    },

    att_liability:'违约责任',

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

    index_collection :
        ['a','b','c','d','e','f','g','h','i','j','k','m','n','p','q','r','s','t','u','v','w','x','y','z',
            '2','3','4','5','6','7','8','9'],

    checkNumberBiggerZero:function(num) {
        return !(!num || !_.isNumber(num) || num <= 0);
    },

    checkAttTraffic:function(good, att) {
        if(att.length > _.size(this.goods[good].att_traffic)){
            return false;
        }
        for(var i = 0; i < att.length; i++){
            if(!_.isArray(att[i]) || att[i].length > 5){
                return false;
            }
        }
        return true;
    },

    checkGoods:function(num) {
        return !!(this.goods[num]);
    },

    checkPaymentStyle:function(num) {
        return (this.checkNumberBiggerZero(num) && num <= 100);
    },

    checkCommonString:function(input) {
        var reg = /^[\s\S]{2,40}$/;
        return reg.test(input);
    },

    checkTime:function(time) {
        return !(!time || (new Date(time).getTime() <= Date.now()));
    },

    getFindDemandCondition:function(category){
        var obj = {};
        if(this.checkGoods(category)){
            obj.category = category;
        }
        return obj;
    },

    getSortDemandCondition:function(order){
        var obj = {};
        if(order == 'data'){
            obj.time_creation = -1;
        }else if(order == 'amount'){
            obj.amount = -1;
        }
        return obj;
    },

    dateNumberToString: function(num) {
        var str = '';
        if(num < 10) {
            str = '0' + num.toString();
        } else {
            str = num.toString();
        }
        return str;
    },

    getOrderIndex:function () {
        var index = 'WL-';
        var today = new Date();
        var year = today.getFullYear().toString();
        var month = this.dateNumberToString(today.getMonth() + 1);
        var date = this.dateNumberToString(today.getDate());
        var hour = this.dateNumberToString(today.getHours());
        var minute = this.dateNumberToString(today.getMinutes());
        var second = this.dateNumberToString(today.getSeconds());
        var random = '';
        for(var i = 0; i< 5; i++) {
            var s_index = Math.floor(Math.random() * config_common.index_collection.length);
            random += this.index_collection[s_index];
        }
        index += year+month+date+'-'+hour+minute+second+'-'+random;
        return index;
    },

    sendData:function(req, data, next) {
        req.result = data;
        next('success');
    }
};
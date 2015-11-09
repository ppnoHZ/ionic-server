/**
 * Created by Administrator on 2015/11/5.
 */

common = {};
//商品种类检查
common.categoryCheck = function(data){
    if(!config.category[data]){
        return errorCode.categoryNotFound;
    }
};
//商品数量检查
common.amountCheck = function(data){
    check(data, Number);
    if(!data || data <= 0){
        return errorCode.amount;
    }
};
//月份检查
common.monthCheck = function(data){
    check(data, String);
    if(parseInt(data) < 1 || parseInt(data) > 12){
        return errorCode.month;
    }
};
//时间检查(毫秒值)
common.timeCheck = function(data){
    check(data, Number);
    if(data <= Date.now()){
        return errorCode.time;
    }
};
//地址检查
common.addressCheck = function(data){
    check(data, String);
    var reg = /^[\s\S]{2,20}$/;
    if(!reg.test(data)){
        return errorCode.address;
    }
};
//支付方式检查
common.stylePaymentCheck = function(data){
    check(data, Number);
    if(!data || data < 0 || data > 100){
        return errorCode.stylePayment;
    }
};
//质检方检查
common.originCheck = function(data){
    if(!config.originCheck[data]){
        return errorCode.originCheck;
    }
};
//文字检查
common.wordCheck = function(data){
    check(data, String);
    if (!data || data.length === 0) {
        return errorCode.wordIsNull;
    }
    var reg = /^[\u4E00-\u9FA5]{2,10}$/;
    if(!reg.test(data)){
        return errorCode.wordForm;
    }
};
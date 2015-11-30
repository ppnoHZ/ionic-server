/**
 * Created by Administrator on 2015/11/25.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrafficOrder = new Schema({
    user_demand_id: {type:String, required:true},            //创建者id
    company_demand_id: {type:String, required:true},        //创建者公司id
    user_traffic_id :{type:String, required:true},          //创建人
    company_traffic_id : {type:String, required:true},     //所属公司
    amount: {type:Number, required:true},                    //凑单数
    category: {type:String, required:true},                 //商品类型
    category_chn:{type:String, required:true},              //商品中文名
    price_unit : {type:Number, required:true},              //每吨价格
    time_arrival:{type:Date, required:true},                //提货时间
    location_arrival:{type:String, required:true},         //提货地点
    time_depart:{type:Date, required:true},                 //交货时间
    location_depart:{type:String, required:true},          //交货地点
    payment_advance:{type:Number, required:true},           //预付款百分比
    att_traffic:{type:String, required:true},               // 物流细则
    att_liability:{type:String, required:true},             // 违约责任
    time_creation:{type:Date, required:true},               //创建时间
    status: {type:String, required:true},                    //订单状态
    step: {type:Number, required:true},                      //流程状态
    time_current_step: {type:Date, required:true},         //流程状态时间
    url_advanced_payment:String,                             // 预付款凭证的URL地址 -- 采购方上传
    url_final_payment:String,                                // 尾款付款凭证URL地址 -- 采购方上传
    style_advanced_payment:String,                          // 采购方支付预付款方式
    style_final_payment:String,                              // 采购方支付尾款的方式
    insurance : {type:Boolean, required:true},              //是否有货物保险
    v_info: {type:Array, required:true},                     //{truck_id:xxx, user_id:xxx}
    offer_id: {type: String, required:true},                  //抢单id
    demand_id: {type: String, required:true}                  //挂单id
});

module.exports = mongoose.model('TrafficOrder', TrafficOrder);
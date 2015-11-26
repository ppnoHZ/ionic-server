/**
 * Created by Administrator on 2015/11/25 0025.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandOfferSchema = new Schema(
    {
        user_id :{type:String, required:true},                          // 表单发起者的用户ID
        company_id : {type:String, required:true},                      // 表单发起者所属公司的ID
        company_name:{type:String,required:true},                       // 表单发起公司的名称 -- 显示用
        demand_id:{type:String, required:true},                         // 对应的采购单单号ID
        demand_user_id:{type:String, required:true},                    // 对应采购单创建者ID
        demand_company_id:{type:String,required:true},                  // 对应采购单创建公司ID
        demand_company_name:{type:String,required:true},                // 对应采购单创建公司名称 -- 显示用
        price:Number,                                                   // 抢单方的报价
        payment_advance:Number,                                         // 抢单方报出的预付款
        time_transaction:Date,                                          // 交货时间
        location_storage:String,                                        // 仓库地点
        amount:Number,                                                  // 出货量，或最小凑单量
        change_remain:{type:Number,default:3},                         // 剩余的能够修改次数
        time_creation:Date
    }
);

module.exports = mongoose.model('DemandOffer',DemandOfferSchema);
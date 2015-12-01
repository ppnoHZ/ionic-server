/**
 * Created by ZHR on 2015/11/16 0016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandSchema = new Schema(
    {
        user_id :{type:String, required:true},                  // 表单发起者的用户ID。
        company_id : {type:String, required:true},              // 表单发起者所属公司的ID。
        company_name:{type:String,required:true},               // 发起公司的名称
        category : {type:String, default:''},                   // 货物种类，英文标识字段。
        category_chn:{type:String ,default:''},                 // 货物种类，中文显示字段。
        price:Number,                                            // 单价
        amount:Number,                                           // 采购数量
        desc:[],                                                 // 货物描述字段，二维数组。
        time_traffic:Date,                                       // 提货到货时间 -- 根据报的是出厂价还是到岸价做具体显示判断
        location_storage:String,                                 // 到货地点
        payment_advance:Number,                                  // 预付款 -- 百分比
        payment_style: String,                                   // 报价方式 -- 出厂价或到岸价
        validity:{type:Boolean,default:true},                   // 是否有效，即是否可抢单
        time_validity: {type:Date,required:true},                // 有效期
        can_join : Boolean,                                      // 是否可凑单
        //origin_check: String,                                  // 质检结果来源：买方，卖方，第三方
        att_product: [],                                         // 产品结算细则
        att_traffic:[],                                          // 物流细则
        att_liability:{type:String,select:false},               // 违约责任细则
        //editor_id:{type:String, default:''},                   // 最后修改者id
        //time_edit:Date,                                        // 最后修改时间
        //status:String,                                         // 单据状态
        time_creation:{type:Date,required:true}                  // 单据发布时间
    }
);

module.exports = mongoose.model('Demand',DemandSchema);
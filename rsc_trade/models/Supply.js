/**
 * Created by ZHR on 2015/11/16 0016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SupplySchema = new Schema(
    {
        user_id :{type:String, required:true},                  // 表单发起者的用户ID。
        company_id : {type:String, required:true},              // 表单发起者所属公司的ID。
        category : {type:String, default:''},                   // 货物种类，英文标识字段。
        category_chn:{type:String ,default:''},                 // 货物种类，中文显示字段。
        desc:{type:Schema.Types.Mixed,default:{}},              // 货物描述字段，随着货物不同而不同。
        offer_amount:{type:Number,default:1},                   // 报价组的数量
        offer_list:[],                                           // 报价组
        location_arrival:String,                                 // 提货地点
        style_payment:Number,                                    // 付款方式
        origin_check: String,                                    // 质检结果来源：买方，卖方，第三方
        att_account: String,                                     // 产品结算细则
        att_liability:String,                                    // 违约责任细则
        editor_id:{type:String, default:''},                    // 最后修改者id
        time_edit:Date,                                          // 最后修改时间
        status:String,                                           // 单据状态
        time_creation:{type:Date,default:Date.now()}            // 单据发布时间
    }
);

module.exports = mongoose.model('Supply',SupplySchema);


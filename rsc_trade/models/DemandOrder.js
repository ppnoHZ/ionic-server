/**
 * Created by Administrator on 2015/11/25 0025.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandOrderSchema = new Schema(
    {
        company_demand_id:{type:String,required:true},          // 需求方公司ID -- 来自采购单
        company_supply_id:{type:String,required:true},          // 供应方公司ID -- 来自抢单
        user_demand_id:{type:String,required:true},             // 需求方订单发起人ID -- 来自采购单
        user_supply_id:{type:String,required:true},             // 供应方订单承接人ID -- 来自抢单
        offer_id:{type:String,required:true},                   // 订单来自的抢单的ID -- 来自抢单
        category:String,                                         // 商品类型 -- 来自采购单
        category_chn:String,                                     // 商品类型中文 -- 来自采购单
        amount:Number,                                           // 采购数量 -- 来自采购单
        price_unit:Number,                                       // 货物单价 -- 来自抢单
        //price_total:Number,                                    // 货物总价 -- 计算得出
        desc:[],                                                 // 货物描述字段，随着货物不同而不同 -- 来自采购单
        time_depart:Date,                                        // 提货时间 -- 出厂价时有效
        time_arrival:Date,                                       // 到货时间 -- 到岸价时有效
        location_depart:String,                                  // 提货地点 -- 来自抢单
        location_arrival:String,                                 // 到货地点 -- 来自采购单
        payment_advance:Number,                                  // 预付款 -- 百分比 -- 来自抢单
        payment_style: String,                                   // 报价方式 -- 出厂价或到岸价 -- 来自采购单
        check_product:[],                                        // 产品检验结果 -- 由采购方填写
        att_product: [],                                         // 产品结算细则 -- 来自采购单
        att_traffic:[],                                          // 物流细则 -- 来自采购单
        att_liability:String,                                    // 违约责任细则 -- 来自采购单
        traffic_orders:[String],                                 // 所关联的物流订单单号列表 -- 物流管控方手填
        time_creation:Date,                                      // 创建时间 -- 系统自动生成
        status:String,                                           // 订单状态 -- 系统自动管理
        step:Number,                                             // 订单步骤 -- 系统自动管理
        time_current_step:Date,                                  // 停在当前步骤的初始日期 -- 系统自动记录
        url_advanced_payment:String,                             // 预付款凭证的URL地址 -- 采购方上传
        url_final_payment:String,                                // 尾款付款凭证URL地址 -- 采购方上传
        //credit_remain: Number,                                 // 采购方从供应方获得的信用额度，需要从账户系统读取
        style_advanced_payment:String,                           // 采购方支付预付款方式
        style_final_payment:String                               // 采购方支付尾款的方式
    }
);

module.exports = mongoose.model('DemandOrder',DemandOrderSchema);
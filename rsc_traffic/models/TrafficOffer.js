/**
 * Created by Administrator on 2015/11/16 0016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrafficOffer = new Schema({
    user_id :{type:String, required:true},                  //创建人
    company_id : {type:String, required:true},             //所属公司
    price : {type:Number, required:true},                   //每吨价格
    demand_id: {type:String, required:true},               //所属发布物流id
    style_payment: {type:Number, required:true},           //支付方式
    amount:  {type:Number, required:true},                  //凑单数
    v_info:  {type:Array, required:true},                   //{truck_id:xxx, user_id:xxx}
    modify_count:{type:Number, default:3},                  //修改次数
    //editor_id:{type:String, default:''},                    //修改人
    time_edit: {type:Date, required:true},                  //修改时间
    time_creation:{type:Date, required:true}               //创建时间
});

module.exports = mongoose.model('TrafficOffer', TrafficOffer);

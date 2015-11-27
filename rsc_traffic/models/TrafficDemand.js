/**
 * Created by Administrator on 2015/11/16 0016.
 * �ɹ���
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrafficDemand = new Schema({
        user_id :{type:String, required:true},                  //创建者id
        company_id : {type:String, required:true},              //创建者公司id
        category : {type:String, required:true},                //商品类型
        category_chn:{type:String, required:true},              //商品中文名
        amount:{type:Number, required:true},                    //数量
        time_arrival:{type:Date, required:true},               //交货时间
        location_arrival:{type:String, required:true},        //交货地点
        time_depart:{type:Date, required:true},                //交货时间
        location_depart:{type:String, required:true},         //交货地点
        style_payment:{type:Number, required:true},            //支付方式
        time_validity: {type:Date, required:true},             //有效期
        can_join : {type:Boolean, required:true},               //是否可拼单
        insurance : {type:Boolean, required:true},              //是否有货物保险
        att_traffic:{type:Array, required:true},               // 物流细则
        att_liability:{type:String, required:true},            // 违约责任
        time_creation:{type:Date, required:true}               // 创建时间
});

module.exports = mongoose.model('TrafficDemand', TrafficDemand);
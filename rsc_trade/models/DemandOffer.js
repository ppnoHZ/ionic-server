/**
 * Created by Administrator on 2015/11/25 0025.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandOfferSchema = new Schema(
    {
        user_id :{type:String, required:true},                          // �������ߵ��û�ID
        company_id : {type:String, required:true},                      // ��������������˾��ID
        company_name:{type:String,required:true},                       // ������˾������ -- ��ʾ��
        demand_id:{type:String, required:true},                         // ��Ӧ�Ĳɹ�������ID
        demand_user_id:{type:String, required:true},                    // ��Ӧ�ɹ���������ID
        demand_company_id:{type:String,required:true},                  // ��Ӧ�ɹ���������˾ID
        demand_company_name:{type:String,required:true},                // ��Ӧ�ɹ���������˾���� -- ��ʾ��
        price:Number,                                                   // �������ı���
        payment_advance:Number,                                         // ������������Ԥ����
        time_transaction:Date,                                          // ����ʱ��
        location_storage:String,                                        // �ֿ�ص�
        amount:Number,                                                  // ������������С�յ���
        change_remain:{type:Number,default:3},                         // ʣ����ܹ��޸Ĵ���
        time_creation:Date
    }
);

module.exports = mongoose.model('DemandOffer',DemandOfferSchema);
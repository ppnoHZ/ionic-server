/**
 * Created by ZHR on 2015/11/16 0016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SupplySchema = new Schema(
    {
        user_id :{type:String, required:true},                  // �������ߵ��û�ID��
        company_id : {type:String, required:true},              // ��������������˾��ID��
        category : {type:String, default:''},                   // �������࣬Ӣ�ı�ʶ�ֶΡ�
        category_chn:{type:String ,default:''},                 // �������࣬������ʾ�ֶΡ�
        desc:{type:Schema.Types.Mixed,default:{}},              // ���������ֶΣ����Ż��ﲻͬ����ͬ��
        offer_amount:{type:Number,default:1},                   // �����������
        offer_list:[],                                           // ������
        location_arrival:String,                                 // ����ص�
        style_payment:Number,                                    // ���ʽ
        origin_check: String,                                    // �ʼ�����Դ���򷽣�������������
        att_account: String,                                     // ��Ʒ����ϸ��
        att_liability:String,                                    // ΥԼ����ϸ��
        editor_id:{type:String, default:''},                    // ����޸���id
        time_edit:Date,                                          // ����޸�ʱ��
        status:String,                                           // ����״̬
        time_creation:{type:Date,default:Date.now()}            // ���ݷ���ʱ��
    }
);

module.exports = mongoose.model('Supply',SupplySchema);


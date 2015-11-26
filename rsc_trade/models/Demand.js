/**
 * Created by Administrator on 2015/11/16 0016.
 * �ɹ���
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandSchema = new Schema(
    {
        user_id :{type:String, required:true},                  // �������ߵ��û�ID��
        company_id : {type:String, required:true},              // ��������������˾��ID��
        company_name:{type:String,required:true},               // ����˾������
        category : {type:String, default:''},                   // �������࣬Ӣ�ı�ʶ�ֶΡ�
        category_chn:{type:String ,default:''},                 // �������࣬������ʾ�ֶΡ�
        amount:Number,                                           // �ɹ�����
        desc:[],                                                 // ���������ֶΣ���ά���顣
        time_traffic:Date,                                       // �������ʱ�� -- ���ݱ����ǳ����ۻ��ǵ�������������ʾ�ж�
        location_storage:String,                                 // �����ص�
        payment_advance:Number,                                  // Ԥ���� -- �ٷֱ�
        payment_style: String,                                   // ���۷�ʽ -- �����ۻ򵽰���
        validity:{type:Boolean,default:true},                   // �Ƿ���Ч�����Ƿ������
        time_validity: {type:Date,required:true},                // ��Ч��
        can_join : Boolean,                                      // �Ƿ�ɴյ�
        //origin_check: String,                                  // �ʼ�����Դ���򷽣�������������
        att_product: [],                                         // ��Ʒ����ϸ��
        att_traffic:[],                                          // ����ϸ��
        att_liability:String,                                    // ΥԼ����ϸ��
        //editor_id:{type:String, default:''},                   // ����޸���id
        //time_edit:Date,                                        // ����޸�ʱ��
        //status:String,                                         // ����״̬
        time_creation:{type:Date,required:true}                  // ���ݷ���ʱ��
    }
);

module.exports = mongoose.model('Demand',DemandSchema);
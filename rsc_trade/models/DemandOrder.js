/**
 * Created by Administrator on 2015/11/25 0025.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandOrderSchema = new Schema(
    {
        company_demand_id:{type:String,required:true},          // ���󷽹�˾ID -- ���Բɹ���
        company_supply_id:{type:String,required:true},          // ��Ӧ����˾ID -- ��������
        user_demand_id:{type:String,required:true},             // ���󷽶���������ID -- ���Բɹ���
        user_supply_id:{type:String,required:true},             // ��Ӧ�������н���ID -- ��������
        offer_id:{type:String,required:true},                   // �������Ե�������ID -- ��������
        category:String,                                         // ��Ʒ���� -- ���Բɹ���
        category_chn:String,                                     // ��Ʒ�������� -- ���Բɹ���
        amount:Number,                                           // �ɹ����� -- ���Բɹ���
        price_unit:Number,                                       // ���ﵥ�� -- ��������
        //price_total:Number,                                    // �����ܼ� -- ����ó�
        desc:[],                                                 // ���������ֶΣ����Ż��ﲻͬ����ͬ -- ���Բɹ���
        time_depart:Date,                                        // ���ʱ�� -- ������ʱ��Ч
        time_arrival:Date,                                       // ����ʱ�� -- ������ʱ��Ч
        location_depart:String,                                  // ����ص� -- ��������
        location_arrival:String,                                 // �����ص� -- ���Բɹ���
        payment_advance:Number,                                  // Ԥ���� -- �ٷֱ� -- ��������
        payment_style: String,                                   // ���۷�ʽ -- �����ۻ򵽰��� -- ���Բɹ���
        check_product:[],                                        // ��Ʒ������ -- �ɲɹ�����д
        att_product: [],                                         // ��Ʒ����ϸ�� -- ���Բɹ���
        att_traffic:[],                                          // ����ϸ�� -- ���Բɹ���
        att_liability:String,                                    // ΥԼ����ϸ�� -- ���Բɹ���
        traffic_orders:[String],                                 // ���������������������б� -- �����ܿط�����
        time_creation:Date,                                      // ����ʱ�� -- ϵͳ�Զ�����
        status:String,                                           // ����״̬ -- ϵͳ�Զ�����
        step:Number,                                             // �������� -- ϵͳ�Զ�����
        time_current_step:Date,                                  // ͣ�ڵ�ǰ����ĳ�ʼ���� -- ϵͳ�Զ���¼
        url_advanced_payment:String,                             // Ԥ����ƾ֤��URL��ַ -- �ɹ����ϴ�
        url_final_payment:String,                                // β���ƾ֤URL��ַ -- �ɹ����ϴ�
        //credit_remain: Number,                                 // �ɹ����ӹ�Ӧ����õ����ö�ȣ���Ҫ���˻�ϵͳ��ȡ
        style_advanced_payment:String,                           // �ɹ���֧��Ԥ���ʽ
        style_final_payment:String                               // �ɹ���֧��β��ķ�ʽ
    }
);

module.exports = mongoose.model('DemandOrder',DemandOrderSchema);
/**
 * Created by Administrator on 2015/11/5.
 */
supplyOrder = new Mongo.Collection("supplyOrder");

function SupplyOrder(){
    this.companyID = '';    //公司id
    this.userID = '';   //用户id
    this.editID = '';   //最后修改人id
    this.timeEdit = new Date(); //最后修改时间
    this.timeCreation = new Date();   //创建时间
    this.category = ''; //货物类型
    this.categoryChn = ''; //货物类型中文
    this.offerAmount = 0;    //报价组数量
    this.desc = {}; //货物参数描述
    this.locationArrival = '';  //提货地点
    this.stylePayment = 0;  //付款方式
    this.originCheck = '';  //质检结果
    this.attAccount = '';   //产品结算细则
    this.offerList = [];   //报价组[offerListData]
    this.attLiability = '';   //违约责任
    this.status = config.purchaseOrderStatus.NORMAL;   //状态
}

function OfferListData(){
    this.amount = 0;    //供货量
    this.priceDep = 0;   //出厂价
    this.arrAmount = 0;   //到岸价数组个数
    this.arrList = []; //到岸价数组
}

function ArrListData(){
    this.routeStart = '';    //起点
    this.routeEnd = '';   //终点
    this.price = 0;   //价格每吨
}

supplyOrder.create = function(obj){
    var data = new SupplyOrder();
    data.category = obj.category; //货物类型
    data.categoryChn = config.categoryName[obj.category]; //货物类型中文
    data.offerAmount = obj.offerList.length;    //报价组数量
    var res = token.decode(obj.token, Meteor.settings.secretKeys.trade);
    data.companyID = res.companyID;    //公司id
    data.userID = res.userID;    //用户id
    data.desc = categoryParam.create(obj.category, obj.desc);//货物参数描述
    data.locationArrival = obj.locationArrival;  //提货地点
    data.stylePayment = parseInt(obj.stylePayment)/100;  //付款方式
    data.originCheck = obj.originCheck;  //质检结果
    data.attAccount = '';   //产品结算细则
    data.attLiability = '';   //违约责任
    data.offerList = supplyOrder.createOfferList(obj.offerList);
    return supplyOrder.insert(data);
};

supplyOrder.createOfferList = function(arr){
    var array = [];
    for(var i = 0; i < arr.length; i++){
        var data = new OfferListData();
        data.amount = arr[i].amount;    //供货量
        data.priceDep = arr[i].priceDep;   //出厂价
        data.arrAmount = arr[i].arrList.length;   //到岸价数组个数
        data.arrList = supplyOrder.createArrList(arr[i].arrList); //到岸价数组
        array.push(data);
    }
    return array;
};

supplyOrder.createArrList = function(arr){
    var array = [];
    for(var i = 0; i < arr.length; i++){
        var data = new ArrListData();
        data.routeStart = arr[i].routeStart;
        data.routeEnd = arr[i].routeEnd;
        data.price = arr[i].price;
        array.push(data);
    }
    return array;
};

//现货报价数组三个月价格
supplyOrder.offerListCheck = function(data){
    check(data, [Object]);
    if(data.length > config.supplyOrderOfferListCount ||
        data.length <= 0){
        return errorCode.supplyOrderOfferListCount;
    }
    for(var i = 0; i < data.length; i++){
        var offerData = data[i];
        var err;
        err = common.amountCheck(offerData.amount);
        if(err){
            return err;
        }
        err = common.amountCheck(offerData.priceDep);
        if(err){
            return err;
        }
        err = supplyOrder.arrListCheck(offerData.arrList);
        if(err){
            return err;
        }
    }
};
//地点起始价格
supplyOrder.arrListCheck = function(data){
    check(data, [Object]);
    for(var i = 0; i < data.length; i++){
        var offerData = data[i];
        var err;
        err = common.wordCheck(offerData.routeStart);
        if(err){
            return err;
        }
        err = common.wordCheck(offerData.routeEnd);
        if(err){
            return err;
        }
        err = common.amountCheck(offerData.price);
        if(err){
            return err;
        }
    }
};

supplyOrder.createCheck = function(obj){

    var err = common.categoryCheck(obj.category);
    if(err){
        return err;
    }

    err = purchaseOrder.tokenCheck(obj.token);
    if(err){
        return err;
    }

    check(obj.desc, Object);

    err = common.addressCheck(obj.locationArrival);
    if(err){
        return err;
    }

    err = common.stylePaymentCheck(obj.stylePayment);
    if(err){
        return err;
    }

    err = common.originCheck(obj.originCheck);
    if(err){
        return err;
    }

    err = supplyOrder.offerListCheck(obj.offerList);
    if(err){
        return err;
    }
};
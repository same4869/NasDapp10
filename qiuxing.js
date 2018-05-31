var QiuxingItem = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.id = obj.id; 
       this.owner = obj.owner; 
       this.requestOwner = obj.requestOwner; 
       this.requestWords = obj.requestWords; 
       this.waitOwner = obj.waitOwner; 
       this.waitWords = obj.waitWords; 
    }
};

var QiuxingItems = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "QiuxingMap", {
        parse: function (text) {
            return new QiuxingItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
}

QiuxingItems.prototype ={
    init:function(){
        this.size = 0;
    },

    //根据实际需求初始化的数量，可以无需更改合约动态增减
    initQiuxingMap:function(size){
        this.size = size;
        LocalContractStorage.set("size", this.size);
    },

    //获得所有球星卡的所有数据状态（当然包括蛇精），前端根据状态定义显示逻辑
    getAllQiuxingMap:function(){
        var info = []
        this.size = LocalContractStorage.get("size");
        for(var i = 0; i < this.size; i++){
            info.push(this.QiuxingMap.get(i))
        }
        return info
    },

    //认领球星卡，当且仅当没有其他用户事先占用的时候可以认领
    haveAQiuxing:function(index){
        var QiuxingItem = this.QiuxingMap.get(index);
        var from = Blockchain.transaction.from;
        if(QiuxingItem){
            QiuxingItem.id = index;
            QiuxingItem.owner = from;
            QiuxingItem.requestOwner = null; 
            QiuxingItem.requestWords = null;
            QiuxingItem.waitOwner = null; 
            QiuxingItem.waitWords = null;
        }else{
            QiuxingItem = {};
            QiuxingItem.owner = from;
            QiuxingItem.id = index;
        }
        this.QiuxingMap.put(index,QiuxingItem);
    },

    //球星卡已经有主人了，申请获得所有权
    requestAQiuxing:function(index, content){
        var QiuxingItem = this.QiuxingMap.get(index);
        var from = Blockchain.transaction.from;
        if(QiuxingItem.owner === from){
            throw new Error("不用自己跟自己申请噢~") 
        }
        if(!QiuxingItem || !QiuxingItem.owner){
            throw new Error("这小只还没有人来认领哦~") 
        }
        QiuxingItem.requestOwner = from; 
        QiuxingItem.requestWords = content;
        this.QiuxingMap.put(index,QiuxingItem);
    },

    //球星卡所有者同意申请，转让球星卡所有权
    agreeAQiuxing:function(index){
        var QiuxingItem = this.QiuxingMap.get(index);
        var from = Blockchain.transaction.from;
        if(QiuxingItem && QiuxingItem.requestOwner){
            QiuxingItem.owner = QiuxingItem.requestOwner;
            QiuxingItem.requestOwner = null; 
            QiuxingItem.requestWords = null;
            QiuxingItem.waitOwner = null; 
            QiuxingItem.waitWords = null;
        }
        this.QiuxingMap.put(index,QiuxingItem);
    },

    //拥有者转让卡片给某其他用户
    transferAQiuxing:function(index, otherAdd, content){
        var QiuxingItem = this.QiuxingMap.get(index);
        var from = Blockchain.transaction.from;
        if(QiuxingItem.owner !== from){
            throw new Error("这只球星卡不是你的~")
        }
        if(from === otherAdd){
            throw new Error("球星卡不能转让给自己~")
        }
        QiuxingItem.waitOwner = otherAdd; 
        QiuxingItem.waitWords = content; 
        this.QiuxingMap.put(index,QiuxingItem);
    },

    //拥有者确认球星卡所有权，获得别人的球星卡
    gainAQiuxing:function(index){
        var QiuxingItem = this.QiuxingMap.get(index);
        var from = Blockchain.transaction.from;
        if(QiuxingItem && QiuxingItem.waitOwner && QiuxingItem.waitOwner === from){
            QiuxingItem.owner = from;
            QiuxingItem.requestOwner = null; 
            QiuxingItem.requestWords = null;
            QiuxingItem.waitOwner = null; 
            QiuxingItem.waitWords = null;
        }
        this.QiuxingMap.put(index,QiuxingItem);
    },

    sendAQiuxing:function(index, otherAdd){
        var QiuxingItem = this.QiuxingMap.get(index);
        var from = Blockchain.transaction.from;
        if(QiuxingItem.owner !== from){
            throw new Error("这张卡不是你的哈")
        }
        if(from === otherAdd){
            throw new Error("不能转让给自己哈")
        }
        QiuxingItem.owner = otherAdd; 
        QiuxingItem.requestOwner = null; 
        QiuxingItem.requestWords = null;
        QiuxingItem.waitOwner = null; 
        QiuxingItem.waitWords = null;
        this.QiuxingMap.put(index,QiuxingItem);
    }

}

module.exports = QiuxingItems;
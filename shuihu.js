var OwnerBean = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.owner = obj.owner; //卡片的当前正在拥有者
       this.requestOwner = obj.requestOwner; //申请此卡片的用户
       this.requestWords = obj.requestWords; //申请卡片，给申请卡片的留言
       this.waitOwner = obj.waitOwner; //待转送此卡片的用户
       this.waitWords = obj.waitWords; //转送卡片，给转送用户的留言
    }
};

var ShuihuItems = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "ownerMap", {
        parse: function (text) {
            return new OwnerBean(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
}

ShuihuItems.prototype ={
    init:function(){
        this.size = 0;
    },

    //动态初始化卡片的数量
    initShuihuMap:function(size){
        this.size = size;
        LocalContractStorage.set("size", this.size);
    },

    //获得所有卡片的所有数据
    getAllCardOwnerMap:function(){
        var info = []
        this.size = LocalContractStorage.get("size");
        for(var i = 0; i < this.size; i++){
            info.push(this.ownerMap.get(i))
        }
        return info
    },

    //获得某张卡片的所有权,仅当卡片还没人被认领时使用
    ownACard:function(index){
        var ownerBean = this.ownerMap.get(index);
        var from = Blockchain.transaction.from;
        if(ownerBean){
            ownerBean.owner = from;
            ownerBean.requestOwner = null; 
            ownerBean.requestWords = null;
            ownerBean.waitOwner = null; 
            ownerBean.waitWords = null;
        }else{
            ownerBean = {};
            ownerBean.owner = from;
        }
        this.ownerMap.put(index,ownerBean);
    },

    //申请获得某张卡片的所有权
    requestACard:function(index, content){
        var ownerBean = this.ownerMap.get(index);
        var from = Blockchain.transaction.from;
        if(!ownerBean || !ownerBean.owner){
            throw new Error("这张卡片还没有所有者") 
        }
        ownerBean.requestOwner = from; 
        ownerBean.requestWords = content;
        this.ownerMap.put(index,ownerBean);
    },

    //所有者同意申请，转让所有权
    agreeACard:function(index){
        var ownerBean = this.ownerMap.get(index);
        var from = Blockchain.transaction.from;
        if(ownerBean && ownerBean.requestOwner){
            ownerBean.owner = ownerBean.requestOwner;
            ownerBean.requestOwner = null; 
            ownerBean.requestWords = null;
            ownerBean.waitOwner = null; 
            ownerBean.waitWords = null;
        }
        this.ownerMap.put(index,ownerBean);
    },

    //拥有者转让卡片给某其他用户
    transferACard:function(index, otherAdd, content){
        var ownerBean = this.ownerMap.get(index);
        var from = Blockchain.transaction.from;
        if(ownerBean.owner !== from){
            throw new Error("这张卡不是你的哈")
        }
        if(from === otherAdd){
            throw new Error("不能转让给自己哈")
        }
        ownerBean.waitOwner = otherAdd; 
        ownerBean.waitWords = content; 
        this.ownerMap.put(index,ownerBean);
    },

    //拥有者确认卡片所有权，获得所有权
    gainACard:function(index){
        var ownerBean = this.ownerMap.get(index);
        var from = Blockchain.transaction.from;
        if(ownerBean && ownerBean.waitOwner && ownerBean.waitOwner === from){
            ownerBean.owner = from;
            ownerBean.requestOwner = null; 
            ownerBean.requestWords = null;
            ownerBean.waitOwner = null; 
            ownerBean.waitWords = null;
        }
        this.ownerMap.put(index,ownerBean);
    },

    getCurrentFrom:function(){
        return Blockchain.transaction.from;
    },

    //直接赠送逻辑
    sendACard:function(index, otherAdd){
        var ownerBean = this.ownerMap.get(index);
        var from = Blockchain.transaction.from;
        if(ownerBean.owner !== from){
            throw new Error("这张卡不是你的哈")
        }
        if(from === otherAdd){
            throw new Error("不能转让给自己哈")
        }
        ownerBean.owner = otherAdd; 
        this.ownerMap.put(index,ownerBean);
    }
}

module.exports = ShuihuItems;
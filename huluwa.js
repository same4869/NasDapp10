var HuluwaItem = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.id = obj.id; //葫芦娃id，每个id对应一个不同的葫芦娃
       this.owner = obj.owner; //葫芦娃的当前正在拥有者
       this.requestOwner = obj.requestOwner; //申请此葫芦娃的用户
       this.requestWords = obj.requestWords; //申请葫芦娃，给当前主人的留言
       this.waitOwner = obj.waitOwner; //待转送此葫芦娃的用户
       this.waitWords = obj.waitWords; //转送葫芦娃，给转送用户留言
    }
};

var HuluwaItems = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "huluwaMap", {
        parse: function (text) {
            return new HuluwaItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
}

HuluwaItems.prototype ={
    init:function(){
        this.size = 0;
    },

    //根据实际需求初始化葫芦娃的数量，可以无需更改合约动态增减
    initHuluwaMap:function(size){
        this.size = size;
        LocalContractStorage.set("size", this.size);
    },

    //获得所有葫芦娃的所有数据状态（当然包括蛇精），前端根据状态定义显示逻辑
    getAllHuluwaMap:function(){
        var info = []
        this.size = LocalContractStorage.get("size");
        for(var i = 0; i < this.size; i++){
            info.push(this.huluwaMap.get(i))
        }
        return info
    },

    //认领葫芦娃，当且仅当没有其他用户事先占用的时候可以认领
    haveAHuluwa:function(index){
        var huluwaItem = this.huluwaMap.get(index);
        var from = Blockchain.transaction.from;
        if(huluwaItem){
            huluwaItem.id = index;
            huluwaItem.owner = from;
            huluwaItem.requestOwner = null; 
            huluwaItem.requestWords = null;
            huluwaItem.waitOwner = null; 
            huluwaItem.waitWords = null;
        }else{
            huluwaItem = {};
            huluwaItem.owner = from;
            huluwaItem.id = index;
        }
        this.huluwaMap.put(index,huluwaItem);
    },

    //葫芦娃已经有主人了，申请获得所有权
    requestAHuluwa:function(index, content){
        var huluwaItem = this.huluwaMap.get(index);
        var from = Blockchain.transaction.from;
        if(huluwaItem.owner === from){
            throw new Error("不用自己跟自己申请噢~") 
        }
        if(!huluwaItem || !huluwaItem.owner){
            throw new Error("这小只还没有人来认领哦~") 
        }
        huluwaItem.requestOwner = from; 
        huluwaItem.requestWords = content;
        this.huluwaMap.put(index,huluwaItem);
    },

    //葫芦娃所有者同意申请，转让葫芦娃所有权
    agreeAHuluwa:function(index){
        var huluwaItem = this.huluwaMap.get(index);
        var from = Blockchain.transaction.from;
        if(huluwaItem && huluwaItem.requestOwner){
            huluwaItem.owner = huluwaItem.requestOwner;
            huluwaItem.requestOwner = null; 
            huluwaItem.requestWords = null;
            huluwaItem.waitOwner = null; 
            huluwaItem.waitWords = null;
        }
        this.huluwaMap.put(index,huluwaItem);
    },

    //拥有者转让卡片给某其他用户
    transferAHuluwa:function(index, otherAdd, content){
        var huluwaItem = this.huluwaMap.get(index);
        var from = Blockchain.transaction.from;
        if(huluwaItem.owner !== from){
            throw new Error("这只葫芦娃不是你的~")
        }
        if(from === otherAdd){
            throw new Error("葫芦娃不能转让给自己~")
        }
        huluwaItem.waitOwner = otherAdd; 
        huluwaItem.waitWords = content; 
        this.huluwaMap.put(index,huluwaItem);
    },

    //拥有者确认葫芦娃所有权，获得别人的葫芦娃
    gainAHuluwa:function(index){
        var huluwaItem = this.huluwaMap.get(index);
        var from = Blockchain.transaction.from;
        if(huluwaItem && huluwaItem.waitOwner && huluwaItem.waitOwner === from){
            huluwaItem.owner = from;
            huluwaItem.requestOwner = null; 
            huluwaItem.requestWords = null;
            huluwaItem.waitOwner = null; 
            huluwaItem.waitWords = null;
        }
        this.huluwaMap.put(index,huluwaItem);
    },

    sendAHuluwa:function(index, otherAdd){
        var huluwaItem = this.huluwaMap.get(index);
        var from = Blockchain.transaction.from;
        if(huluwaItem.owner !== from){
            throw new Error("这张卡不是你的哈")
        }
        if(from === otherAdd){
            throw new Error("不能转让给自己哈")
        }
        huluwaItem.owner = otherAdd; 
        huluwaItem.requestOwner = null; 
        huluwaItem.requestWords = null;
        huluwaItem.waitOwner = null; 
        huluwaItem.waitWords = null;
        this.huluwaMap.put(index,huluwaItem);
    }

}

module.exports = HuluwaItems;
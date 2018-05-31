$(function () {
    var dappContactAddress;
    var serialNumber;
    var NebPay;
    var nebPay;
    var nebulas;
    dappContactAddress = "n1m97EvuKzuj5RuviYSCeBNdKgouAZCvYcy";
    nebulas = require("nebulas"), neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
    
    NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
    nebPay = new NebPay();	
    var myneb = new Neb();
    var nasApi = myneb.api;	

    var curWallectAdd;
    var iHaveItem = [];	


    function getWallectInfo() {
        console.log("getWallectInfo");
        window.addEventListener('message', getMessage);
    
        window.postMessage({
            "target": "contentscript",
            "data": {},
            "method": "getAccount",
        }, "*");
    }
    
    function getMessage(e){
        if (e.data && e.data.data) {
            console.log("e.data.data:", e.data.data)
            if (e.data.data.account) {
                var address = e.data.data.account;
                curWallectAdd = address;
                console.log("address="+address);
                $("#w_address").text(address);
                //hui("#wallet_address").html(address);
                // refresh();
                // nasApi.getAccountState({
                //     address: address
                // }).then(function (resp) {
                //     var amount = Unit.fromBasic(Utils.toBigNumber(resp.balance), "nas").toNumber()//账号余额
                //     console.log("余额："+amount);
                //     this.wallet_balance = amount;
                //     //hui("#wallet_balance").html(amount);
                // });
            }
        }
       
    }


    function getAllQiuxingMap(){
        var from = dappContactAddress;
        var value = "0";
        var nonce = "0";
        var gas_price = "1000000";
        var gas_limit = "20000000";
        var callFunction = "getAllQiuxingMap";
        var callArgs = "";
        //console.log("callFunction:" + callFunction + " callArgs:" + callArgs);
        var contract = {
        "function": callFunction,
        "args": callArgs
        };
        neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        var result = resp.result;   
        console.log("result : " + result);
        result = JSON.parse(result);
        setQiuxingProperties(result);

    }).catch(function (err) {
        console.log("error :" + err.message);
    })
        getWallectInfo()
   }

   function setQiuxingProperties(Qiuxings) {
    console.log(Qiuxings);
    for (var i = 0; i < Qiuxings.length; i++) {
        if (Qiuxings[i] && Qiuxings[i].owner) {
            $($(".market_page .button.small.yellow-p")[i]).text("TA的主人：" + Qiuxings[i].owner);
            if(curWallectAdd !== Qiuxings[i].owner){
                $($(".my_page .salads")[i]).css("display", "none")
                $($(".market_page .button.small.yellow span")[i]).text("求赠送")
            }else{
                $($(".market_page .button.small.yellow")[i]).css("display", "none");
                $($(".market_page .button.small.yellow-p")[i]).text("您现在是该球星卡的主人哦！^_*");
                iHaveItem.push(i);
            }
        }else{
            $($(".my_page .salads")[i]).css("display", "none")
        }

        if(Qiuxings[i] && Qiuxings[i].owner){
            console.log("i:"+ i + " requestOwner:" + Qiuxings[i].requestOwner + " owner:" + Qiuxings[i].owner + " curWallectAdd:" + curWallectAdd);
            if(curWallectAdd === Qiuxings[i].owner && Qiuxings[i].requestOwner && Qiuxings[i].requestOwner !== undefined && Qiuxings[i].requestOwner !== Qiuxings[i].owner){
                $($(".request_page .request_tip_p")[i]).text(Qiuxings[i].requestWords + "\n" + Qiuxings[i].requestOwner)
            }else{
                $($(".request_page .salads")[i]).css("display", "none")
            }
        }else{
            $($(".request_page .salads")[i]).css("display", "none")
        }
    }
    console.log("iHaveItem : " + iHaveItem);
}

    $(".market_page .button.small.yellow").on("click", function(event) {
        var currentIndex = event.currentTarget.id;
        console.log("currentIndex:" + currentIndex + " text:" + $(".market_page .button.small.yellow span")[currentIndex].innerHTML);
        if($(".market_page .button.small.yellow span")[currentIndex].innerHTML === "求赠送"){
            bootbox.prompt("请给对方填写一个赠送给你的理由~", function(result){
                console.log(result); 
                if(result !== null && result !== ""){
                   var currentIndex = event.currentTarget.id;
                   console.log("currentIndex:" + currentIndex);
                   requestAQiuxing(currentIndex, result);
                }
           });
        }else{
            ownAQiuxing(currentIndex);
        }
    });

    $(".my_page .button.small.yellow").on("click", function(event) {
        console.log("my_page click");
        bootbox.prompt("请填写需要转给对方的地址（警告：一旦地址写错，将无法找回）", function(result){
            console.log(result); 
            if(result !== null && result !== ""){
               var currentIndex = event.currentTarget.id;
               console.log("currentIndex:" + currentIndex);
               sendAQiuxing(currentIndex, result);
            }
       });
    });

    $(".request_page .button.small.yellow").on("click", function(event) {
        var currentIndex = event.currentTarget.id;
        console.log("currentIndex:" + currentIndex);
        agreeAQiuxing(currentIndex);
    });

    function agreeAQiuxing(currentIndex){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "agreeAQiuxing";
        var callArgs = "[\"" + currentIndex + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
                listener: function (resp) {
                        console.log("thecallback is " + resp)
                        //upadte card status into in progress...
                        disableSendButton(currentIndex);
                }
        }); 
    }

    function sendAQiuxing(currentIndex, result){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "sendAQiuxing";
        var callArgs = "[\"" + currentIndex + "\",\"" + result + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
                listener: function (resp) {
                        console.log("thecallback is " + resp)
                        //upadte card status into in progress...
                        disableSendButton(currentIndex);
                }
        }); 
    }

    function requestAQiuxing(currentIndex, content){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "requestAQiuxing";
        var callArgs = "[\"" + currentIndex + "\",\"" + content + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
                listener: function (resp) {
                        console.log("thecallback is " + resp)
                        //upadte card status into in progress...
                        // disableSendButton(currentIndex);
                        bootbox.alert("已经向球星卡主人申请，对方确认后这只就是您的了~");
                }
        }); 
    }

    function ownAQiuxing(index){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "haveAQiuxing";
        var callArgs = "[\"" + index + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
                listener: function (resp) {
                        console.log("thecallback is " + resp)
                        //upadte card status into in progress...
                        disableGetButton(index);
                }
        }); 
    }

    function disableGetButton(index) {
        console.log(index);
        $($(".market_page .button.small.yellow")[index]).text("领取中...").attr("disabled","disabled");
    }

    function disableSendButton(index) {
        console.log(index);
        $($(".my_page .button.small.yellow")[index]).text("赠送中...").attr("disabled","disabled");
    }


    $("#submit-btn").on("click", function(event) {
        if(latitudeVaule && longitudeVaule){
            console.log(dist)
            if(dist == 0 || !dist){
                saveLngAndLat(longitudeVaule,latitudeVaule)
            }else{
                updateUserInfo(longitudeVaule,latitudeVaule,dist)
            }
        }else{
            alert("请先等待定位成功~") 
        }
    });

    console.log("getAllQiuxingMap");
    getAllQiuxingMap()
})
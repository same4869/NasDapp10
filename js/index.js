$(function () {
    var dappContactAddress;
    var serialNumber;
    var NebPay;
    var nebPay;
    var nebulas;
    dappContactAddress = "n1fzYiBTh9HFUC6aivFeZPiKDMGe2cchWjM";
    nebulas = require("nebulas"), neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
    
    NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
    nebPay = new NebPay();

    //全局变量
    var _SIZE = 20;
    var _CURRENT_USER;

    //处理页面弹框
    $('[data-toggle="popover"]').popover() //弹窗
    .on('show.bs.popover', function () { //展示时,关闭非当前所有弹窗
        $("body").find('[data-toggle="popover"]').popover('hide');
    });
    $('body').on('click', function(event) {
        var target = $(event.target);
        if (!target.hasClass('popover') //弹窗内部点击不关闭
                && target.parent('.popover-content').length === 0
                && target.parent('.popover-title').length === 0
                && target.parent('.popover').length === 0
                && target.data("toggle") !== "popover") {
                //弹窗触发列不关闭，否则显示后隐藏
            $('[data-toggle="popover"]').popover('hide');
        }
    });

    //从合约获取数据，与页面交互的逻辑写在这里

    //设置英雄个数，隐藏功能，开发者用
    $('#setSize').on('click', function(event) {
        initShuihuMap(_SIZE);
    });
    function initShuihuMap(size){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "initShuihuMap";
        var callArgs = "[\"" + size + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
            listener: function (resp) {
                console.log("thecallback is " + resp)
            }
        }); 
    }

    function ownACard(index){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "ownACard";
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

    function sendACard(currentIndex, result){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "sendACard";
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

    function disableGetButton(index) {
        console.log(index);
        $($(".am-gallery li .get-button")[index]).text("领取中...").attr("disabled","disabled");
    }

    function disableSendButton(index) {
        console.log(index);
        $($(".am-gallery li .send-button")[index]).text("赠送中...").attr("disabled","disabled");
    }

    function updateCardsInfo(){
        getAllCardOwnerMap();
        // var from = dappContactAddress;
        // var value = "0";
        // var nonce = "0";
        // var gas_price = "1000000";
        // var gas_limit = "20000000";
        // var callFunction = "getCurrentFrom";
        // var callArgs = "";
        // var contract = {
        //     "function": callFunction,
        //     "args": callArgs
        // };
        // neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        //     var currentUser = resp.result;   
        //     console.log("result1 : " + currentUser);
        //     _CURRENT_USER = JSON.parse(currentUser);
    
        // }).catch(function (err) {
        //     console.log("error :" + err.message);
        // }) 
    }

    function getAllCardOwnerMap(){
        var from = dappContactAddress;
        var value = "0";
        var nonce = "0";
        var gas_price = "1000000";
        var gas_limit = "20000000";
        var callFunction = "getAllCardOwnerMap";
        var callArgs = "";
        var contract = {
            "function": callFunction,
            "args": callArgs
        };
        neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
            var result = resp.result;   
            console.log("result : " + result);
            result = JSON.parse(result);
            setCardProperties(result);
        
        // var html = "";
        //                 var itemList = result;
        //                 console.log(itemList);
        // for(var i = 0, iLen = itemList.length; i < iLen; i++) {
        //         html += '<li>' +
        //                         '<p class="item-content"><font color="red">玩家：'+ itemList[i].from + '<br>分数：' + itemList[i].score + '<br>昵称：' + itemList[i].name + '</font></p>' +
        //                                         '</li>';
        //                                         console.log(html);
        // }
        // $('#itemList').append(html);
        }).catch(function (err) {
            console.log("error :" + err.message);
        })
    }

    function setCardProperties(cards) {
        console.log(cards);
        for (var i = 0; i < cards.length; i++) {
            if (cards[i] && cards[i].owner) {
                $($(".am-gallery li .am_imglist_user_font2")[i]).text(cards[i].owner);
                $($(".am-gallery li .get-button")[i]).css("display", "none")
            }
        }
    }

    $(".get-button").on("click", function(event) {
        var currentIndex = event.currentTarget.parentElement.id;
        console.log(currentIndex);
        ownACard(currentIndex);
    });

    $(".send-button").on("click", function(event) {
        bootbox.prompt("请填写需要转给对方的地址（警告：一旦地址写错，将无法找回）", function(result){
             console.log(result); 
             if(result !== null && result !== ""){
                var currentIndex = event.currentTarget.parentElement.id;
                console.log(currentIndex);
                sendACard(currentIndex, result);
             }
            
        });
    });

    updateCardsInfo();
})
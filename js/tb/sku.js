function checkedSKU() {
    var color_key = '1627207';
    var size_key = '20509';
    var size_type = '27013';
    var size_type_text = '中国码';

    var skuArray = [{
        "id": "20509",
        "text": "尺码",
        "values": [{
            "id": "28314",
            "text": "S"
        }, {
            "id": "28315",
            "text": "M"
        }, {
            "id": "28316",
            "text": "L"
        }, {
            "id": "28317",
            "text": "XL"
        }, {
            "id": "28318",
            "text": "XXL"
        }]
    }, {
        "id": "1627207",
        "text": "颜色",
        "values": [{
            "id": "28332",
            "text": "灰色"
        }]
    }];



    $('#sku-color-tab-contents .color-list').show();

    $('.size-content:first .size-pannel').show();







    var skuMap = {};

    util.each(skuArray, function(i, item) {
        skuMap[item.id] = item;
    });

    
    var J_SizePannel_id = $('#prop_' + size_key + '-'+skuMap[size_key].values[0].id).closest('.size-pannel').attr('id');

    var $sizeCheckbox = $('#J_SellProperties [value=' + J_SizePannel_id.replace('J_SizePannel_', '') + ']');

    var r=$sizeCheckbox[0]
    r.checked = true;
    E.dispatch(r, "click");
    r.checked = true;









    util.each(["28314", "28315", "28316"], function(i, id) {
        var $checkbox = $('#prop_' + size_key + '-' + id);
        if ($checkbox[0]) {
            $checkbox.attr('checked', true);
            E.dispatch($checkbox[0], "click");
        }
    });


    util.each($('.size-type [name=sizeGroupType]'), function(i, radio) {
        if (radio.value.indexOf(size_type) > -1 || radio.parentElement.innerText.indexOf(size_type_text) > -1) {
            radio.checked = true;
            E.dispatch(radio, "click");
            return false;
        }
    });


    var mainData = {
        "detail": {
            "itemDO": {
                "rootCatId": "16",
                "isNewProGroup": false,
                "feature": "1",
                "itemId": "520940041698",
                "attachImgUrl": ["//img.alicdn.com/imgextra/i1/263817957/TB20Rl1eXXXXXbRXXXXXXXXXXXX-263817957.jpg", "//img.alicdn.com/imgextra/i1/263817957/TB2IURLeXXXXXa2XpXXXXXXXXXX-263817957.jpg"],
                "imgVedioPic": null,
                "auctionStatus": "0",
                "mainPic": "//img.alicdn.com/bao/uploaded/i4/TB1zbCqIVXXXXcrapXXXXXXXXXX_!!0-item_pic.jpg",
                "spuId": "345267637",
                "brand": "HSTYLE/&#38889;&#37117;&#34915;&#33293;",
                "isSecondKillFromPC": false,
                "isSupportTryBeforeBuy": false,
                "isBidden": false,
                "shopIcon": "//img.alicdn.com/63/a7/TB1cOF2JXXXXXbfaXXXSutbFXXX.jpg",
                "weight": "0",
                "quantity": 1003,
                "isDefaultChooseTryBeforeBuy": false,
                "prov": "山东",
                "baikeId": null,
                "itemTaxRate": null,
                "encryptSellerId": "UvCxGOmHuOF8u",
                "progressiveSupport": "false",
                "isSecondKillFromPCAndWap": false,
                "sellerNickName": "%E9%9F%A9%E9%83%BD%E8%A1%A3%E8%88%8D%E6%97%97%E8%88%B0%E5%BA%97",
                "isSecondKillFromMobile": false,
                "title": "韩都衣舍韩版2015秋装新款女装长款宽松显瘦开衫针织衫GY4384娋",
                "location": "山东",
                "newAttraction": "开衫 长款 宽松 舒适美观 时尚百搭",
                "brandId": "8598007",
                "auctionType": "b",
                "cspuCategorySwitch": false,
                "isInRepository": false,
                "hasSku": true,
                "categoryId": "50000697",
                "reservePrice": "328.00",
                "isDcAsyn": true,
                "isElecCouponItem": false,
                "validatorUrl": "//store.taobao.com/tadget/shop_stats.htm",
                "isOnline": true,
                "userId": "263817957",
                "sellProgressiveRate": "3_100_1.60;6_0_4.50;9_0_6.00",
                "imgVedioUrl": null,
                "brandSpecialSold": "false",
                "brandSiteId": "0"
            },
            "standingDate": 0,
            "isService": false,
            "apiBeans": "//count.taobao.com/counter3?keys=ICCP_1_520940041698",
            "rstShopId": 58501945,
            "detail": {
                "isAlicomMasterCard": false,
                "isItemAllowSellerView": true,
                "addressLevel": 2,
                "isAutoFinancing": false,
                "quantityList": null,
                "isCarYuEBao": false,
                "canEditInItemDet": true,
                "isCarService": false,
                "isSkuMemorized": false,
                "buyNowStatus": 2,
                "allowRate": true,
                "isTeMai": false,
                "timeKillAuction": false,
                "loginBeforeCart": false,
                "isNewAttraction": true,
                "isPrescriptionDrug": false,
                "isNewMedical": false,
                "tryReportDisable": false,
                "isH5NewLogin": true,
                "isAllowReport": true,
                "isHkO2OItem": false,
                "reviewListType": 1,
                "goNewAuctionFlow": false,
                "cdn75": false,
                "pageType": "default",
                "isVitual3C": false,
                "isHiddenShopAction": false,
                "isShowEcityBasicSign": false,
                "autoccUser": false,
                "isContractPhoneItem": false,
                "isShowPreClosed": false,
                "showDiscountRecommend": false,
                "isHasQualification": false,
                "defaultItemPrice": "328.00",
                "isHasPos": false,
                "isDownShelf": false,
                "canBuyInMobile": true,
                "is0YuanBuy": false,
                "isShowEcityDesc": false,
                "isIFCShop": false,
                "isNextDayService": false,
                "isHkItem": false,
                "isAliTelecomNew": false,
                "isRegionLevel": false,
                "shopSameCategoryUrl": "//handuyishe.tmall.com/search.htm?search=y&categoryp=50000697&detail_nid=520940041698",
                "isPreSellBrand": false,
                "isCyclePurchase": false,
                "show9sVideo": true,
                "isShowContentModuleTitle": false,
                "isShowEcityVerticalSign": false,
                "isHidePoi": false
            },
            "servItemExtend": null,
            "cartEnable": true,
            "idsMod": [],
            "valFlashUrl": "//cloud.video.taobao.com/play/u/263817957/p/2/e/1/t/3/28691588.swf",
            "tmallRateType": 0,
            "isMeiz": false,
            "tag": {
                "isShowEcityIcon": false,
                "isBrandSiteRightColumn": true,
                "isAsynDesc": true,
                "isBrandAttr": true,
                "isMedical": false,
                "isRightRecommend": true,
                "isShowHouseIcon": false,
                "isShowMeiliXinde": false,
                "isShowTryReport": false,
                "isShowYuanchuanIcon": true
            },
            "storePacket": null,
            "isHouseholdService": false,
            "isAreaSell": false,
            "api": {
                "httpsDescUrl": "//desc.alicdn.com/i7/520/940/520940041698/TB1xEryJFXXXXXfXVXX8qtpFXlX.desc%7Cvar%5Edesc%3Bsign%5E0175654dfc47cf5dadd61db4465f7594%3Blang%5Egbk%3Bt%5E1443165123",
                "propertyUrl": "//mdetail.tmall.com/mobile/itemPackage.do?itemId=520940041698",
                "recommendUrl": "//aldcdn.tmall.com/recommend.htm?appId=03126&itemId=520940041698",
                "rateUrl": "//rate.tmall.com/list_detail_rate.htm",
                "reUrl": "//u.m.taobao.com/reg/newUser.htm?pds=reg%23h%23",
                "newWapDescJson": [{
                    "data": [{
                        "img": "//img.alicdn.com/imgextra/i3/263817957/TB2rwkrfXXXXXcHXpXXXXXXXXXX-263817957.jpg",
                        "templateId": "42"
                    }],
                    "moduleKey": "shop_discount",
                    "enable": true,
                    "moduleName": "店铺活动",
                    "component": "mui/shopactivity/index"
                }, {
                    "moduleName": "优惠",
                    "component": "mui/shopcoupon/index",
                    "enable": true,
                    "moduleKey": "coupon"
                }, {
                    "moduleName": "商品信息",
                    "data": [{
                        "attachImgUrls": [{
                            "img": "//img.alicdn.com/imgextra/i1/263817957/TB20Rl1eXXXXXbRXXXXXXXXXXXX-263817957.jpg",
                            "imageName": "吊牌图"
                        }, {
                            "img": "//img.alicdn.com/imgextra/i1/263817957/TB2IURLeXXXXXa2XpXXXXXXXXXX-263817957.jpg",
                            "imageName": "耐久性标签"
                        }],
                        "props": [{
                            "ptext": "上市年份/季节",
                            "vtexts": ["2014年秋季"]
                        }, {
                            "ptext": "材质成分",
                            "vtexts": ["聚丙烯腈纤维(腈纶)100%"]
                        }, {
                            "vtexts": ["通勤"],
                            "ptext": "风格"
                        }, {
                            "vtexts": ["常规"],
                            "ptext": "厚薄"
                        }]
                    }],
                    "component": "mui/standardItemProps/index",
                    "enable": true,
                    "moduleKey": "item_info"
                }, {
                    "enable": true,
                    "component": "mui/custommodule/index",
                    "moduleName": "商品图片",
                    "data": [{
                        "height": "1242",
                        "width": "750",
                        "img": "https://img.alicdn.com/imgextra/i4/263817957/TB2LT4afpXXXXcCXXXXXXXXXXXX-263817957.jpg"
                    }, {
                        "img": "https://img.alicdn.com/imgextra/i2/263817957/TB2G9k9fXXXXXXqXpXXXXXXXXXX-263817957.jpg",
                        "width": "750",
                        "height": "1540"
                    }, {
                        "width": "750",
                        "img": "https://img.alicdn.com/imgextra/i1/263817957/TB2lAgZfXXXXXbnXpXXXXXXXXXX-263817957.jpg",
                        "height": "1540"
                    }, {
                        "height": "621",
                        "width": "750",
                        "img": "https://img.alicdn.com/imgextra/i2/263817957/TB2z8A7fXXXXXXVXpXXXXXXXXXX-263817957.jpg"
                    }, {
                        "height": "1200",
                        "width": "750",
                        "img": "https://img.alicdn.com/imgextra/i2/263817957/TB2kIdafpXXXXcGXXXXXXXXXXXX-263817957.jpg"
                    }, {
                        "height": "1200",
                        "img": "https://img.alicdn.com/imgextra/i4/263817957/TB2qFFifpXXXXaVXXXXXXXXXXXX-263817957.jpg",
                        "width": "750"
                    }],
                    "moduleKey": "item_picture"
                }, {
                    "component": "mui/shoprecommend/index",
                    "enable": true,
                    "data": [{
                        "templateId": "25"
                    }],
                    "moduleName": "同店推荐",
                    "moduleKey": "hot_recommanded"
                }],
                "descUrl": "//dsc.taobaocdn.com/i7/520/940/520940041698/TB1xEryJFXXXXXfXVXX8qtpFXlX.desc%7Cvar%5Edesc%3Bsign%5E0175654dfc47cf5dadd61db4465f7594%3Blang%5Egbk%3Bt%5E1443165123",
                "myUrl": "//h5.m.taobao.com/my/index.htm#!myTaobao",
                "logOutUrl": "//login.m.taobao.com/logout.htm?pds=logout%23h%23",
                "barterUrl": "//suggest.taobao.com/sug?area=app_detail&nid=520940041698",
                "addFavUrl": "//fav.m.tmall.com/to_collection.htm?xid=0db2&pds=addfav#h#detail&itemNumId=520940041698",
                "loginUrl": "//login.tmall.com/?",
                "newWapDescDynUrl": "//detailskip.taobao.com/json/wap/tmallH5Desc.do?itemId=520940041698&sellerId=263817957&isPreview=false"
            },
            "tradeConfig": {
                "1": "//h5.m.taobao.com/awp/base/buy.htm",
                "2": "//buy.m.tmall.com/order/confirmOrderWap.htm"
            },
            "isChaoshi": false,
            "valItemInfo": {
                "salesProp": {},
                "skuList": [{
                    "pvs": "-1:-1;20509:28314;1627207:28339",
                    "names": "  常规 S 藏蓝色 ",
                    "skuId": 3110395417461,
                    "quantity": 306,
                    "price": "179.00",
                    "priceType": "秋装盛宴"
                }, {
                    "names": "  常规 M 藏蓝色 ",
                    "skuId": 3110395417462,
                    "pvs": "-1:-1;20509:28315;1627207:28339",
                    "quantity": 408,
                    "price": "179.00",
                    "priceType": "秋装盛宴"
                }, {
                    "skuId": 3110395417463,
                    "names": "  常规 L 藏蓝色 ",
                    "pvs": "-1:-1;20509:28316;1627207:28339",
                    "quantity": 286,
                    "price": "179.00",
                    "priceType": "秋装盛宴"
                }],
                "skuMap": {
                    ";-1:-1;20509:28315;1627207:28339;": {
                        "priceCent": 32800,
                        "skuId": 3110395417462,
                        "stock": 409,
                        "price": "328.00"
                    },
                    ";-1:-1;20509:28316;1627207:28339;": {
                        "priceCent": 32800,
                        "skuId": 3110395417463,
                        "price": "328.00",
                        "stock": 287
                    },
                    ";-1:-1;20509:28314;1627207:28339;": {
                        "priceCent": 32800,
                        "skuId": 3110395417461,
                        "stock": 307,
                        "price": "328.00"
                    }
                },
                "skuName": [{
                    "id": "-1",
                    "text": "厚薄",
                    "values": [{
                        "id": "-1",
                        "text": "常规"
                    }]
                }, {
                    "id": "20509",
                    "text": "尺码",
                    "values": [{
                        "id": "28314",
                        "text": "S"
                    }, {
                        "id": "28315",
                        "text": "M"
                    }, {
                        "id": "28316",
                        "text": "L"
                    }]
                }, {
                    "id": "1627207",
                    "text": "颜色分类",
                    "values": [{
                        "id": "28339",
                        "text": "藏蓝色"
                    }]
                }],
                "defSelected": [],
                "skuExtra": {
                    "pickupPoints": null,
                    "tickets": null
                },
                "skuPics": {
                    ";1627207:28339;": "//img.alicdn.com/bao/uploaded/i1/263817957/TB2KV7eeXXXXXa1XXXXXXXXXXXX-263817957.jpg"
                }
            },
            "valPointTimes": 1,
            "isSevenDaysRefundment": false,
            "isTmallComboSupport": true,
            "valCartInfo": {
                "itemId": "520940041698",
                "cartUrl": "//h5.m.taobao.com/awp/base/cart.htm",
                "statsUrl": "//go.mmstat.com/1.gif?logtype=2&category=cart_{loc}_50000697"
            },
            "isWTContract": false,
            "valMode": 128,
            "cmCatId": "-1",
            "valTimeLeft": 102739,
            "valPointRate": 0.5,
            "isMultiPoint": true,
            "tradeParams": {
                "_input_charset": "utf-8",
                "etm": "post",
                "buyNow": "true"
            },
            "tagsId": "4,907,1089,1163,1478,1483,1675,1803,2049,2059,2443,2507,2635,3019,3851,3915,3974,4107,4166,4171,4363,4491,4555,4614,4678,4801,4811,5835,5954,6145,6401,6411,6603,7105,7371,7947,8641,9153,9281,12737,13121,13825,13953,15297,15554,16321,16577,17665,17793,17921,19841,20161,20609,21057,21697,22081,24321,24705,25282,27521,28098,28353,28802,29889,30337,30401,30657,30977,48706,57026,59010,60418,62082,64194,72386,82306"
        },
        "mdskip": {
            "defaultModel": {
                "customResourceDO": {
                    "success": true
                },
                "deliveryDO": {
                    "areaId": 420100,
                    "deliveryAddress": "山东济南",
                    "deliverySkuMap": {
                        "default": [{
                            "arrivalNextDay": false,
                            "postage": "快递: 12.0",
                            "postageFree": false,
                            "skuDeliveryAddress": "山东济南",
                            "type": 0
                        }]
                    },
                    "destination": "武汉市",
                    "success": true
                },
                "detailPageTipsDO": {
                    "crowdType": 0,
                    "hideIcons": false,
                    "jhs99": false,
                    "minicartSurprise": 0,
                    "priceDisplayType": 4,
                    "primaryPicIcons": [],
                    "prime": false,
                    "showDou12CornerIcon": false,
                    "success": true
                },
                "doubleElevenDO": {
                    "doubleElevenItem": false,
                    "halfOffItem": false,
                    "showAtmosphere": false,
                    "showRightRecommendedArea": false,
                    "step": 0,
                    "success": true
                },
                "gatewayDO": {
                    "changeLocationGateway": {
                        "queryDelivery": true,
                        "queryProm": false
                    },
                    "success": true,
                    "trade": {
                        "addToBuyNow": {},
                        "addToCart": {}
                    }
                },
                "inventoryDO": {
                    "hidden": false,
                    "icTotalQuantity": 1000,
                    "skuQuantity": {
                        "3110395417461": {
                            "quantity": 306,
                            "totalQuantity": 306,
                            "type": 1
                        },
                        "3110395417462": {
                            "quantity": 408,
                            "totalQuantity": 408,
                            "type": 1
                        },
                        "3110395417463": {
                            "quantity": 286,
                            "totalQuantity": 286,
                            "type": 1
                        }
                    },
                    "success": true,
                    "totalQuantity": 1000,
                    "type": 1
                },
                "itemPriceResultDO": {
                    "areaId": 420100,
                    "duo11Item": false,
                    "duo11Stage": 0,
                    "extraPromShowRealPrice": false,
                    "halfOffItem": false,
                    "hasDPromotion": false,
                    "hasMobileProm": false,
                    "hideMeal": false,
                    "priceInfo": {
                        "3110395417461": {
                            "areaSold": true,
                            "price": "328.00",
                            "promotionList": [{
                                "amountPromLimit": 0,
                                "amountRestriction": "",
                                "basePriceType": "IcPrice",
                                "canBuyCouponNum": 0,
                                "endTime": 1443542400000,
                                "extraPromTextType": 0,
                                "extraPromType": 0,
                                "limitProm": false,
                                "postageFree": false,
                                "price": "179.00",
                                "promType": "normal",
                                "start": false,
                                "startTime": 1440604800000,
                                "status": 2,
                                "tfCartSupport": false,
                                "tmallCartSupport": false,
                                "type": "秋装盛宴",
                                "unLogBrandMember": false,
                                "unLogShopVip": false,
                                "unLogTbvip": false
                            }]
                        },
                        "3110395417462": {
                            "areaSold": true,
                            "price": "328.00",
                            "promotionList": [{
                                "amountPromLimit": 0,
                                "amountRestriction": "",
                                "basePriceType": "IcPrice",
                                "canBuyCouponNum": 0,
                                "endTime": 1443542400000,
                                "extraPromTextType": 0,
                                "extraPromType": 0,
                                "limitProm": false,
                                "postageFree": false,
                                "price": "179.00",
                                "promType": "normal",
                                "start": false,
                                "startTime": 1440604800000,
                                "status": 2,
                                "tfCartSupport": false,
                                "tmallCartSupport": false,
                                "type": "秋装盛宴",
                                "unLogBrandMember": false,
                                "unLogShopVip": false,
                                "unLogTbvip": false
                            }]
                        },
                        "3110395417463": {
                            "areaSold": true,
                            "price": "328.00",
                            "promotionList": [{
                                "amountPromLimit": 0,
                                "amountRestriction": "",
                                "basePriceType": "IcPrice",
                                "canBuyCouponNum": 0,
                                "endTime": 1443542400000,
                                "extraPromTextType": 0,
                                "extraPromType": 0,
                                "limitProm": false,
                                "postageFree": false,
                                "price": "179.00",
                                "promType": "normal",
                                "start": false,
                                "startTime": 1440604800000,
                                "status": 2,
                                "tfCartSupport": false,
                                "tmallCartSupport": false,
                                "type": "秋装盛宴",
                                "unLogBrandMember": false,
                                "unLogShopVip": false,
                                "unLogTbvip": false
                            }]
                        }
                    },
                    "queryProm": false,
                    "success": true
                },
                "memberRightDO": {
                    "activityType": 0,
                    "level": 0,
                    "postageFree": false,
                    "shopMember": false,
                    "success": true,
                    "time": 1,
                    "value": 0.5
                },
                "miscDO": {
                    "bucketId": 4,
                    "city": "武汉",
                    "cityId": 420100,
                    "hasCoupon": true,
                    "region": "江夏区",
                    "regionId": 420115,
                    "smartBannerFlag": "top",
                    "success": true,
                    "systemTime": "1443513598302",
                    "town": "纸坊街道",
                    "townId": 420115001
                },
                "progressiveInfoDO": {
                    "double11Privilege": -1,
                    "newPCInstallment": false,
                    "progressiveEnable": false,
                    "rateMap": {},
                    "showProgressivePlan": false,
                    "success": true,
                    "text": "",
                    "tipType": -1,
                    "tryBeforeBuy": false
                },
                "rateDO": {
                    "rateCounts": 1144,
                    "success": true
                },
                "sellCountDO": {
                    "sellCount": 1341,
                    "success": true
                },
                "soldAreaDataDO": {
                    "success": true
                },
                "tradeParams": {},
                "tradeResult": {
                    "cartEnable": true,
                    "cartType": 2,
                    "miniTmallCartEnable": true,
                    "startTime": 1443002700000,
                    "success": true,
                    "tradeBtnText": "立即购买",
                    "tradeEnable": true,
                    "tradeType": 2
                },
                "userInfoDO": {
                    "activeStatus": 3,
                    "loginUserType": "buyer",
                    "nicker": "meto00",
                    "success": true,
                    "userId": 346360614
                }
            },
            "isSuccess": true,
            "new": true,
            "success": true
        },
        "h5DescUrls": {
            "1": "https://img.alicdn.com/imgextra/i3/346360614/TB2eM4TfFXXXXalXpXXXXXXXXXX_!!346360614.jpg",
            "2": "https://img.alicdn.com/imgextra/i4/346360614/TB2UDx8fFXXXXbqXXXXXXXXXXXX_!!346360614.jpg",
            "3": "https://img.alicdn.com/imgextra/i1/346360614/TB2EA4UfFXXXXXFXpXXXXXXXXXX_!!346360614.jpg",
            "4": "https://img.alicdn.com/imgextra/i4/346360614/TB2KcacfFXXXXXSXXXXXXXXXXXX_!!346360614.jpg",
            "5": "https://img.alicdn.com/imgextra/i2/346360614/TB2cd0.fFXXXXaKXXXXXXXXXXXX_!!346360614.jpg",
            "6": "https://img.alicdn.com/imgextra/i2/346360614/TB2DS4GfFXXXXcYXpXXXXXXXXXX_!!346360614.jpg",
            "7": "https://img.alicdn.com/imgextra/i4/346360614/TB2P7pOfFXXXXbiXpXXXXXXXXXX_!!346360614.jpg",
            "8": "https://img.alicdn.com/imgextra/i1/346360614/TB27EpKfFXXXXbZXpXXXXXXXXXX_!!346360614.jpg",
            "9": "https://img.alicdn.com/imgextra/i1/346360614/TB20aB_fFXXXXa4XXXXXXXXXXXX_!!346360614.jpg",
            "10": "https://img.alicdn.com/imgextra/i2/346360614/TB2PZVYfFXXXXXGXpXXXXXXXXXX_!!346360614.jpg"
        },
        "pcDescUrls": {
            "1": "https://img.alicdn.com/imgextra/i2/346360614/TB2.ds3fpXXXXXGXpXXXXXXXXXX_!!346360614.jpg",
            "2": "https://img.alicdn.com/imgextra/i2/346360614/TB2u0ljfFXXXXXBXXXXXXXXXXXX_!!346360614.jpg",
            "3": "https://img.alicdn.com/imgextra/i3/346360614/TB23kZZfpXXXXajXpXXXXXXXXXX_!!346360614.jpg",
            "4": "https://img.alicdn.com/imgextra/i2/346360614/TB29qQYfpXXXXaEXpXXXXXXXXXX_!!346360614.jpg",
            "5": "https://img.alicdn.com/imgextra/i3/346360614/TB2SQgTfpXXXXbjXpXXXXXXXXXX_!!346360614.jpg",
            "6": "https://img.alicdn.com/imgextra/i3/346360614/TB2hPtafFXXXXaUXXXXXXXXXXXX_!!346360614.jpg",
            "7": "https://img.alicdn.com/imgextra/i1/346360614/TB2Y1AYfpXXXXawXpXXXXXXXXXX_!!346360614.jpg",
            "8": "https://img.alicdn.com/imgextra/i4/346360614/TB2EjI7fpXXXXcNXXXXXXXXXXXX_!!346360614.jpg",
            "9": "https://img.alicdn.com/imgextra/i2/346360614/TB2xV3UfpXXXXbhXpXXXXXXXXXX_!!346360614.jpg",
            "10": "https://img.alicdn.com/imgextra/i1/346360614/TB2T5tefFXXXXauXXXXXXXXXXXX_!!346360614.jpg",
            "11": "https://img.alicdn.com/imgextra/i3/346360614/TB28Yc0fpXXXXakXpXXXXXXXXXX_!!346360614.jpg",
            "12": "https://img.alicdn.com/imgextra/i3/346360614/TB2ztA7fpXXXXcTXXXXXXXXXXXX_!!346360614.jpg",
            "13": "https://img.alicdn.com/imgextra/i3/346360614/TB2O9cVfpXXXXaBXpXXXXXXXXXX_!!346360614.jpg",
            "14": "https://img.alicdn.com/imgextra/i4/346360614/TB2PEZ_fpXXXXbYXXXXXXXXXXXX_!!346360614.jpg",
            "15": "https://img.alicdn.com/imgextra/i4/346360614/TB2I2U4fpXXXXc4XXXXXXXXXXXX_!!346360614.jpg",
            "16": "https://img.alicdn.com/imgextra/i4/346360614/TB21zZOfpXXXXcMXpXXXXXXXXXX_!!346360614.jpg",
            "17": "https://img.alicdn.com/imgextra/i1/346360614/TB2ESVdfFXXXXazXXXXXXXXXXXX_!!346360614.jpg",
            "18": "https://img.alicdn.com/imgextra/i2/346360614/TB2GKU.fpXXXXb9XXXXXXXXXXXX_!!346360614.jpg",
            "19": "https://img.alicdn.com/imgextra/i2/346360614/TB2Jo4ifFXXXXXjXXXXXXXXXXXX_!!346360614.jpg"
        },
        "mainImageUrls": {
            "1": "https://img.alicdn.com/imgextra/i2/346360614/TB2ii7QfpXXXXcrXpXXXXXXXXXX_!!346360614.jpg",
            "2": "https://img.alicdn.com/imgextra/i4/346360614/TB2pzg7fpXXXXXhXpXXXXXXXXXX_!!346360614.jpg",
            "3": "https://img.alicdn.com/imgextra/i3/346360614/TB25WFefFXXXXaZXXXXXXXXXXXX_!!346360614.jpg",
            "4": "https://img.alicdn.com/imgextra/i1/346360614/TB2X9UZfpXXXXaHXpXXXXXXXXXX_!!346360614.jpg",
            "5": "https://img.alicdn.com/imgextra/i3/346360614/TB2KRpjfFXXXXXPXXXXXXXXXXXX_!!346360614.jpg"
        },
        "shop": {
            "id": "58501945",
            "suid": "263817957",
            "name": "handu",
            "items": []
        },
        "__topic__": "getDetail",
        "__request_id__": "queue::1443513651232"
    };

    var itemData = {
        "title": "韩都衣舍韩版2015秋装新款女装长款宽松显瘦开衫针织衫GY4384娋",
        "itemId": "520940041698",
        "price": "179.00",
        "list": [{
            "pvs": "-1:-1;20509:28314;1627207:28339",
            "names": "  常规 S 藏蓝色 ",
            "skuId": 3110395417461,
            "quantity": 306,
            "price": "179.00",
            "priceType": "秋装盛宴"
        }, {
            "names": "  常规 M 藏蓝色 ",
            "skuId": 3110395417462,
            "pvs": "-1:-1;20509:28315;1627207:28339",
            "quantity": 408,
            "price": "179.00",
            "priceType": "秋装盛宴"
        }, {
            "skuId": 3110395417463,
            "names": "  常规 L 藏蓝色 ",
            "pvs": "-1:-1;20509:28316;1627207:28339",
            "quantity": 286,
            "price": "179.00",
            "priceType": "秋装盛宴"
        }]
    };

};

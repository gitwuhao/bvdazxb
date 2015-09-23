(function(global, undefined) {

    classjs({
        className: 'fs.price',
        extend: 'fs.job',
        data_type: 'handu',
        task_type: 'price',
        initEvent: function() {
            classjs.log();
            this.loadSale();
        },
        loadSale: function() {
            classjs.log();
            var me = this;
            var item = this.getItem();
            if (!item) {
                return;
            }

            util.data.getDetail(item.id, function(data) {
                me.doDetailData(item, data);
            });
        },
        doDetailData: function(item, data) {
            classjs.log();
            var detail = data.detail;
            var mdskip = data.mdskip;
            var item = detail.itemDO;
            var itemData = {
                id: item.itemId,
                reservePrice: item.reservePrice,
                price: item.reservePrice,
                data: {

                }
            };

            var skuMap = itemData.data;
            var skuQuantity = mdskip.defaultModel.inventoryDO.skuQuantity;

            util.each(detail.valItemInfo.skuList, function(i, sku) {
                skuMap[sku.skuId] = sku;
                sku.quantity = skuQuantity[sku.skuId].quantity;
                sku.price = itemData.price;
            });

            util.it(mdskip.defaultModel.itemPriceResultDO.priceInfo, function(key, priceInfo) {
                var sku = skuMap[key];
                var promotionList = priceInfo.promotionList || priceInfo.suggestivePromotionList
                util.each(promotionList, function(i, promotion) {
                    if (parseFloat(sku.price) > parseFloat(promotion.price)) {
                        sku.price = promotion.price;
                        sku.priceType = promotion.type;
                    }
                });
            });

            this.doUploadSale(data);
        },
        doUploadSale: function(data) {
            classjs.log();
            var item = this.metaItemMap[data.id] || {};
            item.oldPrice = item.price;
            item.price = data.price;
            item.data = data.data;
            this.uploadJob(item.id);
        }
    });


    classjs({
        className: 'fs.price.handu',
        extend: 'fs.price',
        shop: config.shops[0],
        data_type: 'handu'
    });


    classjs({
        className: 'fs.price.amh',
        extend: 'fs.price',
        shop: config.shops[1],
        data_type: 'amh'
    });


})(window);

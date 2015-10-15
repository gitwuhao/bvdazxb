(function(global, undefined) {

    classjs({
        className: 'fs.price',
        extend: 'fs.job',
        data_type: 'handu',
        task_type: 'price',
        ready: function() {
            this.on('loadJobAfter', function() {
                this.loadSale();
            });
            this.callSuper();
        },
        loadSale: function() {
            classjs.log();
            var me = this;
            var item = this.getItem();
            if (!item) {
                return;
            }
            cfg.data.getDetail(item.id, function(data) {
                me.doDetailData(data);
            });
        },
        doDetailData: function(data) {
            classjs.log();
            var detail = data.detail;
            var mdskip = data.mdskip;
            var item = detail.itemDO;
            var itemData = {
                id: item.itemId,
                reservePrice: item.reservePrice,
                price: item.reservePrice,
                priceType: '',
                list: []
            };

            var array = itemData.list,
                skuMap = {},
                skuQuantity = mdskip.defaultModel.inventoryDO.skuQuantity;

            util.each(detail.valItemInfo.skuList, function(i, sku) {
                var newSku = {
                    name: sku.names,
                    quantity: skuQuantity[sku.skuId].quantity
                };
                skuMap[sku.skuId] = newSku;
                array.push(newSku);
            });

            util.it(mdskip.defaultModel.itemPriceResultDO.priceInfo, function(key, priceInfo) {
                var promotionList = priceInfo.promotionList || priceInfo.suggestivePromotionList
                util.each(promotionList, function(i, promotion) {
                    if (parseFloat(itemData.price) > parseFloat(promotion.price)) {
                        itemData.price = promotion.price;
                        itemData.priceType = promotion.type;
                    }
                });
            });
            this.doUploadSale(itemData);
        },
        doUploadSale: function(data) {
            classjs.log();
            var item = this.metaItemMap[data.id];
            item.oldPrice = item.price;
            item.price = data.price;
            item.list = data.list;
            this.uploadJob(item.id);
            setTimeout(this.loadSale.bind(this), 1 * 1000);
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

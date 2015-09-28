function checkedSKU(){
var color_key='1627207';
var size_key='20509';
var size_type='27013';
var size_type_text='中国码';

var skuArray= [{
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



var skuMap={};

util.each(skuArray,function(i,item){
	skuMap[item.id]=item;
});

util.each(skuMap[size_key].values,function(i,item){
	var $checkbox=$('#prop_'+size_key+'-'+item.id);
	if($checkbox[0]){
		$checkbox.attr('checked',true);
		E.dispatch($checkbox[0], "click");
	}
});


util.each($('.size-type [name=sizeGroupType]'),function(i,radio){
	if(radio.value.indexOf(size_type)>-1 || radio.parentElement.innerText.indexOf(size_type_text)>-1){
		radio.checked=true;
        E.dispatch(radio, "click");
		return false;
	}
});

};
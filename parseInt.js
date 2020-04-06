// 进制转化需要使用 parseInt 方法转化进制 转化进制的方法
// window.parseInt(str, radix)可以实现把任意进制字符串转为十进制返回。radix参数值介于 2 ~ 36 之间。如果该参数小于 2 或者大于 36，则parseInt(str, radix)的结果将返回 NaN。默认转为10
// parseInt(10, 36) 36进制转化成10进制 0*36的0次方+1*36的一次方 所以是 36
// Number.toString(radix)可以实现2、8、10、16进制的数据相互转换，并以字符串形式输出。radix支持 [2, 36] 之间的整数，默认为10。转化成10进制,转化成对应的进制形式，可以通过 parseInt('字符串', 进制）转化成10进制
function changeJinzhi(num, jinzhi){
    if(jinzhi < 2 || jinzhi > 36) {
        console.error('请转化2到36的进制');
        return;
    }
    num = num + ''
    window.parseInt(num).toString(jinzhi)
}
// parseInt(str, 进制) = num
// num.toString(进制）= str 这两个是存在相等的

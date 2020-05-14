// typeof 原理
// js 五种基本数据类型： string number boolean null undefined object
// typeof 主要返回 应用类型 string number boolean object undefined function 几种形式
// 存储在计算机中的机器码对应如下，使用 typeof 返回的就是机器码的对应值，所以 null 也会返回 object，而且不会判断 array
// 000: 对象
// 001: 整数
// 010: 浮点数
// 100: 字符串
// 110: 布尔
// undefined: -2^30
// null: 全0
// instanceof 原理主要是遍历原型链上的 constructor 是否有对应的数据类型
function instance(target, constructor) {
    let constuctProto = constructor.prototype
    if(!target) return false;
    // 处理的是基本类型 var f = '123'; f instanceOf String // false 虽然 f.__proto__ === String.prototype // true
    if(typeof target !== 'object' && typeof target !== 'function') return false
    while(true && target) {
        // 构造函数的原型 Array.prototype 所以原型应该是 Object.prototype 但是再遍历 proto 就会发现得到 null
        let proto = target.__proto__
        console.log(proto,constuctProto, proto === constuctProto)
        if(proto === constuctProto) {
            return true
        }
        target = proto;
    }
    return false
}

function isObject(target) {
    return Object.prototype.toString.call(target) === '[object Object]'
}

function isPromise(pro) {
    if(typeof pro.then === 'function') return true
}

function isGenerator(gen) {
    return 'function' == typeof gen.next && 'function' == typeof gen.throw;
}

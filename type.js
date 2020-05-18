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
 function bigC(num1, num2) {
     var m = num1.length, n = num2.length;
     // 结果最多为 m + n 位数
     let res = [];
     // 从个位数开始逐位相乘
     for (var i = m - 1; i >= 0; i--) {
         for (var j = n - 1; j >= 0; j--) {
             var mul = (+num1[i]) * (+num2[j]);
             console.log(mul)
             // 乘积在 res 对应的索引位置
             var p1 = i + j, p2 = i + j + 1;
             // 叠加到 res 上
             var sum = mul + (res[p2] || 0);
             res[p2] = sum % 10;
             if(!res[p1]) res[p1]=0
             res[p1] += sum / 10;
         }
     }

     console.log(res)

     // 结果前缀可能存的 0（未使用的位）
     var i = 0, str = [];
     while (i < res.length && res[i] == 0) {
         i++;
         // 将计算结果转化成字符串
         for (; i < res.length; i++)
             str.push('0' + res[i]);
     }


     return !str.length ? "0" : str;
 }
 // 参考 http://datacruiser.io/2019/09/25/43-%E5%AD%97%E7%AC%A6%E4%B8%B2%E7%9B%B8%E4%B9%98-leetcode-Tencent-50/
// 大数相乘利用了n位数*m位数值不会超过m+n位，最大是m+n位，所以我们需要处理的是存储value[i+j+1]=value[i]*value[j]+value[i]*value[j],相加之后进行进位处理
function Multy(num1, num2) {
    var length1 = num1.length;
    var length2 = num2.length;
    var totalLength = length1 + length2;                     //获取相乘后字符串的总有效位数

    var value = []

    for(var i = length1  - 1; i >= 0; i--)
    {
        for(var j = length2 - 1; j >= 0; j--)
        {
            if(!value[i + j + 1]) {
                value[i + j + 1] = 0
            }
            value[i + j + 1] += (num1[i] - '0') * (num2[j] - '0');
        }
    }

    for(var i = totalLength - 1; i > 0; i--)                 //获取每个位置上面的数字并处理进位
    {
        // 进位处理
        if(!value[i - 1]) {
            value[i - 1] = 0
        }
        value[i - 1] += Math.floor((value[i]||0) / 10);
        value[i] = (value[i] || 0) % 10

    }
    console.log(value, 'value')

    if(value[0] === 0)
        return value.join('').slice(1)
    return value.join('')
}
// 大数相加
function add(num1, num2) {
    let add = 0;
    let length1 = num1.length - 1;
    let length2 = num2.length - 1;
    let result = []
    let n1, n2;
    while(length1 >-1 || length2 >-1) {
        if(!num1[length1]) {
            n1 =0
        }else {
            n1 = +num1[length1]
            length1--
        }
        if(!num2[length2]) {
            n2 = 0;
        }else {
            n2 = +num2[length2]
            length2--
        }
        let sum = (add + n1 +  n2)%10
        result.push(sum)
        if((add + n1 +  n2) < 10) {
            add = 0
        } else {
            add =  Math.floor((add + n1 +  n2)/10)
        }
    }
    const r = result.reverse().join('')
    if(r[0] === '0')  return r.slice(1);
    return r
}
// 大数相减
function minus(num1, num2) {
    if(+num1 < +num2) {
        return '-' + minus(num2, num1)
    }
    let add = 0;
    let length1 = num1.length - 1;
    let length2 = num2.length - 1;
    let result = []
    let n1, n2;
    while(length1 >-1 || length2 >-1) {
        if(!num1[length1]) {
            n1 =0
        }else {
            n1 = +num1[length1]
            length1--
        }
        if(!num2[length2]) {
            n2 = 0;
        }else {
            n2 = +num2[length2]
            length2--
        }
        let sum = n1 - n2 + add
        if(n1 < n2) {
            add =  -1
            sum =  sum+10
        } else {
            add =0
        }
        console.log(sum)
        result.push(sum)

    }
    console.log(result)
    const r = result.reverse().join('')
    if(r[0] === '0')  return r.slice(1);
    return r
}
// simple 除法
function chufa(a, b) {
    let times = 1;
    let c =  a -  b
    while(c > 0) {
        c = c - b;
        times++
    }
    return times
}

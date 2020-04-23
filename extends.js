// 拷贝涉及的知识点主要是 json.stringify 可以进行深拷贝，但是如果存在undefined、函数、symbol、正则表达式不会报错但是会忽略不会被拷贝过去，会丢失对象的构造函数，都会变成 object。扩展运算符使用的是浅拷贝
// 然后测试了一下
// ```js
// function cloneJSON(source) {
//     return JSON.parse(JSON.stringify(source));
// }var o = {a: 3, f: 4, t: {s: 7}}
// o.t.s = o
// cloneJSON(o) 报错直接报出循环引用的错误
// ```
// 在 js 里面循环引用是不被处理的， 但是在 node 中会被标记为 circleler 代表引用自身
// 深拷贝还要防止循环引用
function extend(target, obj) {
    target = target || {}
    for(let key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(typeof obj[key] === 'object' && obj[key]) {
                obj[key] = extend({}, obj[key])
            } else {
                target[key] = obj[key]
            }
        }
    }
    return target;
}
// 并没有处理循环应用在循环中会造成栈的泄漏
// 基本思路把处理的对象存储起来然后在使用的时候在发现存储中有，就直接从 hash 中取,首先 Map 数据结构支持存储对象作为 key 进行存储
function extendsProp(target, obj) {
    let hash = new Map()
    function extend(target, obj) {
        target = target || {}
        if(hash.get(obj)) {
            return hash.get(obj)
        } else {
            hash.set(obj, target)
        }
        for(let key in obj) {
            if(obj.hasOwnProperty(key)) {
                if(typeof obj[key] === 'object' && obj[key]) {
                    target[key] = extend({}, obj[key])
                } else {
                    target[key] = obj[key]
                }
            }
        }
        return target;
    }
    return extend(target, obj)

}
function flattenArr(arr) {
    var result = [];
    return flat(arr);
    function flat(arr) {
        arr.forEach(item => {
            if(item instanceof Array) {
                result.concat(flat(item))
            } else {
                result.push(item)
            }
        })
        return result
    }

}

Array.prototype.filter = function(cb){
    let result = []
    for(let i = 0; i < this.length; i++) {
        if(cb(i, this[i])) {
            result.push(this[i])
        }
    }
    return result

}

Array.prototype.reduce3 = function(cb, initial) {
    let pre = this[0];
    let index = 1
    if(initial) {
       pre = initial
       index = 0
    }
    for(index; index < this.length; index++) {
       pre = cb(pre, this[index])
    }
    return pre;
}

Array.prototype.map1 = function(cb) {
    let result = [];
    for(let i = 0; i < this.length; i++) {
        result.push(cb(i, this[i]))
    }
    return result;
}
// 处理循环引用、undefined、正则、函数、Date类型
function getType(v, extend) {
    if(Object.prototype.toString.call(v) === '[object RegExp]') {
        return new RegExp(v)
    }

    if(Object.prototype.toString.call(v) === '[object Date]') {
        return new Date(v)
    }

    if(Object.prototype.toString.call(v) === '[object Function]') {
        let F = function () {
            return v
        }
        var final = eval('F()');
        return final
    }

    if(Object.prototype.toString.call(v) === '[object Array]') {
        return v.slice()
    }

    if(Object.prototype.toString.call(v) === '[object Object]') {
        return extend({}, v)
    }


    return null;

}

function cloneObj(obj) {
    let target = {};
    let hash = new Map()
    function extend(target, obj) {
        if(hash.get(obj)) {
            return hash.get(obj)
        } else {
            hash.set(obj, target)
        }
        for(let key in obj) {
            if(obj.hasOwnProperty(key)) {
               let v = obj[key]
               let val = getType(v, extend);
               if(val) {
                   target[key] = val
               } else {
                   target[key] = obj[key]
               }
            }
        }
        return target;
    }
    return extend(target, obj)
}
// 处理数组引用和对象引用以及函数正则Date类型，未处理object上的symbol属性元素因为 for in 是无法遍历出来的
var clone = (function clone(){
    let arrHash = new Map();
    let objHash = new Map()
    function getType(v, extend) {
        if(Object.prototype.toString.call(v) === '[object RegExp]') {
            return new RegExp(v)
        }
        if(Object.prototype.toString.call(v) === '[object Date]') {
            return new Date(v)
        }

        if(Object.prototype.toString.call(v) === '[object Function]') {
            let F = function () {
                return v
            }
            var final = eval('F()');
            return final
        }

        if(Object.prototype.toString.call(v) === '[object Array]') {
            var result = [];
            if(arrHash.get(v)) return v;
            arrHash.set(v, result);
            for(let i = 0; i < v.length; i++) {
                let y = getType(v[i], extend)
                if(y) {
                    result.push(y)
                } else {
                    result.push(v[i])
                }
            }
            return result
        }

        if(Object.prototype.toString.call(v) === '[object Object]') {
            return extend({}, v)
        }


        return null;

    }
    function cloneObj(obj) {
        let target = {};
        function extend(target, obj) {
            if(objHash.get(obj)) {
                return objHash.get(obj)
            } else {
                objHash.set(obj, target)
            }
            for(let key in obj) {
                if(obj.hasOwnProperty(key)) {
                    let v = obj[key]
                    let val = getType(v, extend);
                    if(val) {
                        target[key] = val
                    } else {
                        target[key] = obj[key]
                    }
                }
            }
            return target;
        }
        return extend(target, obj)
    }
    return {
        cloneObj
    }
})()
// 测试新的处理数组和对象的深拷贝函数
let o = {a: [1, 2, 3], b: [{ a: 13}, function(){}, 123, /123/], v: {w:45}}
o.b[0].r = o
o.b[1] = o.b
let g9 = clone.cloneObj(o)

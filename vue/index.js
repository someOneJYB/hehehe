function defObj(obj, key){
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set: function reactiveSetter (newVal) {
            const value = obj.get()
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            console.log('diff')
            // #7981: for accessor properties without setter
            // if (getter && !setter) return
            // if (setter) {
            //     setter.call(obj, newVal)
            // } else {
            //     val = newVal
            // }
            // childOb = !shallow && observe(newVal)
            // dep.notify()
        }
    })
}
// 输入：
// [[1, 10), [10, 15), [15, 16), [20, 24)]
// 返回：
// [[1, 16), [20, 24)]


function getOrderArr(arr) {
    let min = 0;
    let max = 0;
    let start = arr.slice(1)
    const w = arr[0].split(',');
    min = +w[0].slice(1);
    max = +w[1].slice(0, -1);
    let result = []
    start.forEach(item => {
       let r = item.split(',');
        let r1 = +r[0].slice(1);
        let r2 = +r[1].slice(0, -1);
        console.log(r1, r2)
        if(min <= r1 && r1 <= max && max < r2) {
            max = r2
        } else {
            if(r1 > max) {
                result.push(`[${min}, ${max})`)
                min = r1;
                max = r2
            }
        }
    })
    result.push(`[${min}, ${max})`)
    return result
}
// 如果是 [ 则要判断是否在之中或者，如果是)则判断是否成为新的区间
let h = ['[1, 10)', '[5, 15）', '[15, 16)', '[20, 24)']
// 实现平方根  x = (x + n / x) / 2。
function sqrtNewton(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return n
    var val = n,
        last;
    do {
        console.log(val, last)
        last = val;
        val = (val + n / val) / 2;
    } while (Math.abs(val - last) >= Number.EPSILON)
    return val
}
// 模拟 class
function callCheck(ins, Cons) {
    if(!(ins instanceof Cons)) {
        throw new Error('请使用 new 方法')
    }
}
function _createClass(cons, protos, statics) {
    let p = cons.prototype
    protos.forEach(item => {
        Object.defineProperty(p, item.key, item.value)
    })
    statics.forEach(item => {
        Object.defineProperty(cons, item.key, item.value)
    })
}
// 继承了 prototype 和 static
function _inherits(sub, sup) {
    sub.prototype = Object.create(sup);
    sub.__proto__ = sup
}
function _createSuper(Sup) {
    return function() {
        Sup.call(this, arguments)
    }
}
var A =  (function(){
    function A() {
        callCheck(this, A);
        [...arguments].forEach(item => {
            this[item] = item
        })
    }
    _createClass(A, [{
        key: "say",
        value: function say() {
            console.log('hi');
        }
    }, {
        key: "d",
        value: function d() {
            console.log('d');
        }
    }], [{
        key: "v",
        value: function v() {
            console.log('v');
        }
    }]);
    return A
})()
// 已知B 继承 A
var B = (function(){
    _inherits(B, _A);

    var _super = _createSuper(B);

    function B(a, b) {
        var _this;

        callCheck(this, B);
// 不执行 super 无法执行 _this 赋值
        _this = _super.call(this, a);
        _this.b = b;
        return _this;
    }

    _createClass(B, [{
        key: "say",
        value: function say() {
            console.log('hello');
        }
    }]);
    return B
})(A)

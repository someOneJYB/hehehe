function isEaqual(p1, p2) {
    for(let i = 0; i < p1.length; i++) {
        if(p1[i] !== p2[i]) return false
    }
    return true
}

function Memo(defaultEqualCheck) {
    this.equalCheck = defaultEqualCheck || isEaqual;
}
Memo.prototype.createSelector = function(func) {
    var args = [].slice.call(arguments)
    var realfunc = args.pop();
    let that = this;
    var dependency = args[0] instanceof Array ? args[0] : []
    // state props 作为参数
    return function() {
        // 真正的执行函数 memo
        var memoResult = that.memoFunc(function(){
            return realfunc.apply(null, arguments)
        })
        // 选择器的返回值也做 memo，dependency也依赖state和props计算
        var selector = that.memoFunc(function(){
            let params = []
            for(let i = 0; i < dependency.length; i++) {
                params.push(dependency[i](arguments))
            }
            return memoResult.apply(null, params)
        })
        selector.realfunc = realfunc;
        return selector;
    }
}
Memo.prototype.memoFunc = function(fn) {
    let preResult = null;
    let args = null;
    let that = this
    return function() {
        if(!that.isEaqual(args, arguments)) {
            preResult = fn.apply(null, arguments)
        }
        args = arguments;
        return preResult
    }
}

Memo.getInstance = (function() {
    let ins = null
    return function(equalFunc) {
        if(!ins) ins = new Memo(equalFunc);
        return ins;
    }
})()
modules.exports = Memo.getInstance
// 发散思维， 如果参数都是一个函数，最后执行仍然是函数，那怎么做？
// 首先要对于是函数的参数缓存， 最后执行的函数也要结果缓存。
function isEaqual(p1, p2) {
    if(!p1) return false
    for(let i = 0; i < p1.length; i++) {
        for(let j = 0; j < p1[i].length; j++) {
            if(p1[i][j]!== p2[i][j]) return false
        }
    }
    return true
}
function memo(fn) {
    let preResult = null;
    let args = null;
    return function() {
        if(!isEaqual(args, arguments)) {
            console.log(arguments, 'not equal')
            preResult = fn.apply(null, arguments)
        }
        console.log(fn)
        preResult = fn.apply(null, arguments)
        args = arguments;
        return preResult;
    }
}

function memoFunc(args) {
    let params = [];
    var args = [].slice.call(arguments)
    var resultFn = args.pop();
    for(let i = 0; i < args.length; i++) {
        let m = memo(function() {
            return args[i].apply(null, arguments)
        })
        params.push(m)
    }
    let memoF = memo(function() {
        let resulrParams = []
        let ar = [].slice.call(arguments)
        for(let i = 0; i < params.length; i++) {
            let g = params[i].apply(null, ar[i])
            resulrParams.push(g)
        }
        return resultFn.apply(null, resulrParams)
    })
    return memoF
}
memoFunc(function(a, b){return a+b}, function(a, b){return a-b}, function(a, b){
    console.log(a,b)
    return a*b
})([1, 2], [3, 1])
// memo 思想在闭包中执行真正的函数，这样还能够判断参数是否发生变化，思想也很巧妙，值得学习借鉴。

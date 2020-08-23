function memorize(fn) {
    let cache = {};
    return function() {
        let key = JSON.stringify(arguments);
        cache[key] = cache[key] || fn.apply(this, arguments);
        return cache[key];
    }
}
function currify(fn) {
    let length = fn.length;
    let result = [];
    function next() {
        result = result.concat(Array.from(arguments));
        if(result.length < length) {
            return next
        }
        return fn.call(this, ...result)

    }
    return next;
}
// 颗粒化优化
function currify2(fn) {
    let length = fn.length;
    function next(...ar) {
        if(ar.length < length) {
            return function() {
                return next(...ar.concat(Array.from(arguments)))
            }
        }
        return fn.call(this, ...ar)

    }
    return next;
}
// compose
function compose(...fns) {
    let fn = fns.reverse();
    return function() {
        return fn.reduce((arg, f)=>{
            return f(arg)
        }, ...arguments)
        // let next = fn(arguments);
        // for(let i = 1; i < fn.length; i++) {
        //     next = fn[i](next)
        // }
        // return next;
    }
}
// 函子有map 方法， 盒子中返回一个新的函子，需要处理传入的值会是一种错误的输入，也就是副作用的处理,maybe 处理失效的输入，但无法知道出问题的位置，所以使用 either 函子来确定出现问题的位置也就是在出现问题的时候 map 返回的是 object， Io 函子 value 是一个函数不纯的动作，延迟执行不纯的函数，包装操作, map 形成链式调用保证了值的传递和value值不被污染
class Container {
    static of(value) {
        return new Container(value)
    }
    constructor(val) {
        this._val = val;
    }
    // map 实现链式调用，没有处理值是不合理的
    map(fn) {
        return this.isNothing() ? Container.of(null) : Container.of(fn(this._val))
    }
    isNothing() {
        return this._val === null || this._val === undefined
    }
}
class Maybe {
    static of (value) {
        return new Maybe(value)
    }
    constructor(value) {
        this._value = value;
    }
    isNothing() {
        return this._value === null || this._value === undefined
    }
    map(fn) {
        return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this._value))
    }
}
class IO {
    static of (value) {
        // value 也许不纯
        return new IO(function(){
            return value;
        })
    }
    constructor(fn) {
        // 不纯的函数
        this._value = fn
    }
    map(fn) {{
        // 处理不纯为纯进行组合和fn成新函数，this._value 不纯所以在这里 compose 后变得纯粹
        return new IO(compose(fn, this._value))
    }}
    // monad 就是 io 中有 join 方法，使用join 就是
    join() {
        // 处理 IO（IO（x））
        return this._value()
    }
    // 函数返回函子为了打开函子需要打开
    flatten(fn) {
        return this.map(fn).join()
    }

}
function readFile(filename) {
    return new IO(function(){})
}
IO.of(process).map(p => p.exectPath)
// promise 的 thunk var read = thunkify(fs.readFile);
//
// read('package.json', 'utf8')(function(err, str){
//
// });
// 流程控制是从 thunk 到 co 的简单模拟可以看见从回调函数走向了 generator + promise 对流程的控制
function thunkFy(fn) {
    return function(){
        var args = new Array(arguments.length);
        var ctx = this;

        for(var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
        }

        return function(done){
            var called;
// done 是 callback 所以
            args.push(function(){
                if (called) return;
                called = true;
                done.apply(null, arguments);
            });

            try {
                // 执行的时候就可以自动执行注入的 cb 了也就是 done
                fn.apply(ctx, args);
            } catch (err) {
                done(err);
            }
        }
    }
}
function simpleCo(gen) {
    let g = gen();
    function dealRequest(fn) {
        let v = fn();
        if(v.done) return;
        v.value.then(() => {
            dealRequest(()=>g.next(v.value))
        }, err=> g.throw(err))
    }
    dealRequest(()=>g.next())
}
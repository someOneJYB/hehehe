// co 最后都会返回成 promise 的形式打开；
// 里面是一个 generator 如果还有一个 generator 进入到新的 generator 直到一个结束退回到上一级的 promise 中继续执行，利用了内部 promise 先执行完毕才会执行外部的 promise
// 对象的话就会收集所有的 promise 属性添加 then 方法收集返回的值，最后 promise.all 里面统一返回
// 对象是数组的话直接把所有元素打开按照对应的逻辑处理，因为最后都是 promise 打开，所以 toPromise 方法很关键，所有处理都变成 promise 的关键， next 函数也是承上启下的作用，打开 promise 的关键
// 函数的话直接就是在 promise 执行中把回调结果穿过去
// 普通值也可以返回 promise 的形式在 co 的基础上的改良。
// 最后返回一个大的 promise 而 promise 之间的解开是依赖 onFulfille 和 onReject 作为 promise 的参数穿进去

function co(gen) {
    var args = [].slice(1).call(arguments);
    var ctx = arguments[0]

    return new Promise(function(resolve, reject) {
        if (typeof gen === 'function') gen = gen.apply(ctx, args);
        // gen 不存在或者不是一个 generator
        if (!gen || typeof gen.next !== 'function') return resolve(gen);
        onFulfilled()
        function onFulfilled(res) {
            var ret;
            try {
                ret = gen.next(res);
            } catch (e) {
                return reject(e);
            }
            next(ret);
            return null;
        }
        function onRejected(err) {
            var ret;
            try {
                ret = gen.throw(err);
            } catch (e) {
                return reject(e);
            }
            next(ret);
        }
        function next(ret) {
            if(ret.done) resolve(ret.value);
            // 分别判断了 object promise 对象 数组、gennerator 函数
            var value = toPromise.call(ctx, ret.value);
            // 如果是 generator 就会导致 value 变成了一个大的 promise
            if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
        }
    })
}

function isPromise(val) {
    return val && val.then && typeof val.then === 'function'
}

function isGenerator(val) {
    return 'GeneratorFunction' === (val && val.constructor ? val.constructor.name : '')
}

function toPromise(val) {
    if(isPromise(val)) return val;
    if(isGenerator(val)) co.call(this, val);
    if ('function' == typeof val) return thunkToPromise.call(this, val);
    if (Array.isArray(val)) return arrayToPromise.call(this, val);
    if (isObject(val)) return objectToPromise.call(this, val);
    return new Promise(function(res, rej){
        res(val)
    })
}

function thunkToPromise(fn) {
    var ctx = this;
    return new Promise(function (resolve, reject) {
        fn.call(ctx, function (err, res) {
            if (err) return reject(err);
            if (arguments.length > 2) res = [].slice.call(arguments, 1);
            resolve(res);
        });
    });
}

function arrayToPromise(arr) {
    let ctx = this;
    return Promise.all(arr.map(function(item){
        return toPromise.call(ctx, item)
    }))
}

function isObject(val) {
    return Object == val.constructor;
}

function objToPromise(obj) {
    var results = new obj.constructor();
    var keys = Object.keys(obj);
    var promises = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var promise = toPromise.call(this, obj[key]);
        if (promise && isPromise(promise)) defer(promise, key);
        else results[key] = obj[key];
    }
    return Promise.all(promises).then(function () {
        return results;
    });
// 处理promise的属性放入到 promise的队列中统一处理返回结果。
    function defer(promise, key) {
        // predefine the key in the result
        results[key] = undefined;
        // 如果对应的属性仍旧是 promise 就会等待所有的属性都得到值才会返回值
        promises.push(promise.then(function (res) {
            results[key] = res;
        }));
    }
}

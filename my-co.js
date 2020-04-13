// co 的核心主要是为了让函数按照严格顺序执行只有上一级执行完才可以执行下一个函数

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
    createPromise.__generatorFunction__ = fn;
    return createPromise;
    function createPromise() {
        return co.call(this, fn.apply(this, arguments));
    }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */
// 允许注册 context
function co(gen) {
    var ctx = this;
    var args = slice.call(arguments, 1);

    // we wrap everything in a promise to avoid promise chaining,
    // which leads to memory leak errors.
    // see https://github.com/tj/co/issues/180
    return new Promise(function(resolve, reject) {
        // gen 是一个函数
        if (typeof gen === 'function') gen = gen.apply(ctx, args);
        // gen 不存在或者不是一个 generator
        if (!gen || typeof gen.next !== 'function') return resolve(gen);

        onFulfilled();

        /**
         * @param {Mixed} res
         * @return {Promise}
         * @api private
         */

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

        /**
         * @param {Error} err
         * @return {Promise}
         * @api private
         */

        function onRejected(err) {
            var ret;
            try {
                ret = gen.throw(err);
            } catch (e) {
                return reject(e);
            }
            next(ret);
        }

        /**
         * Get the next value in the generator,
         * return a promise.
         *
         * @param {Object} ret
         * @return {Promise}
         * @api private
         */

        function next(ret) {
            // 判断是否结束 generator 则打开 promise
            if (ret.done) return resolve(ret.value);
            // 分别判断了 object promise 对象 数组、gennerator 函数，把值变成 promise，按顺序执行下去里面的
            var value = toPromise.call(ctx, ret.value);
            // 如果是 generator 就会导致 value 变成了一个大的 promise
            // 因此普通值就会导致无法导出，在下一个 promise 中继续执行next方法直到可以打开
            if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
            return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
                + 'but the following object was passed: "' + String(ret.value) + '"'));
        }
    });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
    if (!obj) return obj;
    if (isPromise(obj)) return obj;
    if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
    if ('function' == typeof obj) return thunkToPromise.call(this, obj);
    if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
    if (isObject(obj)) return objectToPromise.call(this, obj);
    return obj;
}

// 把函数转化成 thunk 形式

function thunkToPromise(fn) {
    var ctx = this;
    return new Promise(function (resolve, reject) {
        fn.call(ctx, function (err, res) {
            if (err) return reject(err);
            if (arguments.length > 2) res = slice.call(arguments, 1);
            resolve(res);
        });
    });
}

// 转化成把array中的元素变成promise
function arrayToPromise(obj) {
    return Promise.all(obj.map(toPromise, this));
}

// 对象变成 promise
function objectToPromise(obj){
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

    function defer(promise, key) {
        // predefine the key in the result
        results[key] = undefined;
        // 如果对应的属性仍旧是 promise 就会等待所有的属性都得到值才会返回值
        promises.push(promise.then(function (res) {
            results[key] = res;
        }));
    }
}

// 判断 promise 类型

function isPromise(obj) {
    return 'function' == typeof obj.then;
}

// 判断是不是 generator
function isGenerator(obj) {
    return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}


// 检查是否是genertor
function isGeneratorFunction(obj) {
    var constructor = obj.constructor;
    if (!constructor) return false;
    if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
    return isGenerator(constructor.prototype);
}


// 检查类型
function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

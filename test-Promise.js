function P(fn) {
    var state = 'pending';
    var value = null;
    var callbacks = [];
    this.then = function(onFulfilled, onRejected) {
        return new P(function (res, rej) {
            // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
            bridgePromise({
                onFulfilled: onFulfilled || null,
                onRejected: onFulfilled || null,
                resolve: res,
                reject: rej,
            })
        })
    }
    function resolve(val) {
        // 是一个 promise 值就需要桥接和打开
        if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
                then.call(val, resolve);
                return;
            }
        }
        state = 'fulfilled';
        value = val;
        // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
        setTimeout(function(){
            callbacks.forEach(function(i) {bridgePromise(i)})
        }, 0)
    }
    function reject(val) {
        // 是一个 promise 值就需要桥接和打开
        if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
                then.call(val, reject);
                return;
            }
        }
        state = 'rejected';
        value = val;
        // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
        setTimeout(function(){
            callbacks.forEach(function(i) {bridgePromise(i)})
        }, 0)
    }
    function bridgePromise(promiseObj) {
        if(state === 'pending') {
            callbacks.push(promiseObj)
            return;
        }
        var cb = state === 'fulfilled' ? promiseObj.onFulfilled : promiseObj.onRejected,
            ret;
        if (cb === null) {
            cb = state === 'fulfilled' ? promiseObj.resolve : promiseObj.reject;
            cb(value);
            return;
        }
        //  在这里执行了 resolve
        console.log('resolve value', value)
        ret = cb(value);
        //  在这里执行了 resolve
        console.log('resolve ret', ret)
        promiseObj.resolve(ret);
    }
    fn(resolve, reject)
}
// test 测试如下：
var promise = new P(function(resolve, reject) {
    return new P(function(res, rej) {
        setTimeout(function() {
            console.log('第一个回调');
            resolve(3);
        }, 2000);
    });
});
// 在新的 promise 里面 setTimeout 执行太慢导致 返回了 undefined 导致 第三个回调
promise.then(function(value) {
    return new P(function(resolve, reject) {
    setTimeout(function() {
        console.log('第二个回调');
        resolve(value * 2);
    }, 2000);
    });
}).then(function(value) {
    setTimeout(function() {
        console.log('第三个回调');
        console.log(value * 2);
    }, 1000);
});
// 测试 reject
var promise2 = new P(function(resolve, reject) {
    return new P(function(res, rej) {
        setTimeout(function() {
            console.log('第一个回调');
            reject(12);
        }, 2000);
    });
});
// 在新的 promise 里面 setTimeout 执行太慢导致 返回了 undefined 导致 第三个回调
promise2.then(function(value) {
    return new P(function(resolve, reject) {
        setTimeout(function() {
        console.log('第二个回调');
        resolve(value * 2);
        }, 3000);
    });
}).then(function(value) {
    setTimeout(function() {
        console.log('第三个回调');
        console.log(value * 2);
    }, 1000);
});

P.all = function(promises) {
    var result = [];
    return new P(function(resolve, reject) {
        promises.forEach(p => {
           p.then(v => result.push(v))
        })
        if(result.length === promises.length) {
            resolve(result)
        }
    })
}
P.race = function(promises) {
    var result = [];
    return new P(function(resolve, reject) {
        for(var i = 0; i < promises.length; i++) {
            promises[i].then(v => result.push(v))
            if(result.length === 1) {
                resolve(result[0])
                return;
            }
        }
    })
}
// 每个 promise 是具有依赖性的
P.order = function(promises) {
    let temp = promises[0]
    promises.unshift()
    var result = []
    promises.forEach(function(i, idx){
        temp = temp.then(promise[i]).then(v => result.push(v))
    })
    console.log('temp')
    console.log(temp, result)
    return temp
    // 第一个结束以后调用第二个 promise 的形式

}

P.resolve = function(v) {
    return new P(function(res){
        res(v)
    })
}

P.order = function(arr) {
   let t = arr[0];
   let container = [];
   for(let i = 1; i < arr.length + 1; i++) {
            t = t.then(v => {
                container.push(v);
                if(i === arr.length) {
                    return P.resolve(container)
                }
                return arr[i]
            })
        }
   return t;
}

// new Promise((res, rej) {
//     axios
// }).then(v => {
//     return new Promise
// })

P.order([new P(function(resolve, reject) {
    setTimeout(()=> {
        console.log('第一个回调');
        resolve(1)
    })
}), new P(function(resolve, reject) {
    console.log('第二个回调');
    resolve(2);
})]).then(v => console.log('last', v))
// 测试结果符合 promise 的执行顺序 then 同步注册，但是异步执行的话会在我的打印处显示

// p1.then(res(p2)).then(res(p3))
// function o(promises) {
//     let temp = promises[0]
//     for(var i = 1; i < promises.length; i++) {
//         temp = temp.then(function(val) {
//             console.log(val)
//             return promises[i]
//         })
//     }
//     return temp
//     // 第一个结束以后调用第二个 promise 的形式
// }

function commonFn(fn) {
    return function(arg) {
        return new Promise((res, rej)=>{
            fn.then(v => res(v))
        })
    }
}
new Promise(function(resolve, reject) {
    p1.then(v => resolve(v))
}).then(v => {
    return new Promise(function(res, rej){
        // cb
    })
})
// co 返回一个大的 promise，先执行
// p1.then(v =)

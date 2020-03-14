var registerError
function P(fn) {
    var state = 'pending';
    var value = null;
    var callbacks = [];
    this.then = function(onFulfilled, onRejected) {
        console.log(this.getStatus(), 'call then 方法')
        return new P(function (res, rej) {
            console.log(state, 'state', 'value', value)
            // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
            // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
            bridgePromise({
                onFulfilled: onFulfilled || null,
                onRejected: onFulfilled || null,
                resolve: res,
                reject: rej,
            })
        })
    }
    this.catch = function(onRejected) {
        return new P(function (res, rej) {
            registerError = 1
            // console.log(state, 'state', 'value', value)
            // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
            // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
            bridgePromise({
                onFulfilled: null,
                onRejected: onRejected || null,
                resolve: res,
                reject: rej,
            })
        })
    }
    this.getStatus = function() {
        return {'state': state, 'value':  value}
    }
    function resolve(val) {
        // console.log('resolve开始', state, value, val)
        // 是一个 promise 值就需要桥接和打开, 这里为什么在 resolve 是 promise 的时候传递这个 resolve 函数是为了最外层的 promise 赋内层传递打开的 promise 的值，最内层的 promise value 值传递给最外层，所以保证了最外层可以把值传递下去
        if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
                // 当前的 resolve 调用栈在最外层
                then.call(val, resolve);
                return;
            }
        }
        // console.log('fufilled开始', state, value, val)
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
        registerError = registerError || 0
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
        // console.log('bridgePromise resolve value', value, callbacks, state)
        ret = cb(value);
        //  在这里执行了 resolve
        // console.log('bridgePromise resolve ret', ret, callbacks, state)
        // 第一个是 undefined
        if(state === 'fulfilled') {
            promiseObj.resolve(ret);
        } else {
            promiseObj.reject(ret);
        }
    }
    try {
        fn(resolve, reject)
    } catch(err) {
        reject(err)
        setTimeout(() => {
            if(registerError === 0) {
                registerError = undefined
                throw new Error('unhandleRejection');
            }
            registerError = undefined
        }, 0)
    }finally {
        // // console.log(registerError)
        // setTimeout(() => {
        //     if(registerError === 0) {
        //         registerError = undefined
        //         throw new Error('unhandleRejection');
        //     }
        //     registerError = undefined
        // }, 0)
    }
}
let p
// var promise = new P(function(resolve, reject) {
//     // 内层的 P 执行结束以后逐层退出函数栈
//    p = new P(function(res, rej) {
//         res(3);function P(fn) {
//     var state = 'pending';
//     var value = null;
//     var callbacks = [];
//     var registerError
//     this.then = function(onFulfilled, onRejected) {
//         console.log(this.getStatus(), 'call then 方法')
//         return new P(function (res, rej) {
//             console.log(state, 'state', 'value', value)
//             // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
//             // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
//             bridgePromise({
//                 onFulfilled: onFulfilled || null,
//                 onRejected: onFulfilled || null,
//                 resolve: res,
//                 reject: rej,
//             })
//         })
//     }
//     this.catch = function(onRejected) {
//         return new P(function (res, rej) {
//             registerError = 0
//             console.log(state, 'state', 'value', value)
//             // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
//             // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
//             bridgePromise({
//                 onFulfilled: null,
//                 onRejected: onRejected || null,
//                 resolve: res,
//                 reject: rej,
//             })
//         })
//     }
//     this.getStatus = function() {
//         return {'state': state, 'value':  value}
//     }
//     function resolve(val) {
//         console.log('resolve开始', state, value, val)
//         // 是一个 promise 值就需要桥接和打开, 这里为什么在 resolve 是 promise 的时候传递这个 resolve 函数是为了最外层的 promise 赋内层传递打开的 promise 的值，最内层的 promise value 值传递给最外层，所以保证了最外层可以把值传递下去
//         if (val && (typeof val === 'object' || typeof val === 'function')) {
//             var thenvar registerError
// function P(fn) {
//     var state = 'pending';
//     var value = null;
//     var callbacks = [];
//     this.then = function(onFulfilled, onRejected) {
//         console.log(this.getStatus(), 'call then 方法')
//         return new P(function (res, rej) {
//             console.log(state, 'state', 'value', value)
//             // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
//             // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
//             bridgePromise({
//                 onFulfilled: onFulfilled || null,
//                 onRejected: onFulfilled || null,
//                 resolve: res,
//                 reject: rej,
//             })
//         })
//     }
//     this.catch = function(onRejected) {
//         return new P(function (res, rej) {
//             registerError = 1
//             console.log(state, 'state', 'value', value)
//             // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
//             // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
//             bridgePromise({
//                 onFulfilled: null,
//                 onRejected: onRejected || null,
//                 resolve: res,
//                 reject: rej,
//             })
//         })
//     }
//     this.getStatus = function() {
//         return {'state': state, 'value':  value}
//     }
//     function resolve(val) {
//         console.log('resolve开始', state, value, val)
//         // 是一个 promise 值就需要桥接和打开, 这里为什么在 resolve 是 promise 的时候传递这个 resolve 函数是为了最外层的 promise 赋内层传递打开的 promise 的值，最内层的 promise value 值传递给最外层，所以保证了最外层可以把值传递下去
//         if (val && (typeof val === 'object' || typeof val === 'function')) {
//             var then = val.then;
//             if (typeof then === 'function') {
//                 // 当前的 resolve 调用栈在最外层
//                 then.call(val, resolve);
//                 return;
//             }
//         }
//         console.log('fufilled开始', state, value, val)
//         state = 'fulfilled';
//         value = val;
//         // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
//         setTimeout(function(){
//             callbacks.forEach(function(i) {bridgePromise(i)})
//         }, 0)
//     }
//     function reject(val) {
//         // 是一个 promise 值就需要桥接和打开
//         if (val && (typeof val === 'object' || typeof val === 'function')) {
//             var then = val.then;
//             if (typeof then === 'function') {
//                 then.call(val, reject);
//                 return;
//             }
//         }
//         registerError = registerError || 0
//         state = 'rejected';
//         value = val;
//         // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
//
//         setTimeout(function(){
//             callbacks.forEach(function(i) {bridgePromise(i)})
//         }, 0)
//     }
//     function bridgePromise(promiseObj) {
//         if(state === 'pending') {
//             callbacks.push(promiseObj)
//             return;
//         }
//         var cb = state === 'fulfilled' ? promiseObj.onFulfilled : promiseObj.onRejected,
//             ret;
//         if (cb === null) {
//             cb = state === 'fulfilled' ? promiseObj.resolve : promiseObj.reject;
//             cb(value);
//             return;
//         }
//         //  在这里执行了 resolve
//         console.log('bridgePromise resolve value', value, callbacks, state)
//         try{
//             ret = cb(value);
//             //  在这里执行了 resolve
//             console.log('bridgePromise resolve ret', ret, callbacks, state)
//             // 第一个是 undefined
//             if(state === 'fulfilled') {
//                 promiseObj.resolve(ret);
//             } else {
//                 promiseObj.reject(ret);
//             }
//         } catch(err) {
//             promiseObj.reject(err);
//         }
//     }
//     try {
//         fn(resolve, reject)
//     } catch(err) {
//         reject(err)
//     }finally {
//         console.log(registerError)
//         setTimeout(() => {
//             if(!registerError) {
//                 throw new Error('unhandleRejection');
//             }
//         })
//     }
// }
// let p
// // var promise = new P(function(resolve, reject) {
// //     // 内层的 P 执行结束以后逐层退出函数栈
// //    p = new P(function(res, rej) {
// //         res(3);function P(fn) {
// //     var state = 'pending';
// //     var value = null;
// //     var callbacks = [];
// //     var registerError
// //     this.then = function(onFulfilled, onRejected) {
// //         console.log(this.getStatus(), 'call then 方法')
// //         return new P(function (res, rej) {
// //             console.log(state, 'state', 'value', value)
// //             // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
// //             // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
// //             bridgePromise({
// //                 onFulfilled: onFulfilled || null,
// //                 onRejected: onFulfilled || null,
// //                 resolve: res,
// //                 reject: rej,
// //             })
// //         })
// //     }
// //     this.catch = function(onRejected) {
// //         return new P(function (res, rej) {
// //             registerError = 0
// //             console.log(state, 'state', 'value', value)
// //             // 处理成对象的原因是防止调用第一个 promise 中的 resolve 形成 死循环，保证每一次的 resolve 都是新的。
// //             // bridgePromise 并不是在新的作用域中而是在this的作用域中this.then 的this中，每一次执行 new 之后里面执行的函数调用的 value 都是 this 的 value
// //             bridgePromise({
// //                 onFulfilled: null,
// //                 onRejected: onRejected || null,
// //                 resolve: res,
// //                 reject: rej,
// //             })
// //         })
// //     }
// //     this.getStatus = function() {
// //         return {'state': state, 'value':  value}
// //     }
// //     function resolve(val) {
// //         console.log('resolve开始', state, value, val)
// //         // 是一个 promise 值就需要桥接和打开, 这里为什么在 resolve 是 promise 的时候传递这个 resolve 函数是为了最外层的 promise 赋内层传递打开的 promise 的值，最内层的 promise value 值传递给最外层，所以保证了最外层可以把值传递下去
// //         if (val && (typeof val === 'object' || typeof val === 'function')) {
// //             var then = val.then;
// //             if (typeof then === 'function') {
// //                 // 当前的 resolve 调用栈在最外层
// //                 then.call(val, resolve);
// //                 return;
// //             }
// //         }
// //         console.log('fufilled开始', state, value, val)
// //         state = 'fulfilled';
// //         value = val;
// //         // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
// //         setTimeout(function(){
// //             callbacks.forEach(function(i) {bridgePromise(i)})
// //         }, 0)
// //     }
// //     function reject(val) {
// //         // 是一个 promise 值就需要桥接和打开
// //         if (val && (typeof val === 'object' || typeof val === 'function')) {
// //             var then = val.then;
// //             if (typeof then === 'function') {
// //                 then.call(val, reject);
// //                 return;
// //             }
// //         }
// //         state = 'rejected';
// //         value = val;
// //         // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
// //
// //         setTimeout(function(){
// //             callbacks.forEach(function(i) {bridgePromise(i)})
// //
// //         }, 0)
// //     }
// //     function bridgePromise(promiseObj) {
// //         if(state === 'pending') {
// //             callbacks.push(promiseObj)
// //             return;
// //         }
// //         var cb = state === 'fulfilled' ? promiseObj.onFulfilled : promiseObj.onRejected,
// //             ret;
// //         if (cb === null) {
// //             cb = state === 'fulfilled' ? promiseObj.resolve : promiseObj.reject;
// //             cb(value);
// //             return;
// //         }
// //         //  在这里执行了 resolve
// //         console.log('bridgePromise resolve value', value, callbacks, state)
// //         try{
// //             ret = cb(value);
// //             //  在这里执行了 resolve
// //             console.log('bridgePromise resolve ret', ret, callbacks, state)
// //             // 第一个是 undefined
// //             if(state === 'fulfilled') {
// //                 promiseObj.resolve(ret);
// //             } else {
// //                 promiseObj.reject(ret);
// //             }
// //         } catch(err) {
// //             promiseObj.reject(err);
// //         }
// //     }
// //     try {
// //         fn(resolve, reject)
// //     } catch(err) {
// //         registerError = 1
// //         reject(err)
// //     }finally {
// //         if(registerError !== undefined && registerError === 1) {
// //             throw new Error('unhandleRejection');
// //         }
// //     }
// // }
// // let p
// // // var promise = new P(function(resolve, reject) {
// // //     // 内层的 P 执行结束以后逐层退出函数栈
// // //    p = new P(function(res, rej) {
// // //         res(3);
// // //         // 执行 resolve 然后是 3 退出回到 外界的 resolve 中
// // //     });
// // //     console.log(p.getStatus())
// // //     // val.then 调用后 value 对应 p 的 3，bridgePromise 访问的是 p 的数据 fulfilled value 3 onFufilled 的是 resolve 方法所以执行的是value=3，正好把外层的 value 赋值为3。然后执行函数返回结果undefined 打开 promise， resolve是undefined，新的 promise state 是undefined，new 出来的 P state 是undefined
// // //     resolve(p)
// // // });
// // // console.log(promise.getStatus())
// // // // promise.then 执行的时候 value 就是 3 执行
// // // promise.then(function(value) {
// // //     return new P(function(res, rej) {
// // //         res(value*2);
// // //     });
// // // }).then(function(value) {
// // //     console.log(value, '3');
// // // });
// // new P(function(resolve, reject) {
// //     throw new Error("Whoops!");
// // }).catch((err) => {console.log(0);return err}).catch(err => {console.log(err);return 1}).catch(v => throw new Error("Whoops1!"))
// //         // 执行 resolve 然后是 3 退出回到 外界的 resolve 中
// //     });
// //     console.log(p.getStatus())
// //     // val.then 调用后 value 对应 p 的 3，bridgePromise 访问的是 p 的数据 fulfilled value 3 onFufilled 的是 resolve 方法所以执行的是value=3，正好把外层的 value 赋值为3。然后执行函数返回结果undefined 打开 promise， resolve是undefined，新的 promise state 是undefined，new 出来的 P state 是undefined
// //     resolve(p)
// // });
// // console.log(promise.getStatus())
// // // promise.then 执行的时候 value 就是 3 执行
// // promise.then(function(value) {
// //     return new P(function(res, rej) {
// //         res(value*2);
// //     });
// // }).then(function(value) {
// //     console.log(value, '3');
// // });
// new P(function(resolve, reject) {
//     throw new Error("Whoops!");
// }).catch((err) => {console.log(0);return err}).catch(err => {console.log(err);return 1}) = val.then;
//             if (typeof then === 'function') {
//                 // 当前的 resolve 调用栈在最外层
//                 then.call(val, resolve);
//                 return;
//             }
//         }
//         console.log('fufilled开始', state, value, val)
//         state = 'fulfilled';
//         value = val;
//         // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
//         setTimeout(function(){
//             callbacks.forEach(function(i) {bridgePromise(i)})
//         }, 0)
//     }
//     function reject(val) {
//         // 是一个 promise 值就需要桥接和打开
//         if (val && (typeof val === 'object' || typeof val === 'function')) {
//             var then = val.then;
//             if (typeof then === 'function') {
//                 then.call(val, reject);
//                 return;
//             }
//         }
//         state = 'rejected';
//         value = val;
//         // 为什么不传入 resolve 的原因是无法记住 promise 内部的 resolve，但是这里传递的话就是当前的 resolve 就会造成递归调用
//
//         setTimeout(function(){
//             callbacks.forEach(function(i) {bridgePromise(i)})
//
//         }, 0)
//     }
//     function bridgePromise(promiseObj) {
//         if(state === 'pending') {
//             callbacks.push(promiseObj)
//             return;
//         }
//         var cb = state === 'fulfilled' ? promiseObj.onFulfilled : promiseObj.onRejected,
//             ret;
//         if (cb === null) {
//             cb = state === 'fulfilled' ? promiseObj.resolve : promiseObj.reject;
//             cb(value);
//             return;
//         }
//         //  在这里执行了 resolve
//         console.log('bridgePromise resolve value', value, callbacks, state)
//         try{
//             ret = cb(value);
//             //  在这里执行了 resolve
//             console.log('bridgePromise resolve ret', ret, callbacks, state)
//             // 第一个是 undefined
//             if(state === 'fulfilled') {
//                 promiseObj.resolve(ret);
//             } else {
//                 promiseObj.reject(ret);
//             }
//         } catch(err) {
//             promiseObj.reject(err);
//         }
//     }
//     try {
//         fn(resolve, reject)
//     } catch(err) {
//         registerError = 1
//         reject(err)
//     }finally {
//         if(registerError !== undefined && registerError === 1) {
//             throw new Error('unhandleRejection');
//         }
//     }
// }
// let p
// // var promise = new P(function(resolve, reject) {
// //     // 内层的 P 执行结束以后逐层退出函数栈
// //    p = new P(function(res, rej) {
// //         res(3);
// //         // 执行 resolve 然后是 3 退出回到 外界的 resolve 中
// //     });
// //     console.log(p.getStatus())
// //     // val.then 调用后 value 对应 p 的 3，bridgePromise 访问的是 p 的数据 fulfilled value 3 onFufilled 的是 resolve 方法所以执行的是value=3，正好把外层的 value 赋值为3。然后执行函数返回结果undefined 打开 promise， resolve是undefined，新的 promise state 是undefined，new 出来的 P state 是undefined
// //     resolve(p)
// // });
// // console.log(promise.getStatus())
// // // promise.then 执行的时候 value 就是 3 执行
// // promise.then(function(value) {
// //     return new P(function(res, rej) {
// //         res(value*2);
// //     });
// // }).then(function(value) {
// //     console.log(value, '3');
// // });
//  new P(function(resolve, reject) {
//     throw new Error("Whoops!");
// }).catch((err) => {console.log(0);return err}).catch(err => {console.log(err);return 1}).catch(v => throw new Error("Whoops1!"))
//         // 执行 resolve 然后是 3 退出回到 外界的 resolve 中});
//     console.log(p.getStatus())
//     // val.then 调用后 value 对应 p 的 3，bridgePromise 访问的是 p 的数据 fulfilled value 3 onFufilled 的是 resolve 方法所以执行的是value=3，正好把外层的 value 赋值为3。然后执行函数返回结果undefined 打开 promise， resolve是undefined，新的 promise state 是undefined，new 出来的 P state 是undefined
//     resolve(p)
// });
var promise = new P(function(resolve, reject) {
// //     // 内层的 P 执行结束以后逐层退出函数栈
    p = new P(function(res, rej) {
   res(3);
// //         // 执行 resolve 然后是 3 退出回到 外界的 resolve 中
    });
    console.log(p.getStatus())
// //     // val.then 调用后 value 对应 p 的 3，bridgePromise 访问的是 p 的数据 fulfilled value 3 onFufilled 的是 resolve 方法所以执行的是value=3，正好把外层的 value 赋值为3。然后执行函数返回结果undefined 打开 promise， resolve是undefined，新的 promise state 是undefined，new 出来的 P state 是undefined
     resolve(p)
});
console.log(promise.getStatus())
// promise.then 执行的时候 value 就是 3 执行
promise.then(function(value) {
    console.log(value)
    throw new Error('123');
}).then(function(value) {
    console.log(value, '3');
}).catch(err => console.log('err'));
// new P(function(resolve, reject) {
//     throw new Error("Whoops!");
// }).catch((err) => {console.log(0);return err}).catch(err => {console.log(err);return 1})


// 总结一下在真实的 promise 中没有处理 then 中的异常，在这个里面处理了then中的异常，同样比较糟糕的是使用了全局变量处理 unhandleRejection 作为标记

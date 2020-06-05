function effectResolved(result) {
    return {
        type: 'EFFECT_RESOLVED',
        result
    }
}

function effectRejected(error) {
    return {
        type: 'EFFECT_REJECTED',
        error
    }
}
function effectTriggered() {
    return {
        type: 'EFFECT_TRIGGERED',
    }
}
function isFunc(fn) {
    return Object.prototype.toString.call(fn).toLowerCase() === '[object function]'
}
/*
* 前言 saga 主要是在 定义一个 take    : effect
  put       race
  call
  cps       fork
  join
  cancel几种类型
*
* */
   // 根据代码中给出的提示这些都是effect：put race call cps fork join cancel take 中都会返回一个 promise，但是是否是 resolved 的状态是不一定的，而流程的控制主要是通过generator+promise.then cue next 的流程，所以要求我们一定要使用 yield 关键字和 generator对函数进行定义。
    // put 相当于在 Promise.resolve().then 中执行 dispatch action 的操作，所以 put 中参数一定包含 action 中的 type，这样才能执行 dispatch，另外因为 then 是执行过的，所以直接进行接下来的 then，可以看出 put 是直接执行的， resolve状态是自己控制的，
// cps相当于在promise 中执行回调函数，回调函数结束以后执行 添加的 callback 就可以 执行，      promise 的 resolve，例如我们使用的 时候 cps(fn);然后再fn中的参数最后一个是callback执行就可以打开promise执行resolve了，
// call 执行主要是和 cps 是差不多的，主要是 call(fn) 然后通过执行 fn 的结果调用 proc 或者 Promise.resolve结果，可以看出resolve状态也是直接自身resolve状态控制在自己手上
//   fork主要是把promise.resolve一个构造出来的generator的函数并调用proc，所以这个的 resolve 状态也是自身控制的，
// race 主要是只要有一个执行了返回以后其他的就可以执行取消其他的promise，并且也设定了then ，并执行了，所以这个 promise 状态控制在自身另外取消和promise状态控制的思想在cancelErrorPromise中有所学习，
// join和cancel也是自己返回promise.resolve，promise状态控制在自己身上。
// take和这几个不一样比较特殊，take 的 promise 是外界控制的，同时返回的promise会被放到注册到 emmitter 中的cbs 中 ，只有在dispatch这个action type 对应的时候才会执行take函数这时候才被resolve，但是在resolve之后会在执行队列中删除，因此需要反复执行的话，需要使用while无限循环配合take使得在执行队列deferredInputs中含有这个对应类型的处理函数。才会让接下来的 yield 按照 next 顺序走下去，这就是最大的区别在于在被 dispatch 时候 emmiter 里面的 cbs 才会被 resolve 执行
 // proc在处理返回结果的时候会判断是否是 iratator 的处理返回一个进行处理收集在 deferredInputs 和一些里面的 effect的处理
// runEffect 中会处理所有类型的effect返回值，并返回一个 promise 这个promise在resolve时候才会执行generator的next逻辑，所以在effect返回的promise的then中打开runEffect中的promise的resolve，进行next执行
// 最后再次改写了dispatch导致在执行的时候会执行dispatch(action)，然后再 emmitter 中的 cbs 中传入 action 遍历执行回调。所以在 emitter 中的 subscribe 中注册的是执行遍历 deferredInputs 中的注册函数传入 action，所以接下来根据这些原理来实现一个简单的 redux-saga 吧
// middleware注意 saga 一定要写成 generator 哈，最重要;
// 只要 dispatch action 就会触发 take 函数逻辑
function sagaMiddleWare(sagas) {
       sagas = [].slice.call(sagas);
       let storeEmitter = new Emitter();
       let subscribe = storeEmitter.subscribe;
    // 先把 saga 处理一下，让该执行的执行毕竟只有 take 是在 dispatch 才会执行
       return function saga({ getState, dispatch }) {
           sagas.forEach(gen => {
               const iterator = gen(getState)
               process({
                   iterator,
                   dispatch,
                   subscribe,
               })
           })
           return function(next) {
               return function(action) {
                   // 一直把dispatch中的逻辑执行以后在执行 take 中的逻辑
                   let result = next(action);
                   storeEmitter.emit(action);
                   return result;
               }
           }
       }
}
// 处理 saga 执行和处理 effect 返回成 promise 形式
function process({ iterator, dispatch, subscribe, }) {
    let iteratorInput = [];
    iterator.running = true;
    const unSubscribe = subscribe(function(action){
        iteratorInput.forEach(function(takePromise){
            if(takePromise.actionType === action.type) takePromise.resolve(action)
        })
    })
    // 返回一个
    const deferredEnd = deferred()
    // 执行 generator 的next逻辑控制流程
    step();
    // 控制反转的重要函数
    function deferred(arg)  {
        let ref = {...arg};
        let p = new Promise(function(resolve, reject){
            ref.resolve = resolve;
            ref.reject = reject;
        })
        ref.promise = p;
        return ref;
    }
    function step(arg, isError) {
        if(isError)
            throw arg
        let result;
        try {
            result = iterator.next(arg);
        } catch(err) {
            throw err.message
        }
        if(!result.done) {
            // runEffect 执行的 result.value 返回的是 take put 等函数的action结果
            let effectResult = runEffect(result.value);
            effectResult.then(step, err => step(err, true))
        } else {
            iterator.running = false;
            deferredEnd.resolve(result.value);
            unSubscribe();
        }
    }
    // promise控制的反转，只有promise 被 resolve 返回的是 promise
    function runEffect(action) {
        //判断 action 类型同时补充
        const keys = Object.keys(action);
        let resultPromise;
        dispatch(effectTriggered())
        if(keys.indexOf('take')) {
            resultPromise = getTakeEffectPromise(action)
        }
        // 剩下的处理逻辑相似
        if(keys.indexOf('put')) {
            resultPromise = getPutEffectPromise(action)
        }
        if(keys.indexOf('race')) {
            resultPromise = getRaceEffectPromise(action)
        }
        // fn 对应执行的 fn
        if(keys.indexOf('call')) {
            resultPromise = getCallEffectPromise(action)
        }
        // 处理成 iretator 并返回 promise， 里面用 task 代表
        if(keys.indexOf('fork')) {
            resultPromise = getForkEffectPromise(action)
        }
        // fn 对应执行的 fn
        if(keys.indexOf('cps')) {
            resultPromise = getCpsEffectPromise(action)
        }
        // 返回的中间 promise 控制另一个反转的promise
        const midPromise = deferred();
        resultPromise.then(v => midPromise.resolve(...v), v => midPromise.resolve(...v));
        midPromise.promise.then(v=>dispatch(effectResolved(v)), err=>dispatch(effectRejected(err)))
        return midPromise;

    }
    function remove(deferredInputs, def) {
        deferredInputs.splice(deferredInputs.indexOf(def), 1)
    }
    // 注册进入 emmit中并且返回一个被外界控制的 promise
    function getTakeEffectPromise(action) {
        const def =  deferred(action);
        // 同时 resolve 被外界控制
        iteratorInput.push(def);
        const done = () => remove(iteratorInput, def)
        // take 类型判断再进行 dispatch
        def.promise.then(done, done)
        def.promise['CANCEL'] = done
        return def.promise

    }
    // 返回一个 promise resolve 的 dispatch action
    function getPutEffectPromise(action) {
       return Promise.resolve(action).then(v => dispatch(v)).catch(() => dispatch(action))
    }
    // fork 处理
    function getForkEffectPromise(action) {
        let iterators = null
        if(isFunc(action.task)) {
           if(isGenerator(action.task)) {
               iterators = action.task
           } else {
               iterators = function *g(val) {
                   yield action.task(val)
               }
           }
        } else {
            iterators = function *g(val) {
                yield action.task
            }
        }
        return Promise.resolve(process({ iterators, dispatch, subscribe, }));
    }
    // 处理 call
    function getCallEffectPromise(action) {
        return new Promise(function(resolve, reject){
            let result
            try{
                result =  action.fn && action.fn(action);
                resolve(result)
            } catch(err) {
                reject(err)
            }
        })
    }
    // 处理 cps 回调形式
    function getCpsEffectPromise() {
        return new Promise(function(resolve, reject){
            const args = [].slice.call(arguments)
            action.callback && action.callback(args.concat((val, isError)=>{
                isError ?  reject(val) :  resolve(val);
            }))
        })
    }
    // effects 作为使用的参数是一个对象里面有需要执行的 effects,里面有对应的 action设置
    function getRaceEffectPromise(action) {
        const promises = []
        const racePromiseResult = Promise.race(
            Object.keys(action.effects).map(key => {
                // runEffect 可以返回一个控制状态的 promise
                let result = runEffect(action.effects[key])
                promises.push(result);
                // 返回一个promise的then被放进去, 只有一个执行 then 结束了以后剩下的promise执行 reject 就可以了
                return result.then(
                    result => ({[key]: result}),
                    error => Promise.reject({[key]: error})
                )
            })
        );
        // 取消 Promise 的请求
        racePromiseResult.then(v=>{
            promises.forEach(p=>{
                p.reject(v)
            })
        });
        return racePromiseResult;

    }
}
function Emitter() {
    this.cbs = [];
}
Emitter.prototype.subscribe = function(fn) {
    let index = this.cbs.push(fn);
    let that = this;
    return function() {
        that.cbs.splice(index, 1);
    }
}

Emitter.prototype.emit = function(action) {
    this.cbs.forEach(item => {
        item(action)
    })
}
function isGenerator(val) {
    return 'GeneratorFunction' === (val && val.constructor ? val.constructor.name : '')
}
// take 中的参数是要包含 action type
function take(action) {
    return {
        'take': action,
        action,
    }
}
// 传递generator函数
function fork(fn) {
    return {
        'take': fn,
        task: fn,
    }
}
// 传递函数
function call(context, fn, ...args) {
    return {
        'call': {
            fn: fn.bind(context),
            args,
        },
        fn: fn.bind(context),
        args,
    }
}
// cps 传递的也是函数
function cps(context, fn, ...args) {
    return {
        'call': {
            callback: fn.bind(context),
            args,
        },
        callback: fn.bind(context),
        args,
    }
}
// put 传递的是 action type
function put(action) {
    return {
        'call': action,
        action,
    }
}
// race 传递的是 effects 对象
function race(effects) {
    return {
        'race': effects,
        effects,
    }
}
// 对 saga 的流程控制是服气的，但是就个人而言理解和学习成本相对于 thunk 是增加的，但是 action 是我们规范的 action 形式，不需要改写成 action 作为一个函数的处理，而且saga的流程控制简直就是绝了，是通过
// generator +  promise 控制流程的执行，以及 promise 的外部控制，中间promise流程控制，真正的流程控制在promise的打开中，思路是很巧妙的。action 写法规范，不会破坏 action 的写法。

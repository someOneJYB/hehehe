function asyncFn(gen) {
    return new Promise(function(resolve, reject) {
        let genFn = gen();
        function next(fn) {
            let v;
            try {
                v =fn()
            } catch(err) {
                return reject(err)
            }
            if(v.done)return resolve(v.value)
            return Promise.resolve(v.value).then((val) => {return next(()=> genFn.next(val))}).catch(err => next(() => genFn.throw(err)))
        }
        next(()=>genFn.next(undefined))
    })
}
function newFunc(Sup, ...arg) {
    let result = Sup(...arg);
    if(!result) {
        let a = {};
        Sup.call(a, arg);
        a.prototype = Object.create(Sup.prototype)
        result = a
    }
    return result;
}
function ObjectCreate(Sup, sub) {
    function F(){}
    F.prototype = Sup.prototype;
    sub.prototype = new F();
    sub.prototype.contructor = sub;
}
// sub.__proto = new F().__proto__ =  Sup.prototype 三级关系吧
// redux 直接食用无 state 版本
function createStore(reducers, enhancer) {
    if(enhancer) {
        return enhancer(createStore, reducers)
    }
    let currentReducer = reducers;
    let listeners = [];
    let currentState =  {};
    let isDispatching = false;
    function subscribe(fn) {
        if(isDispatching) {
           return throw Error('正在发送中')
        }
        let index = listeners.push(fn)
        return function() {
            listeners.splice(index-1, 1)
        }
    }
    function dispatch(action){
        isDispatching = true;
        try {
            currentState = currentReducer(currentState, action);
        } catch(err) {
            console.log('异常')
        }finally {
            isDispatching = false;
        }
        listeners.forEach(item => {
            item()
        })
        return action

    }
    function getState() {
        if(!isDispatching) return currentState;
        else {
            throw Error('在改变中')
        }
    }
    return {
        getState,
        dispatch,
        subscribe,
    }
}
function combineReducer(reducer) {
    let keys = Object.keys(reducer);
    return function(state = {}, action) {
        let changed = false;
        let nowState = {}
        keys.forEach(item=> {
            nowState[item] = reducer[item](state[item], action);
            if(nowState[item] !== state[item]) changed = true;
        })
        if(changed) {
            return nowState
        }
        return state
    }
}
function applyMiddleware(...middlewares) {
    return function(createStore, reducer) {
        let store = createStore(reducer);
        let Api =  {
            getState: store.getState,
            dispatch: function dispatch() {
                return store.dispatch.apply(null, arguments);
            }
        }
        let r = []
        middlewares.forEach(item => {
           r.push(item(Api))
        })
        const dispatch = compose(r)(store.dispatch)
        store.dispatch = dispatch;
        return store;
    }
}
// 洋葱圈模型
function compose(r) {
    return function(realDis){
        var next =  r.pop()(realDis);
        r.reverse().forEach(item => {
            next = item(next)
        })
        return next;
    }
}
// ({ getState, dispatch }) => (next) => (action)
// simpleRedux
// promise


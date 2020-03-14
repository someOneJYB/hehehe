// redux 主要的方法 createStore applyMiddleware combineReducer 方法主要是属性 dispatch、subscribe
function combineReducer(reducers) {
    const reducerKeys = Object.keys(reducers);
    let hasChanged = false;
    reducerKeys.forEach(function(item) {
        state[item] = reducers[item]() || {}
    })
    return function(state = {}, action) {
        const nextState = {};
        reducerKeys.forEach(function(item) {
            let preState = state[item];
            let nowState = reducers[item](action);
            nextState[item] = nowState;
            if(preState !== nowState) {
                hasChanged = true
            }
        })
        return hasChanged ? nextState : state;
    }
}

function createStore(reducers, enhancer) {
    if(enhancer && typeof enhancer === 'function') {
        return enhancer(createStore, reducers)
    }
    //  记录状态
    let currentState = {};
    const listener = [];
    let isPatching = false;
    function subscribe(fn) {
        listener.push(fn);
        return function unSubscribe() {
            listener.splice(0, listener.indexOf(fn));
        }
    }
    function dispatch(action) {
        isPatching = true;
        try {
            currentState = reducers(currentState, action);
            listener.forEach(function(item) {
                item(currentState)
            })
        } catch(err) {
            console.log('发生异常', err.message)
        } finally {
            isPatching = false;
        }
    }
    function getState() {
        return currentState
    }
    return {
        getState,
        dispatch,
        subscribe,
    }

}
// ({ dispatch, getState }) => next => action 三个参数
function applyMiddleware(middlewares) {
    return function setMiddle(createStore, reducers) {
        const store = createStore(reducers);
        const ApplyMiddlewareApi = {
            dispatch: () => { return store.dispatch },
            getState: store.getState,
        }
        const middlewareArr = []
        middlewares.forEach(function(item) {
            middlewareArr.push(item[ApplyMiddlewareApi])
        })
        // 改写 dispatch 可以 action 先过中间件
        const dispatch = compose(middlewareArr)(store.dispatch);
        store.dispatch = dispatch;
    }
}

function compose(fns) {
    return function(real) {
        let next = fns[fns.length - 1](real);
        fns.reverse().slice(1).forEach(item => {
            next = item(next)
        })
        return next
    }
}
// 补充中间件的写法 redux-thunk 如果 action 是函数处理函数，否则的话执行下一个中间件
const thunk = ({ dispatch, getState }) => (next) => (action) => {
    // dispatch 是被改写的 dispatch 所以在 action 里面执行 dispatch 会让洋葱圈从头执行，但是 redux 没有做循环的处理，如果在这个循环中一直调用改写的 dispatch 会导致一直重复，死循环
    if(typeof action === 'function') return action({ dispatch, getState })
    next(action)

}
// 在我们应用中还有一种 thunk 是为了解决回调的地狱
const thunkFn = (fn) => cb => {
    return fn(cb)
}
// 中间件主要是洋葱圈形式: 改写的dispatch是一个中间件开始执行的入口，只有最后一个 中间件的 next 才是真正的 dispatch。

/**
 参数说明：
 actionCreators: action create函数，可以是一个单函数，也可以是一个对象，这个对象的所有元素都是action create函数
 dispatch: store.dispatch方法
 */
// 需要保证每个函数返回的都是 action 的对象形式
function bindActionCreator(actionCreator, dispatch) {
    // 这个函数的主要作用就是返回一个函数，当我们调用返回的这个函数的时候，就会自动的dispatch对应的action
    // 这一块其实可以更改成如下这种形式更好
    // return function(...args) {return dispatch(actionCreator.apply(this, args))}
    return function() { return dispatch(actionCreator.apply(this, arguments)) }
}
export function bindActionCreators(actionCreators, dispatch) {
    // 如果actionCreators是一个函数的话，就调用bindActionCreator方法对action create函数和dispatch进行绑定
    if (typeof actionCreators === 'function') {
        return bindActionCreator(actionCreators, dispatch)
    }
    // 获取所有action create函数的名字
    const keys = Object.keys(actionCreators)
    // 保存dispatch和action create函数进行绑定之后的集合
    const boundActionCreators = {}
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const actionCreator = actionCreators[key]
        // 排除值不是函数的action create
        if (typeof actionCreator === 'function') {
            // 进行绑定
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
        }
    }
    // 返回绑定之后的对象
    /**
     boundActionCreators的基本形式就是
     {
      actionCreator: function() {dispatch(actionCreator.apply(this, arguments))}
      }
     */
    return boundActionCreators
}

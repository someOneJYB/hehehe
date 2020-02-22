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

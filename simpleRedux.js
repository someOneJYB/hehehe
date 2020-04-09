import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { connect } from 'react-redux';
let reducers = {}
let modals = {}
let classname = {}
export { Provider } from 'react-redux';
function createReducer(name, Modal, reducers, modals) {
    modals[name] = new Modal()
    classname[name] = Modal
    let state = modals[name].state || null
    reducers[name] = function(state, action ) {
        if(action.split('/')[0] === name) {
            return {...modals[name].state, ...action.data}
        }
        return {}
    }
}

function createActions(name, Modal, modals, newDispatch, realDispatch) {
    const modal__proto__ = Modal.prototype;
    // models[name] = modal
    modal__proto__.models = modals;
    const modal = modals[name];

    newDispatch[name] = {};
    const setStateMap = {};
    Object.getOwnPropertyNames(modal__proto__).forEach((actionName) => {
        if (actionName === 'constructor' || actionName === 'models') return;

        setStateMap[actionName] = function reducer(data) {
            modal.state = {...modal.state, ...data};
            return realDispatch({type: `${name}/${actionName}`, data});
        };

        const oldAction = modal__proto__[actionName].bind(modal);
        const newAction = function action(...args) {
            // setState 就是 dispatch 之后的传递的值 setState 作为公用的方法使用之后删除避免污染
            modal__proto__.setState = setStateMap[actionName];
            const result = oldAction(...args);
            // 非异步
            if (!result || typeof result.then !== 'function') {
                delete modal__proto__.setState;
                // 在这里发了 dispatch
                return result;
            }
            // 异步的动作
            return new Promise((resolve, reject) => {
                result
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                        delete modal__proto__.setState;
                    });
            });
        };
        // store.dispatch[a][add] = (action) => {
    //      this.setState({a: 12})
    // }
        // 改造的 store.dispatch 成功被解构返回的就是为什么会有 [counter][actionName]的原因, 使用的时候被改造了
        //
        newDispatch[name][actionName] = newAction;
        modal__proto__[actionName] = newAction;
    });
}

function setStore(reducerObj, middleware) {
    Object.entries(reducerObj).forEach(function([name, Modal]) {
        createReducer(name, Modal, reducers, modals)
    })
    const newCompose = __DEV__ && __COMPOSE__ ? __COMPOSE__ : compose;

    const store = createStore(combineReducers(reducers), newCompose(applyMiddleware(...middleware)));
    const realDispatch = store.dispatch;
    // 改写 store.dispatch 真正的 dispatch 已经在改装好的 action 中执行
    const newDispatch = () => {
        return
    };
    store.dispatch = newDispatch;
    // 把对象上的方法作为 action
    Object.entries(reducerObj).forEach(function([name, Modal]) {
        createActions(name, Modal, modals, newDispatch, realDispatch);
    })
}
// [storeName]
// 导出 modals 记录 对应的名字就可以使用上的方法作为 action
// 用法 这里可以发现 改造的 dispatch 成功被解构返回的就是为什么会有 [counter][actionName]的原因
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        increase: (...args) => dispatch(actions.increase(...args)),
        decrease: (...args) => dispatch(actions.decrease(...args))
    }
}

function withStore(...name) {
    return connect(name)
}
// 把 action 和 state 集中在一个 class 中，在执行过程中会把 state 和 action 传递给组件作为 props，改写 dispatch 方法。
let modals = {};
let reducers =  {}
let classname = {}
// 目前reducer的action前缀作为改变的key
function setReducers(name, Modal, reducers, modals) {
    modals[name] = new Modal();
    classname[name] = Modal
    let state = modals[name].state || null
    reducers[name] = function(state, action ) {
        if(action.split('/')[0] === name) {
            return {...modals[name].state, ...action.data}
        }
        return { ...state }
    }

}
function setStore(reducerForClassObj) {
    Object.entries(reducerForClassObj).forEach(function([name, Modal]) {
        setReducers(name, Modal, reducers, modals)
    })
    const newCompose = __DEV__ && __COMPOSE__ ? __COMPOSE__ : compose;

    const store = createStore(combineReducers(reducers), newCompose(applyMiddleware(...middleware)));
    const realDispatch = store.dispatch;
    const newDispatch = () => {
        throw new Error('不要使用 store.dispatch');
    };
    // 把对象上的方法作为 action
    Object.entries(reducerForClassObj).forEach(function([name, Modal]) {
        createActions(name, Modal, modals, newDispatch, realDispatch);
    })
}
function createActions(name, Modal, modals, newDispatch, realDispatch) {
    const modal__proto__ = Modal.prototype;
    // models[name] = modal
    modal__proto__.models = modals;
    const modal = modals[name];

    newDispatch[name] = {};
    const setStateMap = {};
    Object.getOwnPropertyNames(modal__proto__).forEach((actionName) => {
        if (actionName === 'constructor' || actionName === 'models') return null;
// 变成了对应的 reducer 方法
        setStateMap[actionName] = function reducer(data) {
            modal.state = {...modal.state, ...data};
            return realDispatch({type: `${name}/${actionName}`, data});
        };
// 原本真正的函数
        const oldAction = modal__proto__[actionName].bind(modal);
        const newAction = function action(...args) {
            // setState 就是 dispatch 之后的传递的值 setState 作为公用的方法使用之后删除避免污染
            modal__proto__.setState = setStateMap[actionName];
            const result = oldAction(...args);
            // 非异步
            if (!result || typeof result.then !== 'function') {
                delete modal__proto__.setState;
                // 在这里发了 dispatch
                return result;
            }
            // 异步的动作
            return new Promise((resolve, reject) => {
                result
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                        delete modal__proto__.setState;
                    });
            });
        };
        // store.dispatch[a][add] = (action) => {
        //      this.setState({a: 12})
        // }
        // 改造的 store.dispatch 成功被解构返回的就是为什么会有 [counter][actionName]的原因, 使用的时候被改造了
        //
        newDispatch[name][actionName] = newAction;
        modal__proto__[actionName] = newAction;
    });
}
// 需要绑定的 connect(...withStore('xx'))
const withStore = (...names) => {
    if (names.length === 0) {
        throw new Error('注入值');
    }
    return [
        (state) => {
            let mergedState = { loading: {} };
            names.forEach((name) => {
                const modelState = state[name];
                mergedState = {
                    ...mergedState,
                    ...modelState,
                    ...{ loading: { ...mergedState.loading, ...modelState.loading } },
                };
            });
            return mergedState;
        },
        (dispatch) => {
            let mergedMethods = {};
            names.forEach((name) => {
                const modelMethods = dispatch[name];
                mergedMethods = { ...mergedMethods, ...modelMethods };
            });
            // 执行的函数是一个对象
            return mergedMethods;
        },
    ];
};
// 根据 dispatch 中的执行
// 把 数据源写成 Class 的形式，里面的 state 和 改变 state 的函数
// 设置 reducer 传递 {key: 类，} 设置 reducer[key] = function(state, action){
// action 是 key 开头的 action type 则修改对象中的数据，全局modals中存储初始化好的对象，在调用 reducer 的时候就可以修改对应对象的state
// }
// 通过修改store.dispatch设置action，把对应类上除了constructor的方法都放在store.dispatch[name][函数名]
// 设置起来function(data){ 真正的store.dispatch(type：[reducer中的key]/函数名，data: data})
// store.dispatch[name][函数名]=在设置当前的实例对象的圆形方法上的 setState 就是可以调用setState=设置起来function(data){ 真正的store.dispatch(type：[reducer中的key]/函数名，data: data})这样的话执行就可以触发dispatch并且state发生变化，也修改了类中的state，这样的话在函数中执行 setState 就可以达到
// 可以在函数内部执行的时候设置 add(){ this.setState({d:899})从而修改了state也轻松的触发dispatch，为什么要改写 dispatch，不改写就会执行两次 dispatch，一次是在action执行的时候，另外就是dispatch(action)时候，会导致出现问题。

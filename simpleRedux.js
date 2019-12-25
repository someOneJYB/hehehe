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
    const newDispatch = () => {
        throw new Error('不要使用 store.dispatch');
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

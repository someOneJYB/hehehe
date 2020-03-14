const CLEARED = null
const nullListeners = { notify() {} }
function createListenerCollection() {
    // the current/next pattern is copied from redux's createStore code.
    // TODO: refactor+expose that code to be reusable here?
    let current = []
    let next = []

    return {
        clear() {
            next = CLEARED
            current = CLEARED
        },

        notify() {
            const listeners = current = next
            for (let i = 0; i < listeners.length; i++) {
                listeners[i]()
            }
        },

        get() {
            return next
        },

        subscribe(listener) {
            let isSubscribed = true
            if (next === current) next = current.slice()
            next.push(listener)
// 返回了 unsubscribe
            return function unsubscribe() {
                if (!isSubscribed || current === CLEARED) return
                isSubscribed = false

                if (next === current) next = current.slice()
                next.splice(next.indexOf(listener), 1)
            }
        }
    }
}
function Subscribtion(store, parentSub, onStateChange) {
    this.store = store;
    this.parentSub = parentSub;
    this.onStateChange = onStateChange
    this.unsubscribe = null
    this.listeners = nullListeners
}

Subscribtion.prototype.addNestedSub = function(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
}

Subscribtion.prototype.trySubscribe = function(listener) {
    if(!this.unsubscribe) {
        // 判断是否使用是 provider 注册的如果是只能作为坚听者，但我们大部分不会使用这功能
        this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.onStateChange) : this.store.subscribe(this.onStateChange)
        // 也许作为一个 parentSub 被传入所以要有自己的 listener 形式
        this.listeners = createListenerCollection()
    }
}

Subscribtion.prototype.unSubscribe = function(listener) {
    // 在 redux 和 this.listeners.subscribe 也就是 createListenerCollection 返回的都是 unsubscribe 这里主要是实现了中转处理的数据结构，使用某一个listener 或者制造自己的 subscribe 直接监听 store，无论如何在 stateChange 中就可以获取 store.state 进行 render 处理明天继续写
    this.unsubscribe()
}

Subscribtion.prototype.notifyNestedSubs = function() {
    this.listeners.notify()
}


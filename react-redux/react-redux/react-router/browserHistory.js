// 主要是使用 pushState 和 popState，监听 onpopstate 事件然后把注册的 listener 函数执行，但是 pushState 和 replaceState 无刷新改变页面 url 但是无法触发 onPopStateChange，所以需要自身调用注册的 listener
// 页面无刷新的好处页面就不会重新加载，从空白到有体验真的很不好，但是页面的 url 变化的话导致成为一个 get 请求可能需要后端设置返回对应的资源
import HashHistory from "./hashHistory";

const Sunscription = require('./historySubscription')()
const parsePath = (path) => {
    let pathname = path || '/'
    let search = ''
    let hash = ''

    const hashIndex = pathname.indexOf('#')
    if (hashIndex !== -1) {
        hash = pathname.substr(hashIndex)
        pathname = pathname.substr(0, hashIndex)
    }

    const searchIndex = pathname.indexOf('?')
    if (searchIndex !== -1) {
        search = pathname.substr(searchIndex)
        pathname = pathname.substr(0, searchIndex)
    }

    return {
        pathname,
        search: search === '?' ? '' : search,
        hash: hash === '#' ? '' : hash
    }
}
const basename = ''
export const stripPrefix = (path, prefix) =>
    path.indexOf(prefix) === 0 ? path.substr(prefix.length) : path

const getDOMLocation = (historyState) => {
    const { key, state } = (historyState || {})
    const { pathname, search, hash } = window.location

    let path = pathname + search + hash

    if (basename)
        path = stripPrefix(path, basename)

    return {
        ...parsePath(path),
        state,
        key
    }
}
const createKey = () =>
    Math.random().toString(36).substr(2, 8)

const globalHistory = window.history
function BrowserHistory(options) {
    function setState(state) {
        Object.assign(history, state);
        history.length = window.history.length
        Sunscription.notify(
            history.location,
            history.action,
        )
    }
    // 这里需要修改hash
    function push(path, state) {
        globalHistory.pushState({key: createKey, state },null, path)
        setState({
            action: 'PUSH',
            location: path
        })
    }
    // 替换 location
    function replace(path, state) {
        globalHistory.replaceState({key: createKey, state }, null, path)
        setState({
            action: 'REPLACE',
            location: path
        })
    }
    function go(num) {
        // 使用 history 的 go 触发页面url变化同时
        globalHistory.go(num)
    }
    function goBack() {
        go(-1)
    }
    function goForward() {
        go(1)
    }

    function getDOMLocation(){
        return window.location
    }
    function onPopStateChange(e) {
       if(!e.event) return
       handlePop(getDOMLocation(e.state))
    }

    function handlePop(location) {
        Sunscription.transition(location, (ok) => {
            if (ok) {
                setState({ action: 'POP', location })
            } else {
                revertPop(location)
            }
        })
    }

    function revertPop() {
        go(-1)
    }
    function listen(fn) {
        Sunscription.addListener(fn)
        addEventListener(window, 'popstate', onPopStateChange)
        return function() {
            removeEventListener(window, 'popstate', onPopStateChange)
        }
    }

    const history = {
        length: window.history.length,
        action: 'POP',
        location: window.location.href,
        push,
        replace,
        go,
        goBack,
        goForward,
        listen
    }
    return history
}
const addEventListener = (node, event, listener) =>
    node.addEventListener
        ? node.addEventListener(event, listener, false)
        : node.attachEvent('on' + event, listener)

const removeEventListener = (node, event, listener) =>
    node.removeEventListener
        ? node.removeEventListener(event, listener, false)
        : node.detachEvent('on' + event, listener)

export default BrowserHistory

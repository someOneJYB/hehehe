// 使用 onHashChange 方法使用 url 加锚点也就是 hash 的变化不会触发页面的刷新改变页面的url，不会导致页面再次执行 onload 事件，history.go 也会不会导致页面的刷新，所以页面不刷新的方式可以使用改变 hash
// 1、首先保证路径中含有 # 导出push、pop go goBack listen方法
// 2、注册 hashChange 方法，通过判断 hash 对比，所以需要在监听者里面执行 listener 然后合并对象，go 方法依赖的是 history.go 可以进行回滚，push 和 replace 改变的是 location.hash 仍然会引起 hashchange 所以也需要处理一下记录已经处理过了不需要处理，因此和 go 方法的处理方式不同
const Sunscription = require('./historySubscription')()
let ignorePath = null
const encodePath = (path) =>
    path.charAt(0) === '/' ? path : '/' + path
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

function HashHistory(options) {
    const getHashPath = () => {
        // We can't use window.location.hash here because it's not
        // consistent across browsers - Firefox will pre-decode it!
        const href = window.location.href
        const hashIndex = href.indexOf('#')
        return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
    }
    const path = getHashPath()
    if(path ===  '') {
        addHash()
    }
    function addHash() {
        replaceHashPath('/')
    }
    function replaceHashPath(path) {
        window.location.replace(
            window.location.href.slice(0) + '#' + path
        )
    }
    function setState(state) {
        Object.assign(history, state);
        history.length = window.history.length
        Sunscription.notify(
            history.location,
            history.action,
        )
    }
    // 这里需要修改hash
    function push(path) {
        window.location.hash = '#' + path;
        ignorePath = path
        setState({
            action: 'PUSH',
            location: '#'+ path
        })
    }
    // 替换 location
    function replace(path, state) {
        ignorePath = path;
        replaceHashPath(path)
        setState({
            action: 'REPLACE',
            location: '#'+ path
        })
    }
    function go(num) {
        // 使用 history 的 go 触发页面url变化同时
        window.history.go(num)
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

    function createPath(location) {
        let inx = location.indexOf('#');
        return location.slice(inx === -1 ? 0 : inx)
    }

    function hashChange() {
        const path = getHashPath()
        const encodedPath = encodePath(path)

        if (path !== encodedPath) {
            // Ensure we always have a properly-encoded hash.
            replaceHashPath(encodedPath)
        } else {
            const location = getDOMLocation()
            const prevLocation = history.location
            if(location === prevLocation) return
            if (ignorePath === createPath(location))
                return // Ignore this change; we already setState in push/replace.
            ignorePath = null
            handlePop(location, prevLocation)
        }
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
        addEventListener(window, 'hashChange', hashChange)
        return function() {
            removeEventListener(window, 'hashChange', hashChange)
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

export default HashHistory

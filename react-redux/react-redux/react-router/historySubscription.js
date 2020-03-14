// 这里就是history的中间检测者
function historySubscription() {
    const listeners = [];
    function transition(location, cb) {
        // 没啥用,主要是看url是否执行结束目前不需要这部分功能
        cb(true)
    }
    function notify() {
        listeners.forEach(item => item(arguments))
    }
    function addListener(fn) {
        let index = listeners.indexOf(fn)
        index === -1 ? listeners.push(fn) : null
        return function unListen() {
            listeners.splice(index, 0)
        }
    }
    return {
        transition,
        notify,
        addListener
    }
}
export default historySubscription

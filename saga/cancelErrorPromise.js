function runRaceEffect(cbs) {
    const promises = []
    const retP = Promise.race(
        cbs.map(cb => {
                const { promise, reject, resolve } = getPromiseResolveAndReject(cb.success, cb.fail)
                cb(resolve, reject);
                promises.push(promise);
                // 返回一个promise, 只有一个执行 then 结束了
                return promise.then(
                    result => cb.success(result),
                    error => cb.fail(error)
                )
            })
    )

    retP['CANCEL'] = error => {
        promises.forEach(p => p['CANCEL'](error))
    }

    const done = () => retP['CANCEL'](
        'cancel'
    )
    retP.then(done, done)
    return retP
}
function getPromiseResolveAndReject() {
    let def = {}
    const promise = new Promise((resolve, reject) => {
        def.resolve = resolve
        def.reject = reject
    })
    promise['CANCEL'] = err => def.reject(err)
    def.promise = promise
    return def
}
// 这种方式思路来自 saga 但是感觉用起来把 reject resolve 拿出来以后需要把回调也要放回到promise中，方式不太优雅
let p11 = (resolve, reject) => setTimeout((()=>resolve(1)), 300)
p11.sucess = (v) => console.log(v)
p11.fail = (v) => console.log(v)
let p12 = (resolve, reject) => setTimeout((()=>resolve(2)), 600)
p12.sucess = (v) => console.log(v)
p12.fail = (v) => console.log(v)
let p13 = (resolve, reject) => setTimeout((()=>resolve(3)), 900)
p13.sucess = (v) => console.log(v)
p13.fail = (v) => console.log(v)
runRaceEffect([p11, p12, p13])

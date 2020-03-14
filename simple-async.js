// async 函数返回的是一个 promise，await 会等待一个结束执行另一个,里面的 await 认为是 generator 的函数
const g = function* (x, y) {
    yield x + y;
    yield fn()
};
function fn() {
    return p
}
const gen =  () => g(1, 2)
function async(gen) {
    let start = gen();
    // 写成 cb 的好处在于省去了传递参数的问题
    return new Promise((resolve, reject) => {
        function next(fn) {
            let v
            try {
                v = fn();
                console.log(v)
                if(v.done) {
                    resolve(v.value)
                } else {
                    Promise.resolve(()=>{
                        return v.value
                    }).then(res => {
                        next(() => {
                            return start.next(res)
                        })
                    }).catch(e => {
                        next(()=> {
                            return start.throw(e)
                        })
                    })
                }
            } catch(e) {
                reject(e)
            }
            // 得到的是函数第一个 generator
        }
        next(()=>{
            return start.next(undefined)
        })
    })
}
// await 为什么可以被 try catch 执行捕获呢？主要是在编译的时候try catch 代码在reject的catch中会获得 e，所以保证了你写的 try - catch 可以获得抛出 error，否则按照 promise 的尿性不可能捕获到异常的
// https://www.zhihu.com/question/39571954
try {
    async(gen)
} catch(e) {
    console.log('o')
}


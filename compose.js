// 首先指出什么是 compose ， compose 就是使用了组合的形式按顺序调用
// in redux
// 假设 store 来自 redux
let index =  0
const store = {
    dispatch: () => {console.log('store.dispatch')}
}

const fn = (next) => (...arg) => {
    console.log('start');
    console.log(next, 'next')
    next(index++);
    console.log('next end');
    console.log('end')
}
// const fn1 = (next) => (dis) => () => {
//     dis()
// }

function compose(fns) {
    return function(real) {
        let next = fns[fns.length - 1](real);
        fns.reverse().slice(1).forEach(item => {
            next = item(next)
        })
        return next
    }
}
store.dispatch = compose([fn])(store.dispatch)
// 那么 co
// 这个问题来自于保证异步的顺序
// 1、使用 async + await
// 2、使用 co
// 3、使用 promise 保证异步的顺序
// 首先回归到 async 和 await 使用的时候，需要保证
// 实现一个 polyfill
function async(gen) {
    let genFn = gen();
    return new Promise(function(resolve, reject) {
        function step(nextFn) {
            let next = nextFn();
            if(next.done) {
                resolve(next.value);
            } else {
                Promise.resolve(next.value).then((v) => step(genFn.next(v)))
            }
        }
        step(()=>genFn.next())
    })
}
// co 再写一遍返回一个很大的 promise，generator 函数里面返回的都是
function co(genFn) {
    let gen = genFn()
    return new Promise(function(resolve, reject) {
        onFufill()
        function onFufill(res) {
            let v;
            try {
                 v = gen.next(res)
            } catch(err) {
                return reject(err)
            }
            next(v)
        }
        function onReject(e) {
            let v;
            try {
                v = gen.throw(e)
            } catch(err) {
                return reject(err)
            }
            next(v)
        }
        function next(val) {
            if(val.done) resolve(val.value);
            if(val.then) {
                val.then(v => {
                    onFufill(v)
                }).catch(e => onReject(e))
            } else {
                Promise.resolve(val).then(v => {
                    onFufill(v)
                }).catch(e => onReject(e))
            }
        }
    })
}
// promise 保证顺序的话
function getOrder(fns, isArray) {
    var result = [];
    let next = Promise.resolve(fns[0]())
    fns.forEach(fn => {
        next = next.then(v => {
            return Promise.resolve(fn(v))
        }).then(v => {
            result.push(v);
            return isArray ? result : v
        })
    })
    return next

}
// 数组去重
let arr = [1, 2, 3, 2, 1]
arr.filter((item, index) => {
    return arr.indexOf(item) === index;
})
let newArr = Object.values(new Set(arr))
// 生成随机数
function copyArray(source, array) {
    let index = -1
    const length = source.length

    array || (array = new Array(length))
    while (++index < length) {
        array[index] = source[index]
    }
    return array
}
function shuffle(array) {
    const length = array == null ? 0 : array.length
    if (!length) {
        return []
    }
    let index = -1
    const lastIndex = length - 1
    const result = copyArray(array)
    while (++index < length) {
        // 从最末尾的一个元素，之前的随机位置找到交换位置，然后继续找到之前位置再进行交换
        const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
        const value = result[rand]
        result[rand] = result[index]
        result[index] = value
    }
    return result
}
function getRadom(result) {
    const lastIndex = result.length - 1
    let index = -1
    while (++index < result.length) {
        // 从最末尾的一个元素，之前的随机位置找到交换位置，然后继续找到之前位置再进行交换
        const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
        const value = result[rand]
        result[rand] = result[index]
        result[index] = value
    }
    return result
}
function getRadomArr(arr) {
    let len = arr.length - 1;
    while(len){
        let index = Math.floor(Math.random()*(len-1));
        let t = arr[index];
        arr[index] = arr[len];
        arr[len] = t;
        len--;
    }
    return arr;
}

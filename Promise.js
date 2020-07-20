// 在 reject 的时候会触发 onReject 不加 catch 也不会执行unhandleRejection 问题，加了catch执行了then中的onReject 就不会执行catch了，但是catch是为了处理在then中的error的
class Promise {
    constructor(fn) {
        this.value = null;
        this.status = 'pending';
        this.resolveCallbacks = [];
        this.rejectCallbacks = [];
        let resolve = (val) => {
            this.value = val;
            this.status = 'fufilled';
            setTimeout(() => {
                this.resolveCallbacks.forEach(item => item(val))
            }, 0)

        }
        let reject = (val) => {
            this.value = val;
            this.status = 'reject';
            setTimeout(() => {
                this.rejectCallbacks.forEach(item => item(val))
            }, 0)
        }
        try {
            fn(resolve, reject)
        } catch(err) {
            reject(err)
        }
    }
    // promiseA+规范需要处理then是函数的普通对象为then中传递参数同时把resolve和reject传递进去
    then(onFufill = val => val, onReject = val => val) {
        // 处理thenable和then中非函数情况也会resolve但是会resolve只不过给的值是undefined
        function dealThenableFunc(then, resolve, reject) {
            then(function(val){
                resolve(val)
            }, function(err){
                reject(err)
            });
        }
        if(!onFufill instanceof Function) {
            onFufill = () => {}
        }
        if(!onReject instanceof Function) {
            onReject = () => {}
        }
        return new Promise((resolve, reject) => {
            if(this.status !== 'pending') {
                try {
                    let isFufilled = this.status !== 'reject'
                    let val = isFufilled ? onFufill(this.value) : onReject(this.value)
                    if(val instanceof Promise) {
                        val.then(resolve, reject)
                    } else {
                        // 处理then函数但是还需要
                        let then = val.then;
                        if(then instanceof Function) {
                            dealThenableFunc(then, resolve, reject)
                            return;
                        }
                        isFufilled ? resolve(val) : reject(val)
                    }
                } catch(err) {
                    reject(err)
                }
            } else {
                this.resolveCallbacks.push((val)=>{
                    try {
                        if(val instanceof Promise) {
                            val.then(resolve, reject)
                        } else {
                            if(val.then instanceof Function) {
                                dealThenableFunc(val.then, resolve, reject)
                                return;
                            }
                            resolve(val)
                        }
                    } catch(err) {
                        reject(err)
                    }
                })
                this.rejectCallbacks.push((val)=>{
                    try {
                        if(val instanceof Promise) {
                            val.then(resolve, reject)
                        } else {
                            if(val.then instanceof Function) {
                                dealThenableFunc(val.then, resolve, reject)
                                return;
                            }
                            reject(val)
                        }
                    } catch(err) {
                        reject(err)
                    }

                })
            }
        })
    }
}
Promise.resolve = function(val) {
    return new Promise((res, rej)=>{
        res(val)
    }).catch(err => err)
}
// 请记住all的实现好吗？再说一遍好不好？
Promise.all = function(pros) {
    var length = props.length;
    if(!length) return Promise.resolve(props);
    let result = [];
    let index = 0;
    return new Promise(function(resolve, reject) {
        for(let i = 0; i < props.length; i++) {
            props[i].then(val => {
                result[i] = val;
                index++;
                if(index === length) resolve(result)
            }).catch(err => reject(err))
        }
    })
}
// 限制并行请求要求数组中的元素是返回promise函数, limit 代表并行限制数目
Promise.limit = function(arr, limit) {
    let excuting = [];
    let result = [];
    let index = 0;
    excute().then(()=>Promise.all(result))
    function excute() {
        if(index === arr.length) return Promise.resolve();
        let newStart = Promise.resolve();
        let p =  Promise.resolve(arr[index++]());
        result.push(p);
        let e = p.then(val => excuting.splice(excuting.indexOf(e), 1));
        excuting.push(e);
        if(excuting.length >= limit) {
            newStart = Promise.race(excuting)
        }
        return newStart.then(() => excute())
    }
}
Promise.race = function(arr){
    if(!arr.length) throw new Error('不可以使用空数组');
    return new Promise(function(resolve, reject) {
        for(let i = 0; i < arr.length; i++) {
            arr[i].then(val => {
                resolve(val)
            }).catch(err => reject(err))
        }
    })
}

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
    then(onFufill = val => val, onReject = val => val) {
        return new Promise((resolve, reject) => {
            if(this.status !== 'pending') {
                let isFufilled = this.status !== 'reject'
                let val = isFufilled ? onFufill(this.value) : onReject(this.value)
                if(val instanceof Promise) {
                    val.then(resolve, reject)
                } else {
                    isFufilled ? resolve(val) : reject(val)
                }
            } else {
                this.resolveCallbacks.push((val)=>{
                    if(val instanceof Promise) {
                        val.then(resolve, reject)
                    } else {
                        resolve(val)
                    }
                })
                this.rejectCallbacks.push((val)=>{
                    if(val instanceof Promise) {
                        val.then(resolve, reject)
                    } else {
                        reject(val)
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
        let newStart;
        let p =  Promise.resolve(arr[index++]());
        result.push(p);
        let e = p.then(val => excuting.splice(excuting.indexOf(val), 1));
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

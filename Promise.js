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

window.postError = undefined
function MyPromise(fn) {
    let value = null;
    let callback = [];
    let status = 'pending';
    function resolve(val) {
        if(status === 'pending') {
            if(val.then && typeof val.then === 'function') {
                then.call(val, resolve);
                return;
            }
        }
        status = 'resolved';
        value = val;
        setTimeout(function(){
            callback.forEach(function(i) {bridgePromise(i);});
        }, 0);

    }
    function reject(val) {
        window.postError = 0
        if(status === 'pending') {
            if(val.then && typeof val.then === 'function') {
                catch.call(val, reject);
                return;
            }
        }
        status = 'rejected';
        value = val;
        setTimeout(function(){
            callback.forEach(function(i) {bridgePromise(i);});
        }, 0);
    }
    this.then = function(onfull) {
        return new MyPromise(function(resol, rejec){
            bridgePromise({
              resolve: resol,
              reject: rejec,
              onFufill: onfull || null,
              onReject: null,
            });
        });
    }
    this.catch = function(onReject) {
        window.postError = 1
        return new MyPromise(function(resol, rejec){
            bridgePromise({
                resolve: resol,
                reject: rejec,
                onFufill:  null,
                onReject: onReject || null,
            });
        });
    }
    function bridgePromise(obj) {
        if(status === 'pending') {
            callback.push(obj);
            return;
        }
        let cb = null;
        let ret = null;
        cb = status === 'resolved' ? obj.onFufill : obj.onReject;
        if(!cb) {
            status === 'resolved' ? obj.resolve(value) : obj.reject(value);
            return;
        }
        ret = cb(value);
        status === 'resolved' ? obj.resolve(ret) : obj.reject(ret);
    }
    try {
        fn(resolve, reject);
    } catch(err) {
        reject(err);
        setTimeout(function() {
            if(window.postError === 0) {
                window.postError = undefined
                throw new Error('unhandleRejection');
            }
            window.postError = undefined;
        })
    }
}
MyPromise.all = function(allPs) {
    return new MyPromise(function(resolve, reject) {
        let vals = []
        for(let i = 0; i < allPs.length; i++) {
            new MyPromise(function(res, rej) {
                res(allPs[i]);
            }).then(val => {
                vals.push(val);
                if(vals.length === allPs.length) {
                    resolve(vals);
                }
            });
        }
    })
}

MyPromise.race = function(allPs) {
    return new MyPromise(function(resolve, reject) {
        for(let i = 0; i < allPs.length; i++) {
            new MyPromise(function(res, rej) {
                res(allPs[i]);
            }).then(val => {
                resolve(val);
            });
        }
    })
}

MyPromise.order = function(arr) {
    let t = arr[0];
    let container = [];
    for(let i = 1; i < arr.length + 1; i++) {
        t = t.then(v => {
            container.push(v);
            if(i === arr.length) {
                return MyPromise.resolve(container);
            }
            return arr[i]
        })
    }
    return t;
}

MyPromise.resolve = function(v) {
    return new MyPromise(function(res){
        res(v);
    });
}

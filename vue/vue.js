function Vue(options) {
    if(typeof options.data !== 'function') throw Error('请使用data返回一个function')
    this.initData(options.data);
}
var uid = 0;
Vue.prototype.initData =  function(data) {
    const realData =  data();
    console.log(realData)
    this.data = realData
    observe(realData)

}
Vue.prototype.watch = function(express, cb) {
    this.watch = new Watcher(this, express, cb);
    return this.unWatch = function() {

    }
}

function observe(data) {
    if(data._ob_) return;
    new Observer(data)
}
function Observer(value) {
    this.value = value;
    this.dep = new Dep()
    value._ob_ = this;
    if(value instanceof Array) {
        // dealArr(value)
    } else {
        this.walk(value)
    }
}
Observer.prototype.walk = function(value) {
    Object.keys(value).forEach(item => {
        defineReactive$$1(value, item, value[item]);
    })
}
function  defineReactive$$1(obj, key) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
        return
    }
    let val =  obj[key]
    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
            var value = getter ? getter.call(obj) :val;
            console.log('get')
            // 4、调用 get 方法，此时的Dep.target是watcher
            if (Dep.target) {
                // 因为此时的Dep.target是watcher放到依赖中之后Dep.target置为null
                dep.depend();
            }
            return value
        },
        set: function reactiveSetter (newVal) {
            var value = getter ? getter.call(obj) : val;
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            if (getter && !setter) { return }
            if (setter) {
                setter.call(obj, newVal);
            } else {
                val = newVal;
            }
            dep.notify();
        }
    });
}

function Dep() {
    this.subs = [];
    this.id = uid++;
}
Dep.target = null;
Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },
    depend: function () {
        if (Dep.target) {
            // watcher 对应  Dep.target
            console.log(Dep.target)
            Dep.target.addDep(this);
        }
    }
};
// watcher
function Watcher(vm, exp, cb) {
    this.depIds = {};
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    // 1、此处为了触发属性的getter，从而在dep添加自己，结合Observer更易理解
    this.value = this.get();
}
Watcher.prototype = {
    update: function() {
        this.run();    // 属性值变化收到通知
    },
    run: function() {
        var value = this.get(); // 取到最新值
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal); // 执行Compile中绑定的回调，更新视图
        }
    },
    addDep: function(dep) {
        console.log(this.depIds)
        // 1. 每次调用run()的时候会触发相应属性的getter
        // getter里面会触发dep.depend()，继而触发这里的addDep
        // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
        // 则不需要将当前watcher添加到该属性的dep里
        // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
        // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
        // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
        // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
        // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
        // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
        // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
        // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
        // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
        // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    get: function() {
        // 2 初始化 Dep.target
        Dep.target = this;    // 将当前订阅者指向自己
        // 3、调用 data 值中的 get 方法
        var value = this.vm.data[this.exp];    // 触发getter，添加自己到属性订阅器中
        Dep.target = null;    // 添加完毕，重置
        return value;
    }
};

// nextTick 分别使用了 promise.then > mutation > setTimeout 实现在批量更新结束以后执行 nextTick 中的回调函数，不同的异步形式
// vuex和redux共同点：全局state保存状态---->dispatch(action)
// ------>reducer(vuex里的mutation)----> 生成newState; 整个状态为同步操作；
// 区别：最大的区别在于处理异步的不同，vuex里面多了一步commit操作，在action之后commit(mutation)之前处理异步，而redux里面则是通过中间件处理

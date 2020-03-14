function P(fn, val) {
    var value = val;
    var callbacks = [];
    this.then = function (v) {
        return new P(function (res, rej) {
            // 作用域在定义是就定了
            // 当前的作用域是 this 的，但是因为执行在 new P 里面的 value，但实际的作用域链是在 this.then 里面调用的，而不是在 new P 里被调用的，定义在 this.then 里面同时被执行，所以这里的作用域链需要注意一下会顺着this.then 的作用域链找
            console.log('status', value)
            // 误以为 getStatus 调用的是新的 value, 如果使用的是
            getStatus();
        }, v);
    }
// 这个例子告诉我们 new 里面也不是一个新的作用域，都是在 P 的作用域下定义的 getStatus，而不是一个新的作用域下调用的 getStatus，对于作用域的分析：在当前函数中调用其他函数哪怕是new里面执行的也是当前的作用域，而不是new之后的新作用域
    // 在then中调用的getStatus定义在function P 下，所以会引用 this 定义域中的变量，也就是变量在定义的时候就决定了
    // getStatus 定义在 P 的function 下面所以接触到的就是 P 下面的变量
    function getStatus() {
        console.log(value);
    }
    // 这里的 this 是特妈的 window,所以 window 执行的时候就会在作用域内寻找 value 最后找到 this.then 上的 value
    fn()
}
let f = new P(()=>console.log(1), 12);
f.then(13).then(90)
// 这个栗子告诉了我们value在调用的时候使用的是this的value，是不是和then方法的乔接例子一样
// 那么如果我只想获得我自身的 value 呢
function P1(fn, val) {
    this.value = val;
    var callbacks = [];
    this.then = function (v) {
        return new P(function (res, rej) {
            // 当前的作用域是 this 的，但是因为执行在 new P 里面的 value，但实际的作用域链是在 this.then 里面调用的，而不是在 new P 里被调用的，定义在 this.then 里面同时被执行，所以这里的作用域链需要注意一下
            console.log('status', this.value)
            // 误以为 getStatus 调用的是新的 value, 如果使用的是
            getStatus.call(this);
        }, v);
    }
// 这个例子告诉我们 new 里面也不是一个新的作用域，都是在 P 的作用域下调用的 getStatus，而不是一个新的作用域下调用的 getStatus，对于作用域的分析：在当前函数中调用其他函数哪怕是new里面执行的也是当前的作用域，而不是new之后的新作用域
    function getStatus() {
        console.log(this.value);
    }
    // 这里的 this 才是问题的关键
    fn.call(this)
}
let f1 = new P1(function(){console.log(0)}, 12);
f1.then(13).then(90)
// 这个栗子告诉了我们value在调用的时候使用的是this的value，是不是和then方法的乔接例子一样
// 函数作用域实在定义的时候就确定了
var x = 10
function fn() {
    console.log(x)
}
function show(f) {
    var x = 20
    return function(){f()}
}
show(fn)()
// 结果是 10 因为fn定义在全局作用域上所以 x 是 10，这也就证明了
var x = 10
function show(f) {
    var x = 20
    function fn() {
        console.log(x)
    }
    return function(){fn()}
}
show()()
// 20 定义在内部所以是 20 的 x
// 定义域中可以获取变量是固定的，所以和调用的位置是没有关系的，只和定义的位置有关系，定义的位置决定了可以接触到的变量
// 函数作用域的含义是指，属于这个函数的全部变量都可以在整个函数的范围内使用及复用

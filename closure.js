// example 1
function ty() {
    return function(e){
        return function(){
            e()
            // setTimeout(function(){console.log(a.a)}, 5000)
        }
    }
}
var a = {a: function(){console.log('a')}}
var w = ty()(a.a)
a.a = function(){console.log('a1')
 w()
//打印的是 'a' 感觉和下面的例子是不是很像切断了引用
// a = {a: 190}
// 闭包的意思是形参保留着引用不会被删除而已，在使用的时候会被用到。但是传递的参数也适合引用和值传递是息息相关的
function ty(a) {
    return function(){
        setTimeout(function(){console.log('4567', a.a)}, 5000)
    }
}
var a = {a: 1}
ty(a)()
a = {a: 190}
// 结果 1 因为切断了联系
// example2
    function ty(a) {
        return function(){
            setTimeout(function(){console.log('4567', a.a)}, 5000)
        }
    }
    var a = {a: 1}
    ty(a)()
    a.a = 190
 // 结果 190 因为一直保留着 a 的引用所以在执行的时候发现发生了变化
// 探究闭包主要的原因来自于模拟了 redux 发现了一个问题的疑点
// redux 中改写 dispatch 方法
const applyMiddlewareApi = {
 dispatch: () => {
     // 是可采用的是 store 上的 dispatch，保存的是 store 引用在这个函数里面
     return store.dispatch
 }
 // 如果写成 dispatch: store.dispatch 那就无法引用到了、参考上面的例子就是函数的例子，因为没有保持了对象的引用
}
// 在 compose 合成传入的就是 store.dispatch 如果也写成 () => store.dispatch 就不是真正的 store.dispatch 因为保持了对象引用所以就变成实时的
store.dispatch = compose()(store.dispatch)
// 综上请使用一个对象作为闭包内的参数引用这样可以保持对象属性变化获取最新的，当然如果你不想那就直接传递属性，再进行变化也被切断。
// 例子
    function ty() {
        return function(e){
            return function(){
                e()
                // setTimeout(function(){console.log(a.a)}, 5000)
            }
        }
    }
    var a = {a: function(){console.log('a')}}
    var w = ty()(a.a)
    // 已经切断
    a.a = function(){console.log('a1')
    w()
        // a
        // 换个例子
        function ty() {
            return function(e){
                return function(){
                    e.a()
                    // setTimeout(function(){console.log(a.a)}, 5000)
                }
            }
        }
        var a = {a: function(){console.log('a')}}
        var w = ty()(a)
        // 已经切断
        a.a = function(){console.log('a1')
            w()
            // a1
// 如果我们传入的是一个对象仅仅改变属性发挥闭包的深度引用，否则就是认为的普通常量引用一样，深度理解闭包就此结束。
// 不切断变量的地址会一直引用着，否则的话就切断了复制的地址的联系

            function foo(a) {
                console.log(a)
                var b = 2;
                function c() {}
                var d = function() {};
                function a(){}
                b = 3;

            }

            foo(1);

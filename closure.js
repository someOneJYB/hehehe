// example 1
function ty() {
    return function(a){
        setTimeout(function(){console.log(a.a)}, 5000)
    }
}
var a = {a: 1}
ty()(a)
a = {a: 190}
// 闭包的意思是形参保留着引用不会被删除而已，在使用的时候会被用到。但是传递的参数也适合引用和值传递是息息相关的
function ty(a) {
    return function(){
        setTimeout(function(){console.log('4567', a.a)}, 5000)
    }
}
var a = {a: 1}
ty(a)()
a = {a: 190}

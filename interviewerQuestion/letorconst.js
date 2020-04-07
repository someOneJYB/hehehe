// let 是块级作用域
let a = 1;
(function(){
    var a = 1
})()
console.log(a)
// const 主要是不可以改变对象的引用地址，但是可以修改对象的属性
const d = {}
function cons(name, value) {
    Object.defineProperty(d, value, {
        //  不可写
        writable: false,
        value,
    })
}


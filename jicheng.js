// 1、构造函数继承 只能通过属性继承 2、原型继承，共享原型 3、寄生组合继承
function A(a) {
    this.a = a
}
function B(a, b) {
    A.call(this, a)
    this.b = b;
}
// 2 原型继承
function A(a) {
    this.a = a
}
A.prototype.cb = function(name) {
    console.log('i am' + name)
}
function B(b) {
    this.b = b
}
B.prototype = A.prototype
// A 和 B 共享原型修改原型而且无法属性继承
// 寄生组合方式
function A() {
    this.a = a;
}
A.prototype.cb = function(name) {
    console.log('i am' + name)
}
function B(a, b) {
    A.call(this, a);
    this.b = b;
}
B.prototype = Object.create(A)
B.constructor = B
B.prototype.constructor = B
Object.prototype.create = function(Sup) {
    function F(){}
    F.prototype = new Sup();
    return new F()
}
// 原型 __proto__ 只想的是对象的 构造函数
let a = new A(1)
// a.__proto__  A.prototype
// A.prototype 但是是一个对象等同于 Object 因此 Object.__proto__ 就是 Object.prototype
// A.__proto__ 是一个函数的原型就可以得知 Function.prototype 回到循环 Function.prototype 仍旧是一个对象，因此 Object.prototype 继承的原型链会一直到 Object.prototype 称之为顶层继承链
// b.__proto__ 是 B.p遍历原型链条

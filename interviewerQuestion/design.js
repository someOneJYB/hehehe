// 单例模式
class SingleObject {
}
// 访问方法
SingleObject.getInstance = (function () {
    let instance;
    return function () {
        if (!instance) {
            instance = new SingleObject();
        }
        return instance;
    }
})()

function singleInstance(){
    let instance;
    return function() {
        {
            if (!instance) {
                instance = { a: 1 };
            }
            return instance;
        }
    }
}
let Single = (function(){
    let flag = false;
    let instance = null;
    function Sup(){
        if(flag) throw Error('外界调用问题')
    }
    function getInstance() {
        if(!instance) {
            instance = new Sup();
        }
        return instance;
    }
    return getInstance;
})();
let ins = Single();
// new ins.__proto__.constructor(); 防止在外界被 new
const all = singleInstance();
const obj11 = all();
const obj22 = all();
// SingleObject.getInstance 是一个函数所以已经形成了一个作用域，返回的是内部的函数保留着对变量 instance 的引用,等同于上面的例子，只不过一个用的是立即执行函数，一个用的是普通函数。
const obj1 = SingleObject.getInstance();
const obj2 = SingleObject.getInstance();
console.log(obj1 === obj2); // true
// 如果写成(function () {
//     let instance;
//     return function () {
//         if (!instance) {
//             instance = new SingleObject();
//         }
//         return instance;
//     }
// })()（） 没有被指向开辟的是新内存 obj1、obj2分别对应自身的内存空间，无法做到闭包
// 工厂模式
// 某个需要创建的具体对象
class Product {
    constructor (name) {
        this.name = name;
    }
    init () {}
}
// 工厂对象
class Creator {
    create (name) {
        return new Product(name);
    }
}
const creator = new Creator();
const pro = creator.create(); // 通过工厂对象创建出来的具体对象
// 发布订阅
class Subscription {
    constructor() {
        this.listener = [];
    }
    listen(fn) {
        let index = this.listener.push(fn);
        return function unlisten() {
            this.listener.splice(index, 1)
        }
    }
    notify(){
        this.listener.forEach(item => {
            item(arguments)
        })
    }
}

class Listener {
    constructor(fn, subscribe) {
        this.fn = fn
        this.subscribe = subscribe
    }
    addListener() {
        this.unlisten = this.subscribe.listen(this.fn)
    }
    removeListener() {
        this.unlisten()
    }
}
const sub = new Subscription()
const a = new Listener(() => {console.log()}, sub)
const b = new Listener(() => {}, sub)
//装饰漆模式
class Circle{
    draw(){
        console.log('换一个圆形')
    }
}

class Decorator{
    constructor(circle){
        this.circle = circle;
    }
    draw(){
        //在不影响老的功能情况下，添加新的功能，写了一个同名函数，调用时候调用传递进去的对象方法还有新的方法执行
        this.circle.draw();
        this.setRedBorder(circle)
    }
    setRedBorder(circle){
        console.log('设置红色边框')
    }
}

let circle = new Circle()
circle.draw()  //原本的画图
console.log('-----------------')
let dec = new Decorator(circle)
dec.draw()  //装饰器处理之后的画图


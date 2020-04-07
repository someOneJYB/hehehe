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
const obj1 = SingleObject.getInstance();
const obj2 = SingleObject.getInstance();
console.log(obj1 === obj2); // true
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


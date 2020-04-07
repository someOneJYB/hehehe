Function.prototype.call = function(context) {
    let result = [];
    context.fn = this;
    for(var i = 1; i < arguments.length; i++) {
        result.push('arguments[' + i + ']')
    }
    let r = eval( 'context.fn('+ result.join(',') + ')')
    delete context.fn
    return r;
}
Function.prototype.apply = function(context) {
    let result = [];
    context.fn = this;
    for(var i = 1; i < arguments.length; i++) {
        result.push('arguments[' + i + ']')
    }
    let r = eval( 'context.fn('+ result + ')')
    delete context.fn
    return r
}
Function.prototype.bind = function(context) {
    let fn = this;
    let ctx = context
    let arg = [].slice(1).call(arguments)
    function Fn() {}
    function BindFunction() {
        let all = arg.concat(arguments)
        if(this instanceof Fn) {
            return fn.call(this, all)
        }
        fn.call(ctx, all)
    }
    BindFunction.prototype = new Fn();
    return BindFunction

}
// 面试考察点 对象调用函数 < (call | apply | bind) < new 因为 bind 支持 new 会的 this 优先级比 context 更优

// 只有调用koa的app方法才会监听端口并进行
var http = require('http')
function Koa(options) {
    this.options = options;
    this.callback = [];
}
Koa.prototype.getRequestAndResponse = function(res, req) {
    let mid = compose(this.callback)
    this.context = {};
    this.context.res = res;
    this.context.req = req;
    // 最后形成这个样子
    const onerror = err =>  this.context.onerror(err);
    const handleResponse = () => this.respond(this.context);
    return mid(this.context).then(handleResponse).catch(onerror);

}
Koa.prototype.listen = function(port) {
    let server = http.server.listen(this.getRequestAndResponse);
    server.listen(port)
}
Koa.prototype.use = function(fn) {
    this.callback.push(fn)
}
function compose(arr) {
    return function(ctx, next) {
        let index = -1
        dispatch(0)
        function dispatch(i) {
            if(i < index) return Promise.reject('next 不可以调用两次');
            index = i;
            let fn = arr[i]
            if (i === arr.length) fn = next
            if (!fn) return Promise.resolve()
            else {
                try {
                    return Promise.resolve(fn(ctx, dispatch(i+1)))} catch(err) {
                    return Promise.reject(err)
                }
            }
        }
    }
}
// indexof 使用 match 方法实现
function indexOf(str, allStr) {
    return (allStr.match(new RegExp(str)) || { index: -1 }).index
}

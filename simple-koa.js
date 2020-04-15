// 只有调用koa的app方法才会监听端口并进行
var http = require('http')
funtcion Koa(options) {
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
    const handleResponse = () => this.respond(   this.context);
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
        function dispatch(i) {
            if(i < index) return throw('next 不可以调用两次');
            index = i;
            if(!arr[i]) return Promise.resolve();
            else {
                try {Promise.resolve(arr[i](ctx, dispatch(i+1)))} catch(err) {
                    Promise.reject(err)
                }
            }
        }
    }
}

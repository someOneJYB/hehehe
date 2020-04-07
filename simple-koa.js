// 只有调用koa的app方法才会监听端口并进行
var http = require('http')
funtcion Koa(options) {
    this.options = options;
}
Koa.prototype.getRequestAndResponse = function(res, req) {
    this.res = res;
    this.req = req;
}
Koa.prototype.listen = function(port) {
    let server = http.server.listen(this.getRequestAndResponse);
    server.listen(port)
}
Koa.prototype.use = function() {

}

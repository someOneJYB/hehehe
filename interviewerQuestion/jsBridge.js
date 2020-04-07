// WebViewJavascriptBridge的原理也是通过webview的stringByEvaluatingJavaScriptFromString:方法调用JavaScript代码；JavaScript调用Obj-C，则是通过web view的代理方法shouldStartLoadWithRequest：来接收JavaScript的网络请求从而实现调用。
// WebViewJavaScriptBridge 用于 WKWebView & UIWebView 中 OC 和 JS 交互。
// 它的基本原理是：
// 把 OC 的方法注册到桥梁中，让 JS 去调用。
// 把 JS 的方法注册在桥梁中，让 OC 去调用。
// 前置需要注入的是 iframe loaded 方法确保已经
// WebViewJavaScriptBridge 支持安卓和ios：wkwebview 和 UIwebview 两种


function createNativeApi() {
    let callHandler = []
    let registerHandler = []
    let api

    createWebViewJavascriptBridge()

    setupJavascriptBridge()

    function setupJavascriptBridge() {
        if (window.navigator.userAgent.indexOf('Android') > -1) {
            setupAndroidJavascriptBridge(function (bridge) {
                if (!bridge._messageHandler) {
                    bridge.init(function (message, responseCallback) {
                        let data = { 'Javascript Responds': 'Wee!' }
                        responseCallback(data)
                    })
                }
            })
        } else {
            // ios 使用的是 WebViewJavascriptBridge 框架
            setupIosJavascriptBridge(function (bridge) {
                // 客户端返回的方法中 bridge 对象
                window.WebViewJavascriptBridge = bridge
            })
        }
    }
    function invoke(apiName, params, callback) {
        if (!window.WebViewJavascriptBridge) {
            callHandler.push(arguments)
        } else {
            window.WebViewJavascriptBridge.callHandler.apply(this, arguments)
        }
    }
    function register(apiName, callback) {
        if (!window.WebViewJavascriptBridge) {
            registerHandler.push(arguments)
        } else {
            window.WebViewJavascriptBridge.registerHandler.apply(this, arguments)
        }
    }

    /**
     * 创建WebViewJavascriptBridge对象在客户端会执行放置到全局的对象上，所以处理的
     */
    function createWebViewJavascriptBridge() {
        Object.defineProperty(window, 'WebViewJavascriptBridge', {
            configurable: true,
            enumerable: true,
            set: function (bridge) {
                if (bridge.callHandler) {
                    api = bridge
                    // 都是 WebViewJavascriptBridge 框架上的方法
                    callHandler.forEach(function (args) {
                        setTimeout(function () {
                            window.WebViewJavascriptBridge.callHandler.apply(null, args)
                        }, 0)
                    })
                    registerHandler.forEach(function (args) {
                        setTimeout(function () {
                            window.WebViewJavascriptBridge.registerHandler.apply(null, args)
                        }, 0)
                    })
                    registerHandler = []
                    callHandler = []
                }
            },
            get: function () {
                return api
            },
        })
    }

    return {
        invoke,
        register,
    }
}

function setupIosJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(window.WebViewJavascriptBridge)
    }
    if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback)
    }
    window.WVJBCallbacks = [callback]
    let WVJBIframe = document.createElement('iframe')
    WVJBIframe.style.display = 'none'
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
    // 通知 iframe 已经创建 ios 初始化
    document.documentElement.appendChild(WVJBIframe)
    setTimeout(function () {
        document.documentElement.removeChild(WVJBIframe)
    }, 0)
}
function setupAndroidJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(window.WebViewJavascriptBridge)
    } else {
        // 安卓的话通过触发一个事件同时初始化了window.WebViewJavascriptBridge
        document.addEventListener('WebViewJavascriptBridgeReady', function (e, bridge) {
            callback(window.WebViewJavascriptBridge)
        }, false)
    }
}




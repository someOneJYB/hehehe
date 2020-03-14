// react-router 主要是把 history 对象作为 context 传递，然后在组件上下文中注册监听路由变化的函数达到切换不同组件的渲染 link 和 a 的不同也会在里面进行处理
// 分为两种history hashHistory 主要是依赖 onHashChange 的变化来触发路由的变化
// browserHistory 主要是通过 window.onpopstate是popstate事件在window对象上的事件处理程序.注册监听的函数
//
// 每当处于激活状态的历史记录条目发生变化时,popstate事件就会在对应window对象上触发. 如果当前处于激活状态的历史记录条目是由history.pushState()方法创建,或者由history.replaceState()方法修改过的, 则popstate事件对象的state属性包含了这个历史记录条目的state对象的一个拷贝.
//
// 调用history.pushState()或者history.replaceState()不会触发popstate事件. popstate事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮(或者在JavaScript中调用history.back()、history.forward()、history.go()方法).
// 二者的共同点都是又一个中间人注册监听者，通过响应事件后触发注册的监听者函数
// react-router 主要是在 Router 中提供全局的 history 对象，注册一段 setState 的函数检测path变化

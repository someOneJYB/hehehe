// 前置知识：使用的时候 provider 包裹着 store 初始化的 store 对象，该组件形成的是 provider 和 context 改版本的 context，value 是 store， 就可以让消费者访问到上下文的 store
// connect 是一个高阶函数把 store 中的 connect(stateToProps, dispatchtoProps, forwardRef)(component) 会把组件中继承 pureComponent，进行组件的优化，高阶组件每一次在父组件中被render会导致高阶组件重新构建的
// 首先需要一个 subscription 对象里面注册被监听的子组件作为一个中转数据管理

// 主要是 a 的阻止默认行为使用 router 的 history 中的方法改变 url 页面就不会刷新
import {Component} from "react";

export default class Link extends Component {
    // 返回context使得自组件可以获得 history 对象
    constructor(props, context) {
        super(props, context);
    }
    click = (e) => {
        e.preventDefault();
        this.context.history.push(this.props.href)
        this.props.onClick && this.props.onClick()
    }
    render() {
        return <a href={this.props.href} onClick={this.click} />
    }
}

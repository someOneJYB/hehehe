import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
// <Route path='' component='' isExcat/> 这里仅仅处理这些在旧版本代码中缓存了路径的组件这里就不处理了

function samePath(path, pathName, exact) {
    const pstr = path.split('/')
    const nowPtr = pathName.split('/')
    for(let i = 0; i < nowPtr.length && i < pstr.length; i++) {
        if(nowPtr[i] !== pstr[i]) return false
    }
    if(!exact) return true
    if(exact && pstr.length === nowPtr.length) return true
    return false;
}

export default class Route extends Component {
    // 返回context使得自组件可以获得 history 对象
    constructor(props, context) {
        super(props, context);
        this.state = {
            isMatch: this.isMatchPath(this.context.history.location.pathname),
        }
    }

    isMatchPath(pathName) {
        const { exact, path = '/' } = this.props;
        return samePath(path, pathName, exact)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            isMatch: this.isMatchPath(nextContext.history.location.pathname),
        })
    }

    getParams = (path) => {
        let params = {}
        path.slice(path.indexOf('?')+1).split('&').forEach(item => {
            let r = item.split('=')
            params[r[0]] = r[1]
        })
        return {params, pathName: path};
    }

    render() {
        const { isMatch } = this.state
        const { component } = this.props;
        const props = { match: this.getParams(), history: this.context.history, ...this.context.staticContext, location: this.context.route.location}
        return component ? isMatch ? React.cloneElement(component, props) : null : null
    }
}


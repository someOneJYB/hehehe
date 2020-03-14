import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'

export default class Router extends Component {
    // 返回context使得自组件可以获得 history 对象
    getChildContext() {
        return {
            history: this.props.history,
            staticContext: this.props.staticContext,
            route: {
                location: this.props.history.location,
                match: this.state.match
            }
        }
    }
    constructor(props, context) {
        super(props, context)
        this.state = {
            match: this.computeMatch(this.props.history.location.pathname)
        }
        this.unlisten = this.props.history.listen(() => {
            this.setState({
                match: this.computeMatch(history.location.pathname)
            })
        })
    }

    componentWillUnmount() {
        this.unlisten()
    }


    computeMatch(pathname) {
        return {
            path: '/',
            url: '/',
            params: {},
            isExact: pathname === '/'
        }
    }

    render() {
        return Children.only(this.props.children || null)
    }
}
Provider.contextType = {
    store: PropTypes.object,
    subscribtion: PropTypes.object,
}

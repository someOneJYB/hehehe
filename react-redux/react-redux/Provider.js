import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'

export default class Provider extends Component {
    // 返回context使得自组件可以获得 store
    getChildContext() {
        return { store: this.store, subscription: null }
    }
    constructor(props, context) {
        super(props, context)
        this.store = props.store;
    }

    render() {
        return Children.only(this.props.children)
    }
}
Provider.contextType = {
    store: PropTypes.object,
    subscribtion: PropTypes.object,
}

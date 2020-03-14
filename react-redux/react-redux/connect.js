import React, { Component } from 'react'
import { bindActionCreators } from '../redux'
function strictEqual(a, b) { return a === b }
function initMergePropsFactory(dispatch, options) {
    return (ownProps, stateProps, dispatchProps) => {return { ...options, dispatch, ...ownProps, ...stateProps, ...dispatchProps }}
}

function selectorFactoryCreator(dispatch, {
    initMapStateToProps,
    initMapDispatchToProps,
    initMergeProps,
    ...options
}) {
    //   initMapStateToProps,
    //   initMapDispatchToProps, 都没有处理
    const mapStateToProps = (state, ownProps) => initMapStateToProps(state, ownProps)
    const mapDispatchToProps = (dispatch, ownProps) => { return bindActionCreators(initMapDispatchToProps, dispatch, ownProps)}
    const mergeProps = initMergePropsFactory(dispatch, options)


    const selectorFactory = options.pure
        ? pureFinalPropsSelectorFactory
        : impureFinalPropsSelectorFactory

    return selectorFactory(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        dispatch,
        options
    )
}
export function impureFinalPropsSelectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch
) {
    return function impureFinalPropsSelector(state, ownProps) {
        return mergeProps(
            mapStateToProps(state, ownProps),
            mapDispatchToProps(dispatch, ownProps),
            ownProps
        )
    }
}

export function pureFinalPropsSelectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
    areStatesEqual, areOwnPropsEqual, areStatePropsEqual
) {
    let hasRunAtLeastOnce = false
    let state
    let ownProps
    let stateProps
    let dispatchProps
    let mergedProps

    function handleFirstCall(firstState, firstOwnProps) {
        state = firstState
        ownProps = firstOwnProps
        stateProps = mapStateToProps(state, ownProps)
        dispatchProps = mapDispatchToProps(dispatch, ownProps)
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        hasRunAtLeastOnce = true
        return mergedProps
    }

    function handleNewPropsAndNewState() {
        stateProps = mapStateToProps(state, ownProps)

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(dispatch, ownProps)

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        return mergedProps
    }

    function handleNewProps() {
        if (mapStateToProps.dependsOnOwnProps)
            stateProps = mapStateToProps(state, ownProps)

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(dispatch, ownProps)

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        return mergedProps
    }

    function handleNewState() {
        const nextStateProps = mapStateToProps(state, ownProps)
        const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps)
        stateProps = nextStateProps

        if (statePropsChanged)
            mergedProps = mergeProps(stateProps, dispatchProps, ownProps)

        return mergedProps
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
        const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps)
        const stateChanged = !areStatesEqual(nextState, state)
        state = nextState
        ownProps = nextOwnProps

        if (propsChanged && stateChanged) return handleNewPropsAndNewState()
        if (propsChanged) return handleNewProps()
        if (stateChanged) return handleNewState()
        return mergedProps
    }

    return function pureFinalPropsSelector(nextState, nextOwnProps) {
        return hasRunAtLeastOnce
            ? handleSubsequentCalls(nextState, nextOwnProps)
            : handleFirstCall(nextState, nextOwnProps)
    }
}

function makeSelectorStateful(sourceSelector, store) {
    // wrap the selector in an object that tracks its results between runs.
    const selector = {
        run: function runComponentSelector(props) {
            try {
                const nextProps = sourceSelector(store.getState(), props)
                if (nextProps !== selector.props || selector.error) {
                    selector.shouldComponentUpdate = true
                    selector.props = nextProps
                    selector.error = null
                } else {
                    selector.shouldComponentUpdate = false
                }
            } catch (error) {
                selector.shouldComponentUpdate = true
                selector.error = error
            }
        }
    }

    return selector
}
function shallowEqual(a, b) {
   // undefined NaN object 下面比
    if(!a && !b && typeof a === 'number' && typeof b === 'number') {
        if(a === b) return 1/a === 1/b
        return true
    }
    if(a && b && typeof a === 'object' && typeof b === 'object') {
        let keysA = Object.keys(a);
        let keysB = Object.keys(b);
        if(keysA.length !== keysB.length) return false
        for(let i = 0; i < keysA.length; i++) {
            if(a[keysA[i]] !== b[keysA[i]]) return false
        }
        return true;
    }
    return a === b
}
// 外界的 props 变化的时候，就会被重建，被包裹的组件还应该继承 pureComponent 比较好一些，然后把需要的store 中的 state 或者 props 直接怼过去 也可以节约一部分性能，但是如果有 dispatch 函数真的是无能为力了，因为怎么对比函数都不可能一样，就比较伤，只要 redux 变化被包裹的组件就一定会出发 willreceiveProps 吗？不会的如果没有写 mapStateProps 是不会的，只是默认使用 store 的 dispatch 同时还让子组件继承 pureComponent 进行性能的优化
function connect(
       mapStateToProps = null,
       mapDispatchToProps = null,
       mergeProps,
       displayName = 'ComponentKey',
       {
            pure = true,
            areStatesEqual = strictEqual,
            areOwnPropsEqual = shallowEqual,
            areStatePropsEqual = shallowEqual,
            areMergedPropsEqual = shallowEqual,
            ...extraOptions
        } = {}
) {
    const isChangeWhenStateChange = !!mapStateToProps;
    const  wrapperComponent = function(WrappedComponents)  {
        // 因为返回了新的组件在 render 之后，所以就会导致 ReduxR 被重建，返回了一个新的 class 因为，所以我们在 redux 中被包裹的组件 render 不必考虑属性变化，直接重建，被包裹的内部组件变化是因为 redux store 变化所以 rerender 不会重建，只有包裹组件被 render 其他的一起被卸载
        return class ReduxR extends Component {
            static displayName = `withRef(${displayName || 'Component'})`;
            constructor(props, context) {
                super(props, context);
                this.store = this.props.store ? this.props.store : context.store
                this.state = {}
                this.renderCount = 0
                this.propsMode = Boolean(props.store)
                this.setWrappedInstance = this.setWrappedInstance.bind(this)

                console.error(this.store,
                    `Could not find "store" in either the context or props of ` +
                    `"${displayName}". Either wrap the root component in a <Provider>, ` +
                    `or explicitly pass "store" as a prop to "${displayName}".`
                )

                this.initSelector()
                this.initSubscription()
            }
            initSelector() {
                // 这个步骤是初始化 stateMapToProps 和 dispatchToprops
                const sourceSelector = selectorFactoryCreator(this.store.dispatch, {
                        mapStateToProps,
                        mapDispatchToProps,
                        mergeProps,
                        displayName,
                        pure,
                        areStatesEqual,
                        areOwnPropsEqual,
                        areStatePropsEqual,
                        areMergedPropsEqual,
                        ...extraOptions
                    ,})
                this.selector = makeSelectorStateful(sourceSelector, this.store)
                // 获得所有的props合并外界传递和map函数等
                this.selector.run(this.props)
            }
//
            // 只要被重新 render 就会被卸载我写这个干啥多余，外界的 props 变化导致 render 就卸载重新挂载了 只监听store变化就完事了
            // componentWillReceiveProps(nextProps) {
            //     this.selector.run(nextProps)
            // }
            // 只要被重新 render 就会被卸载我写这个干啥多余 只监听store变化就完事了
            shouldcomponentUpdate() {
                return this.selector.shouldComponentUpdate
            }

            initSubscription() {
                // 因为没有传递 stateMapToProps 所以不需要执行监听系列的举动
                if (!isChangeWhenStateChange) return
                const parentSub = this.propsMode ? this.props.subscribtion : this.context.subscribtion
                this.subscribtion = new Subscribtion(this.store, parentSub, this.onStateChange)
                // 注册如果子组件需要进行listener的需要进行处理
                this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription)
            }

            getWrappedInstance = () => {
                return this.setWrappedInstance
            }

            onStateChange = () => {
                this.selector.run(this.props);
                if (this.selector.shouldComponentUpdate) {
                    this.forceUpdate()
                }
                this.notifyNestedSubs()
            }

            setWrappedInstance = (el) => {
                this.setWrappedInstance = el;
            }

            render() {
                // redux 得知变化会引起包裹组件的 props 发生变化，所以最好让被包裹组件继承 pureComponent 或者对比一下传递的 props
                const props = {...this.selector.props};
                if (extraOptions.hasRef) props.ref = this.setWrappedInstance
                return ( <WrappedComponents {...props} />)
            }
        }
    }
    return wrapperComponent
}
// 结构如下：connet包裹组件注册在 subscription 中 store 发生变化进行组件的 rerender，高阶组件在外界被 render 会导致

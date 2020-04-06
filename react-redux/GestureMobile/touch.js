import React, { Component } from 'react';
/*
* 参考来自：腾讯手势库：支持监听 onPinch onRotate onTap onDoubleTap onSingleTap onLongTap onTouchStart（初次的手指 x y 坐标） onTouchMove（主要是多指的放大和缩小） onTouchEnd（主要是处理tap事件和swipe事件） onTouchCancel；onSwipeLeft，onSwipeRight，onSwipeUp，onSwipeDown
* 确定手势库的重点包含放大倍数：在start和move中的斜边比例，设置 scale e.center = {
                    x: (e.touches[1].pageX + e.touches[0].pageX) / 2,
                    y: (e.touches[1].pageY + e.touches[0].pageY) / 2
                };；设置 angle rotate 的角度使用的是内积，判断 cos 进行方向上的设置
                *swipe 方向比较 start e.touches[0] end 中的e.touches[0] x 和 y 进行比较判断二者的绝对值某一个必须大于80，同时时间间隔不超过250ms
* */
class TouchComp extends Component {
    constructor(props) {
        super(props);
        this.preV = { x: null, y: null };
        this.pinchStartLen = null;
        this.isSingleTap = false;
        this.isDoubleTap = false;
        this.delta = null;
        this.lastTime = null;
        this.now = null;
        this.end = null;
        this.multiTouch = false;
        this.tapTimeout = null;
        this.longTapTimeout = null;
        this.singleTapTimeout = null;
        this.swipeTimeout=null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition={x: null, y: null};
        this.afterLongTap = false;
        this.afterLongTapTimeout = null;
    }

    emitEvent(eventName, event) {
        this.props[eventName] && this.props[eventName](event)
    }

    thirdLen = (v) => {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
/*
* 主要目的是确定手指个数并且 this.preTapPosition 代表的是上一次点击的位置，并且去定是否是双击，得到第一次的pinch斜边长度，注册一个延迟执行的长按，但是在规定时间内无执行才会触发，否则删除
* */
    handleTouchStart = (e) => {
        this.emitEvent('onTouchStart', e);
        if(!e.touches) return;
        this.now = new Date();
        let t = e.touches
        this.x1 = t[0].pageX;
        this.y1 = t[0].pageY;
        this.delta = this.now - (this.lastTime || this.now)
        if(this.preTapPosition.x) {
            if(this.delta < 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - y1) < 30) {
                this.isDoubleTap = true
            }
        }
        this.preTapPosition.x = this.x1;
        this.preTapPosition.y = this.y1;
        this.last = this.now;
        if(t.length > 1) {
            let curretX = t[1].pageX;
            let currentY = t[1].pageY;
            this.preV = {
                x: curretX - this.x1, y: currentY - this.y1
            }
            this.pinchStartLen = this.thirdLen(this.preV);
        } else {
            this.isSingleTap = true;
        }
        setTimeout(() => {
            this.emitEvent('onLongTap', e);
            this.afterLongTap = true;
            this.afterLongTapTimeout = setTimeout(() => {
                this.afterLongTap = false;
            }, 1000);
        }, 750)
    }
    /*
    * 多手指操作为放大旋转操作，获取到当前的位置差，得到的斜边进行第一次的比较，判断放大比例，初始化this.x2、this.y2 用于在 end 的时候进行单击和滑动方向的判断
    *
    * */

    handleTouchMove = (e) => {
        // 在这里判断进行的是放大旋转还是简单的单击滑动
        let cx = e.touches[0].pageX;
        let cy = e.touches[0].pageY;
        this.afterLongTap = false;
        clearTimeout(this.afterLongTap)
        // 多手指
        if(e.touches.length > 1) {
            // 获取到第一次的斜边对比后可以获得放大缩小的值
            let v = {x: e.touches[1].pageX - cx, y: e.touches[1].pageY - cy,}
            if(this.pinchStartLen) {
                let scaleValue = this.thirdLen(v) / this.pinchStartLen;
                e.scale = scaleValue;
                e.center = {
                    x: (e.touches[1].pageX + cx) / 2,
                    y: (e.touches[1].pageY + cy) / 2
                };
                this.emitEvent('onPinch', e)
            }
            // 内积获得 cos 和第一次的斜边进行比较
            e.angle = this.getRotateAngle(v, this.preV);
            this.emitEvent('onRotate', e);
            this.preV.x = v.x;
            this.preV.y = v.y;
            // 这个是多指
            this.multiTouch = true;
        }
        this.x2 = cx;
        this.y2 = cy;
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }
// 获取到角度使用内积
    getAngle(v1, v2) {
        var mr = this.thirdLen(v1) * this.thirdLen(v2);
        if (mr === 0) return 0;
        var r = v1.x * v2.x + v1.y * v2.y / mr;
        if (r > 1) r = 1;
        return Math.acos(r);
    }

    getRotateAngle(v1, v2) {
        var angle = this.getAngle(v1, v2);
        // 余弦计算
        if (v1.x * v2.y - v2.x * v1.y > 0) {
            angle *= -1;
        }

        return angle * 180 / Math.PI;
    }
/*
* cancel中取消定时器，触发cancel事件
* */

    handleTouchCancel = (e) => {
        this.emitEvent('onTouchCancel', e);
        clearTimeout(this.singleTapTimeout);
        clearTimeout(this.tapTimeout);
        clearTimeout(this.longTapTimeout);
        clearTimeout(this.swipeTimeout);
    }

    swipeDirection (x1, x2, y1, y2) {
        if (Math.abs(x1 - x2) > 80 || this.end-this.now < 250) {
            return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
        } else {
            return 'Nochange';
        }

    }

    setAction = (e) => {
        const { x1, x2, y1, y2 } = this
        if(Math.abs(this.x2 - this.x2) > 30 && Math.abs(this.y1 - this.y2) > 30) {
            e.direction = this.swipeDirection(x1, x2, y1, y2);
            e.distance = Math.abs(this.x1 - this.x2);
            this.swipeTimeout = setTimeout(() => {
                this._emitEvent('onSwipe', e);
            }, 0);
        } else {
            // tap 事件
            if (this.afterLongTap) {
                clearTimeout(this.afterLongTapTimeout);
                this.afterLongTap = false;
            } else {
                this.tapTimeout = setTimeout(() => {
                    this.emitEvent('onTap', e);
                    if (this.isDoubleTap) {
                        this.emitEvent('onDoubleTap', e);
                        clearTimeout(this.singleTapTimeout);
                        this.isDoubleTap = false;
                    } else if (this.isSingleTap) {
                        this.singleTapTimeout = setTimeout(()=>{
                            this.emitEvent('onSingleTap', e);
                        }, 250);
                        this.isSingleTap = false;
                    }
                }, 0);
            }
        }
    }
/*
* 获取是否是多指操作：
* 1、单指操作：进行 this.x1 x2 y1 y2 的差值判断超过 30 表示滑动否则进去tap的处理，
* 滑动的比较二者差值超过80同时差值大的x为左右y为上下， y2 > y1 下 x1 < x2 向右
* 2、不超过30如果是longTouch 为true则清除掉重置，否则判断是否是双击事件在 start 中判断过，是的话执行，否则为单击事件，都是延迟执行
* */
    handleTouchEnd = (e) => {
        if(!this.multiTouch) {
            this.end = Date.now();
            this.setAction(e)
        }
        this.preV.x = 0;
        this.preV.y = 0;
        this.pinchStartLen = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.multiTouch = false;
    }

    render() {
        return React.cloneElement(React.Children.only(this.props.children), {
            onTouchStart: this.handleTouchStart,
            onTouchMove: this.handleTouchMove,
            onTouchCancel: this.handleTouchCancel,
            onTouchEnd: this.handleTouchEnd
        });
    }
}

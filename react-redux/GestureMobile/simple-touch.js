window.touch = (function(){
    let longtapTimeout = null;
    let longTap = false;
    let isSingleTap = false;
    return {
        install: function(dom) {
            dom.addEventListener('touchStart', function(e) {
                isSingleTap = false;
                if(!e.touches) return;
                if(e.touches.length === 1) {
                    longTap = false;
                    isSingleTap = true;
                    longtapTimeout = setTimeout(function() {
                        longTap = true;
                        dom.dispatchEvent(new CustomEvent('longTapping', {
                            cancelable: true
                        }));
                    }, 750);
                }

            })
            dom.addEventListener('touchMove', function(e) {
                longtapTimeout && clearTimeout(longtapTimeout);
            })
            dom.addEventListener('touchEnd', function(e) {
                if(longTap) {
                    longtapTimeout && clearTimeout(longtapTimeout);
                    longTap = false;
                    dom.dispatchEvent(new CustomEvent('longTapEnd', {
                        cancelable: true
                    }));
                } else {
                    setTimeout(function() {
                        if(isSingleTap) {
                            setTimeout(function() {
                                dom.dispatchEvent(new CustomEvent('tap', {
                                    cancelable: true
                                }));
                            }, 250);
                            isSingleTap = false;
                        }
                    }, 0)
                }
            })
        }
    }
})();
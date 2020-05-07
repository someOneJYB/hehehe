function debounce(fn, timeout) {
    let timer = null;
    return function() {
        let ctx = this;
        clearTimeout(timer)
        timer = setTimeout(function(){
            fn.call(ctx, arguments)
        }, timeout)
    }
}
function throttle(fn, wait) {
    let callback = fn;
    let timerId = null;

    // 是否是第一次执行
    let firstInvoke = true;

    function throttled() {
        let context = this;
        let args = arguments;

        // 如果是第一次触发，直接执行
        if (firstInvoke) {
            callback.apply(context, args);
            firstInvoke = false;
            return ;
        }

        // 如果定时器已存在，直接返回。
        if (timerId) {
            return ;
        }

        timerId = setTimeout(function() {
            // 注意这里 将 clearTimeout 放到 内部来执行了
            clearTimeout(timerId);
            timerId = null;

            callback.apply(context, args);
        }, wait);
    }

    // 返回一个闭包
    return throttled;
}

function flattenArr(arr, result) {
  result = result || [];
  arr.forEach(item => {
      if(item instanceof Array) {
          let g = flattenArr(item, result);
          result.concat(g)
      } else {
          result.push(item)
      }
  })
  return result
}

function throttle(fn, wait, timemout, first){
    let timer = null;
    return function() {
        if(first) {
            fn.apply(this, arguments)
            first= false;
            return;
        }
        if(timer)return
        let ctx=this;
        timer=setTimeout(function(){
            fn.apply(ctx, arguments);
            clearTimeout(timer);
            timer = null
        }, timeout)
    }
}
function debounce(fn, timeout) {
    let timer = null;
    return function() {
        clearTimeout(timer);
        let ctx =   this;
        timer = setTimeout(()=>{
            fn.apply(ctx, arguments)
        }, timeout)
    }
}

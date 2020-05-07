function defObj(obj, key){
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set: function reactiveSetter (newVal) {
            const value = obj.get()
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            console.log('diff')
            // #7981: for accessor properties without setter
            // if (getter && !setter) return
            // if (setter) {
            //     setter.call(obj, newVal)
            // } else {
            //     val = newVal
            // }
            // childOb = !shallow && observe(newVal)
            // dep.notify()
        }
    })
}
// 输入：
// [[1, 10), [10, 15), [15, 16), [20, 24)]
// 返回：
// [[1, 16), [20, 24)]


function getOrderArr(arr) {
    let min = 0;
    let max = 0;
    let start = arr.slice(1)
    const w = arr[0].split(',');
    min = +w[0].slice(1);
    max = +w[1].slice(0, -1);
    let result = []
    start.forEach(item => {
       let r = item.split(',');
        let r1 = +r[0].slice(1);
        let r2 = +r[1].slice(0, -1);
        console.log(r1, r2)
        if(min <= r1 && r1 <= max && max < r2) {
            max = r2
        } else {
            if(r1 > max) {
                result.push(`[${min}, ${max})`)
                min = r1;
                max = r2
            }
        }
    })
    result.push(`[${min}, ${max})`)
    return result
}
// 如果是 [ 则要判断是否在之中或者，如果是)则判断是否成为新的区间
let h = ['[1, 10)', '[5, 15）', '[15, 16)', '[20, 24)']
// 实现平方根  x = (x + n / x) / 2。
function sqrtNewton(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return n
    var val = n,
        last;
    do {
        console.log(val, last)
        last = val;
        val = (val + n / val) / 2;
    }
        // 2018-04-25 22:08 更新
        // 使用Number.EPSILON表示能够接受的最小误差范围
    while (Math.abs(val - last) >= Number.EPSILON)
    return val
}

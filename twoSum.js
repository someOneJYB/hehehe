// method one
const twoSum = function(nums, target) {
    const comp = {};
    for(let i=0; i<nums.length; i++){
        if(comp[nums[i] ]>=0){
            return [ comp[nums[i] ] , i]
        }
        // 记录
        comp[target-nums[i]] = i
    }
};
// method two
function find7(arr, target) {
    for(var i = 0; i < arr.length; i++) {
        var v = erFen(arr, target - arr[i]);
        if(v) { return [arr[i], arr[v]]; }
        else { continue; }
    }
    return 'not find'
}
function erFen(arr, target) {
    var mid = arr[arr.length / 2];
    var index = arr.length / 2;
    var flag = null
    while (index < arr.length && index > -1) {
        console.log(index)
        if (target > mid) {
            index++;
        }
        if (target === arr[index]) {
            flag = index
            break;
        }
        if (target < mid) { index--;}
    }
    return flag
}
find7([1, 2, 3, 5], 5)
var arr = [1, 4, 5, 6, 12, 43, 111];
function search(arr, low, high, num) {
    var mid = Math.floor((low + high) / 2);
    if (low > high) {
        return -1;
    }
    if(arr[mid] === num) {
        return mid;
    }
    if(arr[mid] > num) {
        high = mid - 1;
        return search(arr, low, high, num);
    }
    if(arr[mid] < num) {
        low = mid + 1;
        return search(arr, low, high, num);
    }
}
 // method 3Sum 求和
function threeSum(arr, target, index) {
    if(arr.length < 3) return []
    const result = []
    for(var i = 0; i < target; i++) {
        if(i === index) continue
        let index = arr.indexOf(arr[i])
        let res = twoSum(arr, target - arr[i], index)
        if(res) {
            return [i, ...res]
        }
    }
}
function twoSum(nums, target, index) {
    const comp = {};
    var result = []
    for(let i=0; i<nums.length; i++){
        if(i === index) continue
        if(comp[nums[i] ]>=0){
            result.push([ comp[nums[i] ] , i])
        }
        // 记录
        comp[target-nums[i]] = i
    }
    return result;
}
twoSum([1,4,2], 5)

//现在有10个并发的请求, 希望实现一个队列, 来实现对于并发数量的控制。 第一个参数是并发数，第二个是超时时间，超时时间内不返回，则取消请求并补齐并发数量的请求
function race(arr, limit, timeout){
    let result = []
    let r = arr.slice()
    let g = []
    let index = 0
    while(r.length) {
        g[index]=[]
        for(let i = 0; i < limit && r.length;i++){
            g[index].push(r.shift())
        }
        index++
    }

    function reSend(arr, index) {
        return new Promise(function(resolve,reject){
            setTimeout(()=>{console.log('timeout');reject()}, timeout);
            for(let i = index; i < arr.length+index;i++){
                Promise.resolve(arr[i]()).then(res=>{
                    result[i]=res
                    if(result.length===arr.length){
                        resolve(result)
                    }
                }).catch(err=>{
                    result[i]=res
                })
            }
        }).catch(err => reSend(arr,index))
    }
    let b = []
    let s = Promise.resolve(reSend(g[0],0))
    for(let h = 1; h < g.length;h++){
       s= s.then(res=>reSend(g[h],h))
    }
   return s
}
// 并行的 promise 逻辑
function asyncPool(poolLimit, array, timeOut) {
    let i = 0;
    const ret = [];
    const executing = [];
    const enqueue = function() {
        if (i === array.length) {
            return Promise.resolve();
        }
        const item = array[i++];
        // 在 axios 中执行 cancal 会执行 reject，因此可以在 catch 中继续执行重试 onTimeout 也执行的是reject，所以不要依赖库做其他的
        const p = Promise.resolve().then(() => item(), () => item()).catch(() => item());
        ret.push(p);
        // 已经执行结束存储结果集
        const e = p.then(() => {console.log('执行');executing.splice(executing.indexOf(e), 1)});
        executing.push(e);
        let r = Promise.resolve();
        // 执行的executing仅仅保证有两个
        if (executing.length >= poolLimit) {
            console.log('在执行中的请求大于并发数，需要放掉一个才可以保证再进行发送，无缝衔接',executing)
            r = Promise.race(executing);
        }
        return r.then(() => enqueue());
    };
    return enqueue().then(() => Promise.all(ret));
}
function fetch1(idx) {
    return new Promise(resolve => {
        console.log(`start request ${idx}`);
        setTimeout(() => {
            console.log(`end request ${idx}`);
            resolve(idx)
        }, idx*1000)
    })
};
var f =  [()=>fetch1(1),()=>fetch1(2),()=>fetch1(3),()=>fetch1(4),()=>fetch1(5),()=>fetch1(6)]
await asyncPool(2, f, 1000);

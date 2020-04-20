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
    for(let i=0; i<nums.length; i++){
        if(i === index) continue
        if(comp[nums[i] ]>=0){
            return [ comp[nums[i] ] , i]
        }
        // 记录
        comp[target-nums[i]] = i
    }
    return null;
}
threeSum([1, 2, 3, 3, 4, 5], 11)


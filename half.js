function search(arr, target) {
    let temp = arr
    while(temp.length !== 1) {
        let midIndex = temp.length>>1;
        let mid = temp[midIndex];
        if(target > mid) {
            temp = arr.slice(midIndex+1)
        } else {
            if(target === mid) return midIndex;
            temp = arr.slice(0, midIndex-1)
        }
    }
    return '无'
}

function LinkNode(val, next) {
    this.val = val || null;
    this.next = next || null;
}

LinkNode.prototype.getNode = function(val, head) {
    let start = head
    while(start) {
        if(start.val === val) {
            return start;
        }
        start = start.next;
    }
}

LinkNode.prototype.isCircle = function(head) {
    let one = head.next;
    let second = one.next;
    while(second) {
        if(second === one) {
            return true
        }
        one = second;
        second = second.next;
    }
}

LinkNode.prototype.getMax = function(head) {
    let tem = head;
    let next = head.next
    while(next) {
        if(next.val > tem.val) {
            tem = next
        }
        next = next.next
    }
    return next
}

LinkNode.prototype.delete = function(node, head) {
    let tem = head;
    let next = head.next
    while(next) {
        if(node === next) {
            tem.next = next.next;
            return;
        }
        tem = next
        next = next.next

    }
    return next
}

LinkNode.prototype.reverse = function(head) {
    if (head == null || head.next == null)
    return head;
    let prev = head;
    let cur = head.next;
    let temp = head.next.next;

    while (cur){
        temp = cur.next; //temp作为中间节点，记录当前结点的下一个节点的位置
        cur.next = prev;  //当前结点指向前一个节点
        prev = cur;     //指针后移
        cur = temp;  //指针后移，处理下一个节点
    }

    head.next = null; //while结束后，将翻转后的最后一个节点（即翻转前的第一个结点head）的链域置为NULL
    return prev;
}

function bubleSort(arr) {
    let flag = false;
    for(let i = 0; i < arr.length; i++) {
        for(let j = i + 1; j < arr.length - i + 1; j++) {
            if(arr[i] > arr[j]) {
                flag = true;
                let t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            }
            if(!flag) {
                return
            }
        }
    }
}

function quickSrot(arr) {
    // quickSort 主要是对比哨兵
    if(arr.length <= 1) return arr
    let mid = arr.length / 2;
    let midInArr = arr[mid];
    arr.splice(mid, 1);
    let left = [];
    let right = [];
    for(let i = 0;  i < arr.length; i++) {
        if(arr[i] < midInArr) {
            left.push(left[i])
        } else {
            right.push(arr[i])
        }
    }
    return quickSrot(left).concat(midInArr, quickSrot(right))

}
function merge(left, right) {
    var result = [];
    while(left.length > 0 && right.length > 0) {
        if(left[0] < right[0]) {
            result.push(left.shift())
        }else {
            result.push(right.shift())
        }
    }
    return result.concat(left).concat(right)
}
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    let mid = arr.length / 2;
    let left = arr.slice(0, mid);
    let right = arr.slice(mid);
    return merge(mergeSort(left), mergeSort(right))
}

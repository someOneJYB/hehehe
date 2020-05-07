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
class TreeNode {
    constructor(value) {
        this.value = value
        this.left = null;
        this.right = null;
    }
}
const queue = {}
class WtoTree {
    constructor() {
        this.leftDepth = 0;
        this.rightDepth = 0;
    }
    insert(value) {
        var node = new TreeNode(value);
        if(!this.root){//判断是否为根节点
            this.root = node;
        }else {
            // 不是根节点则新增节点
            insertNode(this.root, node);
        }
        function insertNode(node,newNode){
            //约定右孩子都大于左孩子节点
            if(newNode.value < node.value){
                if(!node.left){//没有左孩子，则新增左孩子
                    node.left = newNode;
                }else{
                    //如果有左孩子则递归算法实现插入左孩子节点
                    insertNode(node.left, newNode);
                }
            }else {
                //如果有孩子为null，则新增右孩子
                if(!node.right){
                    node.right = newNode;
                }else{
                    //如果有左孩子则递归算法实现插入右孩子节点
                    insertNode(node.right,newNode);
                }
            }
        };
    };

    preOrder(node=this.root) {
        if(!node) return;
        console.log(node.value);
        this.preOrder(node.left)
        this.preOrder(node.right)
    }

    midOrder(node=this.root) {
        if(!node) return;
        this.midOrder(node.left)
        console.log(node.value);
        this.midOrder(node.right)
    }

    backOrder(node=this.root) {
        if(!node) return;
        this.backOrder(node.left)
        this.backOrder(node.right)
        console.log(node.value);
    }

    searchMax(node = this.root){
        let value;
        if(node) {
            value = node.value;
            node = node.right;
            while (node) {
                if (node) {
                    value = node.value
                }
                node = node.right
            }
        }
        return value
    }

    searchMin(node=this.root){
        let value;
        if(node) {
            value = node.value;
            node = node.left
            while (node) {
                if (node) {
                    value = node.value
                }
                node = node.left
            }
        }
        return value
    }

    getValue(node=this.root,val){
        if(!node){
            return false;
        }
        if(node.value < val){
            return this.getValue(node.right, val);
        }else if(node.value>val){
            return this.getValue(node.left,val)
        }else{
            return true;
        }
    }
    getNodeNumber(node = this.root) {
        // 统计二叉树中结点个数的算法 （先根遍历）
        let count = 0;

        if(node){
            count++;   // 根结点+1
            count += this.getNodeNumber(node.left);  // 加上左子树上结点数
            count += this.getNodeNumber(node.right);  // 加上右子树上结点数
        }

        return count;
    }
    getDepth(root = this.root) {
        if (root === null) {
            return 0;
        } else {
            var leftDepth = this.getDepth(root.left),
                rightDepth = this.getDepth(root.right);
            var childDepth = leftDepth > rightDepth ? leftDepth : rightDepth;
            return 1 + childDepth;
        }
    };
    // 利用了前序遍历存储每一层的节点个数
    getWidth(node = this.root) {
        let h = this.getDepth();

        let count =  []

        let level = 0;

        this.getMaxWidthRecur(node, count, level);
        console.log(count, h)
        // Return the maximum value from count array
        let max = count[0];
        for (let i = 0; i < h; i++)
        {
            if (count[i] > max)
                max = count[i];
        }
        return max;
    }
    getMaxWidthRecur(node,count,i) {
        if (node != null)
        {
            if(!count[i]) count[i] = 0
            count[i]++;
            this.getMaxWidthRecur(node.left, count, i + 1);
            this.getMaxWidthRecur(node.right, count, i + 1);
        }
    }
}

var nodes = [6,2,3, 1, 5, 6]
var binaryTree = new WtoTree();
nodes.forEach(function(key){
    binaryTree.insert(key);
});
console.log('前序')
binaryTree.preOrder()
console.log('中序')
binaryTree.midOrder()
console.log('后序')
binaryTree.backOrder()
// 求宽度
binaryTree.getWidth()

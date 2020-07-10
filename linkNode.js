function LinkNode(val, next) {
    this.val = val || null;
    this.next = next || null;
}
function LinkNode(val, next) {
    this.val = val;
    this.next = next || null;
}
function addLink(l1,l2){
    var link1 = l1;
    var link2 = l2;
    var start =  null;
    var next = null;
    var add =0;
    while(link1 || link2) {
        if(link1) {
            var v1 = link1.val;
            link1 = link1.next
        } else {
            v1 = 0
        }
        if(link2) {
            var v2 =  link2.val;
            link2 =  link2.next
        } else {
            v2 = 0
        }
        var sum = v1 + v2 + add;
        if(sum >= 10){
            add = Math.floor(sum/10);
            sum = sum % 10;
        }else {
            add =  0;
        }
        console.log(sum)
        if(!next) {
            next = new LinkNode(sum);
            if(!start) {
                start = next
            }
        } else {
            next.next = new LinkNode(sum);
            next = next.next
        }

    }
    return start
}
// 链表相加操作
var a1 = new LinkNode(4)
var a = a1
for(var i = 0; i < 5; i++) {
    a1.next = new LinkNode(i+9)
    a1 = a1.next;
}
var b = new LinkNode(8)
var b1 = b
for(var i = 0; i < 3; i++) {
    b1.next = new LinkNode(i+1)
    b1 = b1.next;
}
addLink(a, b)
// 分割线
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
        }
        if(!flag) {
            return arr
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
    // 前序：根->左->右
    // 后序：左->右->根
    //
    // 那么可以把后序当作：根->右->左，然后再反转一下即可。
    postorderTraversal = function(root) {
        if(!root) return [];
        const res = [], stack = [];
        stack.push(root)
        while (root || stack.length) {
            root = stack.pop();
            res.push(root && root.val)
            if(root &&root.left) {
                stack.push(root.left)
            }
            if(root&& root.right) {
                stack.push(root.right)
            }
        }
        return res.reverse().filter(item =>item)
    };

    // 1, 先依次遍历左孩子, 在栈中依次记录，当左孩子为空时，遍历到叶子节点 //跳回上一层节点, 为防止while循环重复进入，将上一层左孩子置为空
// 2, 接着遍历右孩子, 在栈中依次记录值，当右孩子为空时, 遍历到叶子节点
// 跳回上一层节点, 为防止while循环重复进入，将上一层右孩子置为空 后续遍历
    postorderTraversal(root=this.root) {
        const res = [], stack = []
        while (root || stack.length) {
            if (root.left) {
                stack.push(root)
                root = root.left
            } else if (root.right) {
                stack.push(root)
                root = root.right
            } else {
                res.push(root.value)
                root = stack.pop()
                root && (root.left = null) && (root.right = null)
            }
        }
        return res
    };

    getPre(root) {
        const stack = [], res = []
        root && stack.push(root)
        // 使用一个栈stack，每次首先输出栈顶元素，也就是当前二叉树根节点，之后依次输出二叉树的左孩子和右孩子
        while(stack.length > 0) {
            let cur = stack.pop()
            res.push(cur.value)
            // 先入栈的元素后输出，所以先入栈当前节点右孩子，再入栈左孩子
            cur.right && stack.push(cur.right)
            cur.left && stack.push(cur.left)
        }
        return res
    };

    mid(root) {
        const res = [], stack = []
        let node = root;
        while (stack.length > 0 || node !== null) {
            // 这里用当前节点node是否存在，简化代码，
            if (node) {
                stack.push(node);
                node = node.left
            } else {
                node = stack.pop();
                res.push(node.value);
                node = node.right;
            }
        }
        return res;
    };


    getLCA(root=this.root, node1, node2) {
        if(root == null)
            return null;
        if(root === node1 || root === node2)
            return root;
        let left = this.getLCA(root.left, node1, node2);
        let right = this.getLCA(root.right, node1, node2);
        if(left !== null && right !== null)
            return root.value;
        else if(left !== null)
            return left.value;
        else if (right !== null)
            return right.value;
        else
            return null;
    }


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

    // 查找完整路径是否等于某值
    FindPath(expectNumber) {
        var result = [];
        this.dfsFind(this.root, expectNumber, [], 0, result);
        return result;

    }


    dfsFind(root, expectNumber, path, currentSum, result) {
        console.log(root)
        currentSum += root.value;

        path.push(root.value);
        if (currentSum === expectNumber && !root.left && !root.right) {
            result.push(path.slice(0));
        }
        if (root.left != null) {
            this.dfsFind(root.left, expectNumber, path, currentSum, result);
        }

        if (root.right != null) {
            this.dfsFind(root.right, expectNumber, path, currentSum, result);
        }

        path.pop();
    }


    getDfs() {
        let result = [];
        dfs(this.root)
        function dfs(node) {
            if(node) {
                dfs(node.left);
                dfs(node.right);
                result.push(node.value);
            }
        }
        return result;
    }


    getBfs() {
        let count = [];
        bfs(this.root, count, 0)
        function bfs(node, count, i) {
            if (node != null)
            {
                if(!count[i]) count[i] = []
                count[i].push(node);
                this.getMaxWidthRecur(node.left, count, i + 1);
                this.getMaxWidthRecur(node.right, count, i + 1);
            }
        }
        count.forEach((item,index) => {
            console.log(`第几层${index+1}`);
            item.forEach(it => {
                console.log('节点：', it)
            })
        })
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
binaryTree.getLCA(binaryTree.root, binaryTree.root.right, binaryTree.root.left.right)
binaryTree.getWidth()
// 斐波那qie
const fib = n => {
    if (typeof n !== "number") {
        throw new Error("..");
    }
    if (n < 2) {
        return n;
    }
    let a = 0;
    let b = 1;
    while (n--) {
        [a, b] = [b, a + b];
    }
    return a;
};
// 倒退寻找 f(n) = '某个值' 求n
const getFib = x => {
    if (x <= 1) {
        return x;
    }
    let a = 0;
    let b = 1;
    let n = 1;
    while (true) {
        [a, b] = [b, a + b];
        if(b === x) return n;
        n++;
    }
};

function factorial(num) {
    const dp = [1, 1]
    for (let i = 2; i < num; i++) {
        dp[i] = dp[i - 1] + dp[i - 2]
    }
    return dp[num - 1]
}

function TailDg() {

}
/**
 * @param {number} capacity
 */
var LRUCache = class {

    constructor(capacity) {
        this.cache = new Map();
        this.capacity = capacity;
    }

    /**
     * @param {number} key
     * @return {number}
     */
    get(key) {
        let cache = this.cache;
        if (cache.has(key)) {
            let temp = cache.get(key)
            cache.delete(key);
            cache.set(key, temp);
            return temp;
        } else {
            return -1;
        }
    };

    /**
     * @param {number} key
     * @param {number} value
     * @return {void}
     */
    put(key, value) {
        let cache = this.cache;
        if (cache.has(key)) {
            cache.delete(key);
        } else if (cache.size >= this.capacity) {
            cache.delete(cache.keys().next().value);
        }
        cache.set(key, value);
    };
};
// bitMap 使用的时候位32位，减少内存的使用
// 00000000000000000000000 32位使用的内存减少 采用2-Bitmap共需内存2^32 * 2 bit=1 GB内存，还可以接受。然后扫描这2.5亿个整数，查看Bitmap中相对应位，如果是00变01，01变10，10保持不变。一个字节可以存放8个数，那我只要两个byte就可以解决问题了
const BitMap = function () {
    this.data = [];
};
// 然后是两个基础函数, 用来计算一个数应该存在 data 数组里的索引, 以及在整数里的具体位置.

    BitMap.prototype.getIdx = num => parseInt(num / 32);
BitMap.prototype.getPos = num => num % 32;
// 然后接下来就是添加操作, 就是找到具体的正数用 |= 操作符将相应位数置 1 即可:

    BitMap.prototype.add = function (num) {
        const index = this.getIdx(num);
        const pos = this.getPos(num);

        if (this.data[index] === undefined) this.data[index] = 0;
        this.data[index] |= Math.pow(2, pos);
    };
// 判断是否存在也很简单, 找到位置做按位与操作就可以得到结果:

BitMap.prototype.exist = function (num) {
    const index = this.getIdx(num);
    const pos = this.getPos(num);

    return !!(this.data[index] && (this.data[index] & Math.pow(2, pos)));
};
// 字符串的全排列,拿出第一个和剩下的全排列结合
function fullpermutate(str) {
    var result = [];
    if (str.length > 1) {
        //遍历每一项
        for (var m = 0; m < str.length; m++) {
            //拿到当前的元素
            var left = str[m];
            //除当前元素的其他元素组合
            var rest = str.slice(0, m) + str.slice(m + 1, str.length);
            //上一次递归返回的全排列
            var preResult = fullpermutate(rest);
            //组合在一起
            for (var i = 0; i < preResult.length; i++) {
                var tmp = left + preResult[i]
                result.push(tmp);
            }
        }
    } else if (str.length == 1) {
        result.push(str);
    }
    return result.filter((item, index) => index === result.indexOf(item));
}
// 获得尾递归
// fib_rail_rec(n, 1, 1)
function fib_rail_rec(n, first, second)
{
    if (n == 1) return first;
    if (n == 2) return second;
    return fib_rail_rec(n-1, second, second+first);
}

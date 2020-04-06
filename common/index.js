// main.js
const a1 = require('./a.js');
a1.foo = 2;
let s = require('./count.js')
const a2 = require('./a.js');
console.log('count',s.count)
s.addCount();
console.log('count',s.count)
console.log(a2.foo); // 2
console.log(a1 === a2); // true

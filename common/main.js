const a = require('./a');
console.log('in main, a.a1 = %j, a.a2 = %j', a.a1, a.a2);
const counter = require('./count.js');

counter.increment();
console.log(counter.count); // 1

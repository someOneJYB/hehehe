// module.exports = {
//     foo: 1,
// };
exports.a1 = true;
let b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.a2 = true;
console.log('again')
b = require('./b.js');

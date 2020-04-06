// module.exports.count = 1
// module.exports.addCount = function() {
//     module.exports.count++
// }

let count = 1;

function increment () {
    count++;
}

module.exports = {
    count,
    increment
}

// import { a1, a2 } from './e.mjs'
// console.log(a1, a2); 报错 ReferenceError: Cannot access 'a1' before initialization
import * as a from './e.mjs'
console.log(a);
// [Module] { a1: <uninitialized>, a2: <uninitialized> }

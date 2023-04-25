// // function store() {
// //   this.store = {};
// //   if (store.install) {
// //     return store.install;
// //   }
// //   store.install = this;
// // }
// // var s1 = new store();
// // var s2 = new store();
// // s1.store.name = "lin";
// // console.log(s2);
// //例子：当需要去改动他人的代码，往其中增加新功能时。例如给某些点击事件新增操作提示
// function decorator(dom, fn) {
//   if (typeof dom.onclick === "function") {
//     let _old = dom.onclick;
//     //重写
//     dom.onclick = function () {
//       //调用老方法
//       _old();
//       //执行新的操作
//       fn();
//     };
//   }
// }

// const protoArr = Array.prototype;
// let copyArr = Object.create(protoArr);
// console.log(copyArr.prototype === Array.prototype);

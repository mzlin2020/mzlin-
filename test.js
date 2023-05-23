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

// 观察存储器
// function observe() {
//   this.message = {};
// }

// // 注册监听
// observe.prototype.regist = function (type, fn) {
//   this.message[type] = fn;
// };

// // 触发监听
// observe.prototype.fire = function (type) {
//   this.message[type]();
// };

const obj = {
  message: {},
  regist: function (type, fn) {
    this.message[type] = fn;
  },
  function(type) {
    this.message[type]();
  },
};

// A模块
obj.regist("getSomething", (data) => {
  //doSomething
});
// B模块
obj.fire("getSomething");

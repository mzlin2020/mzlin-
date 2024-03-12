# JavaScript高级（三）

```js
@title 'JavaScript高级（三）' 
@description 'JavaScript新版本特性、高级用法与部分原理提升'
@image 'https://mzlin2020-notes.oss-cn-shenzhen.aliyuncs.com/img/js%E9%AB%98%E7%BA%A7/esmodule%E5%8E%9F%E7%90%861.jpg'
```

## 一、async和await

### 1.1 推导

需求：

假设有这么一个网络请求函数request，每次请求到结果后需要处理一下，再次发送网络请求

```js
//模拟网络请求
function request(url) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(url)
        }, 2000)
    })
}
```

**方式一：回调地狱**

```js
request('mall').then(res =>{
    request(res + '/home').then(res => {
        request(res + '/detail').then(res => {
            console.log(res)
        })
    })
})
//输出：mall/home/detail
```

**方式二：promise返回值**

```js
request('mall').then(res => {
    return request(res + '/home')
}).then(res => {
    return request(res + '/detail')
}).then(res => {
    console.log(res)
})
//输出：mall/home/detail
```

**方式三：promise + generator**

```js
function *getData() {
    yield request('mall')
}

const  generator = getData()
generator.next()
//输出：request('mall')结果（一个promise）：{ value: Promise { <pending> }, done: false }

generator.next().value.then(res1 => {
    console.log(res1)
}) //输出：mall
```

重要一步：（理解yield的参数传递）将拿到的mall，传到第一个yield前面`const res1 = yield request('mall') `

调用第二个yield时，就可以使用res1了

```js
function *getData() {
    cosnt res1 = yield request('mall')
    const res2 = yield request(res1 + '/home')
}
const  generator = getData()
generator.next().value.then(res1 => {
    generator.next(res1) //传递参数
})
```

完整的代码如下

```js
function *getData() {
    const res1 = yield request('mall')
    const res2 = yield request(res1 + '/home')
    const res3 = yield request(res2 + '/detail')
}
const  generator = getData()
generator.next().value.then(res1 => {
    generator.next(res1).value.then(res2 => {
        generator.next(res2).value.then(res3 => {
            console.log(res3)
        })
    })
})

//输出：mall/home/detail
```

是不是觉得上边的代码相比起前两种方式没什么改进？但是其实可以利用一些方式让生成器自调用

或者利用一些库（co），来省略这一步。所以经过这两种方式的转化，代码简化为如下

```js
function *getData() {
    const res1 = yield request('mall')
    const res2 = yield request(res1 + '/home')
    const res3 = yield request(res2 + '/detail')
    console.log(res3)
}
```

**方式四：async与await**

而async与await就是上方的语法糖(`*` -> async，yield -> await )

```js
async function getData() {
    const res1 = await request('mall')
    const res2 = await request(res1 + '/home')
    const res3 = await request(res2 + '/detail')
    console.log(res3)
}
getData()
//输出：mall/home/detail
```

### 1.2 基本语法

添加一个async，函数的执行顺序是怎样的？

```js
async function foo() {
    console.log('内部代码执行~')
}
console.log('start~')
foo()
console.log('end~')

//输出：start~ 内部代码执行 end~
```

答案：同步执行

**与普通函数的区别一**

返回一个promise

```js
async function foo() {}
const promise = foo() 
promise.then(res => {
    console.log(res)
})
```

那么promise中的状态是由什么决定的呢？什么时候能调用then

答案：当foo函数有返回值时，状态变为fulfilled

```js
//情况1：返回普通对象或值
async function foo() {
    return '123'
}
const promise = foo() 
promise.then(res => {
    console.log(res) 
})//输出：123

//情况2：返回一个promise，状态由这个promise决定
async function foo() {
    return new Promise((resolve) => {
        resolve('hahah')
    })
}
foo().then(res => {
    console.log(res)
}) //hahah

//情况3：thenable
async function foo() {
    return {
        then: function(resolve) {
            resolve('111')
        }
    }
}
foo().then(res => {
    console.log(res)
}) //111
```

**与普通函数的区别二（抛出异常）**

异步函数中的异常，会被作为异步函数返回的promise的reject值

```js
async function foo() {
    console.log("代码执行");
    throw new Error("发生了不可描述的错误~")
}
foo().catch(err => {
    console.log(err);
})

//输出：代码执行，发生了不可描述的错误,.....(错误说明)
```







## 三、包管理工具npm

Node package Manager 

### 4.1 package.json

事实上，每一个项目（无论是前端项目还是后端项目），都有一个对应的配置文件。

说明：这个配置文件记录着项目的名称、版本号、项目描述等，也记录着项目所依赖的其他库的信息和依赖的版本号。

**常见的属性**

1、name是项目的名称；(必要)

2、version是当前项目的版本号；(必要)

3、description是描述信息，很多时候是作为项目的基本描述；

4、author是作者相关信息（发布时用到）；

5、license是开源协议（发布时用到）；

6、scripts属性——该属性用于配置一些脚本命令，以键值对的形式存在。配置后我们就可以通过npm run 命令的key来执行这个命令

7、dependencies属性——指定无论开发环境还是生产环境都需要依赖的包

8、devDependencies属性——通过npm install ** --save -dev 安装的包，开发时依赖，项目上线后不需要

**版本管理的问题**

我们安装的版本依赖：^2.0.3 或者 ~2.0.3 这是什么意思呢？

npm的包通常需要遵从semver版本规范

1、X主版本号：当发布了不兼容之前版本的API修改（如webpack4升级到webpack5）

2、Y次版本号：当做了向下兼容的功能性新增（新功能增加）

3、Z修订号：当做了向下兼容的问题修正（没有新功能，修复之前版本的bug）

^ 和 ~ 的区别

1、^x.y.z：表示x是保持不变的，y和z永远安装最新的版本；

2、~x.y.z：表示x和y保持不变的，z永远安装最新的版本

所以，在package.json中，安装的依赖都是大致的版本，并不是精确的版本。真正精确的版本信息保存在**package-lock.json**中

### 4.2 npm install

1、全局安装： `npm install <包> -g`

2、局部安装：`npm install <包>`

其中局部安装分为开发时依赖和生产时依赖：

安装开发和生产依赖：`npm install <包> `

开发依赖：`npm install <包> -dev` 

注：--save是表示将依赖关系添加到package.json中，但是npm5之后可以省略。

![](img/node/image-20210626211104007.png)

npm install会检测是有package-lock.json文件。

**其他命令**

卸载某个依赖包：`npm uninstall <package>`

强制重新build ：`npm rebuild`

清除缓存：`npm cache clean     `

### 4.3 其他工具

**yarn**

yarn是为了弥补npm的一些缺陷而出现的

常见的命令：

安装依赖：`yarn install`

填加包：`yarn add <package>`

移除包 ：`yarn remove <package>`

**cnpm**

查看当前npm镜像

`npm config get registry` 

输出（npm镜像）：`#npm config get registry`

输出（淘宝镜像）：`#httpS://r.npm.taobao.org/`

我们可以直接将npm命令设置为淘宝镜像（不推荐）

`npm config set registry https://registry.npm.taobao.org`

比较推荐将镜像绑定在cnpm上，并且将cnpm设置为淘宝的镜像，这样子不会影响原来npm命令的使用。

`npm install -g cnpm --registry=https://registry.npm.taobao.org`

## 四、JSON数据存储

### 4.1 基本概念

JSON是一种非常重要的数据格式，它并不是编程语言，而是一种可以在服务器和客户端之间传输的数据格式

应用场景：

1、网络数据的传输JSON数据

2、项目的某些配置文件

3、非关系型数据库（NoSQL）将json作为存储格式

其他传输格式：

1、XML：在早期的网络传输中主要使用XML来进行数据交换的，但是这种格式在解析，传输等各方面都弱于JSON，所以目前已经很少被使用了

2、Protobuf：另外一个在网络传输中目前已经越来越多使用的传输格式是protobuf，但是它在2021年3.x版本才支持JavaScript，所以目前在前端使用的较少

### 4.2 基本语法

JSON顶层支持三种类型的值

+ 简单值：数字(Number)、字符串(String)、布尔值、null类型。（注：不支持undefined）

```json
123,
true,
'str'
```

+ 对象值：由key、value组成，key是字符串类型，并且必须添加双引号，值可以是简单值、对象值、数组值

```json
{
    123,
    "obj" : {
        "key": "value"
    }
}
```

+ 数组值：数组值可以是简单值、对象值、数组值

```json
[
    true,
    {
        "name": "linming"
    }
]
```

**localStorage的问题**

当我们将一个对象进行本地缓存的时候，这个对象会被转为字符串

```js
const obj = {
    name: 'linming',
    age: 23
}
localStorage.setItem("obj", obj) //obj会被转为字符串，“[object, object]”
console.log(localStorage.getItem("obj")) 
//输出：[object, object]
```

发现存储的obj的内容丢失了

要解决上述的问题，可以将obj转为json格式，再转为js数据格式

```js
localStorage.setItem("obj", JSON.stringify(obj))
console.log(localStorage.getItem("obj")) 
// 输出: {"name":"linming","age":23}

let res = JSON.parse(localStorage.getItem("obj"))
console.log(res)
//输出： {name: 'linming', age: 23}
```

### 4.3 序列化与解析

**JSON序列化**

JSON序列化可以将一个js数据结构转换成JSON

```js
const obj = { name: 'ming' }
JSON.stringify(obj)   //{ "name": "ming" }
```

这个方法可以接收第二个参数replacer

```js
const obj = {
    name: 'lin',
    age: 22
}
//情况一:传入数组，指定哪些是需要转换的
JSON.stringify(obj, ["name"])   //输出：{"name":"lin"}

//情况二：传入回调函数：拦截处理
let res = JSON.stringify(obj, (key, value) => {
    if(key === "age") {
        return value + 1
    }
    return value
})
console.log(res)
```

也可以有第三个参数apace，这个参数用于是输出JSON数据格式更具可读性

```js
JSON.stingify(obj, null, 2) //传入数值，表示空格
//输出：
{
  "name": "lin",
  "age": 22
}

JSON.stingify(obj, null, "--")
//输出：
{
--"name": "lin",
--"age": 22
}
```

另外，如果被转换对象中有toJSON方法，最终结果由该方法决定

```js
const obj = {
    num: 20,
    toJSON: function() {
        return "格式由我决定"
    }
}
console.log(JSON.stringify(obj));
//输出：格式由我决定
```

**JSON解析**

`JSON.parse()`也可以将一个JSON对象转换成js数据结构

```js
const JSONString = '{ "name": "lin", "age": 22, "isFlag": true }'

console.log(JSON.parse(JSONString));
//输出：{name: 'lin', age: 22, isFlag: true}
```

也可以传进第二个参数，可以对解析的值进行拦截

```js
let res = JSON.parse(JSONString, (key, value) => {
    if(key === "age") {
        return value - 1
    }
    return value
})
console.log(res)
//{name: 'lin', age: 21, isFlag: true}
```

### 4.4 实现深拷贝

利用JSON我们可以来拷贝一个对象，并且实现的是深拷贝

```js
const obj = {
    name: 'linming',
    age: 23,
    friends: {
        name: 'xiaohao',
        age: 22,
        hobbies: ["吃饭", "睡觉", "看剧"]
    },
}

const obj2 = JSON.stringify(obj)
obj2 = JSON.parse(obj2)
//obj与obj2相互独立，改变不会相互影响
obj.friends.hobbies[3] = "刷手机"
console.log(obj2);  //输出的值里没有变化
```

上边的案例中，实现了obj与obj2的深拷贝。但是利用JSON进行深拷贝有一个致命的缺陷：

JSON实现的深拷贝，无法拷贝函数

```js
const obj = {
    name: 'linming',
    friends: {
        name: 'xiaohao',
        age: 22,
        hobbies: ["吃饭", "睡觉", "看剧"]
    },
    run: function() { //函数
        console.log(this.name, "喜欢跑步")
    }
}

let obj2 = JSON.parse(JSON.stringify(obj))
console.log(obj2)  //发现没有把函数拷贝下来！！！
```

另外：undefined、Symbol也会被忽略

### 4.5 indexedDB

indexedDB是一种数据库。一般而言，存储大量数据是需要使用后端的数据库的，但是如果想要保存在浏览器，就可以选择使用indexedDB

indexedDB是一种底层的API，用于在客户端存储大量的结构化数据。它是一种事务型数据库系统，是一种基于JavaScript面向对象数据库。我们需要指定数据库模式，打开与数据库的连接，然后检索和更新一系列事务即可

为什么不适用web storage来保存大量数据呢？

因为首先是web storage的存储大小有限，另一个是不利于搜索，效率不高

基本使用

**indexedDB连接数据库**

1、打开indexedDB的某一个数据库

通过`indexedDB.open(数据库名称，数据库版本)`方法打开一个数据库（如果数据库不存在则创建）

```js
const dbRequest = indexedDB.open("linming")
```

打开成功/失败会触发一下回调函数

```js
//失败
dbRequest.onerror = function(err) {
    console.log("打开数据库失败~")
}
//成功
let db = null
dbRequest.onsuccess = function(event) {
    console.log("打开数据库成功~")
    db = event.target.result
}
```

2、第一次打开数据库时，触发以下回调

```js
dbRequest.onupgradeneeded = function(event) {
    const db = event.target.result
    //创建一些存储对象，users表，主键为keyPath
    db.createObjectStore("users", { keyPath: "id" })
}
```

上面的操作中，数据库第一次被打开后，我们创建了db对象，后续可以通过db这个对象操作数据库。

3、往表中添加数据

```js
const dbRequest = indexedDB.open("linming", 2)
//失败
dbRequest.onerror = function(err) {
    console.log("打开数据库失败~")
}
//成功
let db = null
dbRequest.onsuccess = function(event) {
    console.log("打开数据库成功~")
    db = event.target.result
    console.log(db);
}

dbRequest.onupgradeneeded = function(event) {
    console.log("第一次打开数据库时，触发");
    const db = event.target.result
    //创建一些存储对象，users表，主键为keyPath
    db.createObjectStore('users', {keyPath: 'id'})
}

const  info = {
    "id" : 200,
    "name" : "linming",
    "age" : "14"
}

setTimeout(() => {
    const transaction = db.transaction("users", "readwrite")
    let store = transaction.objectStore("users")
    // 往users表中新增数据  
    const res = store.add(info)
    res.onsuccess = function() {
        console.log("添加操作完成");
    }
}, 300)
```

4、查询数据

```js
const request = store.get(200)
request.onsuccess = function(event) {
    console.log(event.target.result)
}

//输出：{id: 200, name: 'linming', age: '14'}
```



## 八、webWorker

webworker是JavaScript的一种多线程机制

包括了dedicatedWorker和sharedWorker（兼容性不好）两大部分

应用：创建新的线程与主线程并行执行，减少卡顿，提升性能

弊端：存在通信开销

<img src="./img/js高级/webworder通信开销.png" style="zoom:67%;" />

所以真正的性能提升：并行的时间消耗 - 通信开销的时间开销

webWorker与主线程的相同点

![](./img/js高级/webWorker与主线程的相同点.png)

不同点

![](./img/js高级/webWorker与主线程的不同点.png)

```js
//创建DedicatedWorker
const worker = new Worker("worker.js")

//创建sharedWorker
var myWorker = new SharedWorker("worker.js")
```

```js
//index.js
const worker = new Worker('./worker.js')
worker.postMessage('hello')
worker.onmessage = (event) => {
  console.log(event.data) //world
}

//worker.js
self.onmessage = (event) => {
  console.log(event.data)
  postMessage('world')
}
```

## 九、其他

### 9.1 异步函数的传染性

在开发中，如果定义一个网络请求函数并要求返回其结果，那么需要使用到async await。并且如果其他函数执行了该函数，他们也需要用上async await

```js
async function getData() {
  return await fetch('https://my-json-server.typicode.com/typicode/demo/profile').then((resp) => resp.json())
}

async function fn1(){
  //other  works
  return await getData()
}

async function fn2(){
  //other  works
  return await fn1()
}
fn2()
```

弊端：每个使用到getData的函数，都需要使用到async await。破坏了纯函数的结构，产生了副作用



想要实现的效果，不使用async await能够获取到网络请求的结果

思路：在调用时直接报错，在报错中进行结果的处理

```js
//实现
function run(func) {
  let cache = []; //缓存的列表，由于可能不止一个fetch，所以要用一个list
  let i = 0; //缓存列表的下标
  const _originalFetch = window.fetch; //储存原先的fetch
  window.fetch = (...args) => {
    //重写fetch函数，这个fetch要么抛出异常，要么返回真实的数据
    if (cache[i]) {
      //判断一下缓存是否存在，如果存在就返回真实的数据或抛出异常
      if (cache[i].status === "fulfilled") {
        return cache[i].data;
      } else if (cache[i].status === "rejected") {
        throw cache[i].err;
      }
    }
    const result = {
      status: "pending",
      data: null,
      err: null,
    };
    cache[i++] = result; //添加缓存
    //发送请求
    //真实的fetch调用
    const prom = _originalFetch(...args)
      .then((resp) => resp.json())
      .then(
        (resp) => {
          //等待返回结果，然后修改缓存
          result.status = "fulfilled";
          result.data = resp;
        },
        (err) => {
          result.status = "rejected";
          result.data = err;
        }
      );
    //如果没有缓存，就添加缓存和抛出异常
    throw prom;
    //这里为什么会抛出真实fetch返回的promise，主要是因为外面会用到这个promise然后等待拿到最终结果
  };

  try {
    //在try里调用func也就是上述的main函数
    //由于main里面有fetch，且第一次没有缓存，所以会抛出一个异常
    func();
  } catch (err) {
    //从这里捕获到异常
    //这里的err就是上述fetch返回的promise

    if (err instanceof Promise) {
      //验证一下是不是promise
      const reRun = () => {
        i = 0; //重置一下下标
        func();
      };
      err.then(reRun, reRun); //待promise返回结果后重新执行func，也就是重新执行main
      //这次执行已经有缓存了，并且返回中有了正确的结果，所以重写的fetch会返回真实的数据
    }
  }
}


// 调用
function main() {
  const res = fetch(
    "https://my-json-server.typicode.com/typicode/demo/profile"
  );
  console.log("res", res); //res要得到一个data数据而不是一个promise对象
}
run(main);
```

### 9.2 禁止网页被调试

1、如何绕过别人网站的断点进行调试

+ 禁止网页所有断点
+ 右键断点选择`add logpoint`,返回`false`
+ 右键断点选择`add script to ignore list`，添加的忽略代码

2、如何防止自己的网站被调试（不完善）

```js
;(() => {
  function block() {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
      document.body.innerHTML = '检测到非法调试,请关闭后刷新重试!'
    }
    setInterval(() => {
      ;(function () {
        return false
      })
        ['constructor']('debugger')
        ['call']()
    }, 50)
  }
  try {
    block()
  } catch (err) {}
})()
```

## 十、面向对象

JavaScript其实支持多种编程范式的，包括**函数式编程和面向对象编程**： 

1、JavaScript中的对象被设计成一组属性的无序集合，像是一个哈希表，有key和value组成

2、key是一个标识符名称，value可以是任意类型，也可以是其他对象或者函数类型

3、如果值是一个函数，那么我们可以称之为是对象的方法

**创建对象**

```js
//方式一: new关键字
var obj = new Object()

//方式二: 字面量
var obj = {}
```

**操作对象**

```js
//赋值
obj.name = "linming"

//取值
obj.name

//删除值
delete obj.name
```

有时候我们也希望对一个属性进行比较精准的操作控制，比如不允许对象的某个值被删除、被赋值、不允许哪一个值被遍历等等，这个时候，就可以使用`Object.defineProperty`

### 10.1 defineProperty

`Object.defineProperty()`方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

**可接收三个参数**

1、obj要定义属性的对象

2、prop要定义或修改的属性的名称或Symbol

3、descriptor要定义或修改的**属性描述符**

返回值：被修改的对象obj

```js
var obj = {
    name: "linmnig",
    age: 19
}

// 为obj增加一个属性
Object.defineProperty(obj, "height", {
    value: 1.88
})
console.log(obj) //输出：{ name: 'linmnig', age: 19 }
```

注：通过该函数添加的新属性，默认不可被遍历

**属性描述符分类**

属性描述符的类型有两种：

1、数据属性描述符

2、存取属性(访问器)描述符

| 分类       | configurabel | enumerable | value  | writable | get    | set    |
| ---------- | ------------ | ---------- | ------ | -------- | ------ | ------ |
| 数据描述符 | 可以         | 可以       | 可以   | 可以     | 不可以 | 不可以 |
| 存取描述符 | 可以         | 可以       | 不可以 | 不可以   | 可以   | 可以   |

如何区分：当存在get、set时，不能有value和writable（不能共存），反之同理

**数据描述符的特性**

1、`[[Configurable]]`：表示属性是否可以通过delete删除属性，是否可以修改它的特性，或者是否可以将它**修改为存取属性描述符**

A、直接在一个对象上定义某个属性时，这个属性的[[Configurable]]为true

B、通过属性描述符定义一个属性时，这个属性的[[Configurable]]默认为false

2、[[Enumerable]]：表示是否可以通过遍历获得该属性

A、直接在一个对象上定义某个属性时，这个属性的[[Enumerable]]为true

B、通过属性描述符定义一个属性时，这个属性的[[Enumerable]]默认为false

3、[[Writable]]：表示是否可以修改属性的值

A、直接在一个对象上定义某个属性时，这个属性的[[Writable]]为true

B、通过属性描述符定义一个属性时，这个属性的[[Writable]]默认为false

4、[[value]]：属性的value值，读取属性时会返回该值，修改属性时，会对其进行修改

A、默认情况下这个值是undefined

```js
var obj = {
    name: 'linming'
}

//原先obj并没有age这个属性
Object.defineProperty(obj, 'age', {
    //默认值为undefined
    //age默认不可修改或删除
    //age不可被遍历
})
```

**存取属性描述符**

1、[[Configurable]]——与数据属性描述符一致

2、[[Enumerable]]——与数据属性描述符一致

3、**[[get]]**：获取属性时会执行的函数，默认为undefined

4、**[[set]]:**设置属性时会执行的函数，默认为undefined

```js
let obj = {
    name: 'linming',
    _address: '广州'
}

Object.defineProperty(obj, "address", {
    enumerable: true, //可遍历
    configurable: true, //可删除
    get: function() {
        return this._address
    },
    set: function(value) {
        this._address = value
    }
})
```

**get、set**的应用

1、隐藏一个私有属性，不希望直接被外界使用和赋值

2、希望截获某一个属性访问时，设置值时的过程

```js
Object.defineProperty(obj, "address", {
    enumerable: true, //可遍历
    configurable: true, //可删除
    get: function() {
        foo()
        return this._address
    },
    set: function(value) {
        bar()
        this._address = value
    }
})

function foo() {
    console.log("取值前截获到了");
}

function bar() {
    console.log("设置值前截获到了");
}


console.log(obj.address);
console.log(obj.address = "深圳");
```

**Object.defineProperties()**

Object.defineProperties()方法直接在一个对象上定义多个新的属性或修改现有属性，并且返回该对象

例如：同时配置name、age属性

```js
const obj = {
    _age: 18
}

Object.defineProperties(obj, {
    name: {
        configurable: true,
        enumerable: true,
        writableL: true,
        value: "linming"
    },
    age: {
        configurable: false,
        enumerable: false,
        get: function() {
            return this._age
        },
        set: function(value) {
            this._age = value
        }
    }
})
```

**获取某一个属性的属性描述符**

`getOwnPropertyDescriptor()`

```js
console.log(Object.getOwnPropertyDescriptor(obj, "age"));

//输出：
//{
//  get: [Function: get],
//  set: [Function: set],
//  enumerable: false,
//  configurable: false
//}
```

**获取对象的所有属性描述符**

`Object.getOwnPropertyDescriptors()`

```js
console.log(Object.getOwnPropertyDescriptors(obj));
```

### 10.2 批量创建对象

**1、工厂模式**

工厂模式是一种常见的设计模式

通常我们会有一个工厂方法，通过该工厂方法我们可以产生想要的对象

```js
//基本结构
function createPerson () {
    var p = {}
    return p
}

//创建对象实例
var p1 = createPerson()
```

具体案例如下

```js
function createPerson (name, age, height, address) {
    var p = {}
    p.name = name
    p.age = age
    p.height = height
    p.address = address
    p.eating = function() {
        this.name + "在吃东西"
    }
    p.running = function() {
        this.name + "在跑步"
    }
    return p
}

var p1 = createPerson('linming', 22, 1.81, "广州")

console.log(p1.eating);
console.log(p1.name);
```

**工厂模式的缺点：**获取不到对象的具体类型，我们在打印对象时，对象的类型都是Obejct类型

**2、构造函数**

构造函数也称之为构造器（constructor），通常是我们在创建对象时会调用的函数

如果一个普通的函数被使用new操作符来调用了，那么这个函数就称之为是一个构造函数

```js
function foo() {
    console.log("foo~")
}

//普通方式调用
foo() //输出：foo~

//new调用
new foo()  //输出：foo~
```

问题：**new调用有什么特殊的地方吗？**

如果一个函数被使用new操作符调用了，那么它会执行如下操作：

1、在内存中创建一个新的对象（空对象）

2、这个对象内部的[[prototype]]属性会被赋值为该构造函数的prototype属性

3、构造函数内部的this，会指向创建出来的新对象 `{} = this`

4、执行函数的内部代码（函数体代码）

5、如果构造函数没有返回非空对象，则返回创建出来的新对象

```js
function Person() {

}
var p1 =  new Person() //创建一个{}，this = {} ，执行函数体代码，返回新对象

console.log(p1) //输出：Person {}
```

完整的案例代码

```js
function Person (name, age, height, address) {
    //1.new 调用时创建一个{}
    //2.这里的this = 那个空对象
    //执行函数体，往对象里边添加属性、方法
    this.name = name  
    this.age = age
    this.height = height
    this.address = address

    this.eating = function() {
        console.log(this.name + "在吃东西~")
    }
    this.running = function() {
        console.log(this.name + "在跑步~");
    }
}

var p1 = new Person("linming", "18", "2.00", "深圳市")
var p2 = new Person('xiaoming', 22, "1.92", "广州市")
console.log(p1);

p1.eating()
p2.eating()

console.log(p1.eating === p2.eating) //false
```

**构造函数的缺点：**从上边的案例中，`console.log(p1.eating === p2.eating) //false` 我们可以得出，创建出来的实例的函数地址是不同的（即内部创建了不同的内存空间来保存这个函数），但是完成没有必要。但这样子的创建实例多了，就浪费了很多的内存空间

### 10.2 对象的原型

**隐式原型**

JavaScript当中每个对象都有一个特殊的**内置属性[[prototype]]**,这个特殊的属性可以**指向另一个对象**

```js
let obj = { name: 'linming' }  //[[prototype]]
```

如何查看这个属性？

1、方式一：`__proto__`

通过对象的这个属性可以获取到

```js
let obj = {}
console.log(obj.__proto__)
//输出：[Object: null prototype] {}
```

2、方式二：`Object.getPrototypeOf()`

```js
let obj = {}
console.log(Object.getPrototypeOf(obj))
//输出：[Object: null prototype] {}
```

从上边的代码中，都获取到了一个空对象，这个对象有什么用呢？

当我们通过引用对象的属性key来获取一个value时，它会触发[[Get]]的操作，这个操作会首先检查该属性是否对应的属性，如果有的话就使用它；如果没有该属性，那么会访问对象的[[prototype]]内置属性指向的对象上的属性

```js
let obj = {}
obj.__proto__.name = "linming"

console.log(obj.name) //linming
```

### 10.3 函数的原型

1、函数本质上也是一个对象，所以它有**隐式原型**

```js
function foo() {}
console.log(foo.__proto__) // {}
```

2、函数还有一个显示原型属性：prototype

```js
console.log(foo.prototype)  // {}
```

思考：函数的prototype也是一个对象，那么这个对象的隐式原型是谁呢？

```js
console.log(foo.prototype.__proto__)
//输出：[Object: null prototype] {}
```

答案：Object的原型对象

3、当函数作为构造函数被调用时，其内部创造出来的对象的隐式原型会指向显示原型

我们之前讨论过通过new调用一个函数会发生什么？

其中的第二步：`这个对象内部的[[prototype]]属性会被赋值为该构造函数的prototype属性`

```js
function Foo() {
    //1.创建出 {}
    //2. {}.__proto__ = Foo.prototype
    //3.this = {}
    //4.执行代码
    //5.return this 
}
```

所以，构造函数创建出来的实例，它的隐式原型 === 它的显示原型

```js
let f1 = new Foo()
let f2 = new Foo()

console.log(f1.__proto__ === Foo.prototype)
console.log(f2.__proto__ === Foo.prototype)
```

<img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\原型1.jpg" style="zoom:50%;" />

所以，这样一来，往`Foo.prototype`中添加属性，在f1，f2都能访问

```js
Foo.protype.name = 'linming'

console.log(f1.name) //linming
console.log(f2.name) //linming

//通过f1，或者f2向原型对象添加属性
f1.__proto__.age = 22
f2.__proto__.age = 18

console.log(f1.age) //输出：18
```

**4、constructor属性**

```js
function Foo() {}

console.log(Foo.prototype) //输出：{}
```

从上边可以知道，Foo的显示原型对象是空的。

实际上，它不是空的，只是这个原型对象的**enumerable**属性被设置为false，所以我们不能遍历出其中的属性

原型对象上有一个**constructor属性**，指向Foo函数本身

```js
console.log(Foo.prototype.constructor)
//输出：[Function: Foo]
```

所以，下面这样写也是允许的

```js
//获取函数名
console.log(Foo.prototype.constructor.name)  //输出：Foo

//也可以这样
console.log(Foo.prototype.constructor.prototype.constructor.prototype.constructor)
//输出：[Function: Foo]
```

5、修改原型对象

有时候我们不想用原来的原型对象，可以这么做

```js
function Foo() {}

Foo.prototype = {}  //直接修改了整个prototype
```

这样的结果是，我们直接断开了指向原本的原型对象，转而指向这个新的{}

```js
Foo.prototype = {
    name: 'linming',
    age: 22,
    height:1.78
}
```

当然这个新创建的`{}`对象并不完美，因为 其中没有constructor属性

真实开发中，我们可以通过`Object.defineProperty`方法添加constructor

```js
Object.defineProperty(Foo.prototype, "constructor", {
    enumerable: false,  //原来的原型对象的constructor是不能被遍历的
    writable: true,
    configurable: true,
    value: Foo //指向本身
})
```

测试代码

```js
let f1 = new Foo()
let f2 = new Foo()

console.log(f1.name, f2.age, f2.height);

console.log(Foo.prototype.constructor.name); //Foo
```

### 10.4 原型链

我们知道，查找一个对象的属性和方法时，会触发[[ get ]]操作

1、在当前对象中查找

2、如果没有找到，将会去对象的原型上（`__proto__`）查找

```js
const obj = {}
obj.__proto__.address = "广州市"
console.log(obj.address) //输出：广州市
```

3、如果还没找到，会继续沿着原型链查找（原型对象是一个对象，对象有自己的原型对象）

```js
![原型链1](img/js高级/原型链1.jpg)obj.__proto__ = {}
obj.__proto__.__proto__ = {}
obj.__proto__.__proto__.__proto__ = {
    address: 'linming'
}
console.log(obj.address) //输出：linming
```

​    <img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\原型链1.jpg" style="zoom:50%;" />

但是原型链不是无限的，最终会止于最顶层原型

那么最顶层的原型是是谁呢？就是Object的原型对象

### 10.5 Object的原型

**Object本质上是一个构造函数**，Object也是js所有类的父类

```js
const obj = {}
console.log(obj.__proto__)
//输出：[Object: null prototype] {}
```

这里输出的obj的隐式原型就是Object的显式原型对象`[Object: null prototype] {}`

为什么呢？为什么obj的隐式原型可以打印出来的就是顶层原型？

**重点理解**

```js
const obj = {}
//等于
const obj = new Obejct()
```

事实上字面量定义一个对象，就是`new Object()`的语法糖

结合前面说过的调用new创建出一个对象所经过的步骤，就不难理解

```js
const obj = new Object()
//1.创建出一个{}
//2.this = {}
//3.{}.__proto__ = Object.prototype
//4.执行函数体
//5.返回这个对象
```

所以，这样一来，`obj.__proto__ === Object.prototype`

<img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\原型链2.jpg" style="zoom:50%;" />

那么Object的原型对象里边都有什么呢？

有很多默认的属性和方法

```js
console.log(Object.getOwnPropertyDescriptors(Object.prototype))
//输出：
//constructor
//defineGetter__
//defineSetter__
// __lookupGetter__
//__lookupSetter__
//isPrototypeOf
//toString
//valueOf
//__proto__
//...
```

注意：其中，顶层显式原型对象是一个对象，它的隐式原型是null

```js
const obj = new Object()
console.log(obj.__proto__.__proto__) //输出：null
```

**构造函数的顶层原型对象**

思考：构造函数的显式原型也是一个对象，这个对象是否有[[prototype]]隐式原型属性呢？

答案是肯定的

```js
function People() {}

console.log(People.prototype.__proto__) 
//[Object: null prototype] {}
```

并且该People构造函数的原型对象的原型指向最顶层的Object的原型

<img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\原型链3.jpg" style="zoom:50%;" />

所以，可以说People构造函数继承自Object

### 10.6 继承

**1、基于原型链的继承方案**

```js
// 父类
function People() {
    this.name = 'linming'
}
People.prototype.running = function() {
    console.log(this.name + "在跑步")
}

// 子类
function Student() {
    this.age = 22
}

// 继承：改写了Student的显示原型，指向People的实例
Student.prototype = new People()
//也可以写成： const p1 = new People()  Student.prototype = p1

Student.prototype.eating = function() {
    console.log(this.name + "在吃东西")
}

const stu = new Student()
console.log(stu.age) //22
console.log(stu.name) //linming
stu.running() //linming在跑步
stu.eating() //linming在吃东西
```

最主要的代码是`Student.prototype = new People()`

这里将Student的原型改写为People的实例，由此实现了继承

<img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\继承1.jpg" style="zoom:50%;" />

原型链实现的继承有很多的弊端：

1、继承的属性是打印不出来的

```js
console.log(stu)
//输出：People { age: 22 }
```

但是明显我们要的是能显示出继承的name属性、eating方法

（错误？）2、实现继承的多个实例，新增属性时会共享,即多个实例都能访问得到（只能修改已定义的属性，新增的属性不会共享）

```js
var stu1 = new Student()
var stu2 = new Student()

stu1.name = 'xiaoming' //原先的name修改会被共享
console.log(stu2.name);
```

通常情况下我们希望的效果是，修改stu1的name，应该只能应用在stu1上，但实际上stu2也被修改了

3、传递参数不方便

**2、借用构造函数的继承方案**

对上边的案例进行简单的改造，就可以很好的解决出现的三个弊端

```js
function People(name, age, address) {
    this.name = name
    this.age = age
    this.address = address
}
People.prototype.running = function() {
    console.log(this.name + "在跑步")
}

function Student(name, age, address, sno) {
    // this = 所创建的实例
    People.call(this, name, age, address)
    this.sno = sno
}
//改写Student的原型对象
Student.prototype = new People()

//解决弊端1、3
const stu1 = new Student('linming', 22, '揭阳', 20180201) 
const stu2 = new Student('小明', 223, '广州', 201803041) 
console.log(stu1) 
console.log(stu2)
//解决
stu1.name = "林明" 
console.log(stu2.name)
```

弊端：

1、Person函数至少被调用了两次

2、stu的原型对象上会多出一些属性，但是这些属性是没有存在的必要

**3、原型式继承**

```js
var obj = {
    name: 'linming',
    age : 22
}
//原型式继承函数
function createObject(newPrototype) {
    var obj = {}
    // 将obj的原型改写为newPrototype
    Object.setPrototypeOf(obj, newPrototype)
    return obj
}

const info = createObject(obj)
console.log(info) //输出：{}
console.log(info.__proto__) //输出：{ name: 'linming', age: 22 }
```

创建出第三方的对象obj，使其成为info的隐式原型

ES6之后，有一个新的函数`Object.create`，可以实现与`createObject()`同样的效果

```js
const info = Object.create(obj)
console.log(info) //输出：{}
console.log(info.__proto__) //输出：{ name: 'linming', age: 22 }
```

**`Object.create()`**方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__

**4、寄生式继承**

```js
var personObj = {
    running: function() {
        console.log("running");
    }
}


function createStudent(name) {
    var stu = Object.create(personObj)
    stu.name = name
    stu.studying = function() {
        console.log("studying~")
    }
    return stu
}

var stuObj = createStudent("why")
var stuObj1 = createStudent("Kobe")
var stuObj2 = createStudent("james")

console.log(stuObj)
//输出：{ name: 'why', studying: [Function (anonymous)] }
```

**5、寄生组合式继承**

```js
function Person(name, age, firedns) {
    this.name = name
    this.age = age
    this.firedns = firedns
}

Person.prototype.running = function() {
    console.log("running~")
}
Person.prototype.eating = function() {
    console.log("eating~")
}

function Student(name, age, friends, sno, score) {
    Person.call(this, name, age, friends)
    this.sno = sno
    this.score = score
}

// 改写Student的原型对象
// 创建一个对象，该对象的隐式原型指向Person的原型对象，赋值给Student的原型
Student.prototype = Object.create(Person.prototype)
//解决Student的原型中的constructor指向Person的问题
Object.defineProperty(Student.prototype, "constructor", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: Student
})

Student.prototype.studying = function() {
    console.log("studying~");
}

var stu = new Student("why", 18, ['kobe'], 111, 100)
console.log(stu) 
stu.studying() //studying~
stu.running() //running~
stu.eating() //eating~
```

### 10.7 原型内容补充

**1、hasOwnProperty**

判断对象是否有一个属于自己的属性（不是在原型上的属性）

```js
var obj = {
    name: 'linming',
    age: 18
}

var info = Object.create(obj, {
    address: {
        value: "上海市",
        enumerable: true
    }
})
//注：Object.create的第二个参数，是给info对象直接添加上去的属性，不在原型上


console.log(obj.hasOwnProperty("address")) //true
console.log(obj.hasOwnProperty("name")) //false
```

**2、in操作符**

判断某个属性是否在某个对象或者对象的原型上

```js
console.log("address" in info) //true
console.log("name" in info) //true
```

**3、for...in**

该遍历操作可以遍历出原型上的属性

```js
for (let key in info) {
    console.log(key)
}
// address name age
```

**4、instanceof**

用于检测构造函数的prototype，是否出现在某个实例对象的原型链上

假设Student构造函数继承自People类

```js
var stu = new Student()

console.log(stu instanceof Student) //true
console.log(stu instanceof People)  //true
console.log(stu instanceof Object)  //true
```

### 10.8 对象-函数-原型的联系

1、对象存在**隐式原型**

```js
const obj = {}
//相当于
const obj = new Object() //new操作，使obj的隐式原型指向Object的显式原型

console.log(obj.__proto__) //顶层Object的显示原型：[Object: null prototype] {}

console.log(obj.__proto__ === Object.prototype) //true
```

2、函数存在**隐式原型**、也存在**显式原型**

隐式原型(对象)：`Foo.__proto__`

显式原型(对象)：`Foo.prototype`

```js
//为什么FOO函数也是一个对象？
let Foo = new Function()
```

Funtion是Foo的父类（同时，Function本身也是一个对象、也是一个构造函数）

函数的显式原型与隐式原型是不相等的

```js
console.log(Foo.__proto__ === Foo.prototype) //false
```

```js
//Foo.protorype来自哪里
//答案：创建一个函数时，js引擎自动为其添加的
Foo.prototype = { constructor: Foo }
```

```js
//Foo.__proto__来自哪里
//答案：new Function()，即Function对象的显式原型
// Foo.__proto__ === Function.prototype
```

3、关系图

特别注意：

A、`Function.__proto__ === Function.prototype`（自己创造了自己）

B、Object函数对象也可以理解成`const Object = new Function()`,所以它的隐式原型指向Function的显式原型

<img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\原型链4.jpg" style="zoom:50%;" />

创建一些实例，其指向关系如何

<img src="C:\Users\mzlin\Desktop\mzlin-notes\img\js高级\原型链5.jpg" style="zoom:50%;" />

**总结**

```js
1、对象
在js中,每个对象都存在一个隐式原型，默认是一个空对象，可以通过.__proto__访问
当我们访问js对象中的属性时，如果对象自身没有，则会沿着隐式原型查找，找到则返回，直到顶层对象的显示原型

2、函数
函数因为本质也是对象，所以也存在隐式原型
同时函数也存在显示原型，通过prototype访问，显示原型里有一个constructor属性指向函数本身,同时因为显示原型也是一个对象，它也包含了隐式原型，这个隐式原型指向了顶层对象的原型

3、顶层Object
顶层Object是一个构造函数，它的显示原型中存在很多的方法，例如toString等
它的隐式原型是null

4、构造函数
当我们创建一个实例对象时，默认这个实例对象的隐式原型会指向构造函数的显示原型。所以我们可以通过原型链一层层地查找想要的属性，直到顶层Obecjt
```





### 十一、其他



#### 2、async和await

**简单总结**：

1、async和await是用来处理异步函数的

2、promise通过then链来解决多层回调问题，async和await可以进一步优化它

3、async是“异步”的简写，await是“async wait”的简写

4、async用于声明一个function是异步的，await用于等待一个异步方法执行完成的

5、await只能出现在async的函数中

**async基本使用**

我们来对比一下普通函数与async的区别

```javascript
    // 普通函数声明
    function timeout1 () {
        return 'hello wolrd'
    };

    // async函数声明
    async function timeout2 () {
        return 'hello world'
    }

    // 两者的结果
    console.log(timeout1());  //输出：hello world
    console.log(timeout2());  //输出：promise对象
```

async的用法很简单，在函数前面加上这一关键字，按着平时使用函数的方式去使用它。

async返回一个promise对象，如果要获取结果，就可以使用then方法了

```javascript
    timeout2().then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
```

值得注意的是：async函数返回一个promise对象，如果在函数return一个直接量，async会把这个直接通过promise.resolve()封装成Promise对象。如果函数内部出错了，则调用promise.reject，也是返回一个promise对象

```javascript
async function timeout(flag) {
    if (flag) {
        return 'hello world'
    } else {
        throw 'my god, failure'
    }
}
console.log(timeout(true))  // 调用Promise.resolve() 返回promise 对象。
console.log(timeout(false)); // 调用Promise.reject() 返回promise 对象。
```

**await基本使用**

await后边可以放任何表达式，不过放的更多的返回一个promise对象的表达式。注：await关键字只能放在async函数里边。

案例解析

现在写一个函数，让它返回promise 对象，该函数的作用是2s 之后让数值乘以2

```javascript
    function mult (num) {
        return new Promise((resolve,reject) =>{
            setTimeout(() =>{
                resolve(num *2);
            },2000)
        })
    } 

    async function getResult (num) {
        const res = await mult(num);
        console.log(res);
    }

    getResult(44) //2s后输出88
```

执行过程：调用了getResult函数，它里边遇到了await，代码暂停到了这里不再向下执行。只有等到它后边的promise对象执行完毕，拿到promise resolve的值并进行返回，它才继续向下执行。

注：如果await等到的不是一个promise对象，那么await表达式的运算结果就是它等到的东西；如果等到了promise，它会阻塞后边的代码，等着promise对象resolve，然后得到resolve的值，作为await表达式的运算结果

就这一个函数，我们可能看不出async/await 的作用，如果我们要计算3个数的值，然后把得到的值进行输出呢？

```javascript
    async function getResult () {
        const firstRes = await mult(20);
        const secondRes = await mult(30);
        const thirdRes = await mult(40);
        console.log(firstRes+secondRes+thirdRes); //6s后输出180
    }

    getResult()
```

可以想象，如果上边的代码用then链来写，是特别不优雅的。而使用async和await看起来就像在使用同步代码一样

#### 4、promise对象

**promise两个特点**

1、对象的状态不受外界的影响。只有异步操作可以决定当前是哪一种状态，任何其他操作都无法改变这个状态

2、一旦状态改变就不会再改变，任何时候都可以得到这个结果

**promise三种状态**

+ pending：等待状态，比如正在进行网络请求，或者定时器没有到时间
+ fulfilled：满足状态，当我们主动回调了resolve时，就处于该状态，并且会回调.then()
+ rejected:拒绝状态，当我们主动回调了reject，就处于状态，并且会回调.catch()

**基本用法**

```js
let promise = new Promise((resolve,reject) {
    //...some code
    if (/*异步操作成功*/) {
    resolve(value)
} else {
    reject(err)
}              
})
```

调用resolve函数和reject函数时带有参数，那么这些参数会被传递给回调函数

1、resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从pending变为fulfilled），在异步操作成功时调用，并将异步操作的结果作为参数传递出去；

2、reject函数的作用是，将Promise对象的状态从“未完成”变成“失败”（即从pending变为rejected），在异步操作操作失败时调用，并将异步操作报出的错误作为参数传递出去

**promise新建后会立即执行**

```js
//请打印下面代码的执行顺序
let promise = new Promise(function(resolve, reject) {
    console.log('Promise')
    resolve()
})

promise.then(function() {
    console.log('Resolved')
})

console.log('Hi！')

//输出：
//Promise
//Hi!
//Resolved
```

**promise.all()方法**

 该方法的作用是将多个`Promise`对象实例包装，生成并返回一个新的`Promise`实例。 

```js
Promise.all([
    new Promise((resolve, reject) => {
        resolve("hello")
    }),
    new Promise((resolve, reject) => {
        resolve("world")
    })  
]).then(res => {
    console.log(res);
})

//输出：[ 'hello', 'world' ]
```

**promise.race()方法**

只要p1,p2,p3中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的Promise实例的返回值就传递给P的回调函数

```js
Promise.race([
    new Promise((resolve,reject) => {
        setTimeout(() => {
           resolve("p1")
        }, 1000);
    }),
    new Promise((resolve,reject) => {
        setTimeout(() => {
           resolve("p2")
        }, 2000);
    }),
    new Promise((resolve,reject) => {
        setTimeout(() => {
           resolve("p3")
        }, 3000);
    }),
]).then((res) => {
    console.log(res);
})

//输出：p1
```

**promise.resolve()**

有时需要将现有对象转成Promise对象，该方法就起到这个作用

```js
Promise.resolve('foo')
//等价于
new Promise (resolve => resolve('foo'))

//所以
Promise.resolve('foo').then(res => {
    console.log(res);
}) //输出foo
new Promise (resolve => resolve('foo')).then(res => {
    console.log(res);
}) //输出foo
```

注：立即resolve的Promise对象是在本轮“事件循环”结束时，而不是在下一轮“事件循环”开始时

```js
//打印下方代码的输出顺序

setTimeout(() => {
    console.log("three");
}, 0);

Promise.resolve().then(() => {
    console.log("two");
})

console.log("one");

//输出：one 、two 、three
```



#### 5、Proxy代理

proxy可以理解成在目标对象前架设一个“拦截”层，外界对该对象的访问都必须先通过这层拦截，因此提供了一种机制可以对外界的访问进行过滤和改写

**1、创建proxy实例**

`var proxy = new Proxy(target, handler)`

其中，target参数表示所要拦截的目标对象，handler参数也是一个对象，用来定制拦截操作

如果handler没有设置任何拦截，那就等同于直接通向原对象

**2、proxy实例的方法——get（）**

get方法用于拦截某个属性的读取操作

```js
        let person = {
            name: "张三"
        }
        var proxy = new Proxy (person, {
            get: function(target, key) {
                if(property in target) {
                    return target[key]
                } else {
                    throw new ReferenceError("出错啦")
                }
            }
        })
        // console.log(proxy.name)
        // console.log(proxy.age) //报错
```

如果没有这个拦截器，访问不存在的属性只会返回undefined

**3、set（）方法**

set（）方法用于拦截某个属性的赋值操作

```js
//假定obj对象有一个age属性，要求该属性是一个不大于150的整数，可以使用proxy对象保证age的属性符合要求

        handler = {
            set: function(obj, key, value) {
                if (key ==='age') { //如果属性名为age
                    if (!Number.isInteger(value)) { //如果值不为整数
                        throw new TypeError('the age is not a integer')
                    }
                    if (value > 150) { // 如果值大于150
                        throw new RangeError('the age seems invalid')
                    }
                }
                obj[key] = value
            }
        }
        const proxy = new Proxy({}, handler)
        console.log(proxy.age = 100); //100
        console.log(proxy.age = 151); //报错 the age seems invalid
```

另外一个案例

```js
//防止对象中，属性名的第一个字符以下划线开头的属性，被外部读取，修改
function invariant(key, action) {
    if(key[0] === "_") {
        throw new Error('Invalid attempt to ${action} private "${key}" property')
    }
}

let handler = {
    get(target, key) {
        invariant(key, 'get'); //执行时抛出错误，不再执行下文
        return target[key]
    },
    set(target, key, value) {
        invariant(key, 'get') //执行时抛出错误，不再执行下文
        target[key] = value
        return true
    }
}

const proxy = new Proxy({},handler)
console.log(proxy._aa); //报错
console.log(proxy._bb = 'haha') //报错
```

**4、has方法**

has方法用来拦截HasProperty操作，即判断对象是否具有某个属性，这个方法会生效

```js
let handler = {
    has (target, key) {
        if (key[0] === '_') {
            return false
        }
        return key in target
    }
}

let target = {
    _prop : 'foo', //不允许被in运算符发现
    prop : 'foo'
}

let proxy = new Proxy(target, handler)
console.log('prop' in proxy);
console.log('_prop' in proxy);
```

**5、deleteProperty方法**

该方法用于拦截delete操作，如果这个方法排抛出错误或者返回false，当前属性就无法被delete命令删除

```js
let handler = {
    deleteProperty (target, key) {
        invariant (key, 'delete')
        return true
    }
}

let target = {
    _prop : 'foo'
}
let proxy = new Proxy(target, handler)
console.log(delete proxy._prop);
```

**this问题**

在proxy代理情况下，目标对象内部的this关键字会指向proxy代理

```js
const target = {
    m: function () {
        console.log(this === proxy);
    }
}

const handler = {}
const proxy = new Proxy(target, handler)
target.m() //false
proxy.m() //true
```



#### 6、遍历器itertator

**概念**

迭代器（iterator）是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构，只要部署了iterator接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）

**作用**

1、为各种数据结构提供统一的、简便的访问接口；

2、使得数据结构的成员能够按某种次序排序

3、ES6创造了一种新的遍历命令-for..of 循环，iterator接口主要供for...of消费

**遍历过程**

1、创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象的本质就是一个指针对象

2、第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员

3、第二次调用指针对象的next方法，指针就指向数据结构的第二个成员

4、不断调用指针对象的next方法，直到指向数据结构的结束位置

每次调用next方法，就会返回当前成员的信息。具体来说，就是返回一个包含value和done两个属性的对象

**案例**

```js
// 定义遍历器生成函数
function makeIterator (array) {
    let nextIndex = 0;
    return {
        next: function () {
            return nextIndex < array.length? 
            {value: array[nextIndex++], done: false} :
            {value: undefined, done: true}
        }
    }
} 
let example = makeIterator(["a","b"])
console.log(example.next()); //{value: "a", done: false}
console.log(example.next()); //{value: "b", done: false}
console.log(example.next()); //{value: undefined, done: true}
```

**默认Iterator接口**

数据结构只要部署了iterator接口，我们就称这种数据结构为“可遍历”的

ES6规定，默认的iterator接口部署在数据结构的Symbol.iterator属性，或者说，一个属性结构只要有了Symbol.iterator，就是“可遍历的”

原生具备Iterator接口的数据结构如下：

+ Array
+ Map
+ Set
+ String
+ TypedArray
+ 函数的argument对象
+ NodeList对象

**for...of循环**

数据结构只要部署了Symbol.iterator属性，就视为部署了iterator接口，可以使用for...of循环

适用范围：数组、Set、Map、某些类似数组的对象、generator对象、字符串

#### 7、Generator函数

Generator函数是es6提供的一种异步编程解决方案，语法行为与传统函数完全不同

执行generator函数会返回一个**遍历器对象**，也就是说，generator函数除了是状态机，还是一个遍历器对象生成的函数，返回的遍历器对象可以一次遍历generator函数内部的每一个状态

```js
function * helloWorldGenerator () {
    yield 'hello'
    yield 'world'
    return 'ending'
}

let hw = helloWorldGenerator()
console.log(hw); //返回一个iterator对象
```

调用`helloWorldGenerator()`后，函数并不执行，而是返回一个执行内部状态的指针对象（遍历器对象）

```js
console.log(hw.next());
console.log(hw.next());
console.log(hw.next());
console.log(hw.next());
//输出 {value: "hello", done: false}
//输出 {value: "world", done: false}
//输出 {value: "ending", done: true}
//输出 {value: undefined, done: true}

//value属性表示当前的内部状态的值，是yield语句后面那个表达式的值，done属性是一个布尔值，表示是否遍历结束
```

使用遍历器对象的next方法，使得指针指向下一个状态，也就是说，每次调用next方法，内部指针就从函数头部或者上一次停下来的地方开始执行，直到遇到下一条yield（或return语句）。换言之，Generator函数是分段执行的，yield语句是暂停执行的标记，而next方法可以回复执行

**关于yield表达式**

1、遇到yield语句就暂停执行后面的操作，并将紧跟在yield后的表达式的值作为返回的对象的value的属性值

2、如果没有yield语句，就一直执行到函数结束，直到遇到return语句

3、如果没有遇到return语句，则返回对象的value属性值为undefined

注：yield表达式只能在generator中使用

**与iterator接口的关系**

由于Generator函数就是遍历器生成函数，因此可以把Generator赋值给对象的Symbol.interator属性，从而使该具有iterator接口

```js
let myIterator = {}

myIterator[Symbol.iterator] = function * () {
    yield 1
    yield 2
    yield 3
}

console.log([...myIterator]); //[1, 2, 3]
```

前面说过对象是不具有iterator接口的，也不可被for..of遍历，但是通过上边的**Generator赋值给对象的Symbol.interator属性**，使得对象变为可遍历的

**遍历generator函数**

for...of, 扩展运算符，Array.from（）方法都是调用iterator接口，也就是可以用来遍历generator

```js
function * numbers () {
    yield 1
    yield 2
    yield 3
    return 4
}
console.log([...numbers()]);
for(let i of numbers()) {
    console.log(i);
}
console.log(Array.from(numbers()));

//均能够遍历出 1,2,3
```

为什么没有4呢？因为当遇到return时，done的状态改为true，表示遍历结束


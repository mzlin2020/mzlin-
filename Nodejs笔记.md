Nodejs笔记

## 一、初识Node

Node.js是一个基于V8 JavaScript引擎的JavaScript运行时环境



### 1.1 浏览器

**浏览器内核**

+ Gocko：早期被Netscape 和Firefox浏览器使用
+ Trident：微软开发，被应用于IE4-IE11浏览器使用，但是Edge浏览器已经转向Blink
+ Webkit：苹果基于KHTML开发、开源，用于Safari、Google Chrome往前的版本也在使用
+ Blink：Webkit的一个分支，Google开发，目前应用于Google Chrome、Edge、Opera

事实上，我们经常说的浏览器内核指的是浏览器的排版引擎（渲染引擎）



**渲染引擎的工作过程**

![](img/node/image-20210611121835498.png)

我们知道，浏览器在执行代码时，会将html代码编译成DOM Tree，如果在编译过程中，遇到了js代码，就会停下来去编译js代码，为什么？

因为js代码可以操作DOM，所以浏览器将HTML解析的DOM和JavaScript操作之后的DOM放在一起来生成最终的DOM树，而不是频繁的去生成新的DOM树。

js代码的执行需要JavaScript引擎

**JavaScript引擎**

为什么需要JavaScript引擎呢？

1、事实上我们编写的JavaScript无论是交给浏览器或者Node执行，最后都是需要被CPU执行的

2、但是CPU只认识自己的指令集（机器语言）

3、所以我们需要JavaScript引擎帮助我们将JavaScript代码翻译成CPU指令来执行



常见的JavaScript引擎：

a、SpiderMonkey：初代JavaScript引擎，由Brendan Eich开发（JavaScript作者）

b、Chakra：微软开发，用于ie浏览器

c、JavaScriptCore：WebKit中的JavaScript引擎、Apple公司开发

d、**V8**：Google开发的强大的JavaScript引擎



### 1.2 基本使用

如何通过node执行js代码？

+ 方式一：将代码交给浏览器
+ 方式二：将代码载入到node环境中执行



如果希望把js文件交给node执行，需要在终端命令`node js文件名`的方式来载入和执行对应的js文件

```javascript
//方式二
//终端 执行index.js
node index.js
```



**Node的REPL**

node提供也一个REPL交互环境，可以在其中演练简单的代码

通过在终端输入`node`命令开启



### 1.3 传递参数

在某些情况下，我们需要给node传递一些参数

```javascript
//传递linming、age=18
node index.js linming age=18 
```

这样子来传递参数其实是存放于全局对象process中的（内置process中的argv属性）

我们可以在index.js中将argv中的参数遍历出来

```java
// 打印全局对象
// console.log(process);

process.argv.forEach(item=>{
    console.log(item);
})
```



### 1.4 常见的全局对象 

**__dirname**

获取当前文件所在的路径

```javascript
console.log(__dirname);
//输出：C:\Users\Administrator\Desktop\Nodejs\code\01-基础
```



**__filename**

获取当前文件所在的路径和文件名称

```javascript
console.log(__filename);
//输出：C:\Users\Administrator\Desktop\Nodejs\code\01-基础\index.js
```



**process对象**

process提供了node进程中相关的信息。比如node的运行环境、参数信息等



**console对象**

提供了简单的调试控制台

1、console.log

最常用的输出内容的方式

2、console.clear

清空控制台 `console.clear();`

3、console.trace

打印函数的调用栈



**定时器函数**

1、setTimeout（callback，delay）

延迟一些时间后执行一次



2、setInterval（callback，delay）

每隔多长时间重复执行一次



3、setImmediate（callback[,...args]）

callback的 I/O事件后的回调的“立即”执行。区别于setTimeout



4、process.nextTick（callback[,...args]）

添加到下一次的tick队列中



**global对象**

global是一个全局对象，上边提到的process、console、setTimeout等都被放在global中

注意：global与window对象是不同的

在浏览器中，全局变量都是在window上的，比如document、setInterval、setTimeout、alert、console等等。在node中，也有一个类似的global对象，里边存放了许多其他对象。



## 二、JavaScript的模块化

### 2.1 CommonJS规范

CommonJS是一个规范，最初提出来是在浏览器以外的地方使用，并且当时被命名为ServerJS，后来为了体现它的广泛性，修改为CommonJS。

Node是CommonJS在服务器端的一个具有代表性的实现。

1、在node中每一个js文件都是一个单独的模块

2、这个模块中包括CommonJS规范的核心变量：exports、module.exports、require



**exports与require**

案例理解

创建main.js 与bar.js ，在main.js中导入bar.js模块



```javascript
//main.js

// require("./bar") 相当于导入了exports（本质是指向了与exports一样的内存地址）

//这里变量bar==exports （也指向了与exports一样的对象）
const bar = require('./bar')

// 这里利用了ES6的解构赋值
// const {name,age,fn} = require('./bar')

console.log(bar.name);
console.log(bar.age);
bar.fn();
```

```javascript
//bar.js
const name = "linming";
const age = 18;

function fn() {
    console.log("hello " + name);
}

//exports默认是一个全局空对象
exports.name = name;
exports.age = age;
exports.fn = fn;
```



从上面的例子我们可以知道，exports是一个默认存在的空的对象，我们向外导出的变量变成了exports的属性（方法），用require导入的其实就是exports这个对象。



**module.exports**

在Node中我们进行导出时，往往不用exports，而是通过module.exports导出的。

那么exports与module.exports有什么关系吗?

1、CommonJS中是没有module.exports这个概念的，但是为了实现模块的导出，Node中使用的是Module的类，每一个模块都是module的一个实例。

2、所以在Node中真正用于导出的其实根本不是exports，而是module.exports

在Node源码中规定`module.exports = exports`，所以二者指向同一个引用。即**module.exports = exports=require（）**



**require细节**

require是一个函数，可以帮助我们引入一个文件（模块）中导入的对象。

require的查找规则是怎么样的呢？

requiere（X）

1、情况一：

X是一个核心模块，比如path。那么直接返回核心模块，并停止查找

2、情况二：

X是以 ./ 或 ../ 或 / 开头的

查找规则：将X当做一个文件在对应目录下查找，如果有拓展名，按照拓展名查找；没有拓展名，则查找文件X>查找X.js >查找X.json > 查找X.node文件，直到找到为止。或者将X当做一个文件夹查找，会依次去查找上述规则文件夹下的index.js文件

3、情况三：

直接是一个X（没有路径），并且X不是一个核心模块

查找规则：会循着文件路径，依次去每个文件夹下的node_modules文件夹下查找。



**模块的加载过程**

结论一：模块在被第一次引入时，模块中的js代码会被运行一次

结论二：模块被多次引入时，会缓存，最终只加载（运行）一次

为什么只加载一次呢？因为每个模块对象module都有一个属性loaded，默认为false，为true时表示已经被加载了

结论三：存在循环引用、也只加载一次。而且按照的是图结构的深度优先搜索的顺序



**CommonJS规范的缺点**

1、CommonJS加载模块是同步的。

这意味着只有等到对应的模块加载完毕，后续的内容才能被运行（从上往下），这在服务器中不会有什么问题，因为服务器加载的js文件都是本地文件，加载速度非常快。

但是如果它应用于浏览器。因为浏览器需要从服务器中将文件下载下来，再运行。采用同步的方式则意味着之后的js代码无法正常运行。



### 2.2 ES Module

ES Module与CommonJS的模块化有一些不同之处

1、它使用了import和export关键字

2、另一方面它采用编译期的静态分析，并且加入了动态引用的方式。

3、采用ES Module将**自动**采用严格模式： use strict

4、ES Module加载模块是异步的



**导入导出的三种方式**

注：es6的模块化需要在服务器上运行才有效。（使用vscode的live serve插件）

```javascript
//创建index.html
<body>
    <script src="./index.js" type="module"></script>
</body>
```

注：下面的演示，并不是一一对应关系

1、方式一

```javascript
//foo.js
//在语句声明的前面直接加上export关键字
export const name = 'linming';
export const age = 18;
export const sayHello = function (name) {
    console.log("你好"+name);
}

//index.js
//import {标识符列表} from '模块'
import { name,age,sayHello } from "./js/foo.js"; //拓展名不能省
console.log(name);
console.log(age);
sayHello('lin')
```



2、方式二

```javascript
//foo.js
//将所有需要导出的标识符，放到export后面的 {}中
const name = 'linming';
const age = 18;
const sayHello = function (name) {
    console.log("你好"+name);
}
export {name,age,sayHello}
// 注：{}中统一导出，{}大括号不是一个对象

//index.js
//导入时给标识符起别名
import {name as wName, age as wAge, sayHello as Wfn} from './js/foo.js'
console.log(wName);
console.log(wAge);
Wfn('linming')
```



3、方式三

```javascript
//foo.js
//导出时给标识符起一个别名
export {
	name as fName,
    age as fAge,
    sayHello as fFn
}

//index.js
//通过 * 将模块功能放到一个模块功能对象（a module object）上
import * as obj from './js/foo.js'
console.log(obj.fName);
console.log(obj.fAge);
obj.fFn('linming')
```



**default用法**

前面学习的导出功能都是有名字的导出，比如导出

```javascript
export const sayHello = function () {}
//在导出时指定了名字，在导入import时需要知道具体的名字
```

但是，默认导出（default export）可以不用指定名字，并且在导入时可以自己来指定名字。

```javascript
//导出
export default function () {}
//导入import fn from '路径'
```

注：在一个模块中，只能有一个默认导出



**Node对ES Module的支持**

在Node的current版本（v14.13.1）中，支持es module。

方式一：在package.json中配置 type：module

方式二：文件以.mjs结尾，表示使用的是ES Module



```javascript
//演示方式二
//js/bar.mjs
const name = 'ming';
const sayHello = function (name) {    
    console.log("你好" + name);}
export {
	name,
    sayHello
}

//main.mjs
import { name,sayHello } from "./js/bar.mjs";
console.log(name);
sayHello("明明");
```



## 三、常见的内置模块

### 3.1 path

**resolve**

path模块用于对路径和文件进行处理，提供了很多很好用的方法

例如：不同操作系统上的路径可能是不同的"\\", "/" ,"\\\\" ，如果项目想要部署到不同的系统，直接使用原先的路径可能是错误的。但是利用path可以屏蔽他们之间的差异。

```javascript
const path = require('path');
const basePath = '/User/lingming';
const fileName = 'test.vue';

// 拼接路径：通过拼接字符串的方式（不推荐）
// const myPath = basePath + '/' + fileName;

const myPath = path.resolve(basePath,fileName);
console.log(myPath);
```



**dirname、basename、extname**

1、dirname:获取文件的父文件夹

```javascript
const path = require('path');
// 定义路径信息
const filepath = '/User/ming/index.js';

// 获取文件的父文件夹
console.log(path.dirname(filepath));
//输出：/User/ming
```

2、basename：获取文件名

```javascript
const path = require('path');

// 定义路径信息
const filepath = '/User/ming/index.js';

// 获取文件名
console.log(path.basename(filepath));
//输出：index.js
```

3、extname：获取文件拓展名

```javascript
const path = require('path');

// 定义路径信息
const filepath = '/User/ming/index.js';

// 获取文件拓展名
console.log(path.extname(filepath));
//输出： .js
```



**join**

用于路径拼接

```javascript
const path = require('path');
const basepath = 'User/ming/';
const filename = '/index.js';

const filepath = path.join(basepath,filename);
console.log(filepath);
```

join 与 resolve的区别

resolve会判断拼接的路径的字符串中，是否有以./或../或/开头的路径

```javascript
const filepath2 = path.resolve(basepath,filename);
console.log(filepath2);
```



### 3.2 fs文件系统

fs（File System），表示文件系统

对于任何一个为服务器端服务的语言或者框架通常都会有自己的文件系统。

1、因为服务器需要将各种数据、文件等放置到不同的地方。

2、比如用户数据可能大多数是放到数据库中的

3、比如某些配置文件或者用户资源（图片、音视频）都是以文件的形式存在于操作系统上的



Node也有自己的文件系统操作模块，就是fs：

1、借助Node帮助我们封装的文件系统，我们可以在任何操作系统（window、Mac OS、Linnx）上面直接去操作文件

2、这也是Node可以开发服务器的一大原因，也是它可以成为前端自动化脚本等热门工具的原因



fs文件系统的API大多数都提供三种操作方式

1、方式一：同步操作文件：代码会被阻塞，不会继续执行；

2、方式二：异步回调函数操作文件：代码不会被阻塞，需要传入回调函数，当获取到结果时，回调函数被执行

3、方式三：异步Promise操作文件：代码不会被阻塞，通过fs.promises调用方法操作，会返回一个promise，可以通过then、catch进行处理。

案例分析

```javascript
const fs = require('fs');
// 方式一：同步读取文件
const state = fs.statSync('./abc.txt')
console.log(state);
console.log('后续代码执行');
```

```javascript
// 方式二：异步读取
fs.stat('./abc.txt',(err,state)=>{
    if(err){
        console.log(err);
        return
    }
    
console.log(state);})
console.log('后续代码执行');
```

```javascript
// 方式三：promise方式
fs.promises.stat('./abc.txt').then(state=>{
    console.log(state);
}).catch(err=>{
    console.log(err);
})

console.log("后续代码执行");
```



**文件描述符**

为了简化用户工作，Node.js抽象出操作系统之间的特定差异，并为所有打开的文件分配一个数字型的文件描述符。

**fs.open()**方法用于分配新的文件描述符，一旦被分配，则文件描述符可用于从文件读取数据，向文件写入数据，或请求关于文件的信息。

```javascript
fs.open('./abc.txt',(err,fd)=>{
    if(err){
        console.log(err);
        return
    }
    console.log(fd);// 这里该文件被分配了3
    })
```

```javascript
fs.open('./abc.txt',(err,fd)=>{
    if(err){
        console.log(err);
        return
    }
    // 打印文件描述符
    console.log(fd);
    // 通过描述符去获取文件的信息
    fs.fstat(fd,(err,info)=>{
        console.log(info);
    })})
```



**文件的读写**

如果我们希望对文件的内容进行操作，这个时候可以使用文件的读写



1、fs.writeFile(file,data [,options] ,callback) :在文件中写入内容

可选[,options]有两个参数：flag（写入的方式）、encoding（字符的编码）

```javascript
// 文件的写入
const content = "为了更好的明天而战！"
fs.writeFile('./abc.txt',content,err=>{
    console.log(err);
})
```

在文件后面追加

```javascript
// 文件的写入
const content = "为了更好的明天而战！"
fs.writeFile('./abc.txt',content,{flag:"a"},err=>{
    console.log(err);
})
```



2、fs.readFile(path [,options],callback) :读取文件的内容；

```javascript
// 文件的读取
fs.readFile('./abc.txt',{encoding:'utf-8'},(err,data)=>{
    console.log(data);
})
```



参数：flag选项

+ w打开文件写入，默认值（会覆盖原有的内容）
+ w+打开文件进行读写，如果文件不存在则创建文件
+ r+打开文件进行读写，如果不存在那么抛出异常
+ r打开文件读取，读取文件时的默认值
+ a打开要写入的文件，将流放在文件末尾。如果不存在则创建文件
+ a+打开文件以进行读写，将流放在文件末尾。如果不存在则创建文件

参数：encoding选项

目前普遍采用utf-8字符编码

如果不填写encoding，则返回的结果是Buffer



**对文件夹的操作**

1、创建文件夹

```javascript
// 创建文件夹
const dirname = './ming';
if(!fs.existsSync(dirname)){
    //如果不存在相同的文件名
    fs.mkdir (dirname,err =>{
        console.log(err);
    })}
```

2、读取文件夹下的所有文件

```javascript
const dirname = './ming';
fs.readdir(dirname,(err,files) => {
    console.log(files);
})
```

但是如果文件夹下包含了其他文件夹呢？用上边的方法读取不会去读取其他文件夹里边的文件

```javascript
const dirname = './ming';

function getFiles(dirname) {
    fs.readdir(dirname,{withFileTypes:true},(err,files) => {
        for(let file of files) {
            if (file.isDirectory()) {
                const filepath = path.resolve(dirname,file.name);
                getFiles(filepath);
            }else {
                console.log(file.name);
            }
        }
    })
}
getFiles(dirname)
```

3、文件夹重命名

```javascript
// 文件夹重命名
fs.rename('./ming','./linming',err=>{
    console.log(err);
})
```



**其他常用API**

+ writeFile 从指定文件中读取数据
+ appendFile 追加的方式向指定文件中写入数据
+ copyFile 将某个文件中的数据拷贝至另一个文件
+ watch File 对指定文件进行监控



### 3.3 events模块

Node中的核心API都是基于异步事件驱动的：

1、在这个体系中，某些对象（发射器（Emiters））发出一个事件，我们可以监听这个事件（监听器（listeners），并且传入的回调函数，这个回调函数会在监听到事件时调用；

2、发出事件和监听事件都是通过EventEmiter类来完成的，他们都属于events对象

a、emitter.on( eventName,listener) ：监听事件，也可以使用addListener

b、emitter.off( eventName,listener) ：移除事件监听，也可以使用removeListener

c、emitter.emit(eventName [,args]) ：发出事件，可以携带一些参数

```javascript
// 1、创建发射器
const emitter = new EventEmitter()

// 2.监听某一个事件
emitter.on('btnClick',(args)=>{
    console.log('监听到了',args);
})
// 发出某一个事件
setTimeout(()=>{
    emitter.emit('btnClick',{name:"linming"});
},2000)
```

停止监听某一事件，需要写成以下写法

```javascript
emitter.on('btnClick2',(args)=>{
    console.log('监听到了',args);})

const listener2 = (args) =>{
    console.log('监听到了',args);
}

emitter.on('btnClick',listener2)

setTimeout(()=>{
    emitter.emit('btnClick',{name:"linming"});
    emitter.emit('btnClick2',"linming");
    emitter.off('btnClick',listener2);
},2000)
```



## 四、包管理工具npm

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

8、devDependencies属性——通过npm install ** --save -dev 安装我的包，开发时依赖，项目上线后不需要

**版本管理的问题**

我们安装的版本依赖：^2.0.3 或者 ~2.0.3 这是什么意思呢？



npm的包通常需要遵从semver版本规范

1、X主版本号：当发布了不兼容之前版本的API修改（如webpack4升级到webpack5）

2、Y次版本号：当做了向下兼容的功能性新增（新功能增加）

3、Z修订号：当做了向下兼容的问题修正（没有新功能，修复之前版本的bug）



^ 和 ~ 的区别

1、^x.y.z：表示x是保持不变的，y和z永远安装最新的版本；

2、~x.y.z：表示x和y保持不变的，z永远安装最新的版本



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

清除缓存：`npm cache clean	 `



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



## 五、构建脚手架工具

**创建项目**

1、index.js

```javascript
#!/usr/bin/env node
console.log("实现自己的命令：执行index.js");
```

2、创建package.json，并修改

```javascript
  "bin": {
    "mzlin": "index.js"
  },
```

3、执行 npm link

这样子就可以在终端通过`mzlin`来执行index.js文件了



**定义version与help**

`npm install commander -g`

查看版本号

```javascript
const program = require('commander')
// 定义版本号
program.version(require('./package.json').version)

// 解析终端指令
program.parse(process.argv)
```



增加其他的options

```javascript
//index.js
#!/usr/bin/env node
const {helpOptions} = require('./lib/core/help.js')

// 帮助可选信息
helpOptions();

// 解析终端指令
program.parse(process.argv)

//help.js
const program = require('commander')
function helpOptions () {
    // option选项
    program.option('-m --mzlin','a mzlin option');
    program.option('-s --src <src>','a source folder')
    program.option('-d --dest <dest>','a destination dolder 例如: -d src/pages')
    // 监听--help的执行，并回调函数
    program.on('--help',function() {
        console.log("");
        console.log("other:");
        console.log('  other options~');
    })}

module.exports = {
    helpOptions
}
```



**创建项目指令**

思路：

1、创建解析create指令

2、通过download-git-repo从代码仓库中下载模板

3、进入目录并执行npm install命令

4、执行npm run serve 命令、打开浏览器

```javascript
//1.创建解析create指令
//create.js
const program = require('commander')

// 将action的代码逻辑抽离出去   
const {
    createProjectAction
} = require('./actions')

const createCommands = () => {
    // 创建create指令
    program
        .command('create <project> [others...]')
        .description('clone a repository into a folder')
        .action(createProjectAction)
}

module.exports = {
    createCommands
}

//index.js
const {createCommands} = require('./lib/core/create')
// 执行创建的命令
createCommands()
```



```javascript
//2、通过download-git-repo从代码仓库中下载模板

```

后续学习......





## 六、buffer

### 6.1buffer与二进制

对于前端开发来说，通常很少会和二进制打交道，但是对于服务器端为了做很多的功能，我们必须直接去操作其二进制的数据。

所以，Node为了方便开发者完成更多的功能，提供了一个类Buffer，并且是全局的。

Buffer中存储的是二进制数据，是怎样存储的呢？我们可以将Buffer看成是一个存储二进制的数组，这个数组中的每一项，都可以保存8位二进制：00000000

```javascript
//将字符串放进buffer中
const message = 'hello';

// 创建方式一  （该方式已过时）
const buffer1 = new Buffer(message);
console.log(buffer1);

//创建方式二 推荐
const buffer2 = Buffer.from(message);
console.log(buffer2);
//输出 <Buffer 68 65 6c 6c 6f>
//一个字母对应一个16进制（默认使用了utf-8）
```

如果存储的是中文呢

```javascript
const message2 = '你好';
const buffer3 = Buffer.from(message2);
console.log(buffer3);
//输出：<Buffer e4 bd a0 e5 a5 bd>
//一个中文对应3位16进制（默认使用了utf-8）

//解码 :buffer -> string
const str = buffer3.toString('utf8')
console.log(str);
```

buffer还有一种常见的创建方式：Buffer.alloc

```javascript
const buffer4 = Buffer.alloc(8);
console.log(buffer4);
//输出： <Buffer 00 00 00 00 00 00 00 00>
//创建了8位长度的buffer
```

我们可以操作其中的每一位

```javascript
buffer4[0] = 88;
console.log(buffer4);
//输出：<Buffer 58 00 00 00 00 00 00 00>
//88 转16进制 = 58

//如果直接存入88呢
buffer4[1] = 0x88;
console.log(buffer4);
//输出：<Buffer 58 88 00 00 00 00 00 00>
```



**buffer的实例方法**

+ fill 使用数据填充buffer
+ write 向buffer中写入数据
+ toString 从buffer中提取数据
+ slice 截取buffer
+ indexOf 在buffer中查找数据
+ copy 拷贝buffer中的数据



**静态方法**

+ concat 拼接多个buffer
+ isBuffer 判断传入的数据是否是buffer





### 6.2 buffer与文件读取

在不写入读取文件的字符编码时，readFile不会对读取的文件进行解码，会直接返回一个buffer

```javascript
fs.readFile('./info.txt',(err,data) => {
    console.log(data)
});
//输出：<Buffer e4 bd a0 e5 a5 bd e5 95 8a ef bc 8c e6 98 8e e5 a4 a9>

fs.readFile('./info.txt',{encoding:'utf-8'},(err,data) => {
    console.log(data)
});
//输出：你好啊
```



读取图片

```javascript
fs.readFile('./头像.jpg',(err,data) => {
    console.log(data);
})
//输出：<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e1 00 bc 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 129667 more bytes>
```



```javascript
fs.readFile('./头像.jpg',(err,data) => {
    console.log(data); //输出buffer
    fs.writeFileSync('./head.jpg',data)   //将buffer重新转化为图片
})
```



事实上，我们创建Buffer时，并不会频繁向操作系统申请内存，它会默认先申请一个8*1024个字节大小的内存，即8kb。



## 七、事件循环和异步IO

### 7.1 事件循环

事件循环可以理解为我们编写的JavaScript代码和浏览器或者Node之间的一个桥梁。

+ 浏览器的事件循环是JavaScript代码和浏览器API调用（如setTimeout等）的一个桥梁。桥梁间通过回调函数进行沟通
+ Node的事件循环是JavaScript代码和系统调用（file system）之间的桥梁。桥梁间通过回调函数进行沟通

![](img/node/image-20210702232205628.png)



### 7.2 进程和线程

进程和线程是操作系统中的两个概念：

+ 进程（process）：计算机已经运行的程序。

可以认为电脑每启动一个应用程序，就会默认启动一个进程（有可能是多个）。

+ 线程（thread）：操作系统能够运行运算调度的最小单位。

启动的每一个进程中，都会对应启动一个（或多个）线程来执行其中的代码。可以说进程就是线程的一个容器。



可以这么理解，操作系统类似于一个工厂，工厂里边有很多车间，车间就相当于进程，每个车间有一个以上的工人，工人就相当于线程。



**多进程多线程开发 **

操作系统是如何做到同时让多个进程（边听歌、边写代码、边查阅资料）同时工作呢？

这是因为CPU的运算速度非常快，它可以快速的在多个进程之间迅速的切换，对于用户来说是感受不到这种快速的切换的。



**浏览器和JavaScript**

JavaScript是单线程的，JavaScript的线程有自己的容器（进程）：浏览器或者Node

+ 浏览器

目前多数的浏览器其实都是多进程的，当我们打开一个tab页面时就会开启一个新的进程，这是为了防止一个

页面卡死而造成所有页面无法响应，整个浏览器需要强制退出；

每个进程中（如每个tab页面）又有很多的线程，其中包括执行JavaScript代码的线程；



JavaScript的代码是在一个单独的线程中执行的，这就是意味着同一时刻只能做一件事，如果这件事非常耗时，就意味着当前的线程会被阻塞。



我们来看这段js代码是怎么执行的

```javascript
const name = 'linming';

console.log(name);

function sum(num1,num2) {
    return num1 + num2;
}

function bar() {
    return sum(20,30);
}

const result = bar();

console.log(result);
```

注：函数执行时，会被放入栈中执行

![](img/node/image-20210702235505735.png)

### 7.3 浏览器的事件循环

浏览器执行代码时是自上而下的

如果在执行JavaScript代码过程中，有异步操作，是怎么的一个过程呢？

比如运行一个setTimeout函数

```javascript
setTimeout(() => {
    console.log('我在事件队列中执行')
},1000)
```

1、执行时，会将该函数（setTimeout）放进调用栈中，执行**立即结束**，并不会阻塞后续代码的执行。

2、回调函数此时不会在调用栈中，等待时间一到，该回调函数会被加入到事件队列中。

3、事件队列中的任务会按照先进先出的顺序依次进行调用栈中执行。

<img src="img/node/image-20210711202035830.png" style="zoom: 50%;" />



**宏任务和微任务**

事件循环并非只维护着一个队列，事实上有两个队列

1、宏任务队列（macrotask queue）：ajsx、setTimeout、setInterval、DOM监听等

2、微任务队列（microtask queue）：Promise的then回调、Mutatation Observer API、queueMicrotask等

<img src="img/node/image-20210711203626332.png" style="zoom:67%;" />

事件循环对于两个队列的优先级是怎么样的呢？

1、main script中的代码优先执行（编写的顶层script代码）

2、在执行任何一个宏任务之前，都会先查看微任务队列是否有任务需要执行。（也就是宏任务执行之前，必须保证微任务队列是空的。如果不为空，那么优先执行微任务队列中的任务）



**面试题**

求一下代码的打印顺序

```javascript
setTimeout(function () {
    console.log("set1");
    new Promise(function (resolve) {
      resolve();
    }).then(function () {
      new Promise(function (resolve) {
        resolve();
      }).then(function () {
        console.log("then4");
      });
      console.log("then2");
    });
  });
  
  new Promise(function (resolve) {
    console.log("pr1");
    resolve();
  }).then(function () {
    console.log("then1");
  });
  
  setTimeout(function () {
    console.log("set2");
  });
  
  console.log(2);
  
  queueMicrotask(() => {
    console.log("queueMicrotask1")
  });
  
  new Promise(function (resolve) {
    resolve();
  }).then(function () {
    console.log("then3");
  });
```

1、首先在调用栈中执行setTimeout，里边的回调函数放进宏任务中

<img src="img/node/微任务宏任务1.png" style="zoom:50%;" />

2、接着执行setTimeout后的promise，打印出pr1，并将then1放进微任务

<img src="img/node/微任务宏任务2.png" style="zoom:50%;" />

3、紧着执行第二个setTimeout并跳出，并将set2放进宏任务。再直接执行log（2）函数

<img src="img/node/微任务宏任务3.png" style="zoom:50%;" />

4、执行queueMicrotask，添加进微任务

<img src="img/node/微任务宏任务4.png" style="zoom:50%;" />

5、执行最后一个promise，将then3加进微任务

<img src="img/node/微任务宏任务5.png" style="zoom:50%;" />

6、至此，开始执行微任务的回调函数

<img src="img/node/微任务宏任务6.png" style="zoom:50%;" />

7、执行完微任务，开始执行宏任务。首先执行的是set1的回调函数。打印了set1，并将里边的then2加入微任务，再将then4加入微任务

<img src="img/node/微任务宏任务7.png" style="zoom:50%;" />

8、执行微任务里边的then2、then4，此时输出：pr1、2、then1、queueMicrotask1、then3、
set1、then2、then4

9、最后回到宏任务执行set2的回调，打印出最后的set2



## 八、Stream

### 8.1 概述

stream（流）

**程序中的流**

类似于现实中的流水，源源不断地流动。可以想象当我们从一个文件中读取数据时，文件的二进制（字节）数据会源源不断的被读取到我们程序中。这一连串的字节，就是程序中的流

**理解流**

流是连续字节的一种表现形式和抽象概念，流是可读的，也是可写的

官方解释：所有的流都是EventEmitter的实例。事实上Node中很多对象都是基于流实现的，如http模块中的Request和Response对象、process.stdout对象

**为什么需要流？**

1、利用readFile和writeFile的方式读写文件无法控制一些细节的操作。

如从什么位置开始读，读到什么位置，一次性读取多少字节、读到某个位置后，暂停读取等等。

2、文件非常大，一次性读取不合适。比如一个视频文件



### 8.2 文件读写的Stream

Node.js中有四种基本流类型

1、Writable：可以向其写入数据的流

2、Readable：可以从中读取数据的流

3、Duplex：兼顾Readable和Writable

4、Transform：Duplex可以在写入和读取数据时修改或者转换数据的流



**读取文件**

```javascript
// 传统的读取文件
fs.readFile('./abc.txt',{encoding:'utf-8'},(err,data) =>{
    console.log(data);
})
//注添加编码方式，默认data是一个buffer
```

```javascript
// 流的方式读取文件
const reader = fs.createReadStream('./abc.txt',{
    start:3,
    end:6,
    highWaterMark:2
})

// 数据读取的过程
reader.on('data',(data) => {
    console.log(data);
})

// 监听流开始读取
reader.on('open',() => {
    console.log('文件被打开了');
})

// 监听流关闭
reader.on('close',() => {
    console.log('文件关闭了');
})
```

数据读取也可以中断读取pause（），恢复读取resume（）

```javascript
// 数据读取的过程
reader.on('data',(data) => {
    console.log(data);

    reader.pause(); //暂停

    setTimeout(() => {
        reader.resume()
    },1000)
})
```



**写入文件**

```javascript
// 传统的写入方式
fs.writeFile('./foo.txt',"hello world",{flag:'a'},(err) => {
    console.log(err);
})
```



```javascript
// stream的写入方式
const writer = fs.createWriteStream('./foo.txt',{
    flags:"a",
    start:4
})

writer.write("你好啊",(err) => {
    console.log("写入成功");
})

// 在末尾追加内容后关闭流
writer.end('结束吧')
// 也可以使用close()

// 监听文件流是否真的关闭了
writer.on('close',() => {
    console.log("文件关闭了");
})
```



**pipe的使用**

读取一个文件的全部内容，写入另外一个文件中

```javascript
const fs = require('fs')

// // 传统写法
// fs.readFile('./abc.txt',(err,data) => {
//     fs.writeFile('./cba.txt',data,(err) => {
//         console.log(err);
//     })
// })

// Stream写法
const reader = fs.createReadStream("./abc.txt");
const writer = fs.createWriteStream("./bac.txt")

reader.pipe(writer);
writer.close()
```







## 九、http模块

### 9.1 概述

**web服务器**

当应用程序（客户端）需要某一个资源时，可以向一台服务器，通过http请求获取到这个资源；提供资源的服务器就是一个web服务器。

目前有很多开源的web服务器：Nginx、Apache（静态）、Apache Romcat（静态、动态）、Node.js



**web服务器初体验**



```javascript
//创建服务器方式一：
const http = require('http')

// 创建一个web服务器
const server = http.createServer((req,res) => {
    res.end('hello server') //服务器响应
});

// 启动服务器，并指定端口号和主机
server.listen(8888,'0.0.0.0',() => {
    console.log('服务器启动成功');
});
```

在浏览器输入url：localhost：8888，即可访问到这个服务器

注：req指request请求（包含请求的相关信息）、res指response响应（包含要发送给客户端的信息）、可以同时启动多个服务器器

**问题**

每次修改代码，都需要重新执行`node server.js`,比较麻烦

安装：`npm install nodemon -g`

之后通过`nodemon server.js `；来启动服务器，修改代码就可以同步至服务器



```javascript
// 创建服务器方式二：
const server2 = new http.Server((red,res) => {
    res.end("这是Server2")
})

server2.listen(8001,() => {
    console.log('服务器server2启动成功~');
})
```

本质上：方式一和方式二是相同的



**细节补充**

listen函数有三个参数：（三个参数都可以省略）

1、端口port：不写，系统会默认分配一个端口号

```javascript
server2.listen(() => { //不传端口号
    console.log('服务器server2启动成功~');
    console.log(server2.address().port); //输出：64949 系统自动分配
})
```



2、主机号host：通常传入localhost、ip地址127.0.0.1，或者ip地址0.0.0.0（默认就是0.0.0.0）

+ localhost：本质上就是一个域名，通常情况下会被解析成127.0.0.1
+ 127.0.0.1：回环地址，表达的意思其实是我们主机自己发出去的包，直接被自己接收。
+ 0.0.0.0：监听IPv4上所有地址，再根据端口找到不同的应用程序，比如我们监听0.0.0.0时，在同一个网段下的主机中，通过ip地址是可以访问的

如果使用了0.0.0.0，启动服务器后，在URL中通过本级ip地址+端口号也是能够访问到服务器的

```javascript
server2.listen(8081,'0.0.0.0',() => {
    console.log('服务器server2启动成功~');
    console.log(server2.address().port); // 8081
})

//假设此时的ip地址是172.19.213.53，访问：172.19.213.53：8081即可访问到这个服务器
```



### 9.2 request对象

在向服务器发送请求时，会携带很多信息：本次请求的URL、请求的方式（get、post）、本次请求的headers...

这些信息node会封装到一个request对象中，我们可以直接来处理这个对象

```javascript
const server = http.createServer((req,res) => {
    //request对象中封装了客户端给我们服务器传递过来的所有信息
    
    console.log(req.url); //打印请求的url
    console.log(req.method); //打印请求方式
    console.log(req.headers); //打印请求头信息
    
    res.end('hello server') 
    
});
```



服务器端需要根据不同的请求地址，作出不同的响应

```javascript
const http = require('http')

const server = http.createServer((req,res) => {
    // request基本使用
    if (req.url === '/login') {
        res.end('欢迎回来~')
    } else if (req.url === '/users') {
        res.end("用户列表~")
    } else {
        res.end("错误请求~")
    }
})

server.listen(8088,'0.0.0.0',() => {
    console.log("服务器运行成功");
})
```



**url的解析**

如果用户发送的地址中还携带一些额外的参数呢（如登录的账号、密码）？

如：`http://localhost:8000/ligin?name=ming&password=123`

这个时候url的值是ligin?name=ming&password=123，如何解析出我们需要的数据呢？

使用内置模块url ：`const url = require('url')` 

```javascript
const server = http.createServer((req,res) => {

    const parseInfo = url.parse(req.url)
    console.log(parseInfo);
})
```

![](img/node/image-20210713105225686.png)

使用内置模块querystring：`  const qs = require('querystring')`（专门对query进行处理）

```javascript
//判断出用户登录的内容
const server = http.createServer((req,res) => {

    const {pathname,query} = url.parse(req.url)
    if (pathname === '/login') {
        console.log(query); //输出name=ming&password=123
        console.log(qs.parse(query)); //输出：{name:'ming',password:'123'}
        const {name,password} = qs.parse(query)
        console.log(name,password); //ming 123
        res.end("请求结果~")
    }
})
```



**request.method**

但是如果用使用的是post请求，post不会将登录账号密码显示在url里，服务器如何取得这些数据呢？

```javascript
// 假设用户通过post方式进行登录，服务器怎样获取账号、密码
const server = http.createServer((req,res) => {
    const {pathname} = url.parse(req.url); //获取用户输入的url
    if (pathname === '/login') { //用户是否在登录的是登录界面
        if (req.method === 'POST') { //判断发送方法是否为post
            // 拿到body中的数据
            req.setEncoding('utf-8')
            req.on('data',(data) => { //截取流中用户登录的数据
                console.log(data);
            }) //获取到了json对象

            res.end('hello world')
        }
    }
})
```

需要在工具（postman）中发送请求——设置好POST方式，在body中选择raw，并输入用户信息的json

此时，我们获取到的是一个json对象，需要将其转换为js对象

```javascript
// 假设用户通过post方式进行登录，服务器怎样获取账号、密码
const server = http.createServer((req,res) => {
    const {pathname} = url.parse(req.url); //获取用户输入的url
    if (pathname === '/login') { //用户是否在登录的是登录界面
        if (req.method === 'POST') { //判断发送方法是否为post
            // 拿到body中的数据
            req.setEncoding('utf-8')
            req.on('data',(data) => { //截取流中用户登录的数据
                const {name,password} =JSON.parse(data)
                console.log(name);
                console.log(password); //输出的是 ming  123
            })

            res.end('hello world')
        }
    }
})
```



**request.headers**

在request对象的header中也包含很多有用的信息，客户端会默认传递过来一些信息：

1、content-type是这次请求携带的数据类型

+ application/json表示是一个json类型
+ text/plain表示是文本类型
+ application/xml表示是xml类型
+ multipart/form-data表示是上传文件

2、content-length：文件的大小和长度

3、keep-alive

http是就要tcp协议的，但是通产在进行一次请求和响应结束后会立刻中断,node默认是5s

4、accept-encoding：告知服务器，客户端支持的文件压缩格式，比如js文件可以使用gzip编码

5、accept：告知服务器，客户端可接收的格式类型

6、user-agent：客户端相关的信息



### 9.3 response对象

如果我们希望给客户端响应的结果数据，可以通过两种方式：

1、write方法：这种方式是直接写出数据，但是并没有关闭流

2、end方法：这种方式是写出最后的数据，并且写出后会关闭流

```javascript
const http =require('http')

const server = http.createServer((req,res) => {
    res.end('come from server~') //写入并关闭流
})

server.listen(8080,'0.0.0.0',() => {
    console.log("服务器启动成功~");
})
```

如果没有调用end，客户端将会一直等待结果。（所以一般客户端在发送网络请求时，都会设置超时时间）



**返回状态码**

http状态码（http status code）是用来表示http响应状态的数字代码：

http状态码非常多，可以根据不同的情况，给客户端返回不同的状态码

| 状态代码 | 状态描述              | 说明                                                         |
| -------- | --------------------- | ------------------------------------------------------------ |
| 200      | OK                    | 客户端请求成功                                               |
| 400      | Bad Request           | 由于客户端请求语法错误，不能被服务器所理解                   |
| 401      | Unauthorized          | 请求未经授权                                                 |
| 403      | Forbidden             | 服务器收到请求，但是拒绝提供服务                             |
| 404      | Not Found             | 请求的资源不存在                                             |
| 500      | internal server error | 服务器发生不可预期的错误                                     |
| 503      | service unavailable   | 服务器当前不能够处理客户端请求，在一段时间后，可能会恢复正常 |

设置状态码

```javascript
const server = http.createServer((req,res) => {
    // 设置状态码
    // 方式一：直接给属性赋值
    res.statusCode = 400;
    // 方式二：和head一起设置
    res.writeHead(503)

    res.end('come from server~')
})
```



**响应头文件**

res.setHeader：一次写入一个头部信息

res.writeHead:同时写入header和status

```javascript
const server = http.createServer((req,res) => {
    // 设置响应头文件
    res.setHeader('Content-Type',"application/json;charset=utf8") //可解决中文乱码的问题

    res.end('come from server~')
})
```



### 9.4 http请求

axios库可以在浏览器中使用，也可以在Node中使用

1、在浏览器中，axios使用的是封装xhr

2、在node中，使用的是http内置模块



发送http发送get请求

```javascript
const http = require("http")

// 向已经启动的服务器发送get请求
http.get("http://localhost:8888",(res) => {
    res.on('data',data => {
        console.log(data.toString()); //取得我们向服务器写入的内容
    })
})
```



### 9.5 文件上传

创建并启动一个服务器，通过postman向服务器上传一张图片，使服务器将图片保存在本地



**错误写法**

```javascript
// 错误示范

const http = require('http')
const fs = require("fs")

const server = http.createServer((req,res) => {
    if(req.url === '/upload') {
        if(req.method === 'POST') {
            // 如果用户在upload路径下发送了一个post请求（假设上传了一张图片）
            const fileWriter = fs.createWriteStream('.foo.png',{flags:"a+"});
            //开启一个写入流

            req.on('data',(data) => {
                console.log(data);
                fileWriter.write(data) //将读取到的数据全部写进新创建的foo.png中
            });

            req.on('end',() => {
                console.log("文件上传成功~");
                res.end('文件上传成功~')
            })
        }
    }
})

server.listen(8088,() => {
    console.log("服务器启动成功~");
})
```

原因：即使逻辑上没错，通过一个写入流将图片信息写入一个新的png文件中，但是却会将一些额外的信息也写进了foo.png文件中，导致图片无法正常显示

如果要图片正常显示，需要把多余的数据剔除出去，这在http模块中操作是比较麻烦的~



## 十、express框架

### 10.1 概述

express本质上是对http模块的封装，其核心是中间件

为什么使用express框架？

1、原生http在执行时，代码较为复杂（url判断、method判断、参数处理等都需要我们自己处理和封装）

2、所有的内容混在一起不容易维护



**express安装**

+ 方式一：通过express框架提供的脚手架，直接创建一个应用的骨架。

安装：`npm install -g express-generrator`

创建项目：`express express-demo`

安装依赖：`npm install`

启动项目：`node bin/www`



+ 方式二：从零搭建的express应用框架

1、初始化项目：`npm init -y`

2、安装：`npm install express`

```javascript
//基本使用
const express = require('express')

const app = express() //express是一个函数

// 监听默认路径(get方法)
app.get('/',(req,res,next) => {
    res.end('hello Express')
})

// post方法
app.post('/',(req,res,next) => {
    res.end('hello post express');
})

app.post('/login',(req,res,next) => {
    res.end('welcome Back~')
})


app.listen(8080, () => {
    console.log("express服务器启动成功~");
})
```



### 10.2 中间件

express是一个路由和中间件的web框架，它本身的功能非常少，express应用程序本质上是一系列中间函数的调用。



**中间件是什么？**

1、中间件本质是传递给express的一个回调函数

2、这个回调函数接收三个参数：请求对象（request对象）、响应对象（response对象），next对象（在express中定义的用于执行下一个中间件的函数）



**中间件可以执行哪些任务？**

1、执行任何代码

2、更改请求（request）和响应（response）对象

3、结束请求-响应周期（返回数据）

4、调用栈中的下一个中间件

如果当前中间件功能没有结束请求-响应周期，则必须调用next（）将控制权传递给下一个中间件功能，否则，请求将被挂起



**应用中间件**

express主要提供了两种方式：app/router.use 和 app/router.methods

可以是app，也可以是router。

案例一：最普通的中间件

```javascript
const express = require('express');

const app = express();

// 编写普通的中间件
app.use((req,res,next) => {
    console.log("注册了第01个普通的中间件~");
    // 没有end，请求会一直挂着
    res.end("01中间件~")
    next()
})

// 没有next（），只会执行第一个中间件
app.use((req,res,next) => {
    console.log("注册了第02个普通中间件~");
})

app.listen(8080,() => {
    console.log("普通的中间件服务器启动成功~");
})
```



案例二：path匹配中间件

发送网络请求的时候需要加上路径，否则会报错。

注：如果存在多个中间件，没有next（），只会执行第一个

```javascript
const express = require('express');

const app = express();

app.use('/home',(req,res,next) => {
    console.log("home middleware 01");
    res.end("写入完成~")
})

app.listen(8080,() => {
    console.log("路径匹配的中间件服务器启动成功~");
})
```



案例三：路径和方法匹配中间件

只有路径和methods都匹配的时候才能发送请求成功~

```javascript
const express = require("express");

const app = express()

app.get('/home',(req,res,next) => {
    console.log('home and method middleware~');
    // 没有next下面的中间件都不会执行

    res.end('over~')
    // 没有end，请求会一直挂起
})

app.listen(8080,() => {
    console.log("路径和方法匹配服务器启动成功~");
})
```



案例四：连续匹配中间件

```javascript
const express = require("express");

const app = express()

app.get('/home',(req,res,next) => {
    console.log("连续匹配中间件01~");
    next()
},(req,res,next) => {
    console.log("连续匹配中间件02~");
    next()
},(req,res,next) => {
    console.log("连续匹配中间件03~");
    res.end('over~')
},
)

app.listen(8080,() => {
    console.log("连续匹配中间件服务器执行成功~");
})
```



### 10.3 中间件的应用

1、解析json：`app.use(express.json())`

2、解析x-www-form-urlencoded :`app.use(express.urlencoded({extended:true}))`

3、解析form-data，express没有内置相关的方法，需要去安装multer这个库



案例：json解析（用户无论从products界面还是login界面，发送过来的数据都能够被服务器解析成对象）

```javascript
const express = require('express');

const app = express();

app.use((req,res,next) => {
    if (req.headers["content-type"] === 'application/json') { //如果请求是这种格式的
        req.on('data',(data) => {
            const info = JSON.parse(data.toString()) //解析成对象
            req.body = info //将对象保存在响应体里（可以传递给下一个中间件）
        })
    
        req.on('end',() => {
            next() //传递给下一个中间件
        })
    }else{
        // 不是这种请求格式，跳到下一个中间件
        next()
    }
})

app.post('/login',(req,res,next) => {
    console.log(req.body); //获取到上一个中间件传递的对象
    res.end("linming,login~")
})

app.post('/products',(req,res,next) => {
    console.log(req.body);
    res.end("linming Upload producr info success~")
})

app.listen(8080,() => {
    console.log("express服务器启动成功~");
})
```

在postman中选择body->row->json,就可以在url：/login或者/products中向服务器发送网络请求，并且请求都能被解析成为对象



但是上述的代码太多繁琐，node其中内置了一个bady-parser的函数，帮助我们实现以上功能

**json解析**

```javascript
const express = require('express');

const app = express();

app.use(express.json())

app.post('/login',(req,res,next) => {
    console.log(req.body); //获取到上一个中间件传递的对象
    res.end("linming,login~")
})

app.post('/products',(req,res,next) => {
    console.log(req.body);
    res.end("linming Upload producr info success~")
})

app.listen(8080,() => {
    console.log("express服务器启动成功~");
})
```



**解析form-data**

+ **解析文本**

安装multer库：`npm install multer`

(在postman中选择form-data，并发送任意键值对的文本信息过来，都能够被服务器解析出来)

```javascript
//用户发送的是文本信息时
const express = require('express');
const multer = require("multer")

const app = express()

const upload = multer()
app.use(upload.any()) 

app.post('/login',(req,res,next) => {
    console.log(req.body);
    res.end('用户登录成功~')
})

app.listen(8000,() => {
    console.log("form-data解析服务器启动成功~");
})
```

+ **解析图片资源（单个文件上传）**

```javascript
const express = require("express");
const multer = require("multer");

const app = express()

// 使用解析form-data的库
const upload = multer({
    dest:'./uploads/'//将图片资源保存在这个目录下
})
app.use(upload.any())

app.post('/login',(req,res,next) => {
    console.log(req.body);
    res.end("用户登录成功~")
})

//使用了连续匹配中间件
app.post('/upload',upload.single("file"),(req,res,next) =>{
    res.end('文件上传成功~')
})

// file是上传图片时的使用名
app.listen(8080,() => {
    console.log("formdata解析图片服务器启动成功~");
})

```

问题：此时图片资源保存在了uploads文件夹下，但是图片没有后缀名且图片名为自动生成，不利于后续的操作。

怎样保存有规律图片名和想要的后缀名？

```javascript
const express = require("express");
const multer = require("multer");

const app = express()

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'./uploads/');
    },
    filename:(req,file,cb) => {
        cb(null,'foo.png') //但是此处的名字是写死的，可以想办法替换成自动生成有规律的名称
    }
})
// 使用解析form-data的库
const upload = multer({
    // dest:'./uploads/'//将图片资源保存在这个目录下
    storage
})
app.use(upload.any()) //注，图片上传尽量将这个中间件注册成局部的

app.post('/login',(req,res,next) => {
    console.log(req.body);
    res.end("用户登录成功~")
})

app.post('/upload',upload.single("file"),(req,res,next) =>{
    res.end('文件上传成功~')
})

// file是上传图片时的使用名
app.listen(8080,() => {
    console.log("formdata解析图片服务器启动成功~");
})

```

利用时间戳生成图片名称,利用path.extname自动查找源文件拓展名

```javascript
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'./uploads/');
    },
    filename:(req,file,cb) => {
        cb(null,Date.now()+path.extname(file.originalname))
    }
})
```



+ **解析图片资源（多个文件上传）**

只需要将upload.single("file")中间件，改为upload.array("file")，

并且将`app.use(upload.any())`改为局部中间件

```javascript
const path = require('path')

const express = require("express");
const multer = require("multer");


const app = express()

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'./uploads/');
    },
    filename:(req,file,cb) => {
        cb(null,Date.now()+path.extname(file.originalname))
    }
})
// 使用解析form-data的库
const upload = multer({
    // dest:'./uploads/'//将图片资源保存在这个目录下
    storage
})

app.post('/login',upload.any(),(req,res,next) => {
    console.log(req.body);
    res.end("用户登录成功~")
})

app.post('/upload',upload.array("file"),(req,res,next) =>{
    console.log(req.files); 
    res.end('文件上传成功~')
})

// file是上传图片时的使用名
app.listen(8080,() => {
    console.log("formdata解析图片服务器启动成功~");
})

```

可以通过`req.files`获取上传的图片的一些信息



### 10.4 客户端发送请求的方式

客户端传递到服务器参数的方法常见的是5种：

1、方式一：通过get请求中的URL的params

2、方式二：通过get请求中的URL的query

3、方式三：通过post请求中的body的json格式

4、方式四：通过post七扭去的body的x-www-urlencoded格式

5、方式五：通过post请求中的form-data格式

(方式三、四、五已经演练过)



**方式一：通过get请求中的URL的params**

在postman中输入`http://localhost:8080/products/1150` (以get方式)

```javascript
const express = require('express');

const app = express();

app.get('/products/:id',(req,res,next) => {
    console.log(req.params);  //获取到了参数信息
    res.end('商品的详情数据~')
})

app.listen(8080,() => {
    console.log("服务器启动成功~");
});
```



**方式二：通过get请求中的URL的query**

在postman中输入`http://localhost:8080/login?username=linming&password=123` (以get方式)

```javascript
const express = require('express');

const app = express();

app.get('/products/:id',(req,res,next) => {
    console.log(req.params);
    res.end('商品的详情数据~')
})

app.get('/login',(req,res,next) => {
    console.log(req.query);
    res.end("用户的登录信息")
})

app.listen(8080,() => {
    console.log("服务器启动成功~");
});
```



**补充：响应数据**

1、end方法

类似于http中的response.end方法

2、json方法

json方法中可以传入很多的类型：object、array、string、boolean、number、null等，他们会被转换成json格式返回

3、status方法

用于设置状态码



### 10.5 express路由

如果我们将所有的代码逻辑都写在app中，那么app会变得越来越复杂

1、一方面，完整的web服务器包含非常多的处理逻辑

2、另一方面，有些处理逻辑其实是一个整体，我们应该将他们放在一起：如获取用户列表、获取某一个用户信息、创建一个新的用户、删除一个用户、更新一个用户等



解决方案：路由

一个Router实例拥有完整的中间件和路由系统，因此它也被称为mini-app

```javascript
//router/users.js
const express = require('express');

// 创建路由实例
const router = express.Router()

router.get('/',(req,res,next) => {
    // 转换为json格式并返回
    res.json(["xiaoming","xiaoqiang","xiaogang"]);
})

router.get('/:id',(req,res,next) => {
    res.json(`${req.params.id}用户信息`);
})

router.post('/',(req,res,next) => {
    res.json('create user success~');
})

module.exports = router
```

```javascript
const express = require('express');

const useRouter = require('./router/user')

const app = express();

//使用router
app.use('/users',useRouter)

app.listen(8000,() => {
    console.log('路由器服务器启动成功~');
})
```



### 10.6 静态资源的部署

node也可以作为静态资源服务器，并且express提供了非常方便的部署静态资源的方法

```javascript
const express = require('express');

const app = express();

app.use(express.static('./dist')) //dist项目所在的位置

app.listen(8080, () => {
    console.log("服务器启动成功~");
})
```



### 10.7 错误处理

```javascript
const express = require('express');

const app = express();

const  USERNAME_DOES_NOT_EXIST = "USERNAME_DOES_NOT_EXIST"; 
const USERNAME_ALREADY_EXISTS = "USERNAME_ALREADY_EXISTS";

app.post('/login',(req,res,next) => {
    let isLogin = false;
    if(isLogin) {
        res.json("登录成功~")
    }else{
        next(new Error(USERNAME_DOES_NOT_EXIST))
    }
})

app.post('/register',(req,res,next) => {
    let isExist = true;
    if(!isExist) {
        res.json("注册成功~")
    }else{
        next(new Error(USERNAME_ALREADY_EXISTS))
    }
})

// 当包含四个参数，说明进入错误出处理
app.use((err,req,res,next) => {
    let status = 400;
    let message = ''

    switch(err.message) {
        case USERNAME_DOES_NOT_EXIST:
            message = "username does not exist"
            break;
        case USERNAME_ALREADY_EXISTS:
            message = "username already exists"
            break;
        default:
            message = "Not Found~"
    }
    res.status(status);
    res.json({
        errCode:status,
        errMessage:message
    })
})

app.listen(8080, () => {
    console.log("服务器启动成功~");
})
```



## 十一、koa框架

### 11.1 概述

另外一个非常流行的Node Web服务器框架就是Koa

Koa官方介绍：koa：next generation web framework for node.js

koa是express同一个团队开发的新的web框架，旨在为web应用程序和API提供更小、更丰富和更强大的能力。它相比起express具有更强的异步处理能力，核心代码只有1600行，是一个更加轻量级的框架。



**基本使用**

安装：`npm install koa`

koa注册中间件提供了两个参数：

1、ctx：上下文（context）对象——ctx.request: 获取请求对象、ctx.response: 获取响应对象

2、next

```javascript
const koa = require('koa');

const app = new koa();

// 注册中间件
app.use((ctx,next) => {
    ctx.response.body = "hello world~"
})

app.listen(8080,() => {
    console.log('koa服务器启动成功~');
})
```



**响应数据**

本质上`ctx.body`与`ctx.resoponse.body`是一样的，都可以用来作为返回给客户端的信息

设置状态码：`ctx.status = 201` 或者`ctx.response.status`



### 11.2 中间件与路由

koa注册中间件只能通过use方法

注：koa没有提供methods的方式来注册中间件，也没有提供path中间件来匹配路径

也就是不能使用`app.get 、app.post 、app.use('路径')`



但是真实开发中如何将路径和methods分离呢？

方式一：根据request来判断

方式二：根据第三方路由中间件



```javascript
//方式一
const koa = require('koa');
const app = new koa();

// 判断用户连上登录界面
app.use((ctx,next) => {
    if(ctx.request.url === '/login'){
        if(ctx.request.method === 'GET') {
            ctx.response.body = 'login success~'
        }
    }else {
        ctx.response.body = "other requres~"
    }
})

app.listen(8080,() => {
    console.log('koa服务器启动成功~');
})
```

方式一略显麻烦，所以更推荐方式二

**路由的使用**

安装：`npm install koa-router`

```javascript
//创建router/uesr.js
const Router = require('koa-router');

const userRouter = new Router({prefix:'/users'});

userRouter.get('/',(ctx,next) => {
    ctx.response.body = 'user list~';
});

userRouter.post('/',(ctx,next) => {
    ctx.response.body = "create user info~"
});

module.exports = userRouter
```

使用该路由

```javascript
//index.js
const Koa = require('koa');

const userRouter = require('./router/user');

const app = new Koa();

app.use(userRouter.routes());

app.listen(8080, () => {
    console.log('koa路由服务器启动成功~');
})
```



以上我们实现了get、post请求，但是如果用户发送了其他的methods，koa服务器都是统一返回not found。

我们可以使用路由内置的allowedMethods来判断某一个method是否支持

`app.use(userRouter.allowedMethods())`



### 11.3 参数解析

**1、解析url的params**

```javascript
const Koa = require('koa');

const app = new Koa()

const Router = require('koa-router')
const userRouter = new Router({prefix:'/users'})

userRouter.get('/:id',(ctx,next) => {
    console.log(ctx.request.params);
    ctx.body = 'hello world~'
})

// 注册路由
app.use(userRouter.routes())

app.listen(8080,() => {
    console.log("koa服务器启动成功~");
})
```



**2、解析url的query**

```javascript
const Koa = require('koa');

const app = new Koa()

app.use((ctx,next) => {
    console.log(ctx.request.query);
    ctx.body = "hello world~"
})

app.listen(8080,() => {
    console.log("koa服务器启动成功~");
})
```



**3、解析json和urlencoded**

需要安装第三方库：`npm install koa-bodyparser`

用户发送body的格式：

```json
{
    "name":"linming",
    "password":123123
}
```

```javascript
const Koa = require('koa');
const bodyParder = require('koa-bodyparser'); //解析json的库

const app = new Koa();

app.use(bodyParder()); //解析json

app.use((ctx,next) => {
    console.log(ctx.request.body);
    ctx.body = "hello world~"
})

app.listen(8080,() => {
    console.log('服务器启动成功~');
})
```



**4、解析form-data**

安装`npm install koa-multer`

```javascript
const Koa = require('koa');
const multer = require('koa-multer');

const app = new Koa();
const upload = multer();

app.use(upload.any()) //使用该组件

app.use((ctx,next) => {
    console.log(ctx.req.body);
    ctx.response.body = "hello world~"
})

app.listen(8080,() => {
    console.log("服务器启动成功~");
})
```



### 11.4 文件上传

安装`npm install koa-multer`

在postman中的body中上传名为file的图片，并通过服务器保存在本地中

```javascript
const Koa = require('koa');
const multer = require('koa-multer');
const Router = require('koa-router');

const app = new Koa();
const uploadRouter = new Router({prefix:'/upload'});


const upload = multer({
    dest:'./uploads' //资源存放位置
})

uploadRouter.post('/',upload.single('file').(ctx,next) => {
    console.log(ctx.req.file);
    ctx.body = 'success~'
})

app.use(uploadRouter.routes())

app.listen(8080,() =>{
    console.log('服务器启动成功~');
})

```



### 11.5 静态资源部署

安装库：`npm install koa-static`

```javascript
const Koa = require('koa');
const staticAssets = require('koa-static')

const app = new Koa()

app.use(staticAssets('../09-express/dist'))

app.listen(8080,() => {
    console.log("服务器启动成功~");
})
```



### 11.6 补充

1、`app.use()`返回this，因此可以链式调用

> app.use(中间件).use(中间件)

2、`app.context()`可以为ctx添加其他属性

> app.context.mynane = 'mzlin'

3、打印`ctx.response`

> {
>   status: 404,
>   message: 'Not Found',
>   header: [Object: null prototype] {},
>   body: undefined
> }

4、打印`ctx.request`

> {
>   method: 'GET',
>   url: '/路径',
>   header: {
>     authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ...(略)',
>     'content-type': 'application/json',
>     'user-agent': 'PostmanRuntime/7.29.0',
>     accept: '*/*',
>     'cache-control': 'no-cache',
>     'postman-token': 'a6e85566-ea0f-49fb-9f84-adf91299373d',
>     host: '127.0.0.1:8888',
>     'accept-encoding': 'gzip, deflate, br',
>     connection: 'keep-alive',
>     'content-length': '81'
>   }
> }

5、`ctx.res与ctx.req`分别指的是Node的response对象与request对象，而`ctx.response与ctx.requst`指的是koa的

## 十二、mysql

### 12.1 概述

MySQL是一个开源的数据库，原开发者为瑞典的MYSQL AB公司。现在归属于Oracle

MYSQL是一个关系型数据库，其本质上就是一个软件、一个程序。



通常我们将数据库划分成两类：关系型数据库和非关系型数据库

**关系型数据库：**MySQL、Oracle、DB2、SQL Server、Postgre SQL等

1、关系型数据库通常会创建很多个二维数据表

2、数据表之间相互关联起来，形成一对一、一对多、多对多的关系

3、利用SQL语句在多张表中查询我们所需要的的数据

4、支持事务，对数据的访问更加安全



**非关系型数据库**：MongoDB、Redis、Memcached、HBse等

1、非关系型数据库（Not only SQL），简称为NoSQL

2、非关系型数据库比较简单一些，存储数据也会更加自由

3、NoSQL是基于key-value的对应关系，并且查询的过程中不需要经过SQL解析，所以性能更高

4、NoSQL通常不支持事务，需要在自己的程序中来保证一些原子性的操作



### 12.2 基本操作

==**终端操作数据库**==

1、打开终端，查看MYSQL的安装版本

`mysql --version`

2、终端连接数据库

方式一：`mysql -uroot -p123456`

方式二：`mysql -uroot -p` 

3、显示数据库

`show databases;`

mysql默认的数据库有四个：

+ infomation_schema:信息数据库，其中包括MySQL在维护的其他数据库、表、列、访问权限等信息；
+ performance_schema:性能数据里，记录着MySQL Server数据库引擎在运行过程中的一些资源消耗相关的信息
+ mysql：用于存储数据库管理者的用户信息、权限信息以及一些日志信息等
+ sys：相当于是一个简易版的performance_schema，将性能数据库中的数据汇总成更容易理解的形式

4、创建数据库

`create database linming`

5、在linming数据库中，创建一张表

进入linming数据库 ：`use linming`

创建表

```sql
create table user(
	name varchar(20),
    age int,
    height double
);
```

显示表：`show table;`

6、向表中插入数据

```sql
insert into user(name,age,height) values('xiaoming',18,171);
insert into user(name,age,height) values('xiaoqiang',20,180)
```

7、查看user表中所有的数据

`select * from user`



**GUI工具**

在开发中，我们可以借助一些GUI工具来连接上数据库，知乎直接在GUI工具中操作就会非常方便

常用的GUI工具：

1、**Navicat**（简洁，收费）

2、SQLYog（古老、免费）

3、TablePlus



### 12.3 SQL语句

SQL是Structured Query Language ，称之为结构化查询语言，简称SQL

使用SQL编写出来的语句，就称为SQL语句。SQL语句可以用于对数据库进行操作。

==**规范**==

1、关键字通常是大写的，比如CREATE , TABLE , SHOW等等

2、一句语句结束后，需要以 ； 结尾

3、如果遇到关键字作为表名或者字段名称，可以使用 ``包裹



常见的SQL语句可以分成四类：

1、DDL：数据定义语言

可以通过DDL语句对数据库或者表进行：创建、删除、修改等操作

2、DML：数据操作言

可以通过DML语句对表进行：添加、删除、修改等操作

3、DQL：数据查询语句

可以通过DQL从数据库中查询记录

4、DCL：数据控制语言

对数据库、表格的权限进行相关访问控制操作



==**数据库的操作**==

```sql
#查看所有数据
SHOW DATABASES;

#使用某一个数据库
USE linming;

#参看当前正在使用的数据库
SELECT DATABASE();

#创建新的数据库语句
CREATE DATABASE bilibili；#（不严谨）

CREATE DATABASE IF NOT EXISTS bilibili; #(不存在则创建)

CREATE DATABASE IF NOT EXISTS bilibili
		DEFAULT CHARACTER SET utf8mb4 CLOLATE utf8mb4_0900_ai-ci;
		#(不存在则创建，并指定字符集与排序规则)
		
#删除数据库
DROP DATABASE bilibili; #(不严谨)

DROP DARABASE IF EXISTS bilibili；

#修改数据库的字符集和排序规则
ALTER DATABASE bilibili 
	CHARACTER SET = UTF8 
	COLLATE = utf8_unicode_ci;
```



==**数据表的操作**==

```sql
#查看所有的数据表
SHOW TABLES;

#查看某一个表结构
DESC user;

#创建数据表
CREATE TABLE IF NOT EXISTS `users`(
	name VARCHAR(20),
    age INT,
    height DOUBLE
);

#删除表
DROP TABLE IF EXISTS `users`;
```



==**SQL的数据类型**==

MYSQL支持的数据类型：数字类型、日期和时间类型、字符串(字符和字节)类型、空间类型、JSON数据类型



**数字类型**

1、整数数字类型：INTEGER 、INT 、SMALLINT  、TINUINT 、MEDIUMINT 、BIGINT

2、浮点数字类型：FLOAT 、DOUBLE （FLOAT4个字节、DOUBLE8字节）

3、精确数字类型：DECIMAL 、NUMERIC



**日期类型**

1、YEAR

格式：YYYY

范围：1902-2155

2、DATA

该类型用于具有日期部分但没有时间部分的值

格式：YYYY-MM-DD显示值

范围：1000-01-01 到 9999-12-31

3、DATETIME

该类型用于包含日期和时间部分的值

格式：YYYY-MM-DD hh:mm:ss

范围：1000-01-01 00:00:00 到 9999-12-31 23-59-58

4、TIMESTAMP

该类型用于包含日期和时间部分的值

格式：YYYY-MM-DD hh:mm:ss

范围：1970-01-01 00:00:01 到 2038-01-19 03:14:07



**字符串类型**

1、CHAR类型

在创建表时为固定长度，长度可以是0到255之间的任何值

在被查询时，会删除后面的空格

2、VARCHAR类型

该类型的值是可变长度的字符串，长度可以指定为0到65535之间的值

在被查询时，不会删除后面的空格

3、BINARY和VARBINARY类型

用于存储二进制字符串，存储的是字节字符串

4、TEXT类型

用于存储大的字符串类型



==**表约束**==

1、**主键：PRIMARY KEY**

一张表中，我们为了区分每一条记录的唯一性，必须有一个字段是永远不会重复，并且不会为空的，这个字段我们通常会将它设置为主键

特点：

主键是表中唯一的索引；

并且必须是NOT NULL的，如果没有设置 NOT NULL，那么MySQL也会隐式的设置为NOT NULL；

主键也可以是多列索引，PRIMARY KEY(*key_part, ...)，我们一般称之为联合主键；

建议：开发中主键字段应该是和业务无关的，尽量不要使用业务字段来作为主键；



2、**唯一：UNIQUE**

某些字段在开发中我们希望是唯一的，不会重复的，比如手机号码、身份证号码等，这个字段我们可以使用UNIQUE来约束



3、**不能为空：NOT NULL**

某些字段我们要求用户必须插入值，不可以为空，这个时候我们可以使用 NOT NULL 来约束



4、**默认值：DEFAULT**

某些字段我们希望在没有设置值时给予一个默认值，这个时候我们可以使用 DEFAULT来完成；



5、**自动递增：AUTO_INCREMENT**

某些字段我们希望不设置值时可以进行递增，比如用户的id，这个时候可以使用AUTO_INCREMENT来完成；



### 12.4 创建表

创建一个学生表

```sql
CREATE TABLE IF NOT EXISTS student(
	id INT PRIMARY KEY,
	`name` VARCHAR(20) NOT NULL,
	age INT DEFAULT 20,
	telPhone VARCHAR(20) DEFAULT '' UNIQUE NOT NULL
);
```

修改表信息

```sql
#修改表
#1.修改表的名字
ALTER TABLE teacher RENAME TO `teacher22`;

#2.添加字段类型
ALTER TABLE teacher22 ADD `createTime` TIMESTAMP;

#3.修改字段的名称
ALTER TABLE teacher22 CHANGE `telPhone` `phoneNum` VARCHAR(20);

#4.修改字段的类型
ALTER TABLE `teacher22` MODIFY `name` VARCHAR(30);

#5.删除某一个字段
ALTER TABLE `teacher22` DROP `age`;
```

其他操作

```sql
#根据一个表结构与创建另外一张表
CREATE TABLE `teacher` LIKE `student`;

#根据另外一张表中的所有内容，创建一个新的表
CREATE TABLE `student2` (SELECT * FROM `student`);
```



**插入数据**

```sql
#插入数据

#方式一
INSERT INTO student VALUES (001,'ming',23,'13543914804','2021-7-19','2021-7-19');

#因为id设置了自动递增AUTO_INCREMENT，所以之后可以不用插入值
#方式二
INSERT INTO student (name,age,telPhone,createTime,updateTime)
							VALUES('qiang',22,'12345678901','2020-11-22','2022-11-30')
```

思考：怎么给createTime，和updateTime设置时间，使其自动根据时间更新呢？

```sql
#createTime默认自动设置值
ALTER TABLE student MODIFY `createTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
#updateTime默认自动设置值，数据更新时，自动更新值
ALTER TABLE student MODIFY `updateTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
										ON UPDATE CURRENT_TIMESTAMP; 
```

这样子一来，之后添加数据可以简单许多

```sql
INSERT INTO student (name,age,telPhone)
VALUES('hong',23,'15338283019');
#而且createTime、updateTime也会根据当前时间自动设置值
```



**删除数据**

```sql
#删除所有数据
DELETE FROM student;

#删除符合条件的数据
DELETE FROM student WHERE id =3;
```



**更新数据**

```sql
#更新所有数据
UPDATE student SET name = 'mzlin',telPhome = '110110110';
#更新符合条件的数据
UPDATE student SET name = 'lily',telPhone = '010-100100' WHERE id =2;
```



### 12.5 数据查询

```sql
# 基本查询
#查询表中所有的字段以及所有的数据
SELECT * FROM products;

#查询指定的字段
SELECT title,price FROM products;

#对字段查询结果起一个别名
SELECT title as phoneTitle,price as currentPrice FROM products;
```

假设数据库里存放了一些手机的商品数据（id、brand、title、price、score、voteCnt、url、pid）



==**where条件查询**==

```sql
# 查询价格小于1000的手机
SELECT * FROM `products` WHERE price < 1000;

# 查询价格大于等于2000的手机
SELECT * FROM `products` WHERE price >= 2000;

# 价格等于3399的手机
SELECT * FROM `products` WHERE price = 3399;

# 价格不等于3399的手机
SELECT * FROM `products` WHERE price = 3399;

# 查询华为品牌的手机
SELECT * FROM `products` WHERE `brand` = '华为';
```



```sql
# 查询品牌是华为，并且小于2000元的手机
SELECT * FROM `products` WHERE `brand` = '华为' and `price` < 2000;
SELECT * FROM `products` WHERE `brand` = '华为' && `price` < 2000;

# 查询1000到2000的手机（不包含1000和2000）
SELECT * FROM `products` WHERE price > 1000 and price < 2000;

# OR: 符合一个条件即可
# 查询所有的华为手机或者价格小于1000的手机
SELECT * FROM `products` WHERE brand = '华为' or price < 1000;

# 查询1000到2000的手机（包含1000和2000）
SELECT * FROM `products` WHERE price BETWEEN 1000 and 2000;

# 查看多个结果中的一个
SELECT * FROM `products` WHERE brand in ('华为', '小米');
```



**模糊查询**

1、%表示匹配任意字符

2、—表示匹配一个的任意字符

```sql
# 查询所有以v开头的title
SELECT * FROM `products` WHERE title LIKE 'v%';

# 查询带M的title
SELECT * FROM `products` WHERE title LIKE '%M%';

# 查询带M的title必须是第三个字符
SELECT * FROM `products` WHERE title LIKE '__M%';
```



**查询结果排序**

ORDER BY：

1、ASC：升序排列

2、DESC：降序排列

```sql
#华为手机，小米手机安价格升序排序，价格相同则按照分数降序排序
SELECT * FROM products WHERE brand IN ('华为','小米')
					ORDER BY price ASC,score DESC

```



==**分页查询**==

当数据库中的数据非常多时，一次性查询到所有的结果进行显示是不太现实的。

在 真是开发中，我们都会要求用户传入ofset、limit或者page等字段，他们的母的是让我们在数据库中及性能分页查询

```sql
#方式一：LIMIT 多少条数据 OFFSET 偏移量
SELECT * FROM products LIMIT 20 OFFSET 0; #第一次查询
SELECT * FROM products LIMIT 20 OFFSET 20; #第二次查询

#方式二：LIMIT 偏移量，多少条数据
SELECT * FROM products LIMIT 0,20;
SELECT * FROM products LIMIT 20,20;

```



==**聚合函数**==

聚合函数表示对值集合进行操作的组（集合）函数。

```sql
#聚合函数的使用
#求所有手机的价格总和
SELECT SUM(price) as totalPrice FROM products;

#求华为手机的价格总和
SELECT SUM(price) FROM products WHERE brand = '华为';

#求华为手机的平均价格
SELECT AVG(price) FROM products WHERE brand = '华为';

#最高手机的价格和最低手机的价格
SELECT MAX(price) FROM products;
SELECT MIN(price) FROM products;

```



```sql
#求华为手机的个数
SELECT COUNT(*) FROM products WHERE brand = '华为';
SELECT COUNT(*) FROM products WHERE brand = '苹果';
SELECT COUNT(url) FROM products WHERE brand = '苹果';
#去重
SELECT COUNT(DISTINCT price) FROM products;
```



**group by与having的使用**

```sql
#GROUP BY 的使用
#查看各个品牌的平均价格、款式个数、平均评分
SELECT brand,AVG(price),COUNT(*),AVG(score) FROM products GROUP BY brand;

#HAVING 的使用——用于对分组的数据进行筛选
#查看各个品牌评分大于2000的平均价格、款式个数、平均评分
SELECT brand,AVG(price) AS avgPrice,COUNT(*),AVG(score) FROM products 
GROUP BY brand HAVING avgPrice > 2000;

#案例：求各个手机品牌手机，评分大于7.5的平均价格；
SELECT brand,AVG(price) FROM products WHERE score > 7.5 GROUP BY brand;
#说明：where可以再 GROUP BY之前使用，但是不能在之后使用

```



==**多表查询**==

假设之前的商品表products，还需要包括对应的官网，品牌世界排名，品牌的市值等等。我们不能将所有的数据都存到products中，一方面新的数据与products名称的意义不符，另一方面，多个品牌一致时，会造成大量的冗余数据。

简单理解：就是为表增加一个可以与另外一个表关联起来的列

新创建出一张新表，并往里边存入需要的数据

```sql
CREATE TABLE IF NOT EXISTS `brand`(
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(20) NOT NULL,
website VARCHAR(100),
worldRank INT
);

INSERT INTO `brand` (name, website, worldRank) VALUES ('华为', 'www.huawei.com', 1);
INSERT INTO `brand` (name, website, worldRank) VALUES ('小米', 'www.mi.com', 10);
INSERT INTO `brand` (name, website, worldRank) VALUES ('苹果', 'www.apple.com', 5);
INSERT INTO `brand` (name, website, worldRank) VALUES ('oppo', 'www.oppo.com', 15);
INSERT INTO `brand` (name, website, worldRank) VALUES ('京东', 'www.jd.com', 3);
INSERT INTO `brand` (name, website, worldRank) VALUES ('Google', 'www.google.com', 8);

```

添加外键的方式一：创建表时设置

```sql
CREATE TABLE IF NOT EXISTS `products`(
id INT PRIMARY KEY AUTO_INCREMENT,
#.....
brand_id INT,
FOREIGN KEY(brand_id) REFERENCES brand(id)
);
```



方式二：

为表新增列，并设置外键

```sql
ALTER TABLE products ADD brand_id INT;
ALTER TABLE products ADD FOREIGN KEY(brand_id) REFERENCES brand(id);
```



现在我们可以将products中的brand_id关联到brand中的id的值

```sql
UPDATE `products` SET `brand_id` = 1 WHERE `brand` = '华为';
UPDATE `products` SET `brand_id` = 4 WHERE `brand` = 'OPPO';
UPDATE `products` SET `brand_id` = 3 WHERE `brand` = '苹果';
UPDATE `products` SET `brand_id` = 2 WHERE `brand` = '小米';
```

**外键存在时更新和删除数据**

当一个表引用的外键发生了更新或者删除的操作，默认是会报错的。不能执行相关的操作。

因为外键默认的属性时**RESTRICT**：当更新或者删除某个记录时，会检查该记录是否有关联的外键记录，有的话就会报错，不允许更新或者删除

**VASVADE**：当更新或者删除某个记录时，会检查该记录是否有关联的外键记录，有的话：

1、更新：那么会更新对应的记录

2、删除：关联的记录也会被一起删除

**SET NULL**：当更新或者删除某个记录时，会检查该记录是否有关联的外键记录，有的话，将对应的值设置为null



案例：修改外键，对应的记录保持更新

```sql
# 执行命令-查看表结构
SHOW CREATE TABLE `products`;
#查看得知外键名为products_ibfk_1

# 删除之前的外键
ALTER TABLE `products` DROP FOREIGN KEY products_ibfk_1;

#增加新的外键，并设置action
ALTER TABLE `products` ADD FOREIGN KEY (brand_id) 
REFERENCES brand(id) 
ON UPDATE CASCADE ON DELETE CASCADE;
```



**什么是多表查询**

以上边的两张表为例，如果我们希望查询到产品的同时，显示对应的品牌相关的信息，因为数据时存放在两张表中，所以这个时候就需要进行多表查询。

```sql
#错误示范
SELECT * FROM products,brand
#最终结果个数是表1X表格2中的每一项，显示是错误的(笛卡尔乘积)
```



==**常见的多表连接方式**：==

1、左连接

获取左边所有的数据

以案例来说，无边左边的表是否有对应的brand_id的值对应右边表的id，左边的数据都会被查询出来

完整写法：LEFT [OUTER] JOIN

<img src="img/node/左连接.jpg" style="zoom:80%;" />

```sql
SELECT * FROM products LEFT JOIN brand ON products.brand_id = brand.id;

SELECT * FROM products LEFT JOIN brand ON products.brand_id = brand.id
WHERE brand_id IS NULL;
```



2、右连接

希望获取到的是右边的所有数据

<img src="img/node/右连接.jpg" style="zoom: 80%;" />

```sql
SELECT * FROM products RIGHT JOIN brand on products.brand_id = brand.id;

SELECT * FROM products RIGHT JOIN brand on products.brand_id = brand.id
WHERE products.id IS NULL;
```



3、内连接

内连接表示左边的表和右边的表都有对应的数据关联

写法：CROSS JOIN 或者 JOIN

<img src="img/node/内连接.jpg" style="zoom:50%;" />

```sql
SELECT * FROM products INNER JOIN brand ON products.brand_id = brand.id;
```



4、全连接

SQL规范中全连接使用FULL JOIN，但是MYSQL中并没有对它的支持，可以用UNION来实现

<img src="img/node/全连接.jpg" style="zoom:50%;" />

```sql
(SELECT * FROM `products` LEFT JOIN `brand` ON `products`.brand_id = `brand`.id)
UNION
(SELECT * FROM `products` RIGHT JOIN `brand` ON `products`.brand_id = `brand`.id);


(SELECT * FROM `products` LEFT JOIN `brand` ON `products`.brand_id = `brand`.id 
 WHERE `brand`.id IS NULL)
UNION
(SELECT * FROM `products` RIGHT JOIN `brand` ON `products`.brand_id = `brand`.id 
 WHERE `products`.id IS NULL);
```



==**多对多关系**==

数据库中数据之间的关系大致可以分成三种：

1、一对一

2、一对多

3、多对多



什么是多对多？

比如在大学，学生可以选择多门课程，一门课程可以被多个学生选择。这种复杂的关系在开发中应该如何处理呢？

答：建立学生表、选课表之间的关系表

**案列解析**

1、数据准备

```sql
#创建学生表
CREATE TABLE IF NOT EXISTS student (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(20) NOT NULL,
	age INT
);

#创建课程表
CREATE TABLE IF NOT EXISTS courses (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name varchar(20) NOT NULL,
	price DOUBLE NOT NULL
);
```



2、插入数据

```sql
#插入数据
INSERT INTO `students` (name, age) VALUES('小明', 18);
INSERT INTO `students` (name, age) VALUES('小红', 22);
INSERT INTO `students` (name, age) VALUES('小林', 25);
INSERT INTO `students` (name, age) VALUES('小刚', 16);
INSERT INTO `students` (name, age) VALUES('小华', 20);

INSERT INTO `courses` (name, price) VALUES ('英语', 100);
INSERT INTO `courses` (name, price) VALUES ('语文', 666);
INSERT INTO `courses` (name, price) VALUES ('数学', 888);
INSERT INTO `courses` (name, price) VALUES ('历史', 80);
INSERT INTO `courses` (name, price) VALUES ('地理', 788);
INSERT INTO `courses` (name, price) VALUES ('政治', 80);

```

3、创建关系表，并插入数据

```sql
#创建关系表

CREATE TABLE IF NOT EXISTS students_courses (
	id INT PRIMARY KEY AUTO_INCREMENT,
	student_id INT NOT NULL,
	course_id INT NOT NULL,
	FOREIGN KEY (student_id) REFERENCES students(id) ON UPDATE CASCADE,
	FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE CASCADE
);
```



```sql
#小明选了英语、数学
INSERT INTO students_courses (student_id,course_id) VALUES (1,1);
INSERT INTO students_courses (student_id,course_id) VALUES (1,3);


#小红选了语数英
INSERT INTO students_courses (student_id,course_id) VALUES (2,1);
INSERT INTO students_courses (student_id,course_id) VALUES (2,2);
INSERT INTO students_courses (student_id,course_id) VALUES (2,3);

#小华选了历史、语文
INSERT INTO students_courses (student_id,course_id) VALUES (5,2);
INSERT INTO students_courses (student_id,course_id) VALUES (5,4);

```



4、查询案例

```sql
#查询案例
#1.查询所有有选课的学生，选了哪些课程
SELECT s.id id,s.name stuName,s.age stuAge,c.id cId,c.price cPrice
FROM students s
JOIN students_courses sc on s.id = sc.student_id
JOIN courses c on c.id = sc.course_id;


#2.查询所有学生的选课情况
SELECT s.id id,s.name stuName,s.age stuAge,c.id cId,c.price cPrice
FROM students s
LEFT JOIN students_courses sc on s.id = sc.student_id
LEFT JOIN courses c on c.id = sc.course_id;

#3.哪些学生是没有选课的
SELECT s.id id,s.name stuName,s.age stuAge,c.id cId,c.price cPrice
FROM students s
LEFT JOIN students_courses sc on s.id = sc.student_id
LEFT JOIN courses c on c.id = sc.course_id
WHERE	c.id IS NULL;

#4.哪些课是没有被选的
SELECT s.id id,s.name stuName,s.age stuAge,c.id cId,c.price cPrice
FROM students s
RIGHT JOIN students_courses sc on s.id = sc.student_id
RIGHT JOIN courses c on c.id = sc.course_id
WHERE s.id IS NULL;

#5.小明选择了哪些课程
SELECT s.id id,s.name stuName,s.age stuAge,c.id cId,c.price cPrice
FROM students s
LEFT JOIN students_courses sc on s.id = sc.student_id
LEFT JOIN courses c on c.id = sc.course_id
WHERE s.id = 1;
```



**将查询数据转换为json**

`SELECT * FROM products LEFT JOIN brand ON products.brand_id = brand.id;`

在这条语句中，我们查询出了所有手机信息以及其品牌的数据。

但是可以发现，多种款式的手机对应的品牌往往是同一个，没必要起太多列来存放这些品牌信息，如果可以将品牌信息整合成为一列json数据，不仅简单明了，发送给前端处理起来也方便

```sql
#将查询到的数据转成对象（一对多）

SELECT 
	products.id id,products.title title,products.price price,
	JSON_OBJECT('id',brand.id,'name',brand.`name`,'website',brand.website) brand
FROM products
LEFT JOIN brand ON products.brand_id	= brand.id;

```

输出的样式

| id   | title               | price | brand                                                  |
| ---- | ------------------- | ----- | ------------------------------------------------------ |
| 1    | 华为nova3（全网通） | 2699  | {"id": 1, "name": "华为", "website": "www.huawei.com"} |



**多对多转换成数组**

可以看到，一个品牌对应多个款式的手机，一款手机只有一个品牌这是一种一对多的关系。

如果是多对多呢？

以学生与选课之间的关系为例

| id   | stuName | stuAge | cId  | cPrice | name |
| ---- | ------- | ------ | ---- | ------ | ---- |
| 1    | 小明    | 18     | 1    | 100    | 英语 |
| 1    | 小明    | 18     | 3    | 888    | 数学 |

如何将上方的数据组织成对象，放入一个数组中呢（多对多）

```sql
SELECT
	s.id,s.name,s.age,
	JSON_ARRAYAGG(JSON_OBJECT('id',c.id,'name',c.`name`,`price`,c.price))
FROM students s
JOIN students_courses sc on s.id = sc.student_id
JOIN courses c on c.id = sc.course_id
GROUP BY s.id;
```

最终结果

| id   | name | age  | result                                                       |
| ---- | ---- | ---- | ------------------------------------------------------------ |
| 1    | 小明 | 18   | [{"id": 1, "100": 100.0, "name": "英语"}, {"id": 3, "888": 888.0, "name": "数学"}] |



### 12.6 在node中使用mysql

真实开发中，都是通过代码额度执行SQL语句的。Node中就可以执行SQL语句（需要借助第三方库）

1、mysql：最早的Node连接MYSQL的数据库驱动

2、mysql2：在mysql的基础上，进行了优化和改进

目前来说，mysql2更好用一些，有更好的性能，支持promise等

安装:`npm install mysql2`

**基本使用**

```javascript
const mysql  = require('mysql2');

// 1.创建连接,获取对象
const connection = mysql.createConnection({
    host:'localhost',
    database:'linming',
    user:'root',
    password:'123456'
})

// 2.执行SQL语句
const statement = `
SELECT * FROM students;
`

connection.query(statement,(err,results,fields) => {
    console.log(results);
   	// 停止
    connection.end();
})
```

注：上方的语句虽然实现了查询，但是性能缓慢，且不安全。

一般我们需要通过预编译语句来执行会更好一些

**prepared statement(预编译语句)**

1、提高性能：将创建的语句模块发送给MYSQL，然后MYSQL编译（解析、优化、转化）语句模块，并且存储。它不执行，只有我们提供执行参数时，才会执行。而且，就算多次执行，也只会编译一次，所以性能是更高的；

2、防止SQL注入

```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:'localhost',
    database:"linming",
    user:'root',
    password:'123456'
})

// 编写预编译语句 (参数用问号代替)
const statement = `
SELECT * FROM products WHERE price > ? AND score > ?;
`

// execute包含了prepare和query两步操作
connection.execute(statement,[8000,5],(err,results) => {
    console.log(results);
})
```



**connetction pools连接池**

上方的代码中，我们创建了一个连接，但是如果有多个请求的话，该连接很有可能正在被占用，那么是否每次发送一个请求都要去创建一个新的连接呢？

答：不需要

mysql2提供了连接池，连接池可以在需要的时候自动创建连接，并且创建的连接不会被销毁，会放到连接池中，后续可以继续使用

```javascript
const mysql = require('mysql2');

// 创建连接池
const connections = mysql.createPool({
    host:'localhost',
    post:3306,
    database:'linming',
    user:'root',
    password:'123456',
    connectionLimit:10 //最大连接限制
});

// 使用连接池
const statement = `
    SELECT * FROM products WHERE price > ? AND score > ?;
`

connections.execute(statement,[8000,5],(err,results) => {
    console.log(results);
});
```



**使用promise**

为了避免回调地狱，开发中尽量少使用回调函数的方式获取数据，多使用promise的方式。

```javascript
// 使用连接池
const statement = `
    SELECT * FROM products WHERE price > ? AND score > ?;
`

connections.promise().execute(statement,[8000,5]).then(([results]) => {
    console.log(results);
}).catch(err => {
    console.log(err);
})
```

注：这里的then（res）实际会包含results和fields，然后我们不需要fields，所结构结构的方式取出了[results]


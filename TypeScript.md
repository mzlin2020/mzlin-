# TypeScript

## 一、JavaScript的问题

并且随着近几年前端领域的快速发展，让JavaScript迅速被普及和受广大开发者的喜爱，借助于JavaScript本身的

强大，也让使用JavaScript开发的人员越来越多。

但是，JavaScript也存在许多的问题

**缺点**

1、ES5使用的var关键字关于作用域的问题

2、JavaScript设计之初的数组类型并不是连续的内存空间

3、直到今天，JavaScript也**没有加入类型检测**这一机制

**类型错误**

```js
// 当前foo函数的问题
// 1.没有对类型进行检验
// 2.没有对是否传入参数进行检验
function foo(message) {
    console.log(message.length);
}

foo("hello world"); //正常使用
foo(123); //数值没有.length，报错
foo(); //没有传值，报错
```

这种类型检测的缺点，只有等到运行期间才发现。并且当这个错误产生时，会影响后续代码的继续执行，也就是整个项目都因为这一个小小错误而陷入崩溃。



**如何避免这样的错误**

当我们自己编写简单的项目时，这样的错误很容易避免，并且当出现错误时，也很容易检查出来。

但是当我们开发一个大型项目，并不能总保证不会出现这样子的问题，而且如果我们是调用了别人的类库，也不知道应该传入怎样的参数。

如果可以给JavaScript加上很多限制，就可以解决这个问题了。

比如上方的foo函数中，应规定str是一个必传的类型，没有传值在编译期间就直接报错；

比如foo函数必须是String类型，传入其他类型，编译期间直接报错；



**解决方案**

为了弥补JavaScript类型约束上的缺陷，增加类型约束，很多公司推出了自己的方案：

1、2014年，Facebook推出了flow来对JavaScript进行类型检查；

2、同年，Microsoft微软也推出了TypeScript1.0版本；

时至今日，无疑TypeScript是更好用的，Vue3.x已经全线转向TypeScript，很多的项目都慢慢过渡到了TypeScript。



## 二、TypeSctipt概述

**定义：**

TypeScript是拥有类型检测的JavaScript超集，它可以编译成普通、干净、完整的JavaScript代码

**理解**

1、可以将typescript理解成加强版的JavaScript

2、JavaScript所拥有的特性，typescript全部都是支持的，并且随着ECMAScript的标准，包括ES6、7、8等语法标准

3、TypeScript在实现新特性的同时，总是保持和ES标准的同步甚至是领先

4、并且TypeScript最终会被编译成JavaScript代码，在编译时也不需要借助于Babel这样的工具

**特点**

（官方解释）

1、**始于JavaScript，归于JavaScript**

TypeScript从今天数以百万计的JavaScript开发者所熟悉的语法和语义开始。使用现有的JavaScript代码，包括流行的JavaScript库，并从JavaScript代码中调用TypeScript代码；

TypeScript可以编译出纯净、 简洁的JavaScript代码，并且可以运行在任何浏览器上、Node.js环境中和任何支持ECMAScript 3（或更高版本）的JavaScript引擎中；

2、**TypeScript是一个强大的工具，用于构建大型项目**

类型允许JavaScript开发者在开发JavaScript应用程序时使用高效的开发工具和常用操作比如静态检查和代码重构；类型是可选的，类型推断让一些类型的注释使你的代码的静态验证有很大的不同。类型让你定义软件组件之间的接口和洞察现有JavaScript库的行为；

3、**拥有先进的 JavaScript**

TypeScript提供最新的和不断发展的JavaScript特性，包括那些来自2015年的ECMAScript和未来的提案中的特性，比如异步功能和 Decorators，以帮助建立健壮的组件；

这些特性为高可信应用程序开发时是可用的，但是会被编译成简洁的ECMAScript3（或更新版本）的JavaScript；



**typescript编译时环境**

安装：`npm i typescript -g`

查看版本：`tsc --version`

```typescript
//hello_typescript.ts

let message: string = 'hello world';

function bar(payload: string) {
    console.log(payload.length); 
}
bar("hi")
```

编译成js代码 `tsc hello_typescript.ts`

```js
//hello_typescript.js

var message = 'hello world';
function bar(payload) {
    console.log(payload.length);
}
bar("hi");
```

我们会发现，当编译成js代码后，原来的message、bar会报警告。

这是因为默认所有的ts元素在同一文件夹中是处于同一作用域的，可以通过export关键字表明每一个文件是一个模块，元素有自己的作用域。



**ts运行时环境搭建**

上边的编译过程略显麻烦，我们可以通过以下两种方式，一步到位。

**1、ts-node**

安装：`npm install ts-node -g`

安装依赖：`npm install tslib @types/node -g`

使用：`ts-node hellots.ts`



**2、webpack搭建环境**

初始化项目：`npm init -y`

局部安装webpack:`npm install webpack webpack-cli -d `

配置脚本：

```js
//package.json
 "scripts": {
    "build": "webpack"
  },
```

配置webpack.config.js

```js
const path = require('path')

module.exports = {
    entry:"./src/main.ts",
    output:{
        path:path.resolve(__dirname,'./dist'),
        filename:"bundle.js"
    },
    resolve:{
        extensions:['.ts','.js']
    }
}
```

为了解析ts文件，我们需要安装对应的loader,并配置

`npm install ts-loader typescript -d`

`tsc --init`

```js
const path = require('path')

module.exports = {
    module:{
        rules: [
            {
                test:/\.ts$/,
                loader:"ts-loader"
            }
        ]
    }
}
```

搭建本地服务：`npm install webapck-dev-server`

并配置package.json

```js
  "scripts": {
    "serve":"webpack serve"
  },
```

dev-server要求有一个模板文件index.html,可以安装一个html-webpack-plugin自动寻找这个插件

安装:`npm install html-webpack-plugin -d`并配置

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

    plugins:[
        new HtmlWebpackPlugin({
            template:'./index.html'
        })
    ]
}
```

## 三、基础语法

### 3.1 变量声明

完整的声明格式：

声明了类型后TypeScript就会进行类型检测，声明的类型可以称之为类型注解

`var/let/const 标识符：数据类型 = 赋值;`



```ts
let message:string = "hello world;"
```

注：string是小写的，大小写有很大的区别。

string是typescript中定义的字符串类型，String是es定义的字符串包装类



**类型推断**

默认情况下进行赋值时，会将赋值的值的类型，作为前面标识符的类型，这个过程叫做类型推断

```ts
let foo = "foo" //这里foo默认的类型为string

foo = 123 //报错
```



**数组类型的定义**

数组在ts开发中，存放的数据类型最好是固定的（在数组中存放不同的类型是不好的习惯）

```ts
//方式一：
const names1:string[] = ["12","13","15","16"] //推荐

//方式二：
const names2:Array<string> = ["12","23","32","54"] //不推荐（与jsx有冲突）
```

这样子定义后，当向name1，name2添加其他类型时，会直接报错



### 3.2 ts中的数据类型

**any类型**

在某些情况下，我们确实无法确定一个变量的类型，并且可能它会发生一些变化，这个时候我们可以使用any类型

```ts
let a:any = "ming";
a = 123;
a = true;
```

我们可以对any类型的变量进行任何的操作，包括获取不存在的属性、方法。

我们可以给any类型的变量赋值任何的值，比如数字、字符串的值

因为any太过于灵活，频繁使用会使得代码变得不安全。

**unknown类型**

unknown是ts中比较特殊的一种类型，它用于描述类型不确定的变量。

```ts
function foo () {
    return 250;
}

function bar () {
    return "250"
}

let flag = true;  //flag是不确定的
let result: unknown //最好不使用any
if (flag) {
    result = foo()
} else {
    result = bar()
}
// 所以最终难以确定result到底是数值、还是字符串类型。
//所以最好类型限制使用unknown
```



**void类型**

void通常用来指定一个函数是没有返回值的，那么它的返回值就是viod类型；

我们可以将null和undefined赋值给void类型，也就是函数可以返回null或者undefined

```ts
function sum(num1:number, num2:number) {
    console.log(num1 + num2);
    return null //赋值给了void
}
```

```ts
function sum(num1:number, num2:number):void {
    console.log(num1 + num2);
}
//这个函数没有写任何类型，那么它的默认值就是viod
```



**never类型**

never表示永远不会发生值的类型，比如一个函数：

如果一个函数中是一个死循环或者抛出一个异常，那么这个函数会返回东西吗？不会，那么写void类型或者其他类型作为返回值类型都不合适，这个时候就可以使用never类型

```ts
function bar ():never{
    while(true) {
        console.log("死循环");
        
    }
}
```



**tuple类型**

为什么要有元组？

因为数组中通常建议存放相同类型的元素，不同类型的元素是不推荐放在数组中的。

```ts
// 数组的弊端

//如果要在数组中使用多种类型的值，类型推断就要设置为any
const info:any[] = ["why",18,1.88];
const name = info[0]    //这个时候，name的类型默认就是any了
console.log(name.length); 
//问题：当info[0]的值，没有length方法时就直接报错了
```

元组的定义：

`const info:[string,number,number] = ['ming', 20, 1.99]`



### 3.3 函数的参数类型

函数是JavaScript非常重要的组成部分，typescript允许我们指定函数的参数和返回值的类型。

声明函数时，可以在每个参数后添加类型注解，以声明函数接受的参数类型

```ts
    //给参数加上类型注解：num1:number ,num2:number
	function sum(num1:number,num2:number) {
        return num1 + num2
    }
```

```ts
	//给返回值加上类型注解
	function sum(num1:number,num2:number):number {
        return num1 + num2
    }
	//不过，在开发中，通常情况下可以不写返回值的类型（会自动推导）
```



通常情况下，定义一个函数时，都会给参数加上参数注解

```ts
function foo(message:string) {} 
```

但是下列的情况，可以不加

```js
//匿名函数
const names = ['abc','cba','nba']
names.forEach(function(item:string) {  //这里可以不写
    console.log(item.split(""))
})
//注：item会根据上下文的环境推导出来，这个时候可以不添加类型注解
```



**参数是对象类型**

```ts
    function printPoint (point:{x:number,y:number}) {
        console.log(point.x);
        console.log(point.y);
    }
    printPoint({x:123,y:232})
```

当然，也可以传入可选类型(在属性值后+？)

注：可选类型必须写在必选类型的后边

```ts
    function printPoint (point:{x:number,y:number,z?:number}) {
        console.log(point.x);
        console.log(point.y);
        console.log(point.z)
    }
    printPoint({x:123,y:232}) //输出：123 232 undefined
	printPoint({x:123,y:433,z:223}) //输出：123 433 233
	
```



**参数是联合类型**

typescript的类型系统允许我们使用多种运算符，从现有类型中构建新类型

1、联合类型是由两个或者多个其他类型组成的类型

2、表示可以是这些类型中的任何一个值

3、联合类型中的每一个类型被称之为联合成员

```ts
    function printID(id: number|string|boolean) {
        console.log(id);
    }
    printID(123);
    printID("abc");
    printID(true);
```

使用联合类型的时候，要特别注意

```ts
    function printID(id: number|string|boolean) {
        console.log(id.toUpperCase()); 
        //方法将字符串转换为大写，但是不能保证传进来的id一定是string,所以报错
    }
```

一定要这么写的话，可以这样子操作()

```ts
    function printID(id: number|string|boolean) {
        if(typeof id === 'string') {
            console.log(id.toUpperCase()); //不会报错，ts会帮助我们确定id是个string类型
        } else {
            console.log(id);
        }
    }
```

**可选类型和联合类型的关系**

一个参数本身是可选的

```ts
    function foo(message?:string) {
        console.log(message);
        
    }
    foo()
```



**类型别名**

在前边，通过类型注解中编写对象类型 和 联合类型，但是当我们想多次复用代码看起来太长的时候，可以给对象类型起一个别名

```ts
function printPoint (point:{x:number,y:number,z?:number}) {}

function printID(id: number|string|boolean) {}
```

```ts
    //type用于定义类型别名（type alias）
    type PointType = {
        x:number
        y:number
        z?:number
    }
    function printPoint(point:PointType) {}
```

```ts
	type IDType = string | number | boolean

    function printID(id:IDType) {}
```



### 3.4 ts类型补充

**1、类型断言as**

有时候ts无法获取具体的类型信息，这个时候我们需要使用类型断言

```ts
   // <img id="lin" />
    const el = document.getElementById('lin')
    el.src = "url地址"  //报错，但是el是一个img标签，ts无法检测出其类型
```

这里，ts只知道函数会返回HTMLElement，但并不知道它具体的类型

```ts
//使用类型断言
    const el = document.getElementById('lin') as HTMLImageElement
    el.src = "url地址"  //不报错了
```



**2、非空类型断言！**

非空类型断言使用 ！ ，表示可以确定某个标识符是有值的，跳过ts在编译阶段对它的检测

```TS
    //message是可选的 --> undefined | string
	function printMessageLength(message?:string) {
        console.log(message.length); //在没有tsconfig.json文件时，不报错，但是编译不通过
    }
```

因为我们使用的ts-node在运行时，会在内部检测tsconfig.json的配置

但是有时候我们在调用这个函数时，一定会给它传一个字符串参数，基本不会不传，为了使用上边定义的函数通过，有两种做法

```ts
//做法一
    function printMessageLength(message?:string) {
        if(message) {
            console.log(message.length);
        }
    }
```

```ts
//做法二 使用非空断言
    function printMessageLength(message?:string) {
        console.log(message!.length);     
    }
```



**3、!! 和 ??**

!!运算符的使用:

将一个其他类型转换成boolean类型

```ts
const message = "hello world"

// const boolean = new Boolean(message)
// console.log(boolean);

// 等价于
const boolean = !!message;
console.log(boolean);
```

??操作符：

空值合并操作符??是一个逻辑运算符，当操作符左侧是null或者undefined时，返回右侧操作数，否则返回左侧操作数；(类似三元操作符)

```ts
let message: string|null = null
const content = message?? "hello world"
console.log(content); //输出hello world


let message: string|null = "i do not like you"
const content = message?? "hello world"
console.log(content);  //输出：i do not like you
```



**4、字面量类型**

```ts
// "hello woeld"也是可以作为类型的，叫做字面量类型
const message:"hello world" = "hello world"

let num:123 = 123
num = 321 //报错
```

默认情况下这么做没什么意义，但是可以将多个类型联合起来。

```ts
// 字面量类型的意义，就是必须结合联合类型
type Alignment = 'left' | 'right' |'center'
let align:Alignment = 'left'
align = 'right'
align = 'center'
```

这样一来，就将align的取值限定在这三个值中的一个



### 3.5 类型缩小

类型缩小：在给定的执行路径中，我们可以缩小比声明时更小的类型，这个过程称之为缩小。

而我们编写额度 `typeof 参数 === number`等判断语句，可以称之为类型保护。

常见的类型保护有如下几种：
1、typeog   

2、平等缩小

3、instanceof

4、in

```ts
// 1.typeof 的类型缩小
type IDType = number | string
function printID(id:IDType) {
    if(typeof id === 'string') {
        console.log(id.toUpperCase);
    } else {
        console.log(id);
    }
}
```

```ts
// 2.平等的类型缩小（=== == !== !=）
type Direction = "left" | "right" | "top" | "bottom"
function printDirection(direction:Direction) {
    if (direction === 'left') {
        console.log(direction); //类型肯定为left
    } else if (direction === 'right') {
        console.log(direction);
    }
}
```

```ts
// 3. instanceof
function printTime(time: string|Date) {
    if (time instanceof Date) {
        console.log(time.toUTCString);
    } else {
        console.log(time);
    }
}
```

### 3.6 函数类型

在JavaScript开发中，函数是最重要的组成部分，并且函数可以作为一等公民（可以作为参数，也可以作为返回值进行传递）

在使用函数的过程中，函数也有自己的类型

```typescript
// 1.函数作为参数时，在参数中如何编写类型
function foo () {} //作为另一个函数的参数

type FooFnType = () => void
function bar(fn: FooFnType) {

}
// 使用bar
bar(foo)
```

```ts
// 2.定义常量时，编写函数的类型
type AddFnType = (num1:number,num2:number) => number
const add:AddFnType = (num1:number,num2:number) => {
    return num1 + num2
}
```

**小案例**

```ts
function calc(n1:number,n2:number,fn:(num1:number,num2:number) => number) {
    return fn(n1,n2)
}

const res1 = calc(20,30,function(a1,a2) {
    return a1 + a2
})
console.log(res1);

const res2 = calc(20,30,function(a1,a2){
    return a1 * a2
})

console.log(res2);
```



**函数的重载**

函数的重载：函数的名称相同，但是参数不同的几个函数，就是函数重载

在ts中，如果我们编写一个add函数，希望可以对字符串和数字类型进行相加，应该如何编写呢？

```ts
//错误写法：联合类型
function sum(a1:number|string,a2:number|string) :number|string {
    return a1 + a2
}
```

那么应该怎么编写呢？

在ts中，我们可以编写不同的重载签名来表示函数可以以不同的方式进行调用。一般是编写两个或者以上重载签名，再去编写一个通用的函数以及实现

```ts
function add(num1:number,num2:number) :number; //没有函数体
function add(num1:string,num2:string) :string; //没有函数体

function add(num1:any,num2:any) :any {
    return num1 + num2
}

const res = add(20,30)
const res2 = add('abc','bca')

console.log(res,res2);
```



**默认参数与剩余参数**

从ES6开始，JavaScript是支持默认参数的，TypeScript也是支持默认参数的

```ts
function foo(x:number,y:number = 6) { //y其实是undefined和number的类型联合
    return x + y;
}
console.log(foo(10));
```



从ES6开始，JavaScript也支持剩余参数，剩余参数语法允许我们将一个不定数量的参数放到一个数组中

```ts
function sum(...nums:number[]) {
    let total = 0
    for(const num of nums) {
        total += num
    }
    return total
}

console.log(sum(10,20,30));
console.log(sum(10,20,30,40));
console.log(sum(10,20,30,40,50));
```



**ts中的this**

在ts中，this是可以被推导出来的

```ts
const info = {
    name:"ming",
    eating() {
        console.log(this.name + " eating");
    }
}

info.eating() //这里的this，ts推导出来为info对象
```

但是，下列的写法ts推导不出来，运行将报错

```ts
function eating() {
    console.log(this.name + " eating");
}
const info = {
    name:"ming",
    eating:eating
}

info.eating()
```

在js中，上方的两种写法都是一样的，都可以运行，但是在ts中却运行不了

```ts
//解决方案
type ThisType = {name:string}
function eating(this:ThisType) {
    console.log(this.name + " eating");
}
const info = {
    name:"ming",
    eating:eating
}
info.eating()
```



### 3.7 枚举类型

枚举类型是为数不多的ts特有的特性之一

枚举其实就是将一组可能出现的值，一个个列举出来，定义在一个类型中，这个类型就是枚举类型；

枚举允许开发者定义一组命名常量，常量可以是数字、字符串类型

```ts
enum Direction {
    LEFT,
    RIGHT,
    TOP,
    BOTTOM
}

function turnDirection (direction:Direction) {
    switch (direction) {
        case Direction.LEFT:
            console.log("转向左边~");
            break;
        case Direction.RIGHT:
            console.log("转向右边~");
            break;
        case Direction.TOP:
            console.log("转向上边~");
            break;
        case Direction.BOTTOM:
            console.log("转向下边~");
            break;
        default:
            const muDirection:never = direction;
    }
} 
```





## 四、类

### 4.1 初识类

在早期的JavaScript开发中（ES5）我们需要通过函数和原型链来实现类和继承，从ES6开始，引入了class关键字，可以更加方便的定义和使用类

TypeScript作为JavaScript的超集，也是支持使用class关键字的，并且还可以对类的属性和方法等进行静态类型检测

```ts
class Person {
    name:string = '' //需要初始化
    age:number = 0
    eating () {
        console.log(this.name +" eating");
    }
}

const p = new Person()
console.log(p.age);
```

或者也可以这样写

```ts
class Person {
    name:string //需要初始化
    age:number 
    constructor(name:string,age:number) {
        this.name = name,
        this.age = age
    }
    eating () {
        console.log(this.name +" eating");
    }
}
const p = new Person("ming",18)
console.log(p.name);
```

在类中，需要声明类的属性对应的类型，没有声明默认是any。

可以给属性初始值，或者通过构造函数constructor，在调用时传入。（constructor，在我们通过new关键字创建实例时，会被调用）



### 4.2 类的继承

面向对象的其中一大特性就是继承，继承不仅仅可以减少我们的代码量，也是多态的使用前提



场景解析：

假设我们创建了一个Student和Teacher类，但是两者存在大量的重复代码，之后可能还有其他类也有相同的代码，重复编写不仅麻烦，也造成代码臃肿。

可以创建一个父类Person，将Student类和Teacher类共有的代码逻辑抽离到父类Person中，而Student类和Teacher类通过继承拥有父类的方法属性

```ts
class Student {
    name:string = ""
    age:number = 0
    sno:number = 0
    eating() {
        console.log("eating");
    }
    studying() {
        console.log("studying");
    }
}
class Teacher {
    name:string = ""
    age:number = 0
    title:string = ""
    eating() {
        console.log("eating");
    }
    teaching() {
        console.log("teaching");
    }
}
```

可以看到两个类中，存在相同的代码。创建父类，实现继承

```ts
class Person {
    name:string = ''
    age:number = 0
    eating() {
        console.log("eating");
    }
}

class Student extends Person{
    sno:number = 0
    studying() {
        console.log("studying");
    }
}
class Teacher extends Person{
    title:string = ""
    teaching() {
        console.log("teaching");
    }
}
//使用
const stu1 = new Student()
console.log(stu1.name);
console.log(stu1.sno);
```

如果我们不想给父类Person的属性传入初始值，而是通过创建子类实例时传入，通过constructor函数调用，该怎么做呢

```ts
class Person {
    name:string 
    age:number 
    eating() {
        console.log("eating");
    }
    constructor(name:string,age:number) {
        this.name = name
        this.age  = age
    }
}
class Student extends Person{
    sno:number
    constructor(name:string,age:number,sno:number) {
        // super调用父类的构造器
        super(name,age)
        this.sno = sno
    }
    studying() {
        console.log("studying");
    }
}

const stu1 = new Student("ming",18,10010)
console.log(stu1.name);
console.log(stu1.sno);
```



### 4.3 类的多态

```ts
class Animal {
    action() {
        console.log("animal action");
    }
}

class Dog extends Animal {
    action() {
        console.log("dog running !!!");
    }
}

class Fish extends Animal {
    action() {
        console.log("fish swimming");
    }
}

function makeActions(animals:Animal[]) {
    animals.forEach(animal => {
        animal.action()
    })
}

makeActions([new Dog(),new Fish()])
```



### 4.4 ts类的成员修饰符

在TypeScript中，类的属性和方法支持三种修饰符： public、private、protected

+ public 修饰的是在任何地方可见、公有的属性或方法，默认编写的属性就是public的；

+ private 修饰的是仅在同一类中可见、私有的属性或方法；

+ protected 修饰的是仅在类自身及子类中可见、受保护的属性或方法

```ts
//private 

class Person {
    private name:string = "" //私有的外部不能直接访问

    getName() {
        return this.name  //通过这个内部方法访问name
    }
}

const p = new Person()
console.log(p.getName());
```

```ts
//protected：在类内部和子类可以访问
class Person {
    protected name:string = "123"
}

class Student extends Person{
    getName() {
        return this.name
    }
}

const stu = new Student()
console.log(stu.getName());
```



**getter和setter**

在前面一些私有属性我们是不能直接访问的，或者某些属性我们想要监听它的获取(getter)和设置(setter)的过程，

这个时候我们可以使用存取器。

```ts
class Person {
    private _name:string
    constructor(name:string) {
        this._name = name
    }
    // 访问器getter/setter
    set name(newName) {
        this._name = newName
    }
    get name() {
        return this._name
    }
}
const p = new Person("linming")
p.name = "ming"
console.log(p.name);
```



## 五、ts的接口

### 5.1 接口的声明

在前面我们通过type可以声明一个对象类型

```ts
type InfoType = { name:string, age:number }
const info:InfoType = {
    name:"ming",
    age:22
}
```

对象的另一种声明方式就是通过接口来声明

```ts
//接口中可以定义可选类型，也可以定义只读类型
interface InfoType {
    name:string
    age:number
}
const info:InfoType = {
    name:"ming",
    age:22
}
```



我们可以通过接口来统一定义对象的属性值，跟属性名的具体类型

```ts
// 通过interface来定义索引类型
interface IndexLanguage {
    [index:number] :string //索引为数值类型，值为字符串类型
}

const frontLanguage:IndexLanguage = {
    0:"HTML",
    1:"CSS",
    2:"javaScript",
    3:"vue"
    //定义其他类型直接报错
}
```



### 5.2 接口的继承

```ts
// 接口的继承
interface Iswim {
    swimming:() => void
}

interface Ifly {
    flying:() => void
}

interface Iaction extends Iswim,Ifly {}  //可实现多继承

const action :Iaction = {
    swimming(){},
    flying(){}
}
```



### 5.3 字面量赋值

来看下面的代码

```ts
interface IPerson {
    name:string,
    age:number,
    height:number
}

const student:IPerson = {
    name:"linming",
    age:18,
    height:188,
    address:"zhongshan"  //报错，因为类型检测时，address不存在于Iperson中
}
```

但是，只要简单修改一下，就不报错了。这是什么原因呢

```ts
interface IPerson {
    name:string,
    age:number,
    height:number
}

const student= {  //一般的对象写法
    name:"linming",
    age:18,
    height:188,
    address:"zhongshan"
}

const p:IPerson = student  //字面量赋值
```

这是因为ts在字面量直接赋值的过程中，为了进行类型推导会进行严格的类型限制。党史之后我们将一个变量标识符赋值给其他变量时，会进行freshness擦除操作（这里就把address擦除了）



## 六、泛型

软件工程的主要目的是构建不仅仅明确和一致的API，还要让代码具有很强的可重用性：

比如我们可以通过函数来封装一些API，通过传入不同的函数参数，让函数帮助我们完成不同的操作。但是对于参数的类型是否也可以参数化呢？



**类型的参数化**

在定义一个函数时，先不决定参数的类型。而是让调用者以参数的形式告知函数中的参数应该是什么类型

```ts
function foo<Type>(num:Type):Type {
    return num
}

// 调用方式一：明确传入类型 
foo<number>(20)   //告知参数是数值
foo<{name:string}>({name:"ming"})  //告知参数是对象
foo<any[]>(["aaa"])   //告知参数是数组


// 调用方式二：类型推导
foo(50)  //推导出来，参数类型为50
foo("hello")  //参数类型为hello
```



**泛型接收多种参数类型**

```ts
function foo<T,E,O>(arg1:T,arg2:E,arg3:O) {
    return [arg1,arg2,arg3]
}

foo<number,string,boolean>(10,"aaa",true)
```



**泛型接口**

```ts
// 泛型接口
interface IPerson<T1,T2> {
    name:T1
    age:T2
}

const p:IPerson<string,number> = {
    name:"ming",
    age:22
}
```



**泛型类的使用**

```ts
class Point<T> {
    x:T
    y:T
    z:T
    constructor(x:T,y:T,z:T) {
        this.x = x
        this.y = y
        this.z = z
    }
}
 
const p1 = new Point("1.33.2","2.22.3","3.33.4")  //自行推导
const p2 = new Point<string>("1.33.2","2.22.3","3.33.4") 
const p3:Point<string> = new Point("1.33.2","2.22.3","3.33.4") 
```



**泛型的类型约束**

```ts
interface ILength {
    length: number
}

function getLength<T extends ILength>(arg:T) {
    return arg.length
}

getLength('abc')
getLength(["acb","fas"])
getLength({length:100})
```



## 七、其他



**类型的查找**

typescript会在哪里查找我们的类型声明呢？

1、内置类型声明；

2、外部定义类型声明；

3、自己定义类型声明



在项目实际的开发过程中，我们经常会使用一些第三方库。比如axios、lodash 

```ts
import axios from 'axios'

axios.get("接口").then(res => {
    console.log(res);
    
})
```

但是，当我们使用lodash时，却报错了

```ts
import lodash from 'lodash'
```

这是因为ts帮助我们内置了JavaScript运行时的一些标准化API的声明文件。比如Math、Date等内置类型

而lodash不是内置类型

我们可以两种方式，对lodash进行声明

方式一：在自己的库中进行类型声明（编写.d.ts文件），比如axios

```ts
//创建ming.d.ts

declare module 'lodash' {
    export function join(arr:ant[]):void
}
```

```ts
//main.ts
import lodash from 'lodash'  //这次不报错了
console.log(lodash.join(["111","222"]))
```



方式二：通过社区的一个公有库DefinitelyTyped存放类型声明文件

在`https://www.typescriptlang.org/dt/search?search=`查找该库的另外一种安装方式，这种安装方式默认添加了声明





假设在index.html中的script标签中有如下代码

```js
//index.html
<script>
    let name = "linming"
    let age = 22

    function foo () {
        console.log("我写在html中");
    }

    function Person(name,age) {
        this.name = name
        this.age = age
    }
</script>
```

那么是否可以在main.ts中访问到呢？是可以的，因为打包时生成的js文件是会放在index.html的末尾

但是当我们在main.ts中访问时，却报错了。这个时候就需要先声明一下了

```js
//ming.d.js

// 声明变量/函数/类
declare let name:string
declare let age:number

declare function foo():void

declare class Person {
    name:string
    age:number
    constructor(name:string,age:number)
}
```

在main.ts中使用

```ts
import lodash from 'lodash' 
console.log(lodash.join(["111","222"]))

console.log(name);
foo() 

const p = new Person("linming",23)
console.log(p);
```


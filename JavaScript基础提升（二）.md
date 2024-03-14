# JavaScript基础提升（二）

```js
@title 'JavaScript基础提升（二）' 
@description 'JavaScript新版本特性、高级用法与部分原理提升'
@image 'https://mzlin2020-notes.oss-cn-shenzhen.aliyuncs.com/img/js%E9%AB%98%E7%BA%A7/%E7%BB%A7%E6%89%BF1.jpg'
```



## 一、浏览器工作原理

**1、根据网址查询代码，并下载**

当我们访问一个网站时，假设访问的是一个IP地址。那么浏览器会根据IP地址找到对应的服务器，并将对应的网站`index.html`代码下载下来

![](/img/js/browser-download.jpeg)

`index.html`一般关联着许许多多css代码和js代码，这个时候，也会被浏览器所下载下来

于是，浏览器呈现一个页面所需要的代码已经准备完毕，接下来就要解析这些代码了

**2、根据代码渲染页面**

浏览器渲染页面需要用到**浏览器内核**

我们常说的浏览器内核一般是指浏览器的排版引擎（浏览器引擎、页面渲染引擎）

浏览器内核，或者说浏览器引擎解析代码的过程如下：

<img src="/img/js/js-parse-render.jpg" style="zoom: 67%;" />

+ 1、首先html代码会被解析（parser），生成DOM树结构

+ 2、在解析html代码的过程中，如果**遇到js代码，会停止解析html**，转而去执行js代码（这是因为js代码可以操作DOM，而我们不想要整个DOM树构建出来后，再去解析js频繁修改DOM树，这样子十分消耗性能）

+ 3、css代码也进行解析（parser），生成一套style Rules。并最终与DOM树结合起来（Attachment）形成的渲染树（Render Tree）

+ 4、布局Render Tree对每个节点进行布局处理，确定在屏幕上的位置。最后通过遍历渲染树将每个节点绘制出来



> **补充：浏览器内核**
>
> + Gocko：早期被Netscape 和Firefox浏览器使用
> + Trident：微软开发，被应用于IE4-IE11浏览器使用，但是Edge浏览器已经转向Blink
> + Webkit：苹果基于KHTML开发、开源，用于Safari、Google Chrome往前的版本也在使用
> + Blink : Webkit的一个分支，Google开发，目前应用于Google Chrome、Edge、Opera



## 二、v8引擎的工作原理

> 注意：第二三章节核心在于理解js代码的执行过程，为理解闭包及作用域链做铺垫，其中涉及到了GO，VO，AO等概念，篇幅较长。可选择性阅读

在浏览器渲染页面的过程中，js是怎么执行的呢？

解析js代码是需要依靠js引擎的。这是因为，高级编程语言都是需要转成最终的机器指令来执行的（最终要能够被CPU所识别）

**v8引擎解析js代码**的过程如下：

![](/img/js/v8-parse.jpeg)

1、首先js代码会被解析器解析（parse，经过词法分析、语法分析），形成AST树（抽象语法树）

2、Ignition是一个解释器，会将AST转换成ByteCode（字节码）

3、字节码转换为2进制代码的机器代码，最终能够被CPU执行



**js代码在v8引擎中的执行流程**

结合上方的v8引擎解析js代码的过程，我们详细来看代码的执行过程:

+ 1、在js代码被解析成AST树时，会创建一个**GlobalObject对象**(也被称为**GO**)

+ 2、这个`GlobalObject对象`包含了常见的一些全局变量/函数/对象

```js
var GlobalObject = {
    String,
    Date,
    Number,
    setTimeout等等，
    window: GlobalObject   //其中window属性指向GlobalObject
}
```

window对象在这里相当于GlobalObject对象，拥有与其相同的属性



+ 3、在这个阶段（即js代码被解析成AST树过程中），我们下方的代码也会被解析。因为是全局代码，所以会被加入到GlobalObject对象中

```js
// 示例代码如下
var name = 'xiaoming'
var num1 = 20
var num2 = 30 
var result = num1 + num2
```

因为这些变量仅仅是定义了，尚未被执行，所以属性值还没有被赋值给变量，属性值暂时为undefined

```js
var GlobalObject = {
    // ...
    window: GlobalObject,
    name: undefined,
    num1: undefined,
    num2: undefined,
    result: undefined
}
```



+ 4、当到了运行代码阶段，v8引擎为了执行代码，会创建一个执行上下文栈（ECStack）

为了全局的代码能够正常的执行，又需要创建**全局执行上下文**(Global Execution Context GEC)

> 注：全局执行上下文维护着一个VO对象（Variable Object），指向GO



+ 5、开始执行代码，`name、num1、num2、result`的值undefined会被依次替换掉

```js
var GlobalObject = {
    // ...
    window: GlobalObject,
    name: 'xiaoming',
    num1: 20,
    num2: 30,
    result:50
}
```

6、于是不难得出，在num1执行前，如果打印num1，`console.log(num1)`，那么VO找到GO，GO找到的num1肯定是undefined



上边的代码只有变量的定义，如果要执行函数了，具体的过程是怎么样的呢？

**v8引擎执行函数的过程**（涉及函数作用域）

假设执行以下这么一段代码

```js
var name = 'xiaoming',
function foo(num) {
    console.log(m)
    var m = 20
    var n = 30
    console.log('v8执行函数')
}
foo(123) //调用
//v8在调用函数时，执行函数
```



+ 1、编译时：在代码解析成AST树时，创建一个GlobalObject对象

```js
//GO
var GlobalObject = {
    //...
    window: GlobalObject,
    name: undefined,
    foo: 0x100 // 内存地址
}
```

执行遇到函数时，会开辟一块存储函数的空间，所以GO里的`foo`指向一个内存地址(如图)

```js
//0x100
[[scope]]: parent scope  //父级作用域
函数执行体（代码块）
```

![](/img/js/v8-js-parse1.jpeg)

+ 2、即将执行时：在执行函数的过程中，会创建一个函数执行上下文(FEC),并将其放入函数调用栈中

![](/img/js/v8-js-parse2.jpeg)

函数执行上下文中包含一个VO，指向AO

```js
//此时的AO
{
    num: undefined,
    m: undefined,
    n: undefined
}
```

+ 3、开始执行函数

![](/img/js/v8-js-parse3.jpeg)

将参数123赋值给VO中的num

执行`console.log(m)`, 此时m仍为undefined，输出undefined

执行`var m = 20`,将VO中的m赋值为20，

执行`var n = 30`，将VO中的n赋值为30

执行`console.log('v8执行函数')`,输出v8执行函数



+ 4、函数执行完成后，函数执行上下文（FEC）会弹出调用栈，并自行销毁。此时VO没有谁引用它，也被销毁了



思考：当我们在函数中访问该函数中未定义的变量，它们是怎么沿着作用域链一层一层地寻找的呢？

> **补充：常见的js引擎**
>
> SpiderMonkey：  第一款JavaScript引擎，由Brendan Eich开发（也就是JavaScript作者）；
>
> Chakra：  微软开发，用于IT浏览器； 
>
> JavaScriptCore：  WebKit中的JavaScript引擎，Apple公司开发；
>
> V8：  Google开发的强大JavaScript引擎，也帮助Chrome从众多浏览器中脱颖而出；



## 三、作用域链

当我们查找一个变量时，真实的查找路径是沿着作用域链进行查找的

假设有如下代码

```js
var num = 100
function foo() {
    function bar() {
        console.log(num)
    }
    bar()
}
foo()
```

bar函数中并没有定义num，但最终会输出100。原因就是有**作用域链**的存在



**案例分析**

foo函数里边定义了bar函数，并在bar函数中打印了name。name是如何被匹配到的？

```js
var name = 'xiaoming'
function foo(num) {
    console.log(m)
    var m = 10
    var n = 20
    function bar() {
        console.log(name)
    }
    bar()
}
foo(123)
```



具体执行过程

+ 1、编译阶段

创建全局对象GO，创建foo、bar的函数存储空间



+ 2、即将执行阶段

![](/img/js/v8-js-parse4.jpeg)

创建foo的函数执行上下文，其中`mun ： undefined   m : undefined  n : undefined  bar : 内存地址 `



+ 3、执行阶段

将foo的函数执行上下文放入调用栈中，一次执行其中的代码

a、将num赋值为123；

b、执行`console.log(m)`，打印`m = undefined`

c、执行`var m = 10 var n = 20`，为VO中的m、n赋值

d、执行bar，创建一个bar的函数执行上下文



+ 4、执行bar，沿着作用域链逐层查找

![](/img/js/v8-js-parse5.jpeg)

当bar的函数执行上下文在执行`console.log(name)`时，没有找到name(因为其AO对象是没有name变量的)

它会沿着`scope chain`找到foo的`VO`，从而匹配到foo的AO，但是依然没有找到

继续沿着`scope chain`找到全局对象的VO，从而匹配到GO，最终在里边找到了name，输出name

最后，bar函数执行完毕弹出执行栈，AO(bar)失去了引用而销毁掉；foo函数同理；代码执行完毕，全局执行上下文弹出执行栈，执行结束



> 如果你耐心看完了以上内容，可能觉得毫无收获，那么请看看以下题目。先自行推理答案，再试图代入以上分析模式，看看得出来的结果是否一致

**案例一**

```js
var message = 'hello global'
function foo() {
  console.log(message);
}

function bar() {
  var message = 'hello bar'
  foo()
}
bar()
```

你以为结果是`hello bar`？，其实正确结果输出：`hello global`



代码的具体执行过程：

+ 1、编译阶段

```js
// 创建一个全局对象GO
var GO = {
    window: GO,
    message: undefined,
    foo: 0xa00,
    bar:0xb00
}
```

开辟分别存储foo函数、bar函数的内存空间

![](/img/js/v8-js-parse6.jpeg)

**重点：因为定义阶段两个函数同处于一个作用域。其父级作用域都是GO**

+ 2、执行代码

当执行`bar`函数中的`foo`函数时，执行`console.log(message)`，先在foo自身的AO查找，没找到，沿着作用域链查找。直接匹配到了GO



**案例二**

```js
var n = 100
function foo() {
    n = 200
}
foo()
console.log(n)
```

1、编译过程：

```js
GO:{ n: undefined, foo: 0x100 }

//0x100
[scope]:GO
[代码块]
```

2、执行过程

执行`var n = 100`

```js
GO:{ n: 100, foo: 0x100 }
```

执行foo（）, 在foo的AO查找n，没有找到n。沿着作用域链找到父级作用域GO，找到n，并将n改为200

执行`console.log(n)`,输出200



**案例三**

```js
function foo() {
    console.log(n)
    var n = 200
    console.log(n)
}
var n = 100
foo() 
```

1、编译过程

```js
GO: { foo:0x100, n: undefined }

//0x100
[scope]:parent scope
[代码块]
```

```js
//foo的AO
n: undefined
```

2、执行过程

执行`var n = 100`

```js
GO: { foo:0x100, n: 100 }
```

执行foo()，执行`console.log(n)`,查询自身的AO,存在n并输出undefined

执行`var n = 200`,为AO中的n赋值200 `AO: { n: 200 }`，执行`console.log(n),`根据自身AO，输出200



**案例四**

```js
function foo() {
    var a = b = 100
}
foo()

console.log(b)
console.log(a)
```

> 特别注意：`var a = b = 100`将会转换为`var a = 100   b = 100`

1、编译阶段

```js
GO: { foo: 0x100, b: undefined }
//0x100
[scope]:parent scope
[代码块]
```

```js
AO: { a: undefined }
```

2、执行阶段

因为函数中的`b = 100`相当于是在全局中定义的，所以此时GO

```js
GO: { foo: 0x100, b: 100 }
```

执行foo（），执行`var a = b = 100`

```js
AO: { a: 100 }
```

全局执行`console.log(b)`,在GO中找到，输出100；全局执行`console.log(a)`,GO没有，报错



## 四、内存管理

不管是什么样的编程语言，在代码的执行过程中都是需要给它分配内存的，不同的是某些编程语言需要手动的管理内存（如C、C++），某些编程语言可以自动管理内存（如Java、Python、JavaScript）



**js的内存管理**

JavaScript会在定义变量时为我们分配内存

1、对于基本数据类型的分配会在执行时，直接在**栈空间**进行分配

2、js对于复杂数据类型内存的分配会在**堆内存**中开辟一块空间，并且将这块空间的指针返回值变量引用



**垃圾回收机制GC**

程序运行需要内存，对于持续运行的服务进程，必须要及时释放内存，否则，内存占用越来越高，轻则影响系统性能，重则就会导致进程崩溃。

而垃圾回收是一种自动内存管理机制，用于检测和清除不再使用的（不可达）对象，以释放内存空间。当一个对象**不再被引用**时，**垃圾回收器**会将其标记为**垃圾**，然后在适当的时候**清除**这些垃圾对象，并将内存回收给系统以供其他对象使用。

> JavaScript的运行环境js引擎内置了内存垃圾回收器（Garbage Collection，简称GC），帮助我们实现垃圾自动回收

最常见的有两种垃圾回收策略：`标记清除算法、引用计数算法`



### 4.1 标记清除算法

通过算法标记出内存中所有不再使用的对象，然后清除这些对象，后续空出来的内存空间可以分配给其他对象使用

具体实现步骤：

+ 1、标记

垃圾回收器在运行时对内存中所有的对象进行遍历并添加一个标记 0（假设0代表垃圾）。然后从根对象开始递归地遍历所有的对象的引用关系，能够被访问到的对象将其标记改为“非垃圾”的标记 1 。这样一来，所有**非垃圾**的对象被会被标记出来

+ 2、清除

垃圾回收器遍历内存中所有的对象，对于那些标记为垃圾的对象（标记为0），它们占据的空间会被立即回收。那些**可达的**的对象（标记为1）则被保存中内存中



**优势**：简单有效；能够处理循环引用

**弊端**

执行标记清除算法进行垃圾回收后，由于剩余的可达对象的位置是不变的，内存的连续性遭到了破坏，出现了`内存碎片`(如图)

![](/img/js/v8-GC1.jpeg)

假设现在新增一个对象，占据的一定的内存空间。为了尽可能的利用好空闲的内存空间，我们需要分配到合适的位置存放。而碎片化的内存空间会给降低代码的执行效率，分配速度较慢。

> 另外还有一种算法：标记整理算法，该算法的整理阶段将存活状态的对象向内存的一端移动，清除阶段清除了另一端的垃圾对象，确保了内存的连续性



### 4.2 引用计数算法

该算法通过记录每个对象被引用的次数来确定是否进行回收，当一个对象没有任何引用时(被引用次数为0)时被认定为垃圾对象

具体实现步骤：为每个对象添加一个引用计数器

1、当对象被创建时，计数器+1

2、对象被引用，计数器+1；断开引用时，计数器-1

当对象的计数器为0时，说明改对象没用任何引用，可以被回收

```js
const obj = {} //引用计数器：1
let other = obj //引用计数器：2
other = null // 断开，引用计数器：1
obj = null // 断开，引用计数器：0，回收
```

**优势**：实时回收，简单高效

**弊端**

1、每个对象都要维护一个引用计数器，增加了额外的开销

2、处理不了循环引用

```js
function foo () {
    let objA = {name: 'A'};
    let objB = {name: 'B'};
    
    objA.B = objB;
    objB.A = objA;
}
foo()
```

当`foo`函数执行完毕，执行栈中的foo函数弹出，`objA和objB`也就失去了对引用对象的引用。`objA和objB`却相互引用着，导致两者身上的引用计数始终为1（如图）

<img src="/img/js/v8-GC2.jpeg" style="zoom:80%;" />



### 4.3 分代式垃圾回收

现代浏览器大多采用标记清除算法进行垃圾回收，但是高频率收都要遍历整个根对象的话，开销未免太大

为了提高垃圾回收的效率和性能，`V8引擎`使用了分代式的垃圾回收机制。



具体实现步骤：

将内存中的对象划分为**新生代**和**老生代**，二者分别采用不同的算法来优化代码回收效率

新生代：存放存活时间较短的对象，新创建的对象会被归入新生代，新生代通常只有`1-8M`的容量。采用了`Scavenge算法`中的`Chenney算法`进行垃圾回收

老生代：存放存活时间较长的对象，经过多次新生代的垃圾回收后对象会被放入老生代中。采用了`标记-整理-清除`算法

**老生代垃圾回收**

老生代中存放的对象一般较大且存活时间较长，这里使用的算法比较简单，就是标记清除算法的优化版本。在垃圾回收时对内存空间进行了整理，避免了大量不连续的内存碎片的问题。



**新生代垃圾回收**

新生代的内存空间被划分为大小相等的两个空间：To空间（处于空闲状态）、From空间（处于使用状态）

<img src="/img/js/v8-GC3.jpeg"  />

新创建的对象会被放入`From空间`，当该空间快被存满时就会触发垃圾回收机制：

1、**标记**：对From空间中的对象进行标记

2、**复制**：将标记的存活对象复制到To空间，并进行排序。使To空间成为连续的块

3、**清除**：清除From空间中的垃圾对象

4、**交换**：From空间与To空间进行角色交互，即From空间变为To空间，To空间变为From空间



新生代在满足一些条件后可以**晋升**为老生代：

1、当一个对象长期存在于To空间中，意味着其经过了多次垃圾回收后依旧存活，属于长期存活的对象，即可将该对象放入老生代

2、当新创建的对象占用的内存空间大于25%时，为避免From空间被快速填满，将会直接将其放入老生代



> V8对垃圾回收的优化还不止于此，为提升用户的体验，解决全停顿问题，它提出了增量标记、三色标记法、惰性清理、并发、并行等优化方法，限于篇幅，本文不做展开，请自行查阅



## 五、理解闭包

### 5.1 闭包的形成

> 要理解闭包是什么，我们得先知道它是怎么形成的。下文将通过示例代码的执行流程，一步步剖析其闭包形成原因

**示例**

```js
// 简单的闭包案例
function foo() {
    var name = 'foo'
    function bar() {
        console.log("bar", name)
    }
    return bar
}
var fn = foo()
fn()
```

**1、编译阶段**：

定义foo函数和变量fn（如图）

```js
GO: {
    window:GO,
    foo: 0xa00,
    fn: undefined
}
```

![](/img/js/closure1.jpeg)



**2、执行阶段  :  执行`var fn = foo()`**：

调用了foo函数，创建foo函数执行上下文, 并创建AO对象

```js
//foo的AO
AO: {
   name: undefined,
   bar: 0xb00
}
```

**开始执行foo()**，执行`var name = 'foo'` 为name赋值

bar函数是定义不调用，直接跳过

执行`return bar`, 即直接将地址赋值给了变量`fn`

```js
//foo的AO
AO: {
   name: 'foo',
   bar: 0xb00
}
```

```js
GO: {
    window:GO,
    foo: 0xa00,
    fn: 0xb00
}
```

![](/img/js/closure2.jpeg)

从图中可以看到，GO中的`fn`指向`bar函数对象`，而`bar函数对象`的父级作用域指向了`foo的AO对象`

**3、执行阶段：执行 fn（）**

**重要：执行完`var fn = foo()`后，将foo的执行上下文弹出栈。按理来说此时foo的AO对象应该销毁掉。但是因为它身上还维系着一条引用关系，导致其不会被垃圾回收器回收**

因为fn在GO中表现为**0xb00**，即意味着执行的是`bar`函数

创建`bar`函数的执行上下文，放入调用栈中，并创建对应的AO对象

```js
AO:{
    //bar函数内部并无内容，为空
}
```

**开始执行bar（）**

![](/img/js/closure3.jpeg)

执行`console.log('bar', name)`,直接打印输出bar，遇到name，就要到上层作用域中查找，bar的上层作用域是foo的AO对象，找到了`name: foo`，输出foo。

至此，代码执行完毕，闭包也形成了。**内存中foo的AO对象将一直存在着**

![](/img/js/closure4.jpg)

闭包：bar函数+name自由变量的组合



### 5.2 闭包的定义

 维基百科的定义：

1、闭包（closure），又称词法闭包或函数闭包

2、只在支持**头等函数**的编程语言中，实现词法绑定的一种技术

3、闭包在实现上是一个结构体，它存储了一个函数和一个关联的环境

4、闭包跟函数最大的区别在于，当捕捉闭包的时候，它的**自由变量**会在捕捉时被确定，这样即使脱离了捕捉时的上下文，它照样能运行

> 注：在js中，函数是一等公民，意味着函数可以作为另外一个函数的参数，也可以作为另外一个函数的返回值来使用



**简单的理解**

要理解闭包，首先必须理解JavaScript的变量作用域

JavaScript语言的特殊之处，**就在于函数内部可以直接读取全局变量**。**在函数外部无法读取函数内的局部变量**，但是闭包可以帮助我们从外部读取函数局部的变量。

基于此的理解为：闭包就是能够读取其他函数内部变量的函数。在本质上，闭包就是将函数内部和函数外部连接起来的一座桥梁。

结合上方的案例来说明：一般而言，全局变量fn（即函数bar）不可能访问到foo中定义的变量name，但是因为闭包的存在我们能够实现从函数外部访问另一函数的内部

> 由于闭包会使得函数中的变量都被保存在内存中，内存消耗很大，所以不能滥用闭包，否则会造成网页的性能问题



### 5.3 内存泄露

容易造成内存泄露的情况：

1、闭包引起的内存泄露

2、被遗忘的定时器（没有清除定时器）

3、意外定义的全局变量

4、for循环出现死循环



滥用闭包很容易引发内存泄漏，如下模拟极端场景的内存泄露

```js
function createFnArray() {
    // 占据的空间为4M
    var arr = new Array(1024 * 1024).fill(1)
    return function() {
        console.log(arr.length);
        return arr
        // 形成闭包，每一次调用内存中都保留着4m空间的createFnArray的AO对象
    }
}

var arrarFns = []
const fn = createFnArray()
// 运行100次，并将结果存进数组中
for(var i = 0; i < 100; i++) {
    arrarFns.push(fn())
    // 此时内存中约占用了400M空间
}
```

运行代码，在浏览器控制台的Performance中选择Memory

可以看到，代码运行占用了大量的内存空间

```js
setTimeout(() => {
    arrarFns = null
}, 1000);
```

1秒钟后，释放内存

在控制台的内存占用曲线可以看到明显的断层



## 六、函数式编程

**函数式编程与面向对象**

1、函数式编程具备高扩展性和复用性。缺点是函数过多难以管理，逻辑不清晰

2、涉及到业务逻辑的代码，最好使用面向对象。面向对象非常擅长组织逻辑

3、绝大部分前端框架都使用了函数式，很大原因是函数式编程可以使用Tree-shaking

> Tree-shaking的本质是通过文档流的引入判断是否使用了某个方法，但是面向对象方案无法记录

```js
function Class1() {}
Class1.prototype.f1 = () => {  }
Class1.prototype.f2 = () => {  }
new Class1().fn1()
//但是通过webpack打包后，f2也被打包进去了
```



### 6.1 纯函数

函数式编程中有一个非常重要的概念叫纯函数，JavaScript符合函数式编程的范式，所以也有纯函数的概念

**定义：**在程序设计中，若一个函数符合以下条件，那么这个函数被称为纯函数：

1、函数在相同的输入值时，需产生相同的输出

2、函数的输出和输入值以外的其他隐藏信息或状态无关，也和由I/O设备产生的外部输出无关

3、该函数不能有语义上可观察的函数副作用，诸如“触发事件”，使输出设备输出，或更改输出值以外物件的内容

**简单理解：**

1、确定的输入，一定会产生确定的输出；

2、函数在执行过程中，不能产生副作用

**副作用？**

在计算机科学中，引入了医学的概念副作用，表示在执行一个函数时，除了返回函数值之外，还对调用函数产生了附加的影响，比如修改了全局变量，修改了参数或者改变了外部的存储（简单理解:函数依赖于外部的状态）

例如：用户输入，外部配置，数据库

> 副作用往往是产生bug的“温床“



**案例说明**

*1、slice和splice*

```js
//slice是纯函数
//给slice传入一个start/end，那么对于同一个数组来说，它会给我们返回确定的值
//slice本身不会修改原来的数组
var names = ["abc", "cba", "nba", "dna"]
var newName1 = names.slice(0, 3)


//splice不是纯函数
//splice在执行时，有修改掉调用数组对象本身，修改的这个操作就产生了副作用
var newName2 = names.splice(2)
console.log(names)
```

*2、foo和bar*

```js
// foo是一个纯函数
function foo(num1, num2) {
    return num1 * 2 + num2 * num2
}

//bar不是一个纯函数
//bar执行过程中修改了全局编程name
var name = 'abc'
function bar() {
    console.log('bar其他的代码执行')
    name = 'cba'
}
bar()
```



**纯函数的优势**

保证了函数的纯度，只是单纯实现了自己的业务逻辑，需要关心传入的内容是如何获得的或者依赖其他的外部变量是否已经发生了修改



### 6.2 柯里化

柯里化也是属于函数式编程里面一个非常重要的概念

**定义：**

柯里化（Currying），是把接收多个参数的函数，变成接受一个单一参数（最初函数的第一参数）的函数，并且返回接受余下的参数，而且返回结果是新函数的技术

柯里化声称：“如果你固定某些参数，你将得到接受余下参数的一个函数”

**简单理解：**

只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数，这个过程就称之为柯里化



**案例**

```js
function foo(m, n, x, y) {
    return m + n + x + y
}
foo(20,30,40,50)
//柯里化
function bar(m) {
    return function (n) {
        return function (x) {
            return function(y) {
                return m + n + x + y
            }
        }
    }
}
bar(20)(30)(40)(50)
```

最终，我们将foo函数（本来需要接收四个参数），变成只接收一个参数的函数

是否觉得上方的柯里化太过繁琐，其实也是可以简写的

```js
var baz = m => n => x => y => m + n + x + y

var res = baz(20)(30)(40)(50)
console.log(res) //输出140
```



**为什么要有柯里化？**

**1、让函数的职责单一**

在函数式编程中，我们其实希望一个函数处理的问题尽可能的单一，而不是将一大堆处理过程交给一个函数来处理

那么我们是否就可以将每次传入的参数在单一的函数中进行处理，处理完后在下一个函数中再使用处理后的结果

比如有如下需求：add有三个参数，分别在不同的函数中进行不同的操作后，再进行相加

```js
//正常的函数编写
function add(x, y, z) {
    x = x + 2
    y = y * 2
    z = z ** 2
    return x + y + z
}

console.log(add(20,30,40)); //1682


//柯里化
function foo(x) {
    x = x + 2
    return function(y) {
        y = y * 2
        return function(z) {
            z = z ** 2
            return x + y + z
        }
    }
}

console.log(foo(20)(30)(40)); //1682
```

**2、柯里化的复用**

我们来看下边的两个案例

**案例一**

makeAdder函数要求我们传入一个num（并且如果我们有需要的话，可以在这里对num进行一些修改）

之后使用返回的函数时，就不需要再继续传入num了

```js
function makeAdder(num) {
    return function(count) {
        return num + count
    }
}

//假设需要多次使用5去加另外一个数
var add5 = makeAdder(5)
add5(10)
add10(100) 
```

**案例二**

日志打印：当前时间 + 类型 + 说明

封装一个日志打印的函数，一般的实现方法如下

```js
function log(date, type, message) {
    console.log('[${date.getHours()} : ${date.getMinutes()}][${type}]:[${message}]')
}

log(new Date(), "DEBUG", "查询到轮播图的bug")
log(new Date(), "DEBUG", "查询到菜单的bug")
log(new Date(), "DEBUG", "查询到数据的bug")
```

这样的写法未免太过繁琐，存在大量重复的代码

```js
//柯里化
var log = date => type => message => {
    console.log('[${date.getHours()} : ${date.getMinutes()}][${type}]:[${message}]')
}

//时间是固定的（即每次都是打印当下时间）
var nowLog = log(new Date())
newLog("DEBUG")("查询到轮播图的错误")
newLog("FETURE")("新增了添加用户的功能")


//如果类型type否是相同的，还可以进一步优化
var newAndDebug = log(new Date())("DEBUG")
newAndDebug("查询到轮播图的bug")
newAndDebug("查询到轮播图的bug")
newAndDebug("查询到轮播图的bug")
```



### 6.3 手写柯里化

实现功能：传入一个普通函数，将其转化成柯里化函数

1、基本结构：传入一个函数，返回一个函数

```js
function lmCurrying(fn) {
  function curried(...args) {
    return fn(...args);
  }
  return curried;
}
function add(x, y, z) {
  return x + y + z;
}

//调用
var curryAdd = lmCurrying(add);
curryAdd(20, 30, 50);
```

2、curried参数处理

上边的代码中，使用者传入一个函数，最终返回curried函数

但是调用函数的人使用curried函数时，传参的方式可能是不同的

```js
//调用
var curryAdd = lmCurrying(add)

curryAdd(20, 30, 40)
curryAdd(20, 30), 40)
curryAdd(20)(30)(40)
```

当一次性传入三个参数时，就可以简单地这样子编写代码

```js
function lmCurrying(fn) {
    function curried(...args) {
        fn(...args)
    }
    return curried
}
```

3、当已接收参数个数，与传入的函数需要的参数个数一致时，直接调用即可

```js
function lmCurrying(fn) {
    function curried(...args) {
        if (args.length >= fn.length) {
           return fn(...args)
        }
    }
    return curried
}
```

注：`fn.length`可以获取函数本身的参数个数

4、考虑调用方式的不同

比如使用者这样子调用`curryAdd(20)(30)(40)`,这个时候就需要递归调用curried函数了

```js
function lmCurrying(fn) {
    function curried(...args) {
        if(args.length >= fn.length) {
            return fn(...args)
        } else {
            //当传入参数小于原函数的参数个数时
            function curried2(...args2) {
                return curried(...args, ...args2) //递归调用
            }
            return curried2
        }
    }
    return curried
}
```

5、测试代码

```js
function lmCurrying(fn) {
    function curried(...args) {
        if(args.length >= fn.length) {
            return fn(...args)
        } else {
            //当传入参数小于原函数的参数个数时
            function curried2(...args2) {
                return curried(...args, ...args2) //递归调用
            }
            return curried2
        }
    }
    return curried
}

function add(x, y, z) {
    return x + y + z
}

var newFn =  lmCurrying(add)
console.log(newFn(20)(30)(40)); //90
console.log(newFn(20, 30)(40)); //90
console.log(newFn(20, 30, 40)); //90
```



### 6.4 组合函数

组合（Compose）函数是在js开发过程中一种对函数的使用技巧、模式

比如我们需要获取某一个数据，执行函数fn1和fn2，这两个函数时依次执行的，如果我们每次都需要进行两个函数的调用，操作上就会显得重复，那么是否可以将fn1和fn2组成起来，自动依次调用呢

```js
//一般的调用方式
function double(x) {
    return x * 2
}

function square(y) {
    return y ** 2
}

var count = 10
//需求：对count进行乘以2，再进行平方
var res = square(dobule(count))
```



组合函数的写法

```js
function composeFn(fn1, fn2) {
    return function(count) {
        return fn2(fn1(count))
    }
}

var newFn = composeFn(dobule, square)
```



### 6.5 高阶函数

高阶函数（Higher-order function）是`一个接收函数作为参数`或者将`函数作为返回输出`的函数

例如：`filter 、forEach、every`是高阶函数（参数是函数）；`bind`也是一个高阶函数（返回值是函数）

意义：高阶函数是用来抽象通用的问题，帮我们屏蔽细节，让我们只关注目标



**实现forEach**

```js
Array.prototype.myForEach = function(fn) {
  const arr = this //隐式调用，this就是调用该函数的数组
  for(let i in arr) {
    fn(arr[i], i, arr)
  }
}

const arr = [1,23,4,5,6,7]
arr.myForEach((item) => {
  console.log(item)
})
```



**实现filter**

```js
Array.prototype.myFilter = function(fn) {
  const arr = this
  let newArr = []
  for(let key in arr) {
    if(fn(arr[key])) {
      newArr.push(arr[key])
    }
  }
  return newArr
}

const arr = [3,4,5,6,66,2,123,6,77,23,23,32]

const res = arr.filter((item) => {
  return item > 20
})
console.log(res)
```



**实现once**

只调用一次的函数，返回值也是一个函数

> 应用场景：支付时，多次点击也只支付一次

```js
function once(fn) {
  let done = false //闭包
  return function(arg) {
      if(!done) {
          done = true
          fn(arg)
      }
  }
}


const pay = once((monkey) => {
  console.log(monkey)
})

pay(888)
pay(888)
pay(888)
pay(888) //只打印一次888
```

> 注：这里其实应用了闭包



**实现reduce**

```js
arr.reduce((pre, current, index, arr) => {return pre + current}, init)
```

可以接收第二个参数作为第一个pre，不传则将arr的第一个参数作为pre

案例分析

```js
需求一：将routes转化为对象
const routes = [
  { path: "/", component: "home" },
  { path: "/about", component: "about" },
]
//即{'/' :'home'}的格式

routes.reduce((pre, current) => {
  pre[current.path] = current.component
  return pre //pre将作为下一次的pre
}, {})

需求二：累加金额
const goods = [
  { type: "good", price: 10 },
  { type: "good", price: 20 },
  { type: "good", price: 30 },
]

goods.reduce((pre, current) => {
 if(current.type === 'good') {
   pre += current.price
 }
  return pre
}, 0)
```

手写实现

```js
Array.prototype.myreduce = function (fn, init) {
  for (i = 0; i < this.length; i++) {
    init = fn.call(this, init, this[i], i, this);
  }
  return init;
};
```



## 七、防抖节流

**防抖节流**的概念其实最早并不是出现在软件工程中，防抖是出现在电子元件中，节流出现在流体流动中。

JavaScript是事件驱动的，大量的操作会触发事件，加入到事件队列中处理。而对于某些频繁的事件处理会造成性能的损耗，我们就可以**通过防抖和节流来限制事件频繁的发生**。



### 7.1 防抖基本理解

在开发中，我们经常使用一些库来提供防抖节流的方法

```js
//lodash
//说明：传递一个想要进行防抖处理的函数与触发时间，返回一个处理好的防抖函数
const newFn = lodash.debounce(fn, 1000)
btn.onclick = newFn
```



**防抖案例理解**：假设有一个搜索框，用户往里边输入内容时，该搜索框下方会帮用户匹配可能想要搜索的内容

```html
搜索：<input type="text">
```

问题：但是如果用户每输入一个单词，都触发一次处理程序去联想可能的内容。假设用户输入：`helloworld`，就触发了10次处理程序，十分消耗性能

解决思路：规定一个时间（如500ms），用户每输入一个单词后延迟500ms后才触发处理程序。

> 注：（每次输入一个新单词，都会刷新这个500ms的延迟时间）



**防抖的应用场景**

1、输入框中频繁输入内容，搜索或者提交信息

2、频繁的点击按钮，触发某个事件

3、监听浏览器滚动事件，完成某些特定操作

4、用户缩放浏览器的resize事件



**防抖代码案例**

```html
<!--输入框案例-->
<body>
  搜索：<input type="text">
  <script>
    const inputEl = document.querySelector("input")
    let counter = 0
    inputEl.addEventListener('input', () => {
      console.log(`发送了第${++counter}次网络请求`);
    })
  </script>
</body>
```

在输入框中输入`12345`，结果触发了5次事件`发生了第1、2、3、4、5次网络请求`

```html
<!--借助第三方库进行防抖-->
<body>
  搜索：<input type="text">
  <script src="https://cdn.jsdelivr.net/npm/underscore@1.13.1/underscore-umd-min.js"></script>
  <script>
    const inputEl = document.querySelector("input")
    let counter = 0
    const fn = function() {
      console.log(`发送了第${++counter}次网络请求`);
    }
    // 使用防抖函数
    const newFn = _.debounce(fn, 1000)
    inputEl.addEventListener('input', newFn)
  </script>
</body>
```

1秒内输入内容`12345`，最后只有发送一次网络请求。实现了防抖的效果



### 7.2 节流的基本理解

防抖与节流的区别：防抖是从触发事件停止时，开始计时去触发处理程序；而节流是按照**固定的频率**触发处理程序

理解：假设宣讲会后，讲师进行答疑

情况一：一分钟内，无论有多少同学提问，都只回答一个问题（节流）

情况二：一分钟内，如果有同学提问那么回答问题。超过一分钟无人提问，那么答疑环节结束（防抖）



**节流案例理解**：

1、当事件被触发时，会执行这个事件的响应函数。如果事件被频繁触发，那么节流函数会按照一定的频率来执行函数；不管这中间有多少次触发这个事件，执行函数的频率总是固定的

2、在飞机大战游戏中，假设按一次空格键发射一颗子弹。但是用户在1s内按了10次空格键发射10颗子弹，显然不正常。所以一般会使用节流函数来进行处理，不论1s内按了多少次空格键，都只发射一颗



**节流的应用场景**

1、监听页面的滚动事件

2、鼠标移动事件

3、用户频繁点击按钮的操作

4、游戏中的一些设计

**节流的案例**

```html
<body>
  搜索：<input type="text">
  <script src="https://cdn.jsdelivr.net/npm/underscore@1.13.1/underscore-umd-min.js"></script>
  <script>
    const inputEl = document.querySelector("input")
    let counter = 0
    const fn = function() {
      console.log(`发送了第${++counter}次网络请求`);
    }
    // 节流处理
    const newFn = _.throttle(fn, 1500)
    inputEl.addEventListener('input', newFn)
  </script>
</body>
```

在输入框中持续输入内容，每1.5秒会发送一次网络请求



### 7.3 手写防抖函数

希望实现的效果

```js
let counter = 0
function fn() {
    console.log(`第${++counter}次触发`)
}
//调用
let newFn = debounce(fn, 1000)
input.oninput = newFn
//触发input事件时，调用的是经过防抖处理的newFn
```

**1、基本结构**

所以，我们要实现的就是debounce函数

```js
function debounce(fn, delay) {}
```

最后结果是要返回一个函数

```js
function debounce(fn, delay) {
    const _debounce = function() {

    }
    reutrn _debounce
}
```

传进来的fn函数，能够被执行

```js
function debounce(fn, delay) {
    const _debounde = function() {
        fn()
    }
}

//调用
let newFn = debounce(fn, 1000)
input.oninput = newFn
//输入时，每输入一个值就会触发一次
```

为了实现防抖的延迟执行效果，我们可以加入定时器控制

```js
function debounce(fn, delay) {
    const _debounde = function() {
        setTimeout(() => {
            fn()
        }, delay)
    }
}
```

问题：但是这样子做所有的输入都会在自身被输入后的delay时间后被执行

解决办法：**定义一个清除定时器的变量，每一次进行输入时，把上一次的定时器给清除掉**

```js
//防抖函数基本结构
function debounce(fn, delay) {
    // 1.定义一个变量，保存上一次的定时器
    let timer = null
    //2.真正执行的函数
    const _debounce = function() {
        //取消上一次的定时器
        if(timer) clearTimeout(timer)
        timer = setTimeout(() => {
            //外部传入的真正要执行的函数
            fn()
        }, delay)
    }
    return _debounce
}

//测试代码
    const input = document.querySelector('input')
    let counter = 0
    let fn = function() {
      console.log(`第${++counter}次触发`);
    }

    let newFn = debounce(fn, 1000)
    input.oninput = newFn
```

这样一来，我们就基本实现了防抖函数的基本结构

**2、this与参数**

上边的`debounce`函数已经基本实现了防抖功能，但是`this`与参数传递仍有一些问题

```js
//默认情况下，事件处理程序中的this和event参数
const input = document.querySelector("input")
input.addEventListener("input", function(event) {
    console.log(this, event);
})
//输出：<input type="text"> InputEvent {...}
```

但是，在上方我们自己封装的`debounce`中，打印this和event参数却不是我们想要的结果

```js
let counter = 0
function fn(event) {
    console.log(`第${++counter}次触发`, this, event)
}
//调用
let newFn = debounce(fn, 1000)
input.oninput = newFn
//触发input事件时，输出：window undefined
```

显然是不对的

```js
//解决
function debounce(fn, delay) {
    let timer = null
    return function(...args) {
        if(timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

    const input = document.querySelector('input')
    let counter = 0
    let fn = function(event) {
      console.log(`第${++counter}次触发`, this, event);
    }

    let newFn = debounce(fn, 1000)
    input.oninput = newFn
```

**3、第三个参数：立即执行**

我们想要实现这么一个功能，往`debounce`中输入一个布尔值，来决定是否立刻触发一次事件处理程序

为什么需要这么一个参数？

```js
//假设用户输入第一个单词，立马就触发一次事件处理程序
搜索：<input type="text">
```

后面用户可能持续在输入，但一直都不会触发第二次程序。那么第一次已触发的事件处理程序可以提升一点用户的体验

所以，我们可以为`debounce`函数增加第三个参数，当这个参数为true时，用户第一次输入立马执行事件处理程序，而不进行防抖

```js
function debounce(fn, delay, immediate = false) {
    let timer = null
    return function(...args) {
        if(timer) clearTimeout(timer)
        if(immediate) { //如果为true立即执行
            fn.apply(this, args)
            immediate = false
        } else {
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
        }
    }
}

//效果
let newFn = debounce(fn, 1000, true)
input.addEventListener('input', newFn)
//当用户输入第一个字母时，就会立即触发一次
```

以上的防抖函数已经可以解决大部分的应用场景。

如果想要用户输入一段内容后，停顿了一些时间。用户在输入第二段内容的时候，第二段内容的第一个字母也能实现立即执行事件处理程序，可以对代码进行如下改变

```js
//最终效果
function debounce(fn, delay, immediate = false) {
    let timer = null
    let isInvoke = false
    return function(...args) {
        if(timer) clearTimeout(timer)
        if(immediate && !isInvoke) { 
            fn.apply(this, args)
            isInvoke = true
        } else {
        timer = setTimeout(() => {
            fn.apply(this, args)
            isInvoke = false
        }, delay)
        }
    }
}
```

**4、取消功能**

把本次的防抖功能取消掉

为什么需要这一功能？比如搜索框中，我们利用防抖来给用户提供智能联想。但是有些用户目的明确，快速输入内容并点击搜索，此时根本来不及进行一个防抖的时间还在计算当中，同时也因为用户已经不需要这一次的智能联想了，所以可以在用户点击搜索按钮时，把这个防抖功能取消掉，提升性能

```js
function debounce(fn, delay, immediate = false) {
    let timer = null
    let isInvoke = false
    let _debounce = function(...args) {
        if(timer) clearTimeout(timer)
        if(immediate && !isInvoke) {
            fn.apply(this, args)
            isInvoke = true
        } else {
        timer = setTimeout(() => {
            fn.apply(this, args)
            isInvoke = false
        }, delay)
        }
    }

    //取消功能
    //_debounce本身也是一个对象，往其上添加一个方法
    _debounce.cancel = function() {  
        if(timer) clearTimeout(timer)
        timer = null
        isInvoke = false
    }
    return _debounce
}

 // 测试取消功能
const btn = document.querySelector("button")
btn.onclick = newFn.cancel
```



### 7.4 手写节流函数

节流函数的期望的实现效果：

1、第一个输入的内容会立马执行一次事件处理程序

2、后续内容输入会根据时间周期来触发事件处理程序

3、最后一次事件周期，不论内容输入是否达到这个周期，都要执行一次

```js
const remainTime = interval - (nowTime - lastTime)
// remainTime表示用户停止输入后离周期触发时的间隔时间
//interval时间周期
//nowTime每次触发事件的时间戳
//lasttime初始时间

if(remainTime <= 0) {
    //说明一个周期过去了，该触发事件处理程序了
} 
```

**1、基本结构**

```js
function throttle(fn, interval) {
    //1.记录上一次开始的时间
  let lastTime = 0
  // 2.事件触发时，真正执行的函数
  const _throttle = function() {
      //2.1 获取当前事件触发时的时间
    let nowTime = new Date().getTime()
    // 2.2 计算出还剩多少时间去触发函数
    let remainTime = interval - (nowTime - lastTime)
    if(remainTime <= 0) {
      fn() //触发函数
      lastTime = nowTime
    }
  }
  return _throttle
}
```

这个也是实现了第一次输入时，会立即触发一次

**2、控制开始与结尾**

我们可以自定义第一次是否触发或者最后一次输入没有达到周期是否触发

如何控制第一次不触发呢?

可以让`lastTime = nowTime`，只有当`lastTime`过了`nowTime`时间后，才执行第一次事件处理程序

```js
function throttle(fn, interval, options = { leading: true, trailing: false }) {
    const { leading , trailing } = options
    let lastTime = 0
    const _throttle = function() {
        const nowTime = new Date().getTime()
        if(!lastTime && !leading) lastTimg = nowTime //判断是否第一次输入？是怎让其等于当前时间
        const remainTime = interval - (nowTime - lastTime)
        if(remainTime <= 0) {
            fn()
            lastTime = nowTime
        }
    }
    return _throttle
}

//节流
let newFn = throttle(fn, 1000, { leading: false})
inputEl.oninput = newFn
```

效果：在时间周期内，输入内容不会立马触发事件处理程序

trailing的实现比较麻烦，后续再作补充

**3、this和参数**

```js
function throttle(fn, interval, options = { leading: true }) {
    let lastTime = 0
    let { leading } = options
    const _throttle = function(...args) {
        //获取当前时间戳
        let nowTime = new Date().getTime()
        //判断是否为第一次输入，并且传进来的leading为false
        if(!lastTime && !leading) lastTime = nowTime
        let remainTime = interval - (nowTime - lastTime)
        if(remainTime <= 0) {
            fn.apply(this, args)
            lastTime = nowTime
        } 
    }
    return _throttle
}

//测试
function fn(event) {
    console.log(`第${++counter}次触发`, this, args)
}
let newFn = throttle(fn, 2000, { leading: false })
inputEl.oninput = newFn
```



**节流的实现方式二**

```html
<body>
  <input type="text" id="input">
</body>
<script>
    const throttle = (fn, delay) => {
        let timer = null;
        return function (...args) {
            if (timer) return;
            timer = setTimeout(() => {
                fn.call(this, ...args);
                timer = null;
            }, delay);
        };
    };
  const inputDom = document.getElementById("input")
  inputDom.oninput = throttle(function(e) {
    console.log(e.target.value)
  }, 500)
</script>
```



## 八、设计模式

### 8.1 分类

![](/img/js/design-patterns1.jpeg)

常见的设计模式有23种，大致可分为三种类型

+ 创建型模式：主要解决对象创建问题
+ 结构型模式：主要解决对象组合问题
+ 行为型模式：主要解决对象之间的交互问题



> 下文仅简单分析JavaScript中常见的几种设计模式



### 8.2 创建型模式

**1、单例模式**

目的：需要确保全局只有一个对象（为了避免重复新建，避免多个对象存在互相干扰）

设计方式：通过定义一个方法，使用时只允许通过此方法拿到存在内部的同一实例化对象。在js中通过**全局对象**或**闭包**实现单例模式很简单

```js
let Singleton = function (name) {
  this.name = name;
};
Singleton.genInstance = function (name) {
  if (this.instance) return this.instance;
  return (this.instance = new Singleton(name));
};

const instanceOne = Singleton.genInstance("lihua");
const instanceTWO = Singleton.genInstance("xiaoming"); // 不会再新建

console.log(instanceOne, instanceTWO); // instanceOne === instanceTWO
```



*案例1：状态管理，即使多次创建实例，也指向同一个store*

```js
function store() {
  this.store = {};
  if (store.install) {
    return store.install;
  }
  store.install = this;
}
var s1 = new store();
var s2 = new store();
s1.store.name = "lin";
console.log(s2);

//输出：{ store:{ name:'lin' } }
// 这样以来，只要创建实例，都会指向同一个对象
```



*案例2：vue-router保障全局有且只有一个，否则会错乱*

```js
let _Vue
function install(Vue) {
  if(install.installed && _Vue === vue) return
  install.installed = true
   _Vue = Vue
}
vue.use(router) //每次执行都会指向同一个对象
```



**2、工厂模式**

目的：当某一个对象需要经常创建的时候。js中的函数可以充当工厂函数，根据传入参数的同创建不同类型的对象

设计方式：写一个方法，只需要调用该方法，就能拿到想要的对象

```js
function fn(type) {
  switch (type) {
    case:'type1':
      return new Type1() //根据类型创建对象
    //...
  }
}
```



*案例1：创建多个不同的弹窗对象*

```js
function infoPop(content, color) {
  this.content = content;
  this.color = color;
}
function confirmPop(content, color) {
    // ...
}

function pop(type, content, color) {
  switch (type) {
    case "infoPop":
      return new infoPop(content, color);
    case "confirmPop":
      return new confirmPop(content, color);
  }
}

// 创建对象
const popInstance1 = pop("infoPop", "hello", "red");
const popInstance2 = pop("confirmPop", "world", "yellow");
```



### 8.3 结构型模式

**1、适配器模式**

目的：处理不兼容的接口或方法之间的适配问题（强调将一个接口转换为另外一个接口）

设计方式：新增一个包装类，对新的方法/接口进行包装以适应旧代码的调用

```js
// 定义目标接口
function TargetInterface() {
  this.request = function () {
    // ...
  };
}
// 定义适配者
function Adaptee() {
  this.specificRequest = function () {
    // ...
  };
}
// 创建适配器
function Adapter() {
  const adaptee = new Adaptee();

  this.request = function () {
    adaptee.specificRequest();
    // 执行适配逻辑
  };
}

// 使用适配器
const adapter = new Adapter();
adapter.request();
```



*案例一：例如你有一个自研框架，其中有方法在你依赖的库中已经实现，那么完全可以不用再写一次该方法（以lodash为例）*

```js
myMethods.deepClone = function() {
  return _.cloneDeep.call(this, arguments)
}
```



**2、装饰器模式**

目的：在不修改原始对象的情况下，为现有的对象拓展额外的功能

设计方式：假设为一个函数添加新功能，创建一个新的函数并以原始函数为参数，最后返回一个新的函数



*案例一：为耗时函数添加缓存功能*

```js
// 原始函数
function calculate(num) {
  let result = 0;
  for (let i = 0; i < num; i++) {
    result += i;
  }
  return result;
}

// 装饰器函数
function cache(fn) {
  const cache = new Map(); //闭包
  return function (num) {
    if (cache.has(num)) return cache.get(num);
    else {
      const result = fn(num);
      cache.set(num, result);
      return result;
    }
  };
}

const cachedCalculate = cache(calculate);
console.log(cachedCalculate(99999)); // 执行耗时计算
console.log(cachedCalculate(99999)); // 从缓存中获取结果
```



*案例二：当需要去改动他人的代码，往其中增加新功能时。例如给某些点击事件新增操作提示*

```js
function decorator(dom, fn) {
  if (typeof dom.onclick === "function") {
    let _old = dom.onclick;
    //重写
    dom.onclick = function () {
      //调用老方法
      _old();
      //执行新的操作
      fn();
    };
  }
}
```





**3、代理模式**

目的：类似于es6的proxy，对目标对象的访问能够被拦截下来，并执行一些其他的操作

```js
// 代理的对象
function TargetFN() {
  this.request = function () {
    // ...
  };
}

// 定义代理处理函数
function Proxy() {
  const targetFN = new TargetFN();
  this.request = function () {
    // 执行一些前置操作
    targetFN.request();
    // 执行一些后置操作
  };
}

const p = new Proxy();
p.request();

```



### 8.4 行为型模式

**1、策略模式**

目的：定义一些列算法，将其逐个封装起来，目的在于分离算法的使用与实现，优化代码，减少重复代码



*案例一：优化多重if判断语句*

```js
let type = 1;

if (type === 1) {
  console.log("people");
} else if (type === 2) {
  console.log("bird");
} else if (type === 3) {
  console.log("fish");
} else if (type === 4) {
  //...
}

// 使用策略模式
const actions = {
  1: () =>  { console.log("people") },
  2:() =>  { console.log("bird") },
  3: () =>  { console.log("fish") },
  // ...
};

actions[type]()
```



*案例二：优化多重if判断语句嵌套*

```js
let type = 1; //物种类型
let actionsType = 1; //吃饭1,睡觉2，游泳3....

if (type === 1) {
  if (actionsType === 1) {
    // do something
  } else if (actionsType === 2) {
    // do something
  } else if (actionsType === 3) {
    // do something
  }
} else if (type === 2) {
  if (actionsType === 1) {
    // do something
  } else if (actionsType === 2) {
    // do something
  } else if (actionsType === 3) {
    // do something
  }
} else if (type === 3) {
    // ...
} else if (type === 4) {
  //...
}

// 使用策略模式(该部分最终可以抽离出去)
const actions = [
  {
    type: 1,
    actionsType: 1,
    fn: () => {
      //do something
    },
  },
  {
    type: 1,
    actionsType: 2,
    fn: () => {
      //do something
    },
  },
  {
    type: 1,
    actionsType: 3,
    fn: () => {
      //do something
    },
  },
  {
    type: 2,
    actionsType: 1,
    fn: () => {
      //do something
    },
  },
  // ...
];

let fn = actions.find(item => item.type === type && item.actionsType === actionsType);
fn();
```



**2、 观察者模式**

> 在一些文章中，把观察者称为发布订阅模式。但是二者其实有一些小区别

观察者模式指的是一个对象（Subject）维持一系列依赖于它的对象（Observer），当有关状态发生变更时 Subject 对象则通知一系列 Observer 对象进行更新

1、**结构**：两个主要角色：观察者（Observer）和被观察者（Subject）

2、**联系**：观察者直接订阅被观察者，被观察者维护一个观察者列表，并在状态变化时通知所有观察者（通常调用观察者的方法进行通知）



*案例一*

以某个手机的销售场景为例。假设现有一爆款手机在手机店卖断了货，手机店（Subject被观察者）告诉前来的客户（Observer观察者）说把姓名联系方式留下（触发add操作），后续有货了通知（触发notify）客户来买

```js
// Subject 对象(客户在这里留了姓名联系方式)
function Subject() {
  this.observers = [];
}
Subject.prototype = {
  add(observer) {
    // 添加（添加客户的姓名联系方式）
    this.observers.push(observer);
  },
  notify() {
    // 通知（通知客户有货了）
    var observers = this.observers;
    for (var i = 0; i < observers.length; i++) {
      observers[i].update();
    }
  },
};

// Observer 对象
function Observer(name) {
  this.name = name; // （用户信息、联系方式等）
}
Observer.prototype = {
  update() {
    // 更新（通知客户来取货）
    console.log("my name is " + this.name);
  },
};

var sub = new Subject();
var obs1 = new Observer("客户1");
var obs2 = new Observer("客户2");
sub.add(obs1);
sub.add(obs2);
sub.notify();
```



### 8.5 发布订阅模式

发布订阅模式：订阅者（Subscriber）把自己想订阅的事件注册到（subscribe）调度中心（中介者）。当发布者（Publisher）发布该事件到调度中心（也就是事件触发时），由调度中心统一调用订阅者注册的处理代码



1、**结构**：存在一个中介者来订阅和发布者之间的关系

2、**联系**：发布者和订阅者不直接耦合，两者通过中介者进行通信。发布者将消息发送到中介者，然后中介者将消息传递给所有订阅者

3、**通知方式：** 订阅者通过向中介者注册感兴趣的事件或主题，中介者在接收到消息后负责将消息分发给所有订阅者



简单案例

```js
class EventEmitter {
  constructor() {
    this.event = [];
  }
  subscribe(callback) {
    this.event.push(callback);
  }
  publish(value) {
    this.event.forEach((callback) => {
      callback(value);
    });
  }
}

const ev = new EventEmitter();

// 订阅
ev.subscribe((args) => {
  console.log(args + ",callback111");
});
ev.subscribe((args) => {
  console.log(args + ",callback222");
});

// 发布
ev.publish("hello");
```



*案例一：事件总线*

```js
class EventBus {
  constructor() {
    this.events = {}; // 存储事件及其对应的回调函数列表（中介者或者说调度中心）
  }

  // 订阅事件
  subscribe(eventName, callback) {
    this.events[eventName] = this.events[eventName] || []; // 如果事件不存在，创建一个空的回调函数列表
    this.events[eventName].push(callback); 
  }

  // 发布事件
  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => {
        callback(data); // 执行回调函数，并传递数据作为参数
      });
    }
  }

  // 取消订阅事件
  unsubscribe(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (cb) => cb !== callback
      ); // 过滤掉要取消的回调函数
    }
  }
}

// 创建全局事件总线对象
const eventBus = new EventBus();

const callback1 = (data) => {
  console.log("Callback 1:", data);
};

const callback2 = (data) => {
  console.log("Callback 2:", data);
};

// 订阅事件
eventBus.subscribe("event1", callback1);
eventBus.subscribe("event1", callback2); 

// 发布事件
eventBus.publish("event1", "Hello, world!");

// 取消订阅事件
eventBus.unsubscribe("event1", callback1);

// 发布事件
eventBus.publish("event1", "ahahhaha!");
```



`案例二：利用发布订阅实现防止接口重复调用`

```js
import axios from "axios";

let instance = axios.create({
  baseURL: "/api",
});

// 发布订阅
class EventEmitter {
  constructor() {
    this.event = {};
  }
  on(type, cbres, cbrej) {
    if (!this.event[type]) {
      this.event[type] = [[cbres, cbrej]];
    } else {
      this.event[type].push([cbres, cbrej]);
    }
  }

  emit(type, res, ansType) {
    if (!this.event[type]) return;
    else {
      this.event[type].forEach((cbArr) => {
        if (ansType === "resolve") {
          cbArr[0](res);
        } else {
          cbArr[1](res);
        }
      });
    }
  }
}

// 根据请求生成对应的key
function generateReqKey(config, hash) {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data), hash].join(
    "&"
  );
}

// 存储已发送但未响应的请求
const pendingRequest = new Set();
// 发布订阅容器
const ev = new EventEmitter();

// 添加请求拦截器
instance.interceptors.request.use(
  async (config) => {
    let hash = location.hash;
    // 生成请求Key
    let reqKey = generateReqKey(config, hash);

    if (pendingRequest.has(reqKey)) {
      // 如果是相同请求,在这里将请求挂起，通过发布订阅来为该请求返回结果
      // 这里需注意，拿到结果后，无论成功与否，都需要return Promise.reject()来中断这次请求，否则请求会正常发送至服务器
      let res = null;
      try {
        // 接口成功响应
        res = await new Promise((resolve, reject) => {
          ev.on(reqKey, resolve, reject);
        });
        return Promise.reject({
          type: "limiteResSuccess",
          val: res,
        });
      } catch (limitFunErr) {
        // 接口报错
        return Promise.reject({
          type: "limiteResError",
          val: limitFunErr,
        });
      }
    } else {
      // 将请求的key保存在config
      config.pendKey = reqKey;
      pendingRequest.add(reqKey);
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 将拿到的结果发布给其他相同的接口
    handleSuccessResponse_limit(response);
    return response;
  },
  function (error) {
    return handleErrorResponse_limit(error);
  }
);

// 接口响应成功
function handleSuccessResponse_limit(response) {
  const reqKey = response.config.pendKey;
  if (pendingRequest.has(reqKey)) {
    let x = null;
    try {
      x = JSON.parse(JSON.stringify(response));
    } catch (e) {
      x = response;
    }
    pendingRequest.delete(reqKey);
    ev.emit(reqKey, x, "resolve");
    delete ev.reqKey;
  }
}

// 接口走失败响应
function handleErrorResponse_limit(error) {
  if (error.type && error.type === "limiteResSuccess") {
    return Promise.resolve(error.val);
  } else if (error.type && error.type === "limiteResError") {
    return Promise.reject(error.val);
  } else {
    const reqKey = error.config.pendKey;
    if (pendingRequest.has(reqKey)) {
      let x = null;
      try {
        x = JSON.parse(JSON.stringify(error));
      } catch (e) {
        x = error;
      }
      pendingRequest.delete(reqKey);
      ev.emit(reqKey, x, "reject");
      delete ev.reqKey;
    }
  }
  return Promise.reject(error);
}

export default instance;
```



**发布订阅模式与观察者模式的区别？**

1、**通信方式**的差异：观察者模式中，被观察者直接通知观察者；而在发布订阅模式中，发布者通过中介者联系订阅者

2、直接**耦合**与间接耦合：观察者模式中，观察者与被观察者直接耦合；发布订阅模式中，发布者和订阅者通过中介者间接耦合



## 九、面向对象

JavaScript其实支持多种编程范式的，包括**函数式编程和面向对象编程**

面向对象：

1、JavaScript中的对象被设计成一组属性的无序集合，像是一个哈希表，由key和value组成

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



### 9.1 defineProperty

`Object.defineProperty()`方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象



**可接收三个参数**

1、obj：要定义属性的对象

2、prop：要定义或修改的属性的名称或Symbol

3、descriptor：要定义或修改的**属性描述符**

返回值：被修改的对象obj

```js
var obj = {
    name: "xiaoming",
    age: 19
}

// 为obj增加一个属性
Object.defineProperty(obj, "height", {
    value: 1.88
})
console.log(obj) //输出：{ name: 'linmnig', age: 19 }
```

> 注：通过该函数添加的新属性，默认不可被遍历



**属性描述符分类**

属性描述符的类型有两种：

1、数据属性描述符

2、存取属性(访问器)描述符

| 分类       | configurabel | enumerable | value  | writable | get    | set    |
| ---------- | ------------ | ---------- | ------ | -------- | ------ | ------ |
| 数据描述符 | 可以         | 可以       | 可以   | 可以     | 不可以 | 不可以 |
| 存取描述符 | 可以         | 可以       | 不可以 | 不可以   | 可以   | 可以   |

> 如何区分：当存在get、set时，不能有value和writable（不能共存），反之同理

**数据描述符的特性**

+ 1、`[[Configurable]]`：表示属性是否可以通过delete删除属性，是否可以修改它的特性，或者是否可以将它**修改为存取属性描述符**

  + A、直接在一个对象上定义某个属性时，这个属性的[[Configurable]]为true

  + B、通过属性描述符定义一个属性时，这个属性的[[Configurable]]默认为false

+ 2、[[Enumerable]]：表示是否可以通过遍历获得该属性

  + A、直接在一个对象上定义某个属性时，这个属性的[[Enumerable]]为true

  + B、通过属性描述符定义一个属性时，这个属性的[[Enumerable]]默认为false

+ 3、[[Writable]]：表示是否可以修改属性的值

  + A、直接在一个对象上定义某个属性时，这个属性的[[Writable]]为true

  + B、通过属性描述符定义一个属性时，这个属性的[[Writable]]默认为false

+ 4、[[value]]：属性的value值，读取属性时会返回该值，修改属性时，会对其进行修改
  + A、默认情况下这个值是undefined

```js
var obj = {
    name: 'xiaoming'
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
    name: 'xiaoming',
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
        value: "xiaoming"
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



### 9.2 批量创建对象

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

var p1 = createPerson('xiaoming', 22, 1.81, "广州")

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

+ 1、在内存中创建一个新的对象（空对象）

+ 2、这个对象内部的[[prototype]]属性（隐式原型）会被赋值为该构造函数的prototype属性

+ 3、构造函数内部的this，会指向创建出来的新对象 `{} = this`

+ 4、执行函数的内部代码（函数体代码）

+ 5、如果构造函数没有返回非空对象，则返回创建出来的新对象

```js
function Person() {}

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
}

var p1 = new Person("lihua", "18", "2.00", "深圳市")
var p2 = new Person('xiaoming', 22, "1.92", "广州市")
console.log(p1);

p1.eating()
p2.eating()

console.log(p1.eating === p2.eating) //false
```

**构造函数的缺点：**从上边的案例中，`console.log(p1.eating === p2.eating) //false` 我们可以得出，创建出来的实例的函数地址是不同的（即内部创建了不同的内存空间来保存这个函数），但是完成没有必要。但这样子的创建实例多了，就浪费了很多的内存空间



### 9.3 对象的原型

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



### 9.4 函数的原型

1、函数本质上也是一个对象，所以它有**隐式原型**

```js
function foo() {}
console.log(foo.__proto__) // {}
```

2、函数还有一个显示原型属性：prototype

```js
console.log(foo.prototype)  // {}
```

> 思考：函数的prototype也是一个对象，那么这个对象的隐式原型是谁呢？
>
> ```js\
> console.log(foo.prototype.__proto__)
> //输出：[Object: null prototype] {}，即Object的原型对象
> ```



3、当函数作为构造函数被调用时，其内部创造出来的对象的隐式原型会指向显示原型

我们之前讨论过通过new调用一个函数会发生什么？

其中的第二步：`这个对象内部的[[prototype]]属性(即隐式原型)会被赋值为该构造函数的prototype属性`

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

<img src="/img/js/prototype1.jpg" style="zoom: 50%;" />

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



4、constructor属性

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



### 9.5 原型链

我们知道，查找一个对象的属性和方法时，会触发[[ get ]]操作

1、在当前对象中查找

2、如果没有找到，将会去对象的原型上（`__proto__`）查找

```js
const obj = {}
obj.__proto__.address = "广州市"
console.log(obj.address) //输出：广州市
```

3、如果还没找到，会继续沿着原型链查找（原型对象是一个对象，对象有自己的原型对象）

<img src="/img/js/prototype2.jpg" style="zoom:67%;" />

```js
obj.__proto__ = {}
obj.__proto__.__proto__ = {}
obj.__proto__.__proto__.__proto__ = {
    address: 'linming'
}
console.log(obj.address) //输出：linming
```

但是原型链不是无限的，最终会止于最顶层原型

那么最顶层的原型是是谁呢？就是Object的原型对象



### 9.6 Object的原型

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

<img src="/img/js/prototype3.jpg" style="zoom:67%;" />

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

> 注意：其中，顶层显式原型对象是一个对象，它的隐式原型是null

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

<img src="/img/js/prototype6.jpg" style="zoom:67%;" />

所以，可以说People构造函数继承自Object



### 9.7 对象-函数-原型的联系

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

<img src="/img/js/prototype4.jpg" style="zoom:67%;" />

创建一些实例，其指向关系如何

<img src="/img/js/prototype5.jpg" style="zoom:67%;" />

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



### 9.8 原型内容补充

**1、hasOwnProperty**

判断对象是否有一个属于自己的属性（不是在原型上的属性）

```js
var obj = {
  name: "linming",
  age: 18,
};

obj.__proto__.address = "深圳";

console.log(obj.hasOwnProperty("address")); //false
console.log(obj.hasOwnProperty("name")); //true
```

**2、in操作符**

判断某个属性是否在某个对象或者对象的原型上

```js
console.log("address" in obj) //true
console.log("name" in obj) //true
```

**3、for...in**

该遍历操作可以遍历出原型上的属性

```js
for (let key in obj) {
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



### 9.9 继承

**1、原型链继承**

```js
// 父类
function People() {
  this.name = "linming";
  this.obj = { age: 20 }
}
People.prototype.running = function () {
  console.log(this.name + "在跑步");
};

// 子类
function Child() {
  this.age = 22;
}

// 继承：改写了Child的显示原型，指向People的实例
Child.prototype = new People();

Child.prototype.eating = function () {
  console.log(this.name + "在吃东西");
};

const son = new Child();
console.log(son.age); //22
console.log(son.name); //linming
son.running(); //linming在跑步
son.eating(); //linming在吃东西
```

最主要的代码是`Child.prototype = new People()`，这里将Child的原型改写为People的实例，由此实现了继承

> 缺点：父类的引用属性会被所有子类共享，一处修改会影响所有子类；子类实例不能传递参数给父类构造函数



**2、构造函数继承**

```js
function People(name, age, address) {
  this.name = name;
  this.age = age;
  this.address = address;
}

function Child(name, age, address, sno) {
  // this = 所创建的实例
  People.call(this, name, age, address); //相当于在这里执行了People所有初始化方法
  this.sno = sno;
}

const son1 = new Child("linming", 22, "深圳", 20180201);
const son2 = new Child("小明", 223, "广州", 201803041);
console.log(son1);
console.log(son2);
```

> 缺点：子类访问不了父类原型上定义的方法



**3、组合式继承**

组合式继承结合了原型链继承和构造函数继承的特点

```js
function People(name, age, address) {
  this.name = name;
  this.age = age;
  this.address = address;
}

People.prototype.running = function () {
  console.log(this.name + " is running");
};

function Child(name, age, address, sno) {
  // this = 所创建的实例
  People.call(this, name, age, address); //相当于在这里执行了People所有初始化方法
  this.sno = sno;
}

Child.prototype = new People(); //Child的隐式原型即可指向People的显示原型

const son1 = new Child("xiaoming", 22, "深圳", 20180201);
console.log(son1);
son1.running();
```

> 优点：父类方法可以复用；允许子类向父类传参；父类中的引用属性不会被共享



**4、原型式继承**

```js
let person = {
  name: "xiaoming",
  age: 22,
  friends: ["lihua", "tom", "make"],
  sayName: function () {
    console.log(this.name);
  },
};

function objectCopy(obj) {
  function Fun() {}
  Fun.prototype = obj; //让子类的原型指向person
  return new Fun();
}

let p1 = objectCopy(person);
let p2 = objectCopy(person);

p1.friends.push("xxx");
console.log(p2.friends); //多了xxx
```

> 缺点：父类的引用会被所有子类共享；子类实例不能向父类传参



**5、寄生式继承**

```js
let person = {
  name: "xiaoming",
  friends: ["lihua", "make", "jack"],
};

// 创建一个对象，并且允许自定义隐式原型的指向
function copyObject(obj) {
  function Fun() {}
  Fun.prototype = obj;
  return new Fun();
}

function createChild(original) {
  let clone = copyObject(original);
  clone.running = function () {
    console.log(this.name + " is running");
  };
  return clone;
}

const son1 = createChild(person);
const son2 = createChild(person);

son1.friends.push("被共享");
console.log(son2.friends); //['lihua', 'make', 'jack', '被共享']
```



**6、寄生组合式继承**

```js
// 父类
function People(name) {
  this.name = name;
  this.friends = ["lihua", "jack", "tom"];
}

// 子类
function Child(name, age) {
  People.call(this, name); //继承父类的属性方法
  this.age = age; // 子类自己的属性方法
}

// 创建一个对象，并且允许自定义隐式原型的指向
function copyObject(obj) {
  function Fun() {}
  Fun.prototype = obj;
  return new Fun();
}

function inheritPrototype(child, parent) {
  let prototype = copyObject(parent.prototype); // 创建对象，对象的隐式原型 = 父类原型
  prototype.constructor = child;
  child.prototype = prototype;
}

People.prototype.sayName = function () {
  console.log(this.name);
};

inheritPrototype(Child, People); //改造子类的原型

Child.prototype.sayAge = function () {
  console.log(this.age);
};

let son1 = new Child("xiaoming", 22);
let son2 = new Child("lily", 20);
son1.friends.push("不会被共享");
console.log(son2.friends); // ["lihua", "jack", "tom"];

son2.sayAge(); // 20
son2.sayName(); // lily
```

经过这么一番改造后，子类的显示原型被重新赋值了一个对象，并且该对象的隐式原型指向父类的显示原型。因此子类可以访问自己的原型和父类的原型（两者是分隔开的）

另一方面，子类自身拥有父类自身所有的属性和方法（可自定义传参），也可以拥有自己的属性和方法。因此多个子类实例不用担心引用属性被共享的问题




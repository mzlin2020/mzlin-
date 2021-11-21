# CSS

## 一、基础

### 1、块元素和行内元素

1、块元素：独占一行，并且自动填满父元素，可以设置margin和padding及高度和宽度

2、行内元素：不会独占一行，width和height会失效，并且在垂直方向的padding和margin会失效



**补充1、：img是行内元素吗？为什么可以设置宽高**

> <img> 是一个**可替换元素**。它的 display 属性的默认值是 inline，但是它的默认分辨率是由被嵌入的图片的原始宽高来确定的，使得它就像 inline-block 一样。你可以为  设置 border/border-radius、padding/margin、width、height 等等的 CSS 属性。



**补充2：什么是可替换元素**

**可替换元素**（**replaced element**）的展现效果不是由 CSS 来控制的。这些元素是一种外部对象，它们外观的渲染，是独立于 CSS 的。

**理解**：比如`img`标签就是一个典型的可替换元素，浏览器会去找到对应的图片资源，并且替换掉img标签。

可替换元素比较特殊，其宽高由其加载的内容决定，但是CSS可以覆盖其本身的样式

**典型的可替换元素：**`<img>、<video>、<input>`



**补充3：行内块元素**

`display: inline-block`

特点：

1、元素不会独占一行，宽度默认由其内容决定

2、支持设置宽高、外边距、内边距等样式







### 2、 选择器优先级

1、css优先级？

7种选择器基础：

+ id选择器，如 #id {...}
+ 类选择器，如 .class {...}
+ 标签选择器，如 div {...}
+ 属性选择器 ，如a[ href = "segmentfault.com" ] {...}
+ 伪类选择器，：hover {...}
+ 伪元素选择器，::before {...}
+ 通配选择器，如 * {...}

**优先级**: ！important > 内联样式 > ID选择器 >  类选择器( 伪类选择器 )> 标签选择器 (伪元素选择器) 

- 10000：!important；
- 01000：内联样式；
- 00100：ID 选择器；
- 00010：类选择器、伪类选择器、属性选择器；
- 00001：元素选择器、伪元素选择器；
- 00000：通配选择器、后代选择器、兄弟选择器；

注1：选择器**从右往左**解析

注2：`!important`为开发者提供了一个增加样式权重的方法。

用法：`#box{color:red !important;}`



2、选择器都有哪些？

**基础选择器**

- 标签选择器：`h1`
- 类选择器：`.checked`
- ID 选择器：`#picker`
- 通配选择器：`*`

**组合选择器**

- 相邻兄弟选择器：`A + B`
- 普通兄弟选择器：`A ~ B`
- 子选择器：`A > B`
- 后代选择器：`A B`

**属性选择器**

- `[attr]`：指定属性的元素；
- `[attr=val]`：属性等于指定值的元素；
- `[attr*=val]`：属性包含指定值的元素；
- `[attr^=val]`	：属性以指定值开头的元素；
- `[attr$=val]`：属性以指定值结尾的元素；
- `[attr~=val]`：属性包含指定值(完整单词)的元素(不推荐使用)；
- `[attr|=val]`：属性以指定值(完整单词)开头的元素(不推荐使用)；

如果希望选择有某个属性的元素，而不论属性值是什么，可以使用简单属性选择器

```js
//把包含标题（title）的所有元素变为红色
*[title] {
    color: red;
}
```

或者

```html
<style>
    [aaa]{
        color: aqua;
    }
    [bbb]{
        color: blue;
    }
</style>
<body>
    <div aaa>hello</div>
    <div bbb>world</div>
</body>
```











### 3、BFC

**定义**：

块级格式化上下文（Block Formatting Context，BFC） 是Web页面的可视化CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

> (**块级格式化上下文**，是一个独立的渲染区域，让处于 BFC 内部的元素与外部的元素相互隔离，使内外元素的定位不会相互影响)

**理解**

块级格式化上下文，它是页面中的一块渲染区域，并且有一套属于自己的渲染规则，它决定了元素如何对齐内容进行布局，以及与其他元素的关系和相互作用。 当涉及到可视化布局的时候，BFC提供了一个环境，HTML元素在这个环境中按照一定规则进行布局

总结:**BFC是一个独立的布局环境，BFC内部的元素布局与外部互不影响**

**BFC布局规则**

1、内部的Box会在垂直方向上一个接着一个地放置

2、Box垂直方向上的距离由margin决定。属于同一个BFC的两个相邻的Box的margin会发生重叠

3、每个盒子的外边框紧挨着包含块的左边框，即使浮动元素也是如此

> BFC 中子元素的 margin box 的左边， 与包含块 (BFC) border box的左边相接触 (子元素 absolute 除外)

4、BFC 的区域不会与 float 的元素区域重叠

5、BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素，反之亦然

6、计算BFC高度时，考虑BFC所包含的所有元素，浮动子元素也参与计算



**触发BFC**

| 属性     | 属性值                              |
| -------- | ----------------------------------- |
| float    | left、right                         |
| position | absolute、fixed                     |
| overflow | auto、scroll、hidden（除了visible） |
| display  | inline-block、table-cell            |



**BFC解决的问题**

1、解决浮动元素令父元素高度塌陷的问题

方法：给父元素开启BFC

原理：计算BFC的高度时，浮动子元素也参与计算



2、非浮动元素被浮动元素覆盖

方法：给非浮动元素开启BFC

原理：BFC的区域不会与float box重叠



3、两栏自适应布局

方法：给固定栏设置固定宽度，给不固定栏开启BFC

原理：BFC的区域不会与float box重叠



4、外边距垂直方向重合的问题

方法：给上box或者下box任意一个包裹新的box并开启BFC

原理：属于同一个BFC的两个相邻的Box会发生重叠





### 4、伪类与伪元素

**伪类**：当已有元素处于某个状态时，为其添加对应的样式，这个状态是根据用户行为而动态变化的

例如：当用户鼠标悬停指定的元素时，`:hover`可以用来描述这个元素的状态

```html
//改变第一个li的颜色
<ul>
    <li>first</li> 
    <li>second</li>
    <li>third</li>
</ul>

<style>
    li:first-child{
        color: red;
    }
</style>
```

**伪元素**：用于创建一些不在DOM树中的元素，并为其添加样式

例如：`::before`可以在一个元素前增加一些文本，并为这些文本添加样式。（虽然用户可以看到这些文本，但是这些文本实际上不在DOM树上）

```html
//改变第一个字母的颜色

<p>Hello World</p>

<style>
    p::first-letter {
        color: royalblue;
    }
</style>
```

这个地方使用伪元素，看起来好像是创建了一个`<span>`包裹了‘ H ’，但实际上DOM树上并不存在这个元素



从上述的例子中可以看出，伪类的操作对象是DOM树中已有的元素，而伪元素则创建了一个DOM树外的元素。因此，伪类与伪元素的区别在于：有没有创建一个文档树之外的元素



| 伪元素           | 说明                                              |
| ---------------- | ------------------------------------------------- |
| ：：first-letter | 设置对象内的第一个字符的样式                      |
| ：：first-line   | 设置对象内的第一行的样式                          |
| ：：before       | 设置在对象前发生的内容，用来和content属性一起使用 |
| ：：after        | 设置在对象后发生的内容，用来和content属性一起使用 |
| ：：placeholder  | 设置对象文字占位符的样式                          |
| ：：selection    | 设置对象被选择时的颜色                            |



| 伪类          | 说明                                                 |
| ------------- | ---------------------------------------------------- |
| ：link        | 设置超链接a在未被访问前的样式                        |
| ：visited     | 设置超链接a在其链接地址已被访问过时的样式            |
| ：hover       | 设置元素在其鼠标悬停是的样式                         |
| ：active      | 设置元素在被用户激活时的样式（鼠标点击后释放的事件） |
| ：focus       | 设置元素在称为输入焦点时的样式                       |
| ：first-child | 匹配父元素的第一个子元素                             |
| ：last-child  | 匹配父元素的最后一个子元素                           |

### 5、高度塌陷

**解决方案：**

1、创建父级BFC

2、为父级设置高度

3、通过增加尾元素清除浮动？





### 6、层叠上下文

![](img/%E5%89%8D%E7%AB%AF%E6%80%BB%E7%BB%93/%E5%B1%82%E5%8F%A0%E4%B8%8A%E4%B8%8B%E6%96%87.jpg)

**层叠上下文**（堆叠上下文，Stacking  Context）,是HTML中一个三维的概念。在CSS2.1规范中，每一个元素的位置是三维的，当元素发生层叠，这时它可能覆盖了其他元素或者被其他元素覆盖；排在z轴越靠上的位置，距离屏幕观察者越近



每个网页都有一个默认的层叠上下文`<html>`，当你给一个定位元素赋予除了`auto`外的z-index值时，就创建了一个新的层叠上下文



在层叠上下文中，其子元素按照上面解释的规则进行层叠。形成层叠上下文的[方法](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FCSS%2FCSS_Positioning%2FUnderstanding_z_index%2FThe_stacking_context)有：

- 根元素`<html></html>`
- `position`值为`absolute | relative`，且`z-index`值不为 `auto`
- `position` 值为 `fixed | sticky`
- `z-index` 值不为 `auto` 的flex元素，即：父元素`display: flex | inline-flex`
- `opacity` 属性值小于 `1` 的元素
- `transform` 属性值不为 `none`的元素
- `mix-blend-mode` 属性值不为 `normal` 的元素
- `filter`、`perspective`、`clip-path`、`mask`、`mask-image`、`mask-border`、`motion-path` 值不为 `none` 的元素
- `perspective` 值不为 `none` 的元素
- `isolation` 属性被设置为 `isolate` 的元素
- `will-change` 中指定了任意 CSS 属性，即便你没有直接指定这些属性的值
- `-webkit-overflow-scrolling` 属性被设置 `touch`的元素



### 7、回流与重绘

**回流（reflow）**

当render tree中的一部分（或全部）因为元素的尺寸、布局、隐藏等改变而需要重新构建，就称为回流。

注：每个页面至少需要一次回流，就是在页面第一次加载的时候



**重绘（repaint）**

当render tree中的一些元素需要更新属性，而这些属性只是影响元素的外观、风格、而不会影响布局的，比如color、background-color等，就称为重绘



**区别**

1、引起DOM树结构变化，页面布局变化的行为就是回流

2、只是样式的变化，不会引起DOM树变化、页面布局变化的行为叫重绘

3、回流必将引起重绘，而重绘不一定会引起回流

4、回流的代价要远远大于重绘



**如何减少回流**

1、减少对DOM的增删行为

比如删除某个节点、给某个父元素添加子元素

2、减少几何属性的变化

比如元素的宽高变化、border变化、字体大小变化

（可以将这些变化放在一个class中，直接添加class，这样就只引起一次回流）

3、减少元素位置的变化

比如修改一个元素的margin、padidng

（可以脱离文档流的改变位置会更好）

4、减少获取元素的偏移量属性

例如获取一个元素的scrollTop、scrollLeft等属性，浏览器为了保证值的正确也会回流取得最新的值

5、页面的初次渲染

无法避免

6、浏览器窗口尺寸变化

resize事件也会引起回流



### 8、@import和link

1、link 是 HTML 标签，除了能导入 CSS 外，还能导入别的资源，比如图片、脚本和字体等；而 @import 是 CSS 的语法，只能用来导入 CSS；

2、link 导入的样式会在页面加载时同时加载，@import 导入的样式需等页面加载完成后再加载（可能导致页面闪烁）；

3、link 没有兼容性问题，@import 不兼容 ie5 以下；

4、link 可以通过 JS 操作 DOM 动态引入样式表改变样式，而@import不可以。

### 10、CSS隐藏元素

方式一：`overflow：hidden`

说明：overflow的hidden用来隐藏元素溢出部分，占据空间，无法响应点击事件



方式二：`opacity: 0`

```css
#box {
    opacity: 0
}
```

opacity是用来设置元素透明度的，设置透明度为0相当于隐藏了元素



方式三：`display: none`

```css
#box {
    display: none
}
```

彻底隐藏了元素，不占据空间，也不会影响布局



方式四：position

通过position移出可视区域

```css
#box {
    position: absolute;
    left: -99999999px;
    top: -9999999px;
}
```



方式五：z-index

将元素置于其他元素下方

```css
#box {
    position: absolute;
    z-index: -9999;
}
```





### 11、雪碧图

雪碧图（CSS Sprites），其目的是将多张比较小的图片，合并到一张大的图片上，大的图片背景透明。使用的时候，通过把该张图片当做背景图片，通过不同的`background-postion`定位展示那部分的图片

**优点**：降低服务器压力、减少网络请求，页面渲染更快

**缺点**：

1、后期维护困难，添加一张图片需要重新制作

2、应用麻烦，每一张图片都需要计算位置，通过调整位置来展示图片，对误差要求很严格

3、使用图片有局限，只能用在背景图片`background-image`上，不能用`<img>`标签来使用

```css
<style>
#box1 {
    width: 100px;
    height: 100px;
    border:1px black solid;
    background: url('./img/cookie.jpg')-200px -200px;
}
#box2 {
    width: 100px;
    height: 100px;
    border:1px black solid;
    background: url('./img/cookie.jpg') -200px -200px;
}
</style>
```



### 12、一行文字省略



### 13、absolute和fixed的区别

共同点：都会脱离当前文档流、触发BFC

区别：

1、相对定位的元素不同：absolute是相对于离它最近的有定位的父元素进行定位（如果没有定位的元素则相对于浏览器窗口）；fixed是相对于浏览器窗口定位

2、在有滚动条的页面中，absolute会跟随页面滑动，fixed不会滑动，始终固定在同一个位置



### 14、css定位



## 二、居中布局

### 1、水平居中

**A.行内元素**

```css
.parent {
    text-align: center;
}
```

**B.块级元素: margin**

```css
.son {
    width: 100px;
    margin: 0 auto;
}
```

**C.块级元素：flex布局**

```css
.parent {
    display: flex;
    justify-content: center;
}
```

**D.块级元素：绝对定位 **

1.transform

```css
.son {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
}
```

`transform: translate(-50%, 0);`基于自身的宽度，向左偏移



2.left

```css
.son {
    position: absolute；
    width: 宽度；
	left：50%；
	margin-left: -0.5*宽度
}
```

3.left/right: 0

```js
.son {
    position: absolute;
    width: 宽度;
    left: 0;
    right: 0;
    margin: 0 auto;
}
```



### 2、垂直居中

**A.行内元素**

```css
.parent {
    height: 高度;
}
.son {
    line-height: 高度;
}
```

注：子元素line-height的值=父元素height的值，才有效



**B.块级元素：flex布局**

```css
.parent {
	display:flex;
    align-item: center;
}
```



**C.块级元素：绝对定位**

1.transform

```css
.son {
    position: absolute;
    top: 50%;
    transform: translate(0, -50%)
}
```

2.top:50%

```css
.son {
    position: absolute;
    top: 50%;
    height: 高度;
    margin-top: -0.5*高度
}
```

3.top/bottom: 0

```css
.son {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
}
```

**B.块级元素：table**

```css
.parent {
	display: table-cell;
    vertical-align: middle;
}
.son {
    display: inline-block;
}
```





### 3、水平垂直居中

**A.绝对定位**

1.margin负值

```js
.son {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -0.5*宽度;
    margin-top: -0.5*高度;
}
```

2.transform

```css
.son {
	position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%)
}
```

3.left/right/top/bottom: 0

```css
.son {
    position: absolute;
    left: 0;
    top: 0;
    top: 0;
    bottom: 0;
    margin:
}
```



**B.Flex布局**

```css
.parent {
	display: flex;
    justify-content: center;
    align-items: center;
}
```



**C.table**

```css
.parent {
    display :table-cell;
    vertical-align: center;
}
.son {
    display: inline-block;
}
```



**D.grid布局**

```css
.parent {
    display: grid;
}
.son {
    margin: auto;
}
```





## 三、css画图

### 3.1 画一个三角形

通过改变参数可以做出各种形状的三角形

原理：设置div的宽高均为0，调整div四个方向的border，并适当隐藏不需要的border，就可以做出三角形

```html
    <style>
        div {
            width: 0px;
            height: 0px;
            border-bottom: 100px solid red;
            border-right: 100px solid transparent; /*transparent：透明颜色*/
            border-top: 100xpx solid transparent;
            border-left: 100px solid transparent;
        }
    </style>
</head>
<body>
    <div></div>
</body>
```



### 3.2 画一条线

```html
    <style>
        div{
            width: 200px;
            border-bottom: 1px black solid;
        }
    </style>
</head>
<body>
    <div></div>
</body>
```

当然也可以用`<hr>`来画一条线（全屏）



### 3.3 画一个圆

```javascript
    <style>
        div{
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 1px black solid;
        }
    </style>
</head>
<body>
    <div></div>

</body>
```



## 四、盒模型

页面渲染时，dom 元素所采用的 **布局模型**。可通过`box-sizing`进行设置。根据计算宽高的区域可分为：

- `content-box` (W3C 标准盒模型)
- `border-box` (IE 盒模型)
- `padding-box` (FireFox 曾经支持)
- `margin-box` (浏览器未实现)

**盒子的组成**

四部分：margin（外边距）、border（边框）、padding（内边距）、content（内容）

margin、border、padding是css属性，因此可以通过这三个属性来控制盒子的这三个部分。而content则是HTML元素的内容。

**两种盒模型**

盒子的宽度和高度的计算方式由box-sizing属性控制,

css的盒模型包括**IE盒子模型**和**标准的W3C盒子**

1、**标准盒模型**：

```css
box-sizing:content-box
```

content-box:默认值，width和height属性分别应用到元素的内容框，在宽度和导读之外绘制元素的内边距、边框、外边距

```css
width = content-width
height = content-height
```

2、**IE盒模型**

```css
box-sizing:border-box
```

border-box:为元素设定的width和height属性决定了元素的边框盒。就是说，为元素指定的任何内边距和边框都将在已设定的高度和宽度内进行绘制。

```css
width = content-width + padding-width + border-width
heigth = content-heigth + padding-heigth + border-heigth
```

**盒子成分分析**

margin、padding、border都包含：top、bottom、left、right四个方向

```css
/*margin实例*/
margin-top /*上外边距*/
margin-bottom /*下外边距*/
margin-left /*左外边距*/
margin-right /*右外边距*/
```

简写

```css
/*以margin为例*/
margin:10px ; /*设置四条边的外边距相等*/

margin:10px 5px;  /*设置上下10px,左右5px*/

margin:10px 8px 5px; /*设置上外边距10px，左右外边距8px 下外边距5px*/

margin:10px 8px 5px 3px; /*设置顺序为上、右、下、左的外边距*/
```

## 五、CSS动画

### 5.1 CSS动画-animation

避免混淆

| 属性               | 含义                                              |
| ------------------ | ------------------------------------------------- |
| animation（动画）  | 用于设置动画属性，它是一个简写的属性，包含8个属性 |
| transition（过渡） | 用于设置元素的样式过渡                            |
| transform（变形）  | 用于元素进行旋转、缩放、移动和倾斜                |
| translate（移动）  | translate是transform的一个属性值                  |



css动画，也称为关键帧动画，通过@keyframes来定义关键帧

**1、 animation的属性**

| 属性                      | 描述                                                         |
| ------------------------- | ------------------------------------------------------------ |
| animation-duration        | 指定动画完成一个周期所需要时间，单位秒或毫秒，默认是0        |
| animation-timing-function | 指定动画计时函数，即动画的速度曲线，默认是ease               |
| animation-delay           | 指定动画延迟时间，即动画何时开始，默认是0                    |
| animation-direction       | 指定动画播放的方向，默认是nomal                              |
| animation-fill-mode       | 指定动画填充模式，默认是none                                 |
| animation-iteration-count | 指定动画播放次数，默认是1                                    |
| animation-play-state      | 指定动画播放状态，正在运行或暂停，默认是running，也可以paused |
| animation-name            | 指定@keyframes动画的名称（必须）                             |

**2、定义关键帧**

案例分析：实现div旋转一圈

```css
    @keyframes theName {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
```

`theName`是动画的名字，`from`就是最开始的那一帧，`to`表示结束时的那一帧。所以也可以用（0%，100%来表示）

```css
@keyframes theName{
  0%{
    transform: rotate(0deg);
  }
  100%{
    transform: rotate(360deg);
  }
}
```



使用关键帧添加动画

```css
animation: theNmae 2s;
//或者
animation-name: theName;  //不可省略
animation-duration: 2s;
```

**3、 属性说明**

1、指定动画的运动曲线

```css
animation-timing-function:ease /** linear、ease-in、ease-out、ease-in-out **/
```

| 值          | 说明                                   |
| ----------- | -------------------------------------- |
| linear      | 动画从头到尾的速度是相同的             |
| ease        | 默认，低速开始，然后加快，在结束前变慢 |
| ease-in     | 动画以低速开始                         |
| ease-in-out | 低速开始和结束                         |



2、指定动画填充模式

可以规定动画开始前和动画结束后，处于什么状态。这对于改善动画体验有极大的作用

| 属性      | 说明                                                 |
| --------- | ---------------------------------------------------- |
| none      | 默认                                                 |
| forwards  | 动画完成后，元素保持为最后一帧的状态                 |
| backwards | 有动画延迟时，动画开始前，元素状态保持为第一帧的状态 |
| both      | 上述两者效果都有                                     |

```css
/**进度条**/
    #box {
      height: 20px;
      border: 1px solid black;
      background: linear-gradient(#0ff,#0ff);
      background-repeat: no-repeat;
      background-size: 0;
      animation: move linear 2s forwards;
    }
    @keyframes move{
      100% {
        background-size: 100%;
      }
    }
```



3、播放方向

| 属性              | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| nomal             | 默认值                                                       |
| reverse           | 动画方向播放                                                 |
| alternate         | 动画在奇数次（1、3、5...）正向播放，在偶数次（2、4、6...）反向播放 |
| alternate-reverse | 动画在奇数次（1、3、5...）反向播放，在偶数次（2、4、6...）正向播放 |



### 5.2 CSS动画-transition

transition翻译成中文是过渡的意思，顾名思义，它就是专门做过渡动画的，比如一些放大缩小，隐藏显示等



| 值                         | 说明                              |
| -------------------------- | --------------------------------- |
| transition-duration        | 效果的持续时间                    |
| transition-property        | 指定CSS属性的name，transition效果 |
| transition-timing-function | 运动曲线                          |
| transition-delay           | 延迟执行                          |

 

1、transition-duration

鼠标移入，div于2秒内逐渐变大

```css
  div{
      width:100px;
      height:100px;
      border-radius: 50%;
      background:#f40;
      transition-duration: 2s;
  }
  div:hover{
      height:150px;	
      width:150px;
  }
```



2、transition-property

指定CSS属性的name，transition效果只对该属性生效

```js
div{
    width:100px;
    height:100px;
    border-radius: 50%;
    background:#f40;
    transition-duration:1s;
    transition-property:width;
}
div:hover{	
    width:150px;
}
```

案例中的效果只生效了width

3、transition-timing-function

指定transition效果的转速曲线，有多个曲线可选：`ease linear、ease-in、ease-out、ease-in-out`



### 5.3 CSS动画-transform

`transform`字面上就是变形，改变的意思

它有很多的属性，总结起来就以下四个属性

+ rotate旋转
+ skew扭曲
+ scale缩放
+ translate移动

应用：

```css
div {
    width:100px;
    height:100px;
    border-radius: 50%;
    background:#f40;
    animation: scale infinite 2s linear alternate-reverse;
}
@keyframes scale{
  0% {
    transform: scaleX(0.1);
  }
  100% {
    transform: scaleX(1);
  }
}
```



### 5.3 css动画与js动画

**1、css动画**

css动画是关键帧动画，只需要添加关键帧的位置，其他的未定义的帧会被**自动生成**。

缺点：因为往往只是设置几个关键帧的位置，所以在进行动画控制的时候比较困难，不能再半路暂停动画；或者在动画过程中添加一些其他操作，都不大容易

优点：

+ 浏览器可以对动画进行优化
+ 帧速不好的浏览器，CSS3可以自然降级兼容
+ 代码简单，调优方向固定



**2、JS动画**

JS动画是逐帧动画，**在时间帧上绘制内容**，一帧一帧的，可造性很高，几乎可以完成任何想要的动画形式。

缺点：由于逐帧动画的内容不一样，会增加制作的负担，占用比较大的资源空间

优点：

+ 动画播放细腻、丝滑
+ 可控性高，可以制作炫酷的高级动画



**3、CSS动画与JS动画的区别**

1、CSS动画是关键帧动画，JS是时间帧动画。JS的动画可控性要更高一些

2、性能方面，JS实现需要频繁地修改DOM，不断地进行回流和重绘，开销十分大。并且js运行在浏览器的主线程中，可能会导致线程阻塞，从而掉帧。

而CSS动画是运行在合成线程中的，不会阻塞主线程，并且 在合成线程中完成的动作不会触发回流和重绘

总结：**CSS动画的渲染成本小，执行效率高。所以只要能用CSS实现的动画，就不要采用JS去实现**





## 八、清除浮动

1、什么是浮动？

**浮动元素会脱离文档流并向左/向右浮动，直到碰到父级元素或者另一个浮动元素**



2、为什么要清除浮动？

因为浮动元素会脱离正常的文档流，并不会占据文档流的位置。

一个元素的高度默认由其子元素的高度决定，当子元素浮动时，父元素就是去了高度。造成所谓的高度塌陷。对页面的布局造成影响。

所以，需要清除浮动造成的影响



**1、clear清除浮动**

clear属性不允许被清除浮动的元素的左边/右边挨着浮动元素，原理是在被清除浮动的元素上边或者下边添加足够的清除空间（clear不是直接应用在浮动元素上的）

方式一：增加一个没有高度的div，并给其设置`clear:both`

原理：这个div的左边右边不允许存在浮动元素，那么浏览器为了满足其需求，会让其渲染在浮动元素下方。间接就把父元素的高度撑起来了

```html
<style>
    .son1,.son2{
        width: 100px;
        height: 100px;
        border: 1px black solid;
        float: left;
    }
    .son3{
        clear: both;
    }
</style>
<div class="parent">
    <div class="son1"></div>
    <div class="son2"></div>
    <div class="son3"></div> 	<!-- 清除浮动应用在非浮动元素上-->
</div>
```

缺点：增加了一个div标签，增加了页面的渲染负担



方式三：利用伪元素+ 方式一

```html
<style>
.parent::after {
  content: '';
  height: 0;
  display: block;
  clear: both;
}
</style>
```

利用伪元素替代方式一的div标签。伪元素是不会被渲染出来的，很好地提高了性能



**2、BFC清除浮动**

原理：开启BFC的元素内部，浮动元素也参与高度计算

一般使用：给父元素设置`overflow:auto`或者`overflow:hidden`来开启BFC



**3、暴力清除浮动**

给父元素设置固定高度



## 九、css布局

### 9.1 两列布局

**1、左列定宽，右列自适应**

实现方式一：`float:left; margin-left: 浮动元素宽度;`

```html
<style>
    .left {
        height: 100px;
        background-color: antiquewhite;
        width: 200px;
        float: left; 
    }
    .right {
        height: 100px;
        background-color: aqua;
        margin-left: 200px; /* 主要代码*/
    }
</style>
```

利用了左侧元素浮动脱离文档流，右侧的左边距等于浮动元素的宽度



实现方式二：`float:left; 右侧开启BFC`

```html
<style>
    #left {
        float: left;
        height: 500px;
        background-color: blanchedalmond;

    }
    #right {
        overflow: hidden; /*开启BFC*/
        height: 500px;
        background-color: burlywood;
    }
</style>

```

原理：开启BFC区域不会与浮动区域重叠

缺点：浮动脱



实现方式三：使用绝对定位

```html
<style>
    #parent {
        position: relative; /*父相*/
    }
    #left {
        position: absolute; /*子绝*/
        top: 0;
        left: 0;
        height: 300px;
        width: 100px;
        background-color: burlywood;
    }
    #right {
        position: absolute; /*子绝*/
        left: 100px;
        right: 0;
        height: 300px;
        background-color: cadetblue;
    }
</style>
```



实现方式四：使用flex布局

```html
<style>
    #parent {
        display: flex;
    }
    #left {
        height: 300px;
        width: 100px;
        background-color: cadetblue;
    }
    #right {
        flex: 1;
        height: 300px;
        background-color: chocolate;
    }
</style>
```



**2、右列定宽，左列自适应**

与上方反着来



**3、一列不定宽，一列自适应**

效果：一个盒子宽度随着内容的变化而变化，另一个自适应

实现方式一：使用float+overflow实现

```html
  <style>
    #left {
      float: left;
      height: 300px;
      background-color: cadetblue;
    }
    #right {
      overflow: hidden;
      height: 300px;
      background-color: chocolate;
    }
  </style>
```

实现方式二：flex布局

```html
  <style>
    #parent {
      display: flex;
    }
    #left {
      height: 300px;
      background-color: cadetblue;
    }
    #right {
      flex: 1;
      height: 300px;
      background-color: chocolate;
    }
  </style>
```





### 9.2 三列布局

**1、两列定宽，一列自适应**

实现方式一：float + margin

```html
<style>
    #parent {
        min-width: 300px;
    }
    #left {
        float: left;
        width: 100px;
        height: 300px;
        background-color: antiquewhite;
    }  
    #center {
        float: left;
        width: 200px;
        height: 300px;
        background-color: chartreuse  ;
    }
    #right {
        margin-left: 300px;
        height: 300px;
        background-color: brown;
    }
</style>
```



实现方式二：float + BFC

利用bfc区域

```html
<style>
    #left {
        float: left;
        width: 100px;
        height: 300px;
        background-color: antiquewhite;
    }  
    #center {
        float: left;
        width: 200px;
        height: 300px;
        background-color: chartreuse  ;
    }
    #right {
        overflow: hidden;
        height: 300px;
        background-color: brown;
    }
</style>
```



实现方式三：flex布局

```html
<style>
    #parent {
        display: flex;
    }
    #left {
        width: 100px;
        height: 300px;
        background-color: antiquewhite;
    }  
    #center {
        width: 200px;
        height: 300px;
        background-color: chartreuse  ;
    }
    #right {
        flex: 1;
        height: 300px;
        background-color: brown;
    }
</style>
```



**2、两侧定宽，中间自适应**

#### 双飞翼布局

特点：使用margin属性

双飞翼布局是中间栏不变，将内容部分为两边挪出位置

```html
<style>
    #header {
        height: 60px;
        background-color: #ccc;
    }
    /* 左边 */
    #left {
        float: left;
        margin-left: -100%; /*挪到中间部分的左边*/
        width: 100px;
        height: 300px;
        background-color: antiquewhite;
        opacity: 0.5;  /* 方便观察*/
    }

    /* 中间 */
    #center {
        float: left;
        height: 300px;
        background-color: #7fffd4;
        width: 100%;
    }
    #center_inbox {
        height: 300px;
        margin:0 120px 0 100px;  /*避免中间的两端内容被两侧的遮挡住*/
    }

    /* 右边 */
    #right {
        float: left;
        width: 120px;
        height: 300px;
        margin-left: -120px; /* 挪到中间部分的右边，值等于自身宽度*/
        background-color: chocolate;
        opacity: 0.5; /* 方便观察*/
    }
    #footer {
        clear: both; /* 清除浮动 因为左中右元素全部脱离文档流了*/
        height: 60px;
        background-color: #ccc;
    }
</style>

<body>  
    <!-- 头部 -->
    <div id="header"></div>

    <!-- 主要部分 -->
    <div id="parent">
        <div id="center">
            <div id="center_inbox">中间自适应</div>
        </div>
        <div id="left">左列定宽</div>
        <div id="right">右列定宽</div>
    </div>

    <!-- 底部 -->
    <div id="footer"></div>
</body>
```





#### 圣杯布局

特点：使用padding属性

圣杯布局是中间栏为两边挪出位置

```html
<style>
    #header, #footer {
        height: 50px;
        background-color: #ccc;
    }
    #parent {
        height: 300px;
        padding: 0 100px 0 100px; /*左右paading分别等于左右盒子的宽*/
    }
    #left {
        float: left;
        margin-left: -100%; /*使其位于左侧*/
        position: relative;
        left: -100px; /*摆正位置*/
        height: 300px;
        width: 100px;
        background-color: cornsilk;
    }
    #center {
        float: left;
        width: 100%;
        height: 300px;
        background-color: darkkhaki;
    }
    #right {
        float: left;
        margin-left: -100px; /*使其上去一行*/
        position: relative;
        left: 100px; /*摆正位置*/
        width: 100px;
        height: 300px;
        background-color: darkseagreen;
    }
</style>

<body>
    <div id="header"></div>
    <div id="parent">

        <div id="center">中间自适应</div>
        <div id="left">左列定宽</div>
        <div id="right">右列定宽</div>

    </div>
    <div id="footer"></div>
</body>
```



除了圣杯布局，双飞翼布局还有很多其他的布局方式

1、flex布局

```html
<div id="parent">
    <div id="left">左边固定宽度</div>
    <div id="center">中间自适应</div>
    <div id="right">右边固定宽度</div>
</div>

<style>
    #parent {
        display: flex;
        height: 300px;
    }
    #left {
        width: 100px;
        background-color: indianred;
    }
    #center {
        flex: 1;
        background-color: lightblue;
    }
    #right {  
        width: 100px;
        background-color: khaki;
    }
</style>
```



2、position布局

```html
<style>
    #parent {
        position: relative;
    }
    #left {
        position: absolute;
        top: 0;
        left: 0;
        height: 300px;
        width: 100px;
        background-color: lightblue;
    }
    #center {
        margin-left: 100px;
        margin-right: 120px;
        height: 300px;
        background-color: lightcoral;
    }
    #right {
        position: absolute;
        top: 0;
        right: 0;
        width: 120px  ;
        height: 300px;
        background-color: lightgoldenrodyellow;
    }
</style>
```



### 9.3 多列布局

#### 多列等宽布局

1、flex布局

```html
<style>
    #parent {
        display: flex;
        height: 300px;
    }
    #column {
        flex: 1;
        margin: 0 10px;
        border: 1px black solid;
    }
</style>

<body>
    <div id="parent">
        <div id="column">第一列</div>
        <div id="column">第二列</div>
        <div id="column">第三列</div>
        <div id="column">第四列</div>
    </div>
</body>
```



2、使用float浮动

```html
<style>
    #parent {
        height: 300px;
    }
    #column {
        float: left;
        width: 20%;
        margin: 0 10px;
        border: 1px black solid;
    }
</style>
```

缺点：需要清除浮动



#### 九宫格布局

1、使用flex布局

```html
<style>
    #parent {
        display: flex;
        height: 500px;
        flex-direction: column;
    }
    .row {
        display: flex;
        flex: 1;
    }
    .item {
        border: 1px black solid;
        flex: 1;
    }
</style>

<body>
    <div id="parent">
        <div class="row">
            <div class="item">1</div>
            <div class="item">2</div>
            <div class="item">3</div>
        </div>

        <div class="row">
            <div class="item">4</div>
            <div class="item">5</div>
            <div class="item">6</div>
        </div>

        <div class="row">
            <div class="item">7</div>
            <div class="item">8</div>
            <div class="item">9</div>
        </div>
    </div>
</body>
```



### 9.4 全屏布局

#### 绝对定位

```html
<style>
    html,body {
        margin: 0;
        padding: 0;
    }
    #parent {
        height: 100%;
    }
    #top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        border: 1px black solid;
    }
    #left {
        position: absolute;
        left: 0;
        top: 40px;
        bottom: 40px;
        width: 120px;
        border: 1px black solid;
    }
    #right {
        position: absolute;
        /* overflow: auto; */
        right: 0;
        left: 120px;
        top: 40px;
        bottom: 40px;
        border: 1px black solid;
    }
    #bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        border: 1px solid black;
    }
</style>
<body>
    <div id="parent">
        <div id="top">top</div>
        <div id="left">left</div>
        <div id="right">right</div>
        <div id="bottom">bottom</div>
    </div>
</body>
```



#### flex布局

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }
    html,body,#parent {
        height: 100%;
    }
    #parent {
        display: flex;
        flex-direction: column;
    }
    #top {
        height: 40px;
        background-color: rosybrown;
    }
    #middle {
        flex: 1;
        display: flex;
    }
    #left {
        flex: 1;
        background-color: sandybrown;
    }
    #right {
        flex: 1;
        background-color: springgreen;
    }
    #bottom {
        background-color: royalblue;
        height: 30px;
    }
</style>
<body>
    <div id="parent">
        <div id="top">top</div>
        <div id="middle">
            <div id="left">left</div>
            <div id="right">right</div>
        </div>
        <div id="bottom">bottom</div>
    </div>
</body>
```


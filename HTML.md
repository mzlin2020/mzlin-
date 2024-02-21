# HTML

```js
@title 'HTML' 
@description 'HTML新特性与常用的DMO、BOM操作汇总'
@image 'https://mzlin2020-notes.oss-cn-shenzhen.aliyuncs.com/img/html/vscode%E5%9F%BA%E7%A1%80%E6%8F%92%E4%BB%B6%E4%B8%8E%E9%85%8D%E7%BD%AE.jpg'
```

## 1、HTML语义化标签

HTML5语义化标签是指：特定的标签包含特定的内容

html5新增的语义化标签：

```html
<!--均为块级元素-->
<header>头部</header> <!--页眉-->
<nav>导航栏</nav>
<section>文档中的节</section><!--网页文档部分，长表单或者文章-->
<main>主要区域</main><!--页面的主要部分-->
<artical>文章内容</artical><!--定义页面独立的内容-->
<aside>侧边栏</aside>
<footer>底部</footer>  <!--页脚部分-->
<figure>图像</figure><!--文档中的图像-->
```

**为什么要语义化？**

1、页面呈现出清晰的内容结构、代码结构。便于团队开发和维护，语义化更具可读性

2、有利于SEO，和搜索引擎建立良好沟通，有助于爬虫爬取有效信息

（爬虫依赖标签来确定关键字的权重，更多的语义化标签，帮助爬虫抓取更多的有效信息，也增加了页面权重）

## 2、行内元素和块元素

1、块元素：独占一行，并且自动填满父元素

2、行内元素：不会独占一行，width和height会失效，并且在垂直方向的padding、border、margin不占据空间

> 补充：span等行内非替换元素的特点：设置padding/border，左右有效，上下有效但不占据空间；设置margin：左右有效，但是上下失效

| 元素类型 | 列举                                        |
| -------- | ------------------------------------------- |
| 行内元素 | `a、b、span、img、input、select、string`... |
| 块级元素 | `div、ul、li、dl、dt、dd、h1至h5、p`...     |
| 空元素   | `<br>、<hr>、<img>、<link>、<meta>`...      |

**思考1：img是行内元素，为什么可以设置宽高?**

> <img> 是一个**可替换元素**。它的 display 属性的默认值是 inline，但是它的默认分辨率是由被嵌入的图片的原始宽高来确定的，使得它就像 **inline-block** 一样。所以可以设置 border/border-radius、padding/margin、width、height 等等的 CSS 属性

**思考2：什么是可替换元素?**

**可替换元素**（**replaced element**）的展现效果不是由 CSS 来控制的。这些元素是一种外部对象，它们外观的渲染，是独立于 CSS 的。

> 简单理解：可替换元素比较特殊，其宽高由其加载的内容决定，但是CSS可以覆盖其本身的样式。典型的可替换元素：`iframe、video、input`等
>
> 参考链接：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Replaced_element

## 3、iframe标签

定义：iframe元素会创建包含另一个文档的**内联框架**。iframe一般用来包含别的页面，例如可以在自己的网站页面加载别人网站的内容

> tip：可以将提示文字放在`<iframe></iframe>`,在不支持iframe的浏览器会显示出来

**优点：**

+ iframe可以实现无刷新文件上传
+ iframe可以跨域通信
+ 解决了加载缓慢的第三方内容如图标和广告等的加载问题

**缺点：**

1、会阻塞主页面的onload事件（ 文档内容完全加载完成会触发该事件 ）

2、搜索引擎无法解读这种页面，不利于SEO

3、iframe和主页面共享连接池，而浏览器对相同区域有限制所以会影响性能（页面会增加服务器的http请求）

应用：

1、第三方广告

2、基于iframe实现微前端（将web应用由单一的单体应用转变为多个小型前端应用聚合为一的应用）

## 4、文档类型声明

Doctype（document type），文档类型声明位于文档最前面，告诉浏览器以何种方式来渲染页面

主要有两种模式：**标准模式（严格模式）、混杂模式**

**严格模式：**是指浏览器按照W3C标准来解析代码，呈现页面

**混杂模式：**是指浏览器按照自己的方式来解析代码，使用一种比较宽松的向后兼容的方式来显示页面。删除了`<!Doctype>`，意味着把如何渲染html页面的权利交给了浏览器，有多少种浏览器就有多少种展示方式。

> 利用document.compatMode可以查询当前文档的渲染模式：BackCompat混杂模式，CSS1Compat标准模式

## 5、html5新增内容

1、为了更好的实践web语义化，增加了：header，footer，nav，aside，section等语义化标签；

2、为增强表单，为`input`标签增加了color，email，date，range等类型

3、存储方面：提供了sessionStorage，localStorage和离线存储。（这些存储方式方便数据在客户端的存储和获取）

4、多媒体方面：规定了多媒体音频（audio）、视频元素（vedio）

5、其他：Geolocation地理定位、canvas画布、拖放、多线程编程的web worker 和 websocket协议

## 6、canvas和svg的区别

**1、Canvas**

**Canvas 画布** 提供了一个通过`JavaScript`和 `HTML`的`<canvas>`元素来绘制图形的方式。它可以用于动画、游戏画面、数据可视化、图片编辑以及实时视频处理等方面。

特点：1、聚焦于2D图形 2、借助js动态绘制 3、依赖分辨率（位图 ）4、修改需重绘 5、适合绘制图像密集的图形

```html
<canvas id="canvas"></canvas>
```

```js
// 绘制绿底矩形
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "green";
ctx.fillRect(10, 10, 150, 100);
```

**2、Svg**

可缩放矢量图形——svg基于XML标记语言，用于描述二维的矢量图形

特点：1、不依赖分辨率（矢量图） 2、可通过脚本和css修改  3、每个图形以DOM形式插入页面，绘制复杂图形性能差

```html
<!-- 绘制蓝底圆形 -->
<svg id="svgelem" height="200">
    <circle id="greencircle" cx="60" cy="60" r="50" fill="#1E81FF" />
</svg>
```

**区别**

1、canvas绘制的图形一般为位图，缩放会导致失真；svg绘制的图形为矢量图，不存在是真的情况

2、canvas绘制的图形不会出现在DOM结构中，svg绘制的会存在于DOM结构。

3、canvas类似于动画，每次图形的改变都是先清除原来的图形，然后把新的图形画上去，svg则是可以直接通过js来进行某些操作

4、svg不适合游戏应用

## 7、meta标签

> MDN：meta标签用于表示那些不能由其他HTML元相关（meta-related）元素表示的**元数据信息**

| 属性       | 说明               |
| ---------- | ------------------ |
| http-equiv | 设置的项           |
| name       | 设置的项           |
| content    | 表示要设置的项的值 |

**一、http-equiv属性**

该属性一般设置的都是与**http请求头**相关的信息，设置的值会关联到http头部。

浏览器在请求服务器获取html的时候，服务器会将html中设置的meta放在响应头中返回给浏览器。

常见的值：`content-type、expires、refresh、set-cookie、window-target、charset、pragma`

**1、content-type**

例如：`<meta http-equiv="content-type" content="text/html charset=utf8"> `

可以用来声明文档类型、字符集。这样子声明，服务器返回的响应头：`content-type:text/html charset=utf8`

**2、expires**

用于设置资源的过期时间

例如：`<meta http-equiv="expires" content="31 Dec 2021" >`，最终返回给客户端的响应头： `expires: 31 Dec 2008`

**3、refresh**

该种设定表示多少秒后自动刷新页面，并自动跳转到指定的页面。不设置url那么浏览器刷新本页面

`<meta http-equiv="refresh" content="5 url=http://www.baidu.com">`，5秒后跳转至百度

**4、window-target**

强制页面在当前窗口以独立页面显示，可以防止别人在框架中调用自己的页面

`<meta http-equiv="window-target" content="_top">`

**5、pragma**

禁止浏览器从本地计算机的缓存中访问页面的内容

`<meta http-equiv="pragma" content="no-cache">`

**二、name属性**

name属性主要用于**描述网页**，与其对应的content中的内容主要是便于搜索引擎查找信息和分类信息用的，用法与http-equiv相同，name设置属性名，content设置属性值

**1、author**

用来标注网页的作者

`<meta name="author" content="lin"`

**2、description**

用来告诉搜索引擎当前网页的主要内容，是关于网站的一段描述信息

`<meta name="description" content="这是一个什么样的、干什么的网站">`

**3、keywords**

设置网页的关键字，来告诉浏览器关键字是什么。是一个经常被用到的名称。它为文档定义了一组关键字，某些搜索引擎在遇到这些关键字时，会用这些关键字对文档进行分类

`<meta name="keywords" content="clothes shoes">`

**4、robots**

告诉搜索引擎机器人抓取哪些页面：`all/none/index/noindex/follow/nofollow`

`<meta name="robots" content="all">`

> `all`：文件将被检索，且页面上的链接可以被查询
>
> `none`:文件将不被检索，且页面上的链接不可以被查询
>
> `index`:文件将被检索
>
> `follow`：页面上的链接可以被查询
>
> `noindex`：文件将不被检索，但是页面上的链接可以被查询
>
> `nofollow`：文件将不被检索，页面上的连接可以被查询

**5、viewport**

适配移动端，控制视口的大小和比例

`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`

> `width`： 数值、device-width
>
> `height`：数值、device-height
>
> `initial-scale`：初始缩放比例
>
> `maximum-scale`：最大缩放比例
>
> `minnimum-scale`：最小缩放比例
>
> `user-scalable`：是否允许用户缩放（yes/no）

## 8、HTML / XHTML / XML

+ HTML：超本文标记语言，是语法较为松散的，不严格的web语言
+ XML：可扩展的标记语言，主要用于存储数据和结构，可扩展
+ XHTML：可扩展的超文本标记语言，基于XML，作用与HTML类似，但语法更加严格

其中，XHTML是HTML的规范版本

## 9、src与href的区别

src与href都是用来引用外部的资源，区别如下：

+ 1、src用于替换当前元素；

src是source的缩写，指向外部资源的位置，指向的内容将会嵌入到文档中当前标签所在位置；

+ 2、href用于在当前文档和引用资源之间确立链接关系

href是`Hypertext Reference`的缩写，指向网络资源所在位置，建立和当前元素或当前文档之间的链接

## 10、H5新增全局属性data-

该属性用于自定义属性数据，然后在js中DOM操作通过dataset获取到，通常用于HTML与js数据之间的传递

```html
<!-- 实例 -->
<body>
  <div id="box" data-age="18" data-name="minglin"></div>
  <script>
    const box = document.querySelector('.box')
    console.log(box.dataset)
  </script>
</body>
```

```js
//输出
DOMStringMap
age: "18"
name: "minglin"
```

**示例：主题切换**

```html
<html data-theme="light">
  <head>
    <style>
      :root[data-theme="light"] {
        --bg-color: green;
      }
      :root[data-theme="dark"] {
        --bg-color: black;
      }
      #app {
        background-color: var(--bg-color);
      }
    </style>
  </head>
  <body>
    <div id="app">app</div>
    <button id="btn">切换主题颜色</button>
    <script>
      document.getElementById("btn").addEventListener("click", () => {
        let theme = document.documentElement.dataset?.theme;
        theme === "light" ? (theme = "dark") : (theme = "light");
        document.documentElement.setAttribute("data-theme", theme);
      });
    </script>
  </body>
</html>
```

> `window.matchMedia("(prefers-color-scheme: dark)").matches`可获取系统颜色，true为亮色主题，false为暗色主题



## 11、图片预览功能

本地获取上传的图片对象，进行预览

```html
<body>
    <input type="file">
    <img class="preview"></div>
    <script>
        const input = document.getElementsByTagName('input')[0]
        const preview = document.querySelector('.preview')
        input.onchange = e => {
            // 获取file对象
            const file = e.target.files[0]
            // 转为base64
            const reader = new FileReader()
            reader.onload = e => {
                    preview.src = e.target.result
            }
            reader.readAsDataURL(file)
        }
    </script>
</body>
```



## 12、script标签async/defer

在HTML中会遇到以下三类script

1、`<script src='xxx'></script>`

2、`<script src='xxx' async></script>`

3、`<script src='xxx' defer></script>`

**1、script**

浏览器在解析HTML的时候，如果遇到一个没有任何属性的script标签，就会暂停解析

先发送网络请求获取该js脚本的代码，然后让js引擎执行该代码

当该js代码执行完毕后恢复继续解析HTML

![](C:/Users/mzlin/Desktop/mzlin-notes/img/前端总结/defer与async的区别1.jpg)

特点：script阻塞了浏览器对HTML的解析，如果获取js脚本代码内容的网络请求迟迟得不到响应，或者js脚本执行时间过长，都会导致白屏，用户看不到页面内容

**2、async script**

当浏览器遇到带有async属性的script时，请求该脚本的网络请求是异步的，不会阻塞浏览器解析HTML

一旦网络请求回来之后，如果HTML还没有解析完，浏览器会暂停解析，先让JS引擎执行代码，执行完毕之后再解析HTML

、![](C:/Users/mzlin/Desktop/mzlin-notes/img/前端总结/defer与async的区别2.jpg)

特点：async是不可控的，因为执行时间不确定。如果在异步js脚本中获取某个DOM元素，有可能获取不到。如果存在多个async时，他们之间的执行顺序也不确定，完全依赖于网络传输结果，谁先到执行谁

**3、defer script**

当浏览器遇到带有defer的属性的script时，获取该脚本的网络请求也是异步的，不会阻塞浏览器解析HTML

一旦网络请求回来，如果HTML还没解析完，浏览器也不会去解析js。等到HTML完全执行完毕，再去执行JS代码

![](C:/Users/mzlin/Desktop/mzlin-notes/img/前端总结/defer与async的区别3.jpg)

如果存在多个defer的script标签，会按照他们在HTML中出现的顺序执行

**4、总结**

| script标签       | js执行顺序         | 是否阻塞解析HTML       |
| ---------------- | ------------------ | ---------------------- |
| `<script>`       | 在HTML中的顺序     | 阻塞                   |
| `<script async>` | 网络请求返回的顺序 | 可能阻塞，也可能不阻塞 |
| `<script defer>` | 在HTML中的顺序     | 不阻塞                 |


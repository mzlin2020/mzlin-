# web基础(二)

## 一、前端跨域

**概念**

**1、同源策略及其限制内容**

同源策略是一种约定，它是浏览器最核心也是最基本的安全功能，如果少了同源策略，浏览器很容易受到XSS、CSRF等攻击。

同源，指的是“协议 + 域名 + 端口”三者相同（即使两个不同的域名指向同一个IP地址，也不是同源）



**2、同源策略的限制内容**

1、不能访问对方的Cookie、LocalStorage、indexedDB等存储性内容

2、不能读取和修改对方的DOM节点

3、AJAX请求发送后，结果被浏览器拦截了（限制XMLHttpRequest请求）

但是有三个标签允许跨域加载资源

```js
<img scr=""> // 加载图片（比如加载其他网站的图片，不用配置跨域）
<link href="">
<script src="">
```



**3、常见的跨域场景**

当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域。

不同域之间互相请求资源，就算作“跨域”

| URL                                                        | 说明                   | 是否允许通信 |
| ---------------------------------------------------------- | ---------------------- | ------------ |
| `http://www.a.com/a.js`与`http//www.a.com/b.js`            | 同一域名下             | 允许         |
| `http://www.a.com/lab/a.js`与`http://a.com/script/b.js`    | 同一域名下不同文件夹   | 允许         |
| `http://www.a.com:8000/a.js`与`http://www.a.com:7777/b.js` | 同一域名，不同端口     | 不允许       |
| `http://www.a.com/a.js`与`https://www.a.com/b.js`          | 同一域名，不同协议     | 不允许       |
| `http://www.a.com/a.js`与`http://www.70.32.92.74/b.js`     | 域名和域名对应IP       | 不允许       |
| `http://www.a.com/a.js`与`http://scrpt.a.com/b.js`         | 主域相同，子域不同     | 不允许       |
| `http://www.a.com/a.js`与`http://a.com/b.js`               | 同一域名，不同二级域名 | 不允许       |
| `http://www.cnblogs.com/a.js`与`http://www.a.com/b.js`     | 不同域名               | 不允许       |

注：如果是协议和端口造成的跨域问题“前台”是无能为力的



**4、请求跨域了，请求发出去了没有?**

重点：跨域并不是请求发不出去，请求能发出去，服务器能收到请求并正常返回结果，只是结果被浏览器拦截了。

表单可以跨域，而Ajax不能，原因在于跨域是为了阻止用户读取到另外一个域名下的内容，而表单仅是提交内容，不会返回新的内容



**1.2 JSONP**

**1、JSONP原理**

利用`<script>`标签没有跨域限制的漏洞，网页可以得到从其他来源动态产生的JSON数据，JSON请求一定需要对方的服务器做支持才可以

JSON与AJAX相同，都是客户端向服务器端发送请求，从服务器获取数据的方式。但AJAX属于同源策略，JSONP属于非同源策略（跨域请求）



**2、JSONP优缺点**

JSON优点是简单兼容性好，可以用于解决主流浏览器的跨域数据访问的问题。

缺点是仅支持get方法具有局限性，不安全可能会遭受XSS攻击



**3、具体流程**

1、前端定义解析函数

```html
<script>
window.jsonpCallback = function(res) {
    console.log(res)
}
</script>
```

2、通过params形式包装请求参数，并且声明执行函数（cb = jsonpCallback）

```html
<script src="http://localhost:8080/api/jsonp?msg=hello&cb=jsonpCallback"></script>
```

3、后端获取前端声明的执行函数（jsonpCallback），并以带上参数、调用执行函数的方式传递给前端

```js
//后端代码
const Koa = require("koa")
const app = new Koa()

app.use((ctx, next) => {
    cnost { cb, msg } = ctx.query
    ctx.body = `${cb}(${JSON.stringify{ msg }})`
	return 
})
```



## 二、host配置

**基本作用**

host文件是一个没有扩展名的系统文件。

基本作用是将一些常用的网址域名与其对应的IP地址建立一个关联的“数据库”，当用户再浏览器中输入网址时，系统会首先从hosts文件中寻找到对应的IP地址，一旦找到即立刻打开对应网页。如果没有找到，则系统再会将网址提交到DNS域名解析服务器进行IP地址的解析。



**优势**

1、加快域名解析

对于那些经常要访问的网站，通过再host配置域名与IP的映射关系，从而为浏览器省去请求DNS解析域名的步骤，提高访问速度

2、方便记忆

对于难以记忆的IP地址，但是又需要经常使用，可以通过host配置一个容易记忆的域名


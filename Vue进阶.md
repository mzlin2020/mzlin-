# Vue进阶

## 一、router

### 1.1 History的问题

History模式需要服务器的支持

在单页面应用中，服务端不存在http://www.test.com/login这样的地址会返回找不到该页面。

我们前端虽然借助了router实现了路由跳转，一旦进行刷新那么就会去请求服务器，就会返回404

> 在脚手架中不存在这个问题，因为它默认帮我们处理了这个问题。
>
> hash模式不存在这个问题



演示

借助Node服务器，部署我们打包好的项目

```js
const path = require('path')
const express = require('express')
// const history = require('connect-history-api-fallback') // 导入处理history模式的模块

const app = express()

// 注册处理sistory模式的中间件
// app.use(history())

// 处理静态资源
app.use(express.static(path.join(__dirname, './web')))

app.listen(3000, () => {
  console.log('服务器在3000端口启动成功~')
})
```

刷新

`Cannot GET /detail/14`

而当启用了处理这history的中间件后，再刷新就不会报错了

> 刷新时默认会去请求服务器，而服务器如果找不到对应url的资源，返回index.html。这样子问题就又回到前端



### 3.2 hash模式的原理

前端路由是如何做到URL和内容进行映射呢?

+ URL中#后内容作为路径地址
+ 监听hashchange事件
+ 根据当前路由地址找到对应组件重新渲染



URL的hash也就是锚点（#），本质上是改变window.location的href属性；我们可以通过直接赋值location.hash来改变href，但是页面不发生刷新

onHashchange事件可以监听到location.hash的变化，从而进行替换页面内容的DOM操作

```vue
    <div id="app">
        <a href="#/home">home</a>
        <a href="#/about">about</a>

        <div class="content">default</div>

        <script>
            const content = document.querySelector(".content")
            window.addEventListener("hashchange",()=>{
                switch(location.hash ) {
                    case "#/home":
                        content.innerHTML = "Home";
                        break;
                    case "#/about" :
                        content.innerHTML = "About"
                        break;
                    default:
                        content.innerHTML = "Default"
                }
            })
        </script>
```

hash的优势就是兼容性更好，但是缺陷是有一个#，显得不像一个真实的路径。





### 3.3 history模式的原理

**原理**

+ 通过`history.pushState()`方法改变地址栏
+ 监听popState事件（该事件可以监听浏览器历史操作的变化）
+ 根据当前路由地址找到对应组件重新渲染



**分析**

![](E:\学习笔记汇总\img\vue\router分析.png)

1、vue.use()，如果传递一个函数，则调用函数；如果传递对象，则调用对象中的install方法

所以VueRouter中需要有一个install方法

2、VueRouter应该是一个类，或是一个构造函数



**VueRouter类图**

![](E:\学习笔记汇总\img\vue\Vuerouter类图.png)

**install方法**

```js
//VueRouter/index.js
let _Vue = null

export default class VueRouter {
  static install(Vue) {
    // 1.判断当前插件是否已经被安装
    if(VueRouter.install.installed) return
    VueRouter.install.installed = true

    // 2.把Vue构造函数记录到全局变量
    _Vue = Vue

    // 3.把创建Vue实例时候传入的router对象注入到Vue示例上
    _Vue.mixin({
      beforeCreate() {
        // 只需全局组件获得$router即可
        if(this.$options.router) {
          _Vue.prototype.$router = this.$options.router
        }
      }
    })
  }
}
```



**constructor**

需初始化三个对象：options、routeMap、data

options：记录传入的选项

routeMap：保存路径与组件的映射关系

data：是一个响应式对象，其中有一个current属性表示当前的路径地址

```js
export default class VueRouter {
  static install(Vue) { ... }
  constructor(options) {
    this.options = options
    this.routeMaps = {}
    this.data = _Vue.observable({
      current: '/'
    })
}
```



**createRouteMap**

遍历所有的路由规则，把路由规则解析成键值对的形式，存储到routeMap中

```js
  createRouteMap() {
    this.options.routes.forEach(route => {
      this.routeMaps[route.path] = route.component 
    })
  }
```





**initComponents**

该方法用于创建`router-link`和`router-view`两个组件

```js
let _Vue = null

export default class VueRouter {
  static install(Vue) {
    // 1.判断当前插件是否已经被安装
    // 2.把Vue构造函数记录到全局变量
    // 3.把创建Vue实例时候传入的router对象注入到Vue示例上
    _Vue.mixin({
      beforeCreate() {
        // 只需全局组件获得$router即可
        if(this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init() //调用
        }
      }
    })
  }

  constructor(options) {
	//...
  }

  init() {
    this.createRouteMap()
    this.initComponents(_Vue)
  }

  createRouteMap() {
      //....
  }

  initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      template: '<a :href="to"><slot></slot></a>'
    })
  }
}
```





测试

```js
import Vue from "vue";
import VueRouter from "../VueRouter/index";

Vue.use(VueRouter)

const routes = [
    //...
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
```

但是页面报错了



错误原因在于vue-cli创建的项目是运行时版本的vue，不支持template模板

> Vue的构建版本
>
> 1、运行时版：不支持template模板，需要打包的时候提前编译
>
> 2、完整版：包含运行时和编译器，体积比运行时版大10k左右，程序运行的时候把模板转换成render函数

所以我们需要将版本切换为完整版的，只需在webpack中配置`runtimeCompiler: true`



当然，如果要使用运行时版本的Vue也可以的，只需要将template模板的内容写成render函数

```js
  initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      // template: '<a :href="to"><slot></slot></a>'
      render(h) {
        return h('a', {
          attrs: {
            href: this.to
          }
        }, [this.$slots.default])
      }
    })
  }
```





创建`router-view`组件

```js
    Vue.component('router-view', {
      render(h) {
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
```



但是当我们单间切换路由时，页面发生了刷新。且没有切换到对应的数据上.所以我们需要a标签的默认行为，并为其绑定事件

```js
  initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      // template: '<a :href="to"><slot></slot></a>'
      render(h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandler (e) {
          history.pushState({}, "", this.to)
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })

    const self = this
    Vue.component('router-view', {
      render(h) {
        const component = self.routeMaps[self.data.current]
        return h(component)
      }
    })
  }
```



**initEvent**

```js
  initEvent() {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
```





**完整代码**

```js
let _Vue = null

export default class VueRouter {
  static install(Vue) {
    // 1.判断当前插件是否已经被安装
    if(VueRouter.install.installed) return
    VueRouter.install.installed = true

    // 2.把Vue构造函数记录到全局变量
    _Vue = Vue

    // 3.把创建Vue实例时候传入的router对象注入到Vue示例上
    _Vue.mixin({
      beforeCreate() {
        // 只需全局组件获得$router即可
        if(this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  constructor(options) {
    this.options = options
    this.routeMaps = {}
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init() {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap() {
    this.options.routes.forEach(route => {
      this.routeMaps[route.path] = route.component 
    })
  }

  initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      // template: '<a :href="to"><slot></slot></a>'
      render(h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandler (e) {
          history.pushState({}, "", this.to)
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })

    const self = this
    Vue.component('router-view', {
      render(h) {
        const component = self.routeMaps[self.data.current]
        return h(component)
      }
    })
  }

  initEvent() {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
}
```


























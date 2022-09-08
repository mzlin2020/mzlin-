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





## 二、vue响应式原理

vue.js 采⽤数据劫持的⽅式，结合发布者-订阅者模式，通过Object.defineProperty()来劫持各个属性 

的setter，getter以监听属性的变动，在数据变动时发布消息给订阅者，触发相应的监听回调

**概念梳理**

+ 数据响应式

数据模型仅仅是普通的js对象，当我们修改数据时，视图会进行更新，避免了繁琐的DOM操作，提高开发效率

+ 双向绑定

数据改变，视图改变；视图改变，数据也随之改变

+ 数据驱动

Vue最独特的特性之一，开发过程中仅需关注数据本身，不需要关心数据是如何渲染到视图的





### 2.1 模拟响应式核心原理

vue2.x使用的是`Object.defineProperty`

```js
    <div id="root"></div>
    <script>
        // 模拟Vue中的data选项
        const data = {
            name: 'linzm',
            age: 25
        }

        // 模拟Vue实例
        let vm = {}

        // 数据劫持
        proxyData(data)
        function proxyData() {
            // 遍历data对象的所有属性
            Object.keys(data).forEach(key => {
                Object.defineProperty(vm, key, {
                    enumerable: true,
                    configurable: true,
                    get() {
                        console.log('访问数据')
                        return data[key]
                    },
                    set(newValue) {
                        console.log('设置数据')
                        if(data[key] === newValue) return
                        data[key] = newValue
                        document.getElementById('root').textContent = data[key]
                    }
                })
            })
        }
```



而在vue3中使用了proxy进行代理

```js
    <div id="root">ddddd</div>
    <script>
        // 模拟Vue中的data选项
        const data = {
            name: 'linzm',
            age: 25
        }

        // 数据劫持
        let vm = new Proxy(data, {
            get(target, key) {
                console.log('访问数据')
                return target[key]
            },
            set(target, key, newValue) {
                console.log('设置数据')
                if(target[key] === newValue) return 
                target[key] = newValue
                document.getElementById('root').textContent = target[key]
            }
        })
```





### 2.2 发布订阅模式和观察者模式

发布订阅者和观察者是不同的，主要区别是观察者没有信号中心

**1、发布/订阅模式**

+ 订阅者（家长想要知道孩子的考试成绩）
+ 发布者（老师将成绩发布给家长）
+ 信号中心

> 我们假定，存在一个“信号中心",某个任务执行完成，就向信号中心”发布“一个信号，其他任务可以向信号中心”订阅“这个信号，从而知道什么时候自己可以开始执行。这就叫做”发布/订阅模式“



**事件触发器**

```js
        class EventEmitter {
            constructor() {
                // 对象，用于存储事件与处理程序的映射关系
                // {'click': [fn1, fn2], 'change': [fn]}
                this.subs = Object.create(null)
            }

            // 注册事件(订阅消息)
            $on(eventType, handler) {
                this.subs[eventType] = this.subs[eventType] || []
                this.subs[eventType].push(handler)
            }

            // 触发事件（发布消息）
            $emit(eventType) {
                if(this.subs[eventType]) {
                    this.subs[eventType].forEach(handler => {
                        handler()
                    })
                }
            }
        }
        // 测试
        const em = new EventEmitter()
        em.$on('click', () => {
            console.log('事件处理程序')
        })
        em.$emit('click')
```



**2、观察者模式**

观察者（订阅者）——watcher

+ update（）：当事件发生时，具体要做的事情

目标（发布者）——Dep

+ subs数组：存储所有的观察者
+ addSub（）：添加观察者
+ notify（）：当事件发生，调用所有观察者的update方法

没有事件中心

```js
        // 发布者-目标
        class Dep {
            constructor() {
                // 记录所有的订阅者
                this.subs = []
            }
            // 添加订阅者
            addSub(sub) {
                if(sub && sub.update) {
                    this.subs.push(sub)
                }
            }

            // 发布通知
            notify() {
                this.subs.forEach(sub => {
                    sub.update()
                })
            }
        }

        // 订阅者-观察者
        class Watcher {
            update() {
                console.log('update')
            }
        }
        const d = new Dep()
        const w = new Watcher()
        d.addSub(w)
        d.notify()
```





**总结**

![](E:\学习笔记汇总\img\vue\观察者和发布订阅者.png)



### 3.3 实现过程

功能：

+ 负责接收初始化的参数（选项）
+ 负责把data中的属性注入到Vue实例，转换成getter/setter
+ 负责调用observer监听data中所有属性的变化
+ 负责调用compiler解析指令/差值表达式



**Vue的类图**

![](E:\学习笔记汇总\img\vue\vue实例类图.png)

```js
class Vue {
  constructor(options) {
    // 1.通过属性保存选项的数据
    // 2.把data中的成员转换成getter、setter，注入到vue实例中
    // 3.调用observer对象，监听数据的变化
    // 4.调用compiler对象，解析指令和差值表达式
  }

  _proxyData(data) {}
}
```



```js
class Vue {
  constructor(options) {
    // 1.通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2.把data中的成员转换成getter、setter，注入到vue实例中
    this._proxyData(this.$data)
    // 3.调用observer对象，监听数据的变化
    // 4.调用compiler对象，解析指令和差值表达式
  }

  _proxyData(data) {
    // 遍历data中所有的属性
    Object.keys(data).forEach(key => {
      // this 指向vue实例,这里将向实例注入data的属性
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          if(newValue === Object[key]) return
          Object[key] = newValue
        }
      })
    })
  }
}
```

测试

```html
  <div id="app"></div>
  <script src="./js/vue.js"></script>
  <script>
    const vm = new Vue({
      el: '#app',
      data: {
        count: 10,
        msg: 'hello'
      }
    })
    console.log(vm)
  </script>
```

可看到Vue实例创建成功了，但是$data的属性却不是响应式的，我们需要调用observer将其进行转换



**observer**

observer负责把data中的数据转换成响应式

```js
class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    // 1.判断data是否是对象
    if(!data || typeof data !== 'object') return 

    // 2.遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive(obj, key, val) {
	let that = this
    this.walk(val)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return val
      },
      set(newValue) {
        if(newValue === val) return 
        val = newValue
        that.walk(val)
        // 发送通知
      }
    })
  }
}
```

```js
//vue.js
class Vue {
  constructor(options) {
    // 3.调用observer对象，监听数据的变化
    new Observer(this.$data)
  }

}
```



**compiler**

负责编译模板，解析指令/差值表达式、负责页面的初次渲染，当数据变化后要重新渲染视图

<img src="E:\学习笔记汇总\img\vue\compiler类图.png" style="zoom:55%;" />

 

```js
class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm
  }
  // 编译模板，处理文本节点和元素节点
  compile(el) {}

  // 编译元素节点，处理指令
  compileElement(node) {}

  // 编译文本节点，处理差值表达式
  compileText(node) {}

  // 判断元素属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  // 判断节点是否是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }

  // 判断节点是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}
```



**处理文本节点**

```js
class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile(el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if(this.isTextNode(node)) {
        this.compileText(node)
      } else if(this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }
      // 判断node节点，是否有子节点，如果有，要递归调用compile
      if(node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  // 编译元素节点，处理指令
  compileElement(node) {}

  // 编译文本节点，处理差值表达式
  compileText(node) {
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if(reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])
    }
  }

}
```

在vue.js中调用一次

```js
class Vue {
  constructor(options) {
    // 4.调用compiler对象，解析指令和差值表达式
    new Compiler(this)
  }
}
```





**Dep**

![](E:\学习笔记汇总\img\vue\响应式原理图.png)

功能：收集依赖，添加观察者



```js
class Dep {
  constructor() {
    // 存储所有的观察者
    this.subs = []
  }

  // 添加观察者
  addSub (sub) {
    if(sub && sub.update) {
      this.subs.push(sub)
    }
  }

  // 发送通知
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
```





**watcher对象**

![](E:\学习笔记汇总\img\vue\watch对象.png)

功能：当数据变化触发依赖，dep通知所有的watcher实例更新视图、自身实例化的时候往dep对象中添加自己



```js
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    // data中属性名称
    this.key = key
    // 回调函数负责更新视图
    this.cb = cb
    // 把wathcer对象记录到dep类的静态属性target
    Dep.target = this
    // 触发get方法，在get方法中调用addSub
    this.oldValue = vm[key]
    Dep.target = null
  }

  // 当数据发生变化的时候更新视图
  update() {
    let newValue = this.vm[this.key]
    if(this.oldValue === newValue) return 
    this.cb(newValue)
  }
}
```

```js
//compiler.js

  // 编译文本节点，处理差值表达式
  compileText(node) {

    // ....

    // 创建watcher对象，当数据改变更新视图
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
```



**总结**

![](E:\学习笔记汇总\img\vue\响应式原理整体流程图.png)

1、创建实例，将传递进来的options记录下来，调用`_proxyData`方法将options的data注入到Vue实例中

2、调用Observer方法，将data中的数据转换成getter和setter

3、当数据发生变化，调用setter去通知Dep，并调用Dep的notify方法

4、notify方法发送通知watcher（当我们创建watcher时，会将watcher添加到Dep的subs中，收集依赖）

5、watcher的update方法便会去更新视图（注：页面首次加载时调用的是compiler更新视图）














# 	react进阶


## 1、event对象

```jsx
<button onClick={(e) => {console.log(e)}}>getEvent</button>
```

在react中的event对象是一个合成的event对象`SyntheticBaseEvent`

```js
// 原生的event包含中这个合成event中
event.nativeEvent
```

如果有多个参数，则追加最后一个参数为event

```js
<button onClick={(e) => sum(5,10, e)}>getEvent</button>
```



值得注意的是

```js
function App() {
  const getEvent = (e: any) => {
    console.log(e.nativeEvent.currentTarget) //<div id="root"><div>
    console.log(e.nativeEvent.target) //<button>get<button>
  }
  return (
    <div>
      <button onClick={getEvent}>get</button>
    </div>
  );
}
```



## 2、setState

### 2.1 基本认识

1、在react中，**不能直接修改state的值来让界面发生更新**

```jsx
{/*计数器案例*/}
  increment() {
    this.state.counter += 1
    console.log(this.state.counter);
  }
```

直接修改state中的值，实际修改成功了。但是react不能更新到界面上。

这种修改方式react并不知道数据发生了变化



2、setState方法是从Component中继承过来的



3、setState是异步更新的（也有可能是同步）

```jsx
{/*改变文本案例*/}
  changeMsg() {
    this.setState({
      message: "你好，世界"
    })
    console.log(this.state.message);
  }
```

如果是同步状态的，那么控制台应该打印`你好，世界`，而实际上它仍然打印`hello world`。说明setState是异步的

**为什么setState要设计成异步的**

+ 可以提升性能。如果每次调用setState都进行一次更新，那么意味着render函数会被频繁调用，页面重新渲染，效率低。最好的办法是获取到多个更新，之后进行批量更新
+ 保持state和props一致，避免产生其他bug。同步更新了state，但是还未执行render函数时，state与props中的数据是不一致的



4、立即获取到setState更新后的数据

setState的第二个参数是一个回调函数，会等到数据发生更新后调用

类似于vue中的nexttick方法，即上方的案例中，message改变了，想要获取到更新后的值而非更新前的值

```jsx
{/*setState的第二个参数（回调函数）*/}
  changeMsg() {
    this.setState({
      message: "你好，世界"
    }, () => {
      console.log(this.state.message);
    })
  }
```

输出：`你好，世界`

另一个方式是通过生命周期函数：`componentDidUpdate()`



5、在某些特殊情况下，setState是同步的

情况一：定时器

```jsx
{/*使用定时器*/}
  changeMsg() {
    setTimeout(() => {
      this.setState({
        message: "你好世界"
      })
      console.log(this.state.message);
    }, 0);
  }
```

直接同步输出：`你好世界`



情况二：原生DOM事件

```js
  componentDidMount() {
    const btn = document.getElementsByClassName('btn')[0]
    btn.addEventListener("click", () => {
      this.setState({counter: this.state.counter + 999})
      console.log(this.state.counter)
    })
  }
```





6、this.setState中更新了state，但是并不会覆盖掉整个state

```jsx
this.state = {
    message1: "hello world",
    message2: "hi react"
};
```

假设`setState`更新了message1，那么它最终仅仅只更新了message1，而不会返回一个新的对象覆盖掉原来的state

源码：`return Object.assign({}, preState, newState)`



7、在this.setState中多次调用相同的操作**可能**会被合并

```jsx
{/*调用了三次*/}
  increment() {
    this.setState({
      counter: this.state.counter + 1
    })
    this.setState({
      counter: this.state.counter + 1
    })
    this.setState({
      counter: this.state.counter + 1
    })
  }
```

最终结果并不会+3，而是简单地加1



但是如果setState传递的第一个参数是函数，则不会被合并

```js
  btnChange() {
    this.setState((prev, props) => {
      return { counter: prev.counter + 100 }
    })
    this.setState((prev, props) => {
      return { counter: prev.counter + 100 }
    })
  }
//结果： +200
```





### 2.2 不可变数据

**结论**：要保证state中复杂数据的不可变性，特别是处理深层嵌套数据时

在开发中，为了提升性能，经常会使用`shouldComponentUpdate`，或者`PureComponent`。这种情况下通过`setState`直接改变`state`中的复杂数据将会直接导致失效。

```jsx
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [
        { name: 'lihua', age: 22 },
        { name: 'tom', age: 23 },
        { name: 'lucy', age: 20 }
      ]
    };
  }
  render() {
    return (
      <div>
        <h2>我的朋友</h2>
        <ul>
          {
            this.state.friends.map(item => {
              return <li key={item.name}>{ item.name }</li>
            })
          }
        </ul>
        <button onClick={ e => { this.addFriend() }}>增加</button>
      </div>
    );
  }
  addFriend() {
    const newFriend = { name: 'xiaoming', age: 23 }
    this.state.friends.push(newFriend)
    this.setState({
      friends: this.state.friends
    })
  }
}
```

上边的代码中往friends数组中新增一个对象。这样子的代码是能够正常运行的。但是一旦加了render的渲染优化，这个代码就失效了

```jsx
shouldComponentUpdate(newProps, newState) {
    if(newState.friends !== this.state.friends) return true
    return false
}
```

原因是：上边的判断是相等的。

为什么呢？明明已经新增一个对象到friends中了，竟然`newState.friends === this.state.friends`

**重点理解**：从内存的角度理解，friends保存的是数组的引用地址，即使之后friends新增了内容，this.state.firends保存的依然是数组的引用地址不变。

正确的处理方式：不要直接通过setState去修改this.state中的值

```jsx
{/*推荐做法*/}
const newFriends = [...this.state.friends]
newFriends.push({name: 'xiaoming', age: 23})
this.setState({
    friends: newFriends
})
```





## 3、非受控组件

+ ref
+ defaultValue / defaultChecked
+ 手动操作DOM元素



```jsx
export default class Home extends PureComponent {
    constructor() {
        super()
        this.state = {
            name: 'linming'
        }
        this.nameRef = createRef()
    }
  render() {
    return (
        <>
            <div>Home</div>
            <input type="text" defaultValue={this.state.name} ref={this.nameRef}/>
            <button onClick={() => this.alertName()}>change</button>
        </>
    )
  }
  alertName() {
    const el = this.nameRef.current
    console.log(el.value) 
  }
}
```

当我们更改input的值时，打印的`el.value`值会跟着改变，但是`this.state.name`不会跟着改变，这是与受控组件的区别

怎么理解非受控组件：`this.state.name`仅仅是初始值，之后`this.state.name`的变化与input不再有关联。

应用场景：必须手动操作DOM元素的时候，setState实现不了。例如获取文件上传的名字`<input type=file>`



## 4、异步组件

+ 传统模式：渲染组件-> 请求数据 -> 再渲染组件
+ 异步模式：请求数据-> 渲染组件

React 16.6 新增了 ，`Susponse` 让组件“等待”某个异步操作，直到该异步操作结束即可渲染。 



示例

```jsx
import React from 'react'
const Home = React.lazy(() => import('./pages/Home'))
function App() {
  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Home/>
      </React.Suspense>
    </div>
  );
}
export default App;
```

 当数据还没有加载完成时候，会展示`Suspense`中 `fallback`的内容，弥补请求数据中过渡效果 



## 5、Portals

portals（传送门）提供了一种非常棒的办法允许你将子节点渲染到父组件以外的DOM节点

语法：

```js
ReactDom.createPortal(child,container)
//参数1：可渲染的react子元素，参数2：DOM元素
```



示例

```jsx
{/* 父组件 */}
function App() {
  return (
    <div className="App">
      <Home>Modal内容</Home>
    </div>
  );
}

//子组件
  render() {
    return (
        <div className='modal'>{this.props.children}</div>
    )
  }
```

当子组件Modal设置了`position:absolute`时，相对于离它最近的有定位的父元素进行定位。当某一天父组件设置了`position:relative`时，可能会影响子组件Modal的样式（例如高度变化）

这时候我们需要将子组件'传送'出来，不再受其父组件样式的影响



```js
    return (
      ReactDOM.createPortal(
        <div className='modal' >{this.props.children}</div>,
        document.body
      )
    )
```



## 6、性能优化

### SCU

SCU即`shouldComponentUpdate`

+ SCU默认返回true，即react默认重新渲染所有子组件
+ 必须配合"不可变值"一起使用
+ 有性能问题时再考虑使用



```js
//基本用法
shouldComponentUpdate(nextProps, nextState) {
    if(nextState.count !== this.state.count) {
        return true
    }
    return false
}
```

在react中，只要父组件发生了更新，那么子组件必然也会发生更新（它的SCU默认为true）



该方法通过对比新旧的state和props的变化来决定是否更新，所以绝对不能setState时，改变初始值，这回让SCU永远返回false

```js
//禁止这么做
this.state.counter = newCounter
this.setState(this.state.counter)
```



示例

```jsx
{/* 父组件 */}
function App() {

  const handleChangeCouner = () => {
    setCounter((prev) => prev += 100)
  }
  const handleChangeOtherSomething = () => {
    setName('222222222222')
  }
  const [counter, setCounter] = useState(0)
  const [name, setName] = useState('1111')
  return (
    <div>
      <div>
        <button onClick={handleChangeCouner}>changeConter</button>
        <button onClick={handleChangeOtherSomething}>changeConterOtherSomething</button>
      </div>
        <Home counter={counter}></Home>
        <div>{name}</div>
    </div>
  );
}


{/* 子组件 */}
export default class Home extends React.Component {
    constructor(props) {
        super(props)
    }
    shouldComponentUpdate(nextProps, nextState) {
      if(nextProps.counter !== this.props.counter) {
        return true
      }
      return false
    }
    componentDidUpdate() {
      console.log('hasChange')
    }
  render() {
    return (
        <div>{this.props.counter}</div>
    )
  }
}
```

当点击`handleChangeCouner`时，打印`hasChange`，点击`handleChangeOtherSomething`则不会



### memo / PureComponent

如果我们子组件以来了太多的state和props，那么一个个的在`shouldComponentUpadate`中进行深度比较，很麻烦

memo / PureComponent，所实现的功能还是SCU，但是是浅层比较

这样以来我们就无需自己编写相应的SCU



> 注意：有性能问题时再使用这两个优化，进行比较也是会消耗一定性能的





## 7、单向数据流

1、在react中，数据流动的原则：应是单项数据流动，自顶向下，从父组件到子组件

2、单项数据流特性要求我们共享数据要放置在上层组件中

3、子组件通过调用父组件传递过来的方法更改数据

4、当数据发生更改时，react会重新渲染组件树

5、单向数据流使得组件之间的数据流动变得可预测，定位程序错误变得简单





## 8、类组件的生命周转期

![](.\img\react进阶\生命周期.jpg)

 React 生命周期指的是组件从创建到卸载的整个过程，每个过程都有对应的钩子函数会被调用，它主要有以下几个阶段

+ 挂载阶段：组件实例被创建和插入DOM树的过程
+ 更新阶段：组件被重新渲染的过程
+ 卸载阶段：组件从DOM树中被删除的过程



### 挂载阶段

1、static defaultProps

设置props的默认值

```jsx
static defaultProps = {
    name: '设置默认props'
}
```

2、static propTypes

props数据类型检查

```js
import PropTypes from 'prop-types';

static propsTypes = {
    name: PropTypes.string
}
```

3、**constructor(props)**

构造函数的作用：初始化`props | state`、绑定事件处理函数

```js
constructor(props) {
  super(props);
  this.state = {number: 0};
  this.handlexxx = this.handlexxx.bind(this)
}
```

4、**static   getDerivedStateFromProps(nextProps, prevState)**

react17新增, 这个生命周期函数是为了替代componentWillReceiveProps存在的 

 这个[生命周期](https://so.csdn.net/so/search?q=生命周期&spm=1001.2101.3001.7020)的功能实际上就是将传入的props映射到state上面 

```js
static getDerivedStateFromProps(nextProps, prevState) {
    const {type} = nextProps;
    // 当传入的type发生变化的时候，更新state
    if (type !== prevState.type) {
        return {
            type,
        };
    }
    // 否则，对于state不进行任何操作
    return null;
}
```



5、componentWillMount() 

 组件挂载前调用，不推荐使用

>注意：
>
>由于 React 未来的版本中推出了异步渲染，DOM 被挂载之前的阶段都可以被打断重来，导致 `componentWillMount` 、 `componentWillUpdate` 、 `componentWillReceiveProps` 在一次更新中可能会被触发多次，因此那些只希望触发一次的副作用应该放在 `componentDidMount` 中。



5、**componentDidMount()**

组件挂载成功的钩子，表示该过程组件已成功挂载到真实DOM上，在渲染的过程中只执行一次

用法：监听事件、获取真实DOM、网络请求



### 更新阶段

1、componentWillReceiveProps(newProps) 

 父组件更新 props 钩子 （不推荐使用）



2、**shouldComponentUpdate(nextProps, nextState)** 

组件是否进行更新，必须有返回值，默认返回true



3、componentWillUpdate()

组件更新前（不推荐使用）

4、getSnapshotBeforeUpdate(prevProps)





5、**componentDidUpdate()** 

组件更新后调用

用法：

+  以对组件中的 DOM 进行操作
+  在比较了 `this.props` 和 `nextProps` 的前提下可以发送网络请求 ()

```js
componentDidUpdate(prevProps, prevState, snapshot) {
	if (this.props.userID !== prevProps.userID) {
   		this.fetchData(this.props.userID);
  }
}

```

### 卸载阶段

1、**componentWillUnmount()** 

 这是 `unmount` 阶段唯一的生命周期，在这里进行的是善后工作：清理计时器、取消网络请求或者取消事件监听等。 



## 9、JSX原理

实际上，`JSX`仅仅只是`React.createElement(component, props, ...children)`函数的语法糖。

最终的`JSX`都会通过babel转换成`React.createElement`的函数调用

> 思考：`import React from 'react'`有时没有使用过，但是却是必须的？因为babel转化过程中，需要使用调用`React.createElement()`方法



```jsx
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
<script type="text/babel">
    const message1 = <h2>hello react</h2>
    const message2 = React.createElement("h2", null, "hello react")

    ReactDOM.render(message2, document.getElementById("app"))
</script>
```

在上方的代码中，message1与message2可以说是相等的

前面提到，引入babel是用来解析jsx的，但是上方的代码并没有用到jsx，所以可以改成这样子

```jsx
<script>
    const message2 = React.createElement("h2", null, "hello react")
    ReactDOM.render(message2, document.getElementById("app"))
</script>
```

依然是能够正常运行的



**createElement的三个参数**

参数一：type

当前的ReactElement的类型。如果是标签元素，那么就使用字符串表示；如果是组件元素，那么就直接使用组件的名称

参数二：config

所有的jsx中的属性都在config中以对象的属性和值的形式存储

参数三：children

存放标签中的内容（可能是文本或者新的标签），以children数组的方式进行存储

**babel转化**

将我们编写的JSX代码通过Babel可以转换成`React.createElement`函数

```jsx
//JSX代码
<div>
    <h2 className="title">title</h2>
    <div>content</div>
    <div>footer</div>
</div>
```

转化

```js
/*#__PURE__*/
React.createElement(
  "div",
  null,
  /*#__PURE__*/ React.createElement(
    "h2",
    {
      className: "title"
    },
    "title"
  ),
  /*#__PURE__*/ React.createElement("div", null, "content"),
  /*#__PURE__*/ React.createElement("div", null, "footer")
);    
```



## 10、虚拟DOM

通过的`React.createElement`最终创建出来的就是一个`ReactElement`对象，而它就是所谓的虚拟DOM

验证    

```jsx
      render() {
        const CreateElement = (
            <div className="container">
              <h3>Hello React</h3>
              <p>React is great </p>
            </div>
        )
        console.log(CreateElement);
        return CreateElement
        }
```

结果为

```jsx
//虚拟DOM对象
{
  type: "div",
  props: { className: "container" },
  children: [
    {
      type: "h3",
      props: null,
      children: [
        {
          type: "text",
          props: {
            textContent: "Hello React"
          }
        }
      ]
    },
    {
      type: "p",
      props: null,
      children: [
        {
          type: "text",
          props: {
            textContent: "React is great"
          }
        }
      ]
    }
  ]
}
```



## 11、实现react

基于react的核心原理实现一个自己的react

### 环境准备

搭建babel和webpack环境

```js
//依赖
    "@babel/core": "^7.11.4",
    "@babel/preset-env": "^7.11.0",
    "@babel/preset-react": "^7.10.4",
    "babel-loader": "^8.1.0",
    "clean-webpack-plugin": "^3.0.0",
    "html-webpack-plugin": "^4.3.0",
    "webpack": "^4.44.1",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.0"
```

配置

```js
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "bundle.js"
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  },
  plugins: [
    // 在构建之前将dist文件夹清理掉
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["./dist"]
    }),
    // 指定HTML模板, 插件会将构建好的js文件自动插入到HTML文件中
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  devServer: {
    // 指定开发环境应用运行的根据目录
    contentBase: "./dist",
    // 指定控制台输出的信息
    stats: "errors-only",
    // 不启动压缩
    compress: false,
    host: "localhost",
    port: 5000
  }
}
```

问题：babel转化jsx时，会默认调用`React.createElement `,需要将其换为`myReact.createElement`

可以在每个jsx文件开头添加一行注释`/** @jsx myReact.createElement*/`，或者进行babel配置

babel配置

```js
//.babelrc
{
    "presets": [
      "@babel/preset-env",
      [
        "@babel/preset-react",
        {
          "pragma": "myReact.createElement"
        }
      ]
    ]
  }
```



单独创建一个myReact文件夹，并引用至index中，之后所有实现的方法都写入该文件夹中



### 实现createElement

createElement方法目标：将jsx代码转化为虚拟DOM对象

```js
//myReact/createElement.js
function createElement (type, props, ...children) {
    return {
        type,
        props,
        children
    }
}
export default createElement


//myReact/index.js
import createElement from './createElement'

export default {
    createElement
}
```

在入口文件中使用，babel会自动调用`myReact.createElement`进行转化

```jsx
import myReact from './myReact'

const virtualDOM = (
    <div className="container">
      <h1>你好 myReact</h1>
      <h2 data-test="test">(编码必杀技)</h2>
    </div>
  )

  console.log(virtualDOM)
```

浏览器输出虚拟DOM

```js
{
    type: 'div',
    props: { className: 'container' },
    children: [
        {
            type: 'h1',
            props: null,
            children: ['你好 myReact']
        },
        {
            type: 'h2',
            props: [data-test: 'test'],
            children: ['(编码必杀技)']
        }
    ]
}
```



问题1：文本节点转化错误`children: ['(编码必杀技)']`

正确做法：`children: [ type: 'text', props: { textContent: '(编码必杀技)' }  ]`

思路：当children不是一个对象时，那么它就是一个文本节点，进行特殊处理

```js
function createElement (type, props, ...children) {
    const textElement = [...children].map(child => {
        if(child instanceof Object) {
            return child
        } else {
            return createElement("text", {textContent: child})
        }
    })
    return {
        type,
        props,
        children: textElement
    }
}

export default createElement
```



问题2：null / true / false 在react中是不用显示的，也就不用生成虚拟DOM

例如：`<div className='container'>{2 == 1 && <div>如果2和1相等渲染当前内容</div>}</div>`

```js
//结果为
{
    type: 'div',
    props: {className: 'container'},
    children: [
        {
            type: 'text',
            props: {textContent: false},
            children: []
        }
    ]
}
```

解决方案：移除值为布尔值或者null的child

```js
function createElement (type, props, ...children) {
    const textElement = [...children].reduce((result,child) => {
        if(child !== null && child !== false && child !== true) {
            if(child instanceof Object) {
                result.push(child)
            } else {
                result.push(createElement("text", {textContent: child}))
            }
        }
        return result
    }, [])
    return {
        type,
        props,
        children: textElement
    }
}

export default createElement
```



问题3：在react中，我们可以通过props拿到children

解决方法：复制一份children到props中

```js
function createElement (type, props, ...children) {
    const textElement = [...children].reduce((result,child) => {
        if(child !== null && child !== false && child !== true) {
            if(child instanceof Object) {
                result.push(child)
            } else {
                result.push(createElement("text", {textContent: child}))
            }
        }
        return result
    }, [])
    return {
        type,
        props: Object.assign({children: textElement}, props),
        children: textElement
    }
}

export default createElement
```



### 实现render

目标：将虚拟DOM转化为真实DOM，并渲染到页面中

创建render文件,并导入到index中使用

```jsx
import myReact from './myReact'

const root = document.getElementById('root')

const virtualDOM = (
    <div className="container">
      <h1>你好 myReact</h1>
      <h2 data-test="test">(编码必杀技)</h2>
      {2 == 1 && <div>如果2和1相等渲染当前内容</div>}
    </div>
  )

myReact.render(virtualDOM, root)
```

在render函数中实现diff算法

```js
export default function diff(virtualDOM, container, oldDOM) {
    // 当oldDOM不存在时
    if(!oldDOM) {
        mountElement(virtualDOM, container) //挂载
    }

    // 当oldDOM存在时
    
}
```

当oldDOM不存在时，将virtualDOM转化为真实DOM，此时virtualDOM分为两种情况，一种是普通的元素，另一种它可以是一个组件

```js
//mountElement
export default function mountElement(virtualDOM, container) {
    //处理普通元素
    mountNativeElement(virtualDOM, container)
}
```

```js
//mountNativeElement
export default mountNativeElement(virtualDOM, container){
    
}
```



**挂载普通元素**

```js
export default function mountNativeElement(virtualDOM, container) {
    let newElement = null
    if(virtualDOM.type === 'text') {
        // 处理文本
        newElement = document.createTextNode(virtualDOM.props.textContent)
    } else {
        // 处理元素节点
        newElement = document.createElement(virtualDOM.type)
    }

    // 递归创建子节点
    virtualDOM.children.forEach(child => {
        mountNativeElement(child, newElement) //最好使用mountElement来递归
    })

    // 将转化好的真实DOM挂载到根元素上
    container.appendChild(newElement)
}
```

当代码跑通后，便可在浏览器中看到对应的内容



因为后续有一些代码需要复用，可以将这一部分的代码进行简单抽离

```js
//mountNativeElement
import createDOMElement from './createDOMElement'
export default function mountNativeElement(virtualDOM, container) {
    let newElement = createDOMElement(virtualDOM)

    // 将转化好的真实DOM挂载到根元素上
    container.appendChild(newElement)
}

//createDOMElement
import mountElement from './mountElement'

export default function createDOMElement(virtualDOM) {
    let newElement = null
    if(virtualDOM.type === 'text') {
        // 处理文本
        newElement = document.createTextNode(virtualDOM.props.textContent)
    } else {
        // 处理元素节点
        newElement = document.createElement(virtualDOM.type)
    }

    // 递归创建子节点
    virtualDOM.children.forEach(child => {
        mountElement(child, newElement)
    })

    return newElement
}
```



**为DOM对象添加属性**

```js
//updateNodeElement
// 为DOM元素添加属性
export default function updateNodeElement(newElement, virtualDOM) {
    // 获取节点对应的属性
    const newProps = virtualDOM.props
    Object.keys(newProps).forEach(propsName => {
        const propsValue = newProps[propsName]
        // 处理事件
        if(propsName.slice(0,2) === 'on') {
            // 事件名称 
            const eventName = propsName.toLowerCase().slice(2)
            // 添加事件
            newElement.addEventListener(eventName, propsValue)
        }
        else if(propsName === 'value' || propsName ==='checked') {
            newElement[propsName] = propsValue
        }
        else if(propsName !== 'children') { //children将不进行处理,抛弃
            if(propsName === 'className') {
                newElement.setAttribute('class', propsValue)
            }
            else {
                newElement.setAttribute(propsName, propsValue)
            }
        }
    })
}
```

引用

```js
//createDOMElement
export default function createDOMElement(virtualDOM) {
    let newElement = null
    if(virtualDOM.type === 'text') {
        // 处理文本
        newElement = document.createTextNode(virtualDOM.props.textContent)
    } else {
        // 处理元素节点
        newElement = document.createElement(virtualDOM.type)
        updateNodeElement(newElement, virtualDOM) //设置属性
    }

    // 递归创建子节点
    virtualDOM.children.forEach(child => {
        mountElement(child, newElement)
    })

    return newElement
}
```



### 挂载组件

需要明确一点，如果要挂载的目标对象是一个组件，那么它的生成的虚拟DOM的type是一个函数

```jsx
//组件
const Heart = () => <span>&hearts;</span>

//虚拟DOM
{
    type: f function() {}.
    props: {},
        children: []
}
```

修改代码为

```js
//index
import myReact from './myReact'
const root = document.getElementById('root')

const APP = () => {
  return  <div>APP</div>
}

myReact.render(<APP/>, root)

//mountElement
import mountNativeElement from './mountNativeElement'
import isFunction from './isFunction'

export default function mountElement(virtualDOM, container) {
    if(isFunction(virtualDOM)) {
        console.log("处理函数")
        mountConponent(virtualDOM, container)
    } else {
        // 处理普通元素
        mountNativeElement(virtualDOM, container)
    }
}
```

mountConponent挂载组件

```js
//mountConponent
import isFunctionComponent from './isFunctionComponent'
export default function mountComponent(virtualDOM, container) {
  if(isFunctionComponent(virtualDOM)) {
    // 函数组件
    console.log('函数组件')
  }
  else {
    // class组件
    console.log('class组件')
  }
}
```

通过判断virtualDOM.type原型上是否存在render，存在即是类组件

那么如何处理函数组件，使其返回一个虚拟DOM对象呢？很简单，只需要调用type中的函数即可

```js
// 
import isFunctionComponent from './isFunctionComponent'
import mountNativeElement from './mountNativeElement'
export default function mountComponent(virtualDOM, container) {
  let nextVirtualDOM = null
  if(isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM)
    mountNativeElement(nextVirtualDOM, container)
  }
  

  // 获取函数的虚拟DOM
  function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM)
  }
}
```

问题：如果函数组件之中嵌套了函数组件，上边的代码将无法执行

```js
//多加一层判断
export default function mountComponent(virtualDOM, container) {
  let nextVirtualDOM = null
  if(isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM)
    if(isFunction(nextVirtualDOM)) {
      mountComponent(nextVirtualDOM, container)
    } else {
      mountNativeElement(nextVirtualDOM, container)
    }
  }
  // 获取函数的虚拟DOM
  function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM)
  }
}
```

**为函数组件添加属性**

这一部分比较简单，将在调用type中函数生成虚拟DOM时，将props传递及进去

```js
  // 获取函数的虚拟DOM
  function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM.props || {})
  }
```



**挂载类组件**

```js
//index
class APP extends myReact.Component {
  render() {
    return <div>hello React</div>
  }
}
myReact.render(<APP title="hello world"/>, root)
```

因为类组件继承自Component，所以我们也需要创建该文件



处理类组件

```js
//mountComponent
export default function mountComponent(virtualDOM, container) {
  let nextVirtualDOM = null
  if(isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM)
  } else {
    // 类组件
    nextVirtualDOM = buildClassComponent(virtualDOM)
  }

  if(isFunction(nextVirtualDOM)) {
    mountComponent(nextVirtualDOM, container)
  } else {
    mountNativeElement(nextVirtualDOM, container)
  }
  // 获取函数的虚拟DOM
  function buildFunctionComponent(virtualDOM) {
    return virtualDOM.type(virtualDOM.props || {})
  }

  // 获取类组件的虚拟DOM
  function buildClassComponent(virtualDOM) {
    const component = new virtualDOM.type(virtualDOM.props || {})
    const nextVirtualDOM = component.render()
    return nextVirtualDOM
  }
}
```

传递属性

```jsx
//index
class APP extends myReact.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div>hello React, {this.props.title}</div>
  }
}

myReact.render(<APP title="hello world"/>, root)

//Component
export default class Component {
  constructor(props) {
    this.props = props
  }
}
```



### 更新DOM

示例代码

```jsx
//index
const virtualDOM = (
  <div className="container">
  <h1>你好 myReact</h1>
  <h2 data-test="test">编码必杀技</h2>
  <button onClick={() => alert("你好")}>点击我</button>
  </div>
)

const modifyDOM = (
  <div className="container">
  <h1>你好 newWorld</h1>
  <h2 data-test="test">newnewnwe</h2>
  <button onClick={() => alert("你好!!!!!!!!")}>点击我</button>
  </div>
)

myReact.render(virtualDOM, root)

setTimeout(() => {
  myReact.render(modifyDOM, root)
}, 2000)
```



思考：要更新DOM，需要对比新旧DOM，那么同一时刻如何获取这两者呢?

当前页面展示的真实DOM，就是由虚拟DOM转化来的，那么可以将虚拟DOM添加到真实DOM的属性之中，当进行对比时，要获取旧的DOM，可以从当前页面的真实DOM属性之中获取

```js
//createDOMElement

export default function createDOMElement(virtualDOM) {
	//....

    // 保存旧的虚拟DOM
    newElement._virtualDOM = virtualDOM

    // 递归创建子节点
    //...

    return newElement
}
```

获取旧DOM

```js
// render
export default function render(virtualDOM, container, oldDOM = container.firstChild) {
    diff(virtualDOM, container, oldDOM)
}
```



**对比：DOM**

情况一：type类型相同,更新内容

```jsx
//diff
export default function diff(virtualDOM, container, oldDOM) {
    const oldVirtualDOM = oldDOM && oldDOM._virtualDOM

    // 当oldDOM不存在时
    if(!oldDOM) {
        mountElement(virtualDOM, container)
    }
    // 当oldDOM存在时
    else if(oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
        if(virtualDOM.type === 'text') {
            // 更新内容
            updateTextNode(virtualDOM, oldVirtualDOM, oldDOM)
        } else {
            // 更新属性
            updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
        }
        // 递归对比子元素
        virtualDOM.children.forEach((child, i) => {
            diff(child, oldDOM, oldDOM.childNodes[i])
        })
    }
}
```

```js
export default function updateTextNode(virtualDOM, oldVirtualDOM, oldDOM) {
  if(virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
    oldDOM.textContent = virtualDOM.props.textContent
    oldDOM._virtualDOM = virtualDOM
  }
}
```

情况一：type类型相同,更新属性

```js
export default function updateNodeElement(
    newElement,
    virtualDOM,
    oldVirtualDOM = {}
  ) {
    // 获取节点对应的属性对象
    const newProps = virtualDOM.props || {}
    const oldProps = oldVirtualDOM.props || {}
    Object.keys(newProps).forEach(propName => {
      // 获取属性值
      const newPropsValue = newProps[propName]
      const oldPropsValue = oldProps[propName]
      if (newPropsValue !== oldPropsValue) {
        // 判断属性是否是否事件属性 onClick -> click
        if (propName.slice(0, 2) === "on") {
          // 事件名称
          const eventName = propName.toLowerCase().slice(2)
          // 为元素添加事件
          newElement.addEventListener(eventName, newPropsValue)
          // 删除原有的事件的事件处理函数
          if (oldPropsValue) {
            newElement.removeEventListener(eventName, oldPropsValue)
          }
        } else if (propName === "value" || propName === "checked") {
          newElement[propName] = newPropsValue
        } else if (propName !== "children") {
          if (propName === "className") {
            newElement.setAttribute("class", newPropsValue)
          } else {
            newElement.setAttribute(propName, newPropsValue)
          }
        }
      }
    })
    // 判断属性被删除的情况
    Object.keys(oldProps).forEach(propName => {
      const newPropsValue = newProps[propName]
      const oldPropsValue = oldProps[propName]
      if (!newPropsValue) {
        // 属性被删除了
        if (propName.slice(0, 2) === "on") {
          const eventName = propName.toLowerCase().slice(2)
          newElement.removeEventListener(eventName, oldPropsValue)
        } else if (propName !== "children") {
          newElement.removeAttribute(propName)
        }
      }
    })
  }
```



情况二： 类型不同，无需对比

```js
//diff
export default function diff(virtualDOM, container, oldDOM) {
    const oldVirtualDOM = oldDOM && oldDOM._virtualDOM
    
    // 当oldDOM不存在时
    if(!oldDOM) {
        mountElement(virtualDOM, container)
    }
    // 当oldDOM存在时
    else if(virtualDOM.type !== oldVirtualDOM.type && typeof virtualDOM !== 'function') {
        const newElement = createDOMElement(virtualDOM)
        oldDOM.parentNode.replaceChild(newElement, oldDOM)
    }

    else if(oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
        //....
    }
    
}
```



**删除节点**

```js
import unmountNode from './unmountNode'

export default function diff(virtualDOM, container, oldDOM) {
    	//...

        // 递归对比子元素
        //..

        // 删除节点
        // 获取旧节点
        let oldChildNodes = oldDOM.childNodes
        // 判断旧节点的数量
        if(oldChildNodes.length > virtualDOM.children.length) {
            // 有节点需要被删除
            for(let i = oldChildNodes.length -1; i > virtualDOM.children.length -1; i--) {
                unmountNode(oldChildNodes[i])
            }
        }
    }
    
}
```

```js
export default function unmountNode(node) {
  node.remove()
}
```



### 实现setState

```jsx
//index
class APP extends myReact.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: 'hello world'
    }
    this.changeTitle = this.changeTitle.bind(this)
  }
  changeTitle() {
    this.setState({ title: "had changed" })
  }
  render() {
    return (
      <div id="container">
        <div>{this.state.title}</div>
        <div>
          <button onClick={this.changeTitle}>changeTitle</button>
        </div>
      </div>
    )
  }
}
myReact.render(<APP/>, root)
```

需要在Component中定义setState方法

```js
export default class Component {
  constructor(props) {
    this.props = props
  }

  setState(state) {
    this.state = Object.assign({}, this.state, state)
    // 对比新旧DOM，并更新到页面上
    // 获取最新的要渲染的 virtualDOM 对象
    let virtualDOM = this.render()
    // 获取旧的 virtualDOM 对象 
  }

  setDOM(dom) {
    this._dom = dom
  }
  getDOM() {
    return this._dom
  }
}
```

获取到这个旧dom的方式比较麻烦些，需要找到当前页面的实例，根据这个实例的virtualDOM，调用setDOM方法传到Component

```js
// mountConponent

  // 获取类组件的虚拟DOM
  function buildClassComponent(virtualDOM) {
    const component = new virtualDOM.type(virtualDOM.props || {})
    const nextVirtualDOM = component.render()
    +nextVirtualDOM.component = component
    return nextVirtualDOM
  }
```

```js
import createDOMElement from './createDOMElement'
export default function mountNativeElement(virtualDOM, container) {
    let newElement = createDOMElement(virtualDOM)
    // 将转化好的真实DOM挂载到根元素上
    container.appendChild(newElement)

    let component = virtualDOM.component
    if(component) {
        component.setDOM(newElement)
    }
}
```

这样一来，在getDOM里就有这个旧的虚拟DOM了

实现效果

```js
import diff from "./diff"

export default class Component {
  constructor(props) {
    this.props = props
  }

  setState(state) {
    this.state = Object.assign({}, this.state, state)
    // 对比新旧DOM，并更新到页面上
    // 获取最新的要渲染的 virtualDOM 对象
    let virtualDOM = this.render()
    // 获取旧的 virtualDOM 对象 
    let oldDOM = this.getDOM()
    // console.log(oldDOM)
    // 获取容器
    let container = oldDOM.parentNode
    // 实现对比
    diff(virtualDOM, container, oldDOM)
  }

  setDOM(dom) {
    this._dom = dom
  }
  getDOM() {
    return this._dom
  }
}
```



### 更新组件

```js
export default function diff(virtualDOM, container, oldDOM) {
    const oldVirtualDOM = oldDOM && oldDOM._virtualDOM
    const oldComponent = oldVirtualDOM && oldVirtualDOM.component
    // 当oldDOM不存在时
    if(!oldDOM) {
        //....
    }
    // 当oldDOM存在时
    else if(virtualDOM.type !== oldVirtualDOM.type && typeof virtualDOM !== 'function') {
        //....
    }

    // 对比组件
    else if(typeof virtualDOM.type === 'function') {
        diffComponent(virtualDOM, oldComponent, oldDOM, container)
    }

    else if(oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
        //...
    }
    
}
```

情况一：不是同一个组件

```js
import mountComponent from "./mountComponent"

export default function diffComponent(virtualDOM, oldComponent, oldDOM, container) {
  if(isSameComponent(virtualDOM, oldComponent)) {
    // 同一个组件，做组件更新操作
  } else {
    mountComponent(virtualDOM, container, oldDOM)
  }
}

// 判断是否是同一个组件
function isSameComponent(virtualDOM, oldComponent) {
  return oldComponent && virtualDOM.type === oldComponent.constructor
}
```

这里更新时，还需要删除页面旧的DOM对象

```js
export default function mountNativeElement(virtualDOM, container, oldDOM) {
    let newElement = createDOMElement(virtualDOM)

    // 判断旧的DOM是否存在，存在则删除
    if(oldDOM) {
        unmountNode(oldDOM)
    }
    // 将转化好的真实DOM挂载到根元素上
    container.appendChild(newElement)

    let component = virtualDOM.component
    if(component) {
        component.setDOM(newElement)
    }
}
```



略...



### key属性

在 React 中，渲染列表数据时通常会在被渲染的列表元素上添加 key 属性，key 属性就是数据的唯一标识，帮助 React 识别哪些数据被修改或者删除了，从而达到 DOM 最小化操作的目的。

key 属性不需要全局唯一，但是在同一个父节点下的兄弟节点之间必须是唯一的。

也就是说，在比对同一个父节点下类型相同的子节点时需要用到 key 属性。



**节点新增**

实现思路是在两个元素进行比对时，如果类型相同，就循环旧的 DOM 对象的子元素，查看其身上是否有key 属性，如果有就将这个子元素的 DOM 对象存储在一个 JavaScript 对象中，接着循环要渲染的 Virtual DOM 对象的子元素，在循环过程中获取到这个子元素的 key 属性，然后使用这个 key 属性到 JavaScript 对象中查找 DOM 对象，如果能够找到就说明这个元素是已经存在的，是不需要重新渲染的。如果通过key属性找不到这个元素，就说明这个元素是新增的是需要渲染的。

**节点删除**

实现思路是循环旧节点，在循环旧节点的过程中获取旧节点对应的 key 属性，然后根据 key 属性在新节点中查找这个旧节点，如果找到就说明这个节点没有被删除，如果没有找到，就说明节点被删除了，调用卸载节点的方法卸载节点即可。



## 12、fiber








# Uni-App学习

```js
@title 'Uni-App框架' 
@description 'Uni-App框架学习笔记，汇总了一些基本要点，并结合记录了简单商城项目的demo'
@image 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
```

##  一、概述

 `uni-app` 是一个使用 [Vue.js](https://vuejs.org/) 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/QQ/钉钉/淘宝）、快应用等多个平台。 

**环境搭建**

1、HBuilderX

 HBuilderX是通用的前端开发工具，但为`uni-app`做了特别强化。 （App开发版，开箱即用）

2、微信开发者工具

稳定版Stable Build

`https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html`

**项目创建并运行**

在HBuilderX中新建项目hello-uniapp，并尝试将项目运行至浏览器、微信开发者工具、手机App

1、运行至微信开发者工具

注意：如果是第一次运行至微信开发者工具，需要配置小程序的相关路径，才能成功。同时也要打开微信开发者工具的端口服务（默认关闭）

2、运行手机App

将手机通过usb（传输文件MTP）连接到电脑，打开手机开发者模式，并选择开发者工具中的允许usb调试，usb安装

**项目目录结构**

+ pages

  所有的页面存在目录

+ static

  静态资源目录，例如图片等

+ unpackage

  打包目录，存放各个平台的打包文件

+ App.vue

  根组件，所有页面都是在App.vue下进行切换的，页面的入口文件，可调用页面的生命周期函数

+ main.js

  项目入口文件，主要作用是初始化vue实例并使用需要的插件

+ manifest.json

  应用的配置文件，用于指定应用的名称、图标、权限等

+ pages.json

  用来对uni-app进行全局配置，决定文件的路径、窗口样式、原生导航栏、底部原生的tabbar等

+ uni.scss

  用于控制应用的风格，该文件中预设了一批scss变量配置

## 二、基本配置

### 2.1 pages.json



**1、globalStyle**

globalStyle 用于设置应用的状态栏、导航条、标题、窗口背景色等。 

通过增删改等操作可以改变页面的整体外观样式

```javascript
"globalStyle": {
		"navigationBarTextStyle": "black", //nav-bar文本颜色
		"navigationBarTitleText": "uni-app", //nav-bar文本内容
		"navigationBarBackgroundColor": "#F8F8F8", //nav-bar背景颜色
		"backgroundColor": "#F8F8F8" //页面的整体颜色
	}
```

**2、pages**

uni-app通过pages节点配置应用由哪些页面组成，pages节点接收一个数组，数组每个项都是一个对象，其属性如下：

+ path

  string，配置页面路径

+ style

  Object 配置页面窗口表现

注意：pages数组的第一项表示应用启动页

```javascript
//在pages文件夹下创建meaage文件夹下创建message.vue
<template>
	<div>
		hello world
	</div>
</template>

<script>
</script>

<style>
</style>


//pages.json文件中进行配置
{
	"pages": [ //pages数组中第一项表示应用启动页
		{
			"path":"pages/message/message",
			"style":{
				"navigationBarTitleText":"信息页"
			}
		},
		{
			"path": "pages/index/index",
			"style": {
				"navigationBarTitleText": "uni-app"
			}
		}
	]
}
```

**3、tabbar**

1、tabBar 中的 list 是一个数组，只能配置最少2个、最多5个 tab，tab 按数组的顺序排序。

2、 tabbar 的页面展现过一次后就保留在内存中，再次切换 tabbar 页面，只会触发每个页面的onShow，不会再触发onLoad 

```javascript
	"tabBar":{
		"list":[
			{
				"text":"首页", //显示文本
				"pagePath":"pages/index/index", //路径
				"iconPath":"static/tabbar/home.png", //图片路径
				"selectedIconPath":"static/tabbar/home_active.png" //被选中后图片路径
			},
			{
				"text":"分类",
				"pagePath":"pages/category/Category",
				"iconPath":"static/tabbar/category.png",
				"selectedIconPath":"static/tabbar/category_active.png"
			},
			{
				"text":"购物车",
				"pagePath":"pages/cart/Cart",
				"iconPath":"static/tabbar/cart.png",
				"selectedIconPath":"static/tabbar/cart_active.png"
			},
			{
				"text":"我的",
				"pagePath":"pages/profile/Profile",
				"iconPath":"static/tabbar/profile.png",
				"selectedIconPath":"static/tabbar/profile_active.png"
			}
		]
	}
```

tabbar的其他属性

1、 color —— tab 上的文字默认颜色 

2、 selectedColor —— tab 上的文字选中时的颜色 

3、 backgroundColor —— tab 的背景色 

4、 fontSize —— 文字默认大小  等等

```javascript
"tabBar":{
		"color":"#808080",
		"selectedColor":"#DD524D",
		"list":[
			{
				"text":"首页",
				"pagePath":"pages/index/index",
				"iconPath":"static/tabbar/home.png",
				"selectedIconPath":"static/tabbar/home_active.png"
			}]
            }
```

**4、condition**

 启动模式配置，仅开发期间生效，用于模拟直达页面的场景，如：小程序转发后，用户点击所打开的页面。 

```javascript
	"condition":{
		"current":0 ,//表示当前的激活模式（list的索引项）
		"list":[{
			"name":"detail",
			"path":"pages/detail/Detail",
			"query":"id=999"
		}]
	}
```



## 三、组件的使用

**text组件**

文本组件。

用于包裹文本内容。

```javascript
<template>
	<view>
		<view>
			<text selectable>这是购物车</text>
		</view>
	</view>
</template>
```



**view视图容器**

它类似于传统html中的div，用于包裹各种元素内容。

| 属性名                 | 类型    | 默认值 | 说明                                                         |
| :--------------------- | :------ | :----- | :----------------------------------------------------------- |
| hover-class            | String  | none   | 指定按下去的样式类。当 hover-class="none" 时，没有点击态效果 |
| hover-stop-propagation | Boolean | false  | 指定是否阻止本节点的祖先节点出现点击态（阻止冒泡）           |
| hover-start-time       | Number  | 50     | 按住后多久出现点击态，单位毫秒                               |
| hover-stay-time        | Number  | 400    | 手指松开后点击态保留时间，单位毫秒                           |

实例

```vue
	<view>
		<view>我类似于div</view>
		<view class="beforePress" hover-class="afterPress">green</view>
	</view>

<style>
	.beforePress{
		width: 200px;
		height: 200px;
		background-color: green;
	}
	.afterPress{
		width: 200px;
		height: 200px;
		background-color: yellow;
	}
</style>
```



**button按钮**

```vue
<view>
	<button>确定</button>
	<button size="mini">确定</button>
	<button type="primary">确定</button>
	<button size="mini" loading>确定</button>
</view>
```



**image图片组件**

 该组件默认宽度 300px、高度 225px； 

`src` 仅支持相对路径、绝对路径，支持 base64 码；

| 属性名    | 类型    | 默认值        | 说明                                             | 平台差异说明                                |
| :-------- | :------ | :------------ | :----------------------------------------------- | :------------------------------------------ |
| src       | String  |               | 图片资源地址                                     |                                             |
| mode      | String  | 'scaleToFill' | 图片裁剪、缩放的模式                             |                                             |
| lazy-load | Boolean | false         | 图片懒加载。只针对page与scroll-view下的image有效 | 微信小程序、App、百度小程序、字节跳动小程序 |

实例

```vue
<view>
<image src="../../static/logo.png" mode="aspectFill"></image>
<image src="../../static/logo.png" mode="aspectFit"></image>
</view>
```



**uni-app的样式**

1、[内容缩放拉伸的处理](https://uniapp.dcloud.io/adapt?id=_3-内容缩放拉伸的处理)

rpx即响应的px，一种根据屏幕宽度自适应的动态单位，以750宽的屏幕为基准，750宽恰好为屏幕的宽度，屏幕变宽，rpx显示效果等比放大。

```vue
		<view class="box">
			我会随着屏幕的变化而变化
		</view>

<style>
.box{
	width: 750rpx;
	height: 750rpx;
}
</style>
```

 2、导入外联样式

使用@import语句可以导入外联样式表

实例：在static中创建test.css文件，并设置视图容器view的背景颜色为pink

在App.vue中引用该样式表

```javascript
<style>
	/*每个页面公共css */
	@import url("./static/test.css");
</style>
```

3、选择器

uni-app支持常用的选择器，class，id，element，但是不支持*选择器，page相当于body节点



4、全局样式

定义在app.vue中的样式为全局样式，作用于每一个页面。在pages目录下的vue文件中定义的样式为局部样式，局部页面的样式会覆盖app.vue中的选择器



## 四、生命周期



### 4.1 应用生命周期

`uni-app` 支持如下应用生命周期函数：

| 函数名   | 说明                                           |
| :------- | :--------------------------------------------- |
| onLaunch | 当`uni-app` 初始化完成时触发（全局只触发一次） |
| onShow   | 当 `uni-app` 启动，或从后台进入前台显示        |
| onHide   | 当 `uni-app` 从前台进入后台                    |
| onError  | 当 `uni-app` 报错时触发                        |

注意：应用生命周期仅可在`App.vue`中监听，在其它页面监听无效。

```vue
<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() { //当应用进入后台时触发
			console.log('App Hide')
		},
        onError: function(err) {
            console.log(err)
        }
	}
</script>
```



### 4.2 页面生命周期

|                   |                                                              |
| :---------------- | :----------------------------------------------------------- |
| 函数名            | 说明                                                         |
| onLoad            | 监听页面加载，其参数为上个页面传递的数据，参数类型为 Object（用于页面传参） |
| onShow            | 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面 |
| onReady           | 监听页面初次渲染完成。注意如果渲染速度快，会在页面进入动画完成前触发 |
| onHide            | 监听页面隐藏                                                 |
| onUnload          | 监听页面卸载                                                 |
| onPullDownRefresh | 监听用户下拉动作，一般用于下拉刷新                           |
| onReachBottom     | 页面滚动到底部的事件（不是scroll-view滚到底），常用于下拉下一页数据。 |

```vue
<script>
	export default {
		// 生命周期
		onShow() {
			console.log("页面显示")
		},
		onReady() {
			console.log("页面初次渲染完成")
		},
		onHide() {
			console.log("页面隐藏")
		}
	}
</script>
```



**开启下拉刷新**

**方法一**

- 需要在 `pages.json` 里，找到的当前页面的pages节点，并在 `style` 选项中开启 `enablePullDownRefresh`。
- 当处理完数据刷新后，`uni.stopPullDownRefresh` 可以停止当前页面的下拉刷新。

实例

```vue
	"pages": [ 
		{
			"path":"pages/profile/Profile",
			"style":{
				"navigationBarTitleText":"用户",
				"enablePullDownRefresh":true //开启下拉加载更多
			}
	]
```

```javascript
<script>
	export default {
    onPullDownRefresh() {
		console.log("触发下拉刷新")
		uni.stopPullDownRefresh(); //停止当前页面下拉刷新。
    }
	}
</script>
```

**方法二**

通过点击事件，触发下拉加载更多

```javascript
<template>
	<view class="">
		<button size="mini" @click="btnClick">确定</button>
	</view>
</template>

<script>
	export default {
		methods:{
			btnClick(){
				uni.startPullDownRefresh(); //开启下拉加载更多
				setTimeout(()=>{
					console.log("通过事件触发下拉加载更多")
					uni.stopPullDownRefresh()  //关闭下拉加载更多
				},2000)
			}
		}
	}
</script>
```



**页面触底事件**（上拉加载更多）

onReachBottom生命周期函数用于监听页面触底时的事件，常用于下拉下一页数据

```javascript
<script>
export default {
	onReachBottom(){
		console.log("页面触底了")
	}
}
</script>
```

可以发现，当滚动条尚未触底时，已经触发该函数。这个触发的距离是可控的

在pages中的style中提供了 onReachBottomDistance 属性，用于 页面上拉触底事件触发时距页面底部距离，单位只支持px 

```javascript
{
			"path":"pages/category/Category",
			"style":{
				"navigationBarTitleText":"分类",
				"onReachBottomDistance":200 //距离底部200px时触发
			}
		},
```



## 五 、网络请求

### 5.1 uni.request

注意： 在各个小程序平台运行时，网络相关的 API 在使用前需要配置域名白名单。 

![1618925998426](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1618925998426.png)

```javascript
<template>
	<view>
		<button @click="sendNet">发送网络请求</button>
	</view>
</template>

<script>
	export default {
		methods:{
			sendNet(){
				uni.request({
					url:"http://152.136.185.210:7878/api/m5/home/multidata",
					success(res) {
						console.log(res)
					}
				})
			}
		}
	}
</script>
```

或者可以这样子写

```javascript
<script>
	export default {
		methods:{
			sendNet(){
				uni.request({
					url:"http://152.136.185.210:7878/api/m5/home/multidata",
				}).then(res=>{
					console.log(res[1])
				})
			}
		}
	}
</script>
```



### 5.2 数据缓存

1、uni.setStorage({参数})

将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个异步接口。

| 参数名  | 类型     | 必填 | 说明                                                         |
| :------ | :------- | :--- | :----------------------------------------------------------- |
| key     | String   | 是   | 本地缓存中的指定的 key                                       |
| data    | Any      | 是   | 需要存储的内容，只支持原生类型、及能够通过 JSON.stringify 序列化的对象 |
| success | Function | 否   | 接口调用成功的回调函数                                       |

2、uni.getstorage({参数})

 从本地缓存中异步获取指定 key 对应的内容 

| 参数名  | 类型     | 必填 | 说明                                            |
| :------ | :------- | :--- | :---------------------------------------------- |
| key     | String   | 是   | 本地缓存中的指定的 key                          |
| success | Function | 是   | 接口调用的回调函数，res = {data: key对应的内容} |

3、uni.removestorage({参数})

​	 从本地缓存中异步移除指定 key 

| 参数名  | 类型     | 必填 | 说明                   |
| :------ | :------- | :--- | :--------------------- |
| key     | String   | 是   | 本地缓存中的指定的 key |
| success | Function | 是   | 接口调用的回调函数     |

代码案例

```javascript
<template>
	<view>
		<button @click="sendNet">发送网络请求</button>
		<button type="warn" @click="setData">存储数据</button>
		<button type="primary" @click="getData">获取数据</button>
		<button type="warn" @click="removeData">删除数据</button>
	</view>
</template>


<script>
	export default {
		methods:{
			// 存储数据
			setData(){
				uni.setStorage({
					key:"id",
					data:88,
					success() {
						console.log("存储成功")
					}
				})
			},
			// 获取数据
			getData(){
				uni.getStorage({
					key:"id",
					success(res){
						console.log("获取成功",res)
					}
				})
			},
			// 删除数据
			removeData(){
				uni.removeStorage({
					key:"id",
					success() {
						console.log("删除成功")
					}
				})
			}
		}
	}
</script>
```

有异步，相应的也就有同步的数据缓存方法

1、uni.setStorageSync 

 将 data 存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个同步接口。 

```javascript
			// 存储数据
			setData(){
				uni.setStorageSync('storage_key', 'hello');
				console.log("存储成功")
			},
```

2、uni. getStorageSync 

 从本地缓存中同步获取指定 key 对应的内容。 

```javascript
			// 获取数据
			getData(){
			const value = uni.getStorageSync('storage_key');
			    if (value) {
			        console.log(value);
			    }
			},
```

3、uni. removeStorageSync 

 从本地缓存中同步移除指定 key

```javas
			// 删除数据
			removeData(){
				uni.removeStorageSync('storage_key');
				console.log("删除成功")
			}
```

## 六、图片

### 6.1  图片上传

uni.chooseImage 

从本地相册选择图片或使用相机拍照。 

| 参数名   | 类型          | 必填 | 说明                                           | 平台差异说明                              |
| :------- | :------------ | :--- | :--------------------------------------------- | :---------------------------------------- |
| count    | Number        | 否   | 最多可以选择的图片张数，默认9                  | 见下方说明                                |
| sizeType | Array<String> | 否   | original 原图，compressed 压缩图，默认二者都有 | App、微信小程序、支付宝小程序、百度小程序 |
| success  | Function      | 是   | 成功则返回图片的本地文件路径列表 tempFilePaths |                                           |

注意： count 值在 H5 平台只能限制单选/多选，并不能限制数量 

```javascript
<template>
	<view>
		<button type="warn" @click="getImage">上传图片</button>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				imageArr:[] //储存图片
			}
		},
		methods:{
			getImage () {
				uni.chooseImage({
					count:6,
					success(res) {
						console.log(res) //图片路径保存在tempFilePaths
					}
				})
			}
		}
	}
</script>
```

案例：将上传的照片在页面中展示出来

```javascript
<template>
	<view>
		<button type="warn" @click="getImage">上传图片</button>
		<view class="" v-for="item in imageArr" :key="item.index">
			<image :src="item" mode="aspectFit"></image>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				imageArr:null //储存图片
			}
		},
		methods:{
			getImage () {
				uni.chooseImage({
					count:6,
					success:res=>{
						console.log(res) //图片路径保存在tempFilePaths
						this.imageArr = res.tempFilePaths
					}	
				})
			}
		}
	}
</script>
```

### 6.2 图片预览

uni.previewImage预览图片 

| 参数名  | 类型          | 必填         | 说明                   |
| :------ | :------------ | :----------- | :--------------------- |
| current | String/Number | 详见下方说明 | 详见下方说明           |
| urls    | Array<String> | 是           | 需要预览的图片链接列表 |

注： current 为当前显示图片的链接/索引值，不填或填写的值无效则为 urls 的第一张。 

```javascript
<template>
	<view>
		<button type="warn" @click="getImage">上传图片</button>
		<view class="" v-for="item in imageArr" :key="item.index">
			<image :src="item" mode="aspectFit" @click="seeImage(item)"></image>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				imageArr:null //储存图片
			}
		},
		methods:{
			// 上传图片
			getImage () {
				uni.chooseImage({
					count:6,
					success:res=>{
						console.log(res) //图片路径保存在tempFilePaths
						this.imageArr = res.tempFilePaths
					}	
				})
			},
			// 预览图片
			seeImage (current) {
				console.log(current)
				uni.previewImage({
					current,
					urls:this.imageArr
				})
			}
		}
	}
</script>
```

## 七、跨端兼容

uni-app 已将常用的组件、JS API 封装到框架中，开发者按照 uni-app 规范开发即可保证多平台兼容，大部分业务均可直接满足。但每个平台有自己的一些特性，因此会存在一些无法跨平台的情况。

解决方案：**条件编译**

条件编译是用特殊的注释作为标记，在编译时根据这些特殊的注释，将注释里面的代码编译到不同平台。

**写法：**

 `#ifdef 或 #ifndef +平台名称 开头，以 #endif 结尾`

- \#ifdef：if defined 仅在某平台存在
- \#ifndef：if not defined 除了某平台均存在

平台名称可取值如下：

| 值        | 平台         |
| :-------- | :----------- |
| APP-PLUS  | App          |
| H5        | H5           |
| MP-WEIXIN | 微信小程序   |
| MP-ALIPAY | 支付宝小程序 |

实例

组件的条件编译

```javascript
		<!-- #ifdef H5 -->
		<view class="">
			我在h5平台显示
		</view>
		<!-- #endif -->
		
		<!-- #ifdef MP-WEIXIN -->
		<view class="">
			我在微信小程序显示
		</view>
		<!-- #endif -->
```

API的条件编译

```javascript
		created() {
			// #ifdef H5
			console.log("我在h5平台显示")
			//  #endif
			
			//  #ifdef MP-WEIXIN
			console.log("我在微信小程序中显示")
			//  #endif
			
		}
```

样式的条件编译

```javascript
<style>
view{
	/* #ifdef H5 */
	background-color: #007AFF;
	/* #endif */
	
	/* #ifdef MP-WEIXIN */
	font-size: 30px;
	/* #endif */
}
</style>
```

## 八、路由与页面跳转

### 8.1 navigator

页面跳转

该组件类似HTML中的<a>组件，但只能跳转本地页面。目标页面必须在pages.json中注册

| 属性名    | 类型   | 默认值   | 说明                                                         |
| :-------- | :----- | :------- | :----------------------------------------------------------- |
| url       | String |          | 应用内的跳转链接，值为相对路径或绝对路径，如："../first/first"，"/pages/first/first"，注意不能加 `.vue` 后缀 |
| open-type | String | navigate | 跳转方式                                                     |
| delta     | Number |          | 当 open-type 为 'navigateBack' 时有效，表示回退的层数        |

注：		

`<navigator url="../cart/Cart" open-type="switchTab">跳转到购物车页面</navigator>`

open-type取值说明：

1、open-type="redirect" 可跳转到非tabbar页面，并且销毁原页面

2、open-type="switchTab"可跳转到tabbar页面，并且销毁原页面

```javascript
<navigator url="../detail/Detail">跳转到详情页页面（可返回）</navigator>

<navigator url="../detail/Detail" open-type="redirect">跳转到详情页面（销毁原页面）</navigator>

<navigator url="../cart/Cart" open-type="<switchTab></switchTab>">不能直接跳转到tarbar页面</navigator>
```

### 8.2 其他API

**uni.navigateTo()**

 保留当前页面，跳转到应用内的某个页面，使用`uni.navigateBack`可以返回到原页面 	

```javascript
<button @click="goDetail">跳转详情页(可返回)</button>

methods:{
			goDetail(){
				uni.navigateTo({
					url:"../detail/Detail"
				})
			}
		}
```



**uni.redirectTo()**

 关闭当前页面，跳转到应用内的某个页面 

```javascript
<button @click="goDetail2">跳转详情页（销毁原页面）</button>

			goDetail2(){
				uni.redirectTo({
					url:"../detail/Detail"
				})
			}
```



 **uni.switchTab()**

 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面 



### 8.3 路由传参

将设需要从首页向详情页传递参数

```javascript
<button @click="goDetail">跳转详情页(可返回)</button>

methods:{
			goDetail(){
				uni.navigateTo({
					url:"../detail/Detail?id=8080" //在这里传递参数（可传递多个）
				})
			}
	}

//详情页接收参数
onLoad(options){
    console.log(options)  //{id：8080}
}
```



##  九、组件生命周期

| 生命周期钩子  | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| beforeCreate  | 在实例初始化之后被调用                                       |
| created       | 在实例创建完成后被立即调用                                   |
| beforeMount   | 在挂载开始之前被调用                                         |
| mounted       | 挂载到实例上去之后调用。                                     |
| beforeUpdate  | 数据更新时调用，发生在虚拟 DOM 打补丁之前                    |
| updated       | 由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子 |
| activated     | 被 keep-alive 缓存的组件激活时调用                           |
| deactivated   | 被 keep-alive 缓存的组件停用时调用                           |
| beforeDestroy | 实例销毁之前调用。在这一步，实例仍然完全可用                 |
| destroyed     | Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁 |
| errorCaptured | 当捕获一个来自子孙组件的错误时被调用                         |

 案例

```javascript
		beforeCreate() {
			console.log("实例已经开始初始化")
			console.log(this.num) //这时候还不能访问到数据
		},
		created() {
			console.log("实例已经创建完成了")
			console.log(this.num) //可以访问到num
		},
		beforeMount(){
			console.log("页面准备渲染了")
			console.log(document.getElementById("content"))
			// 这时候还未渲染，所以提取不到 返回null	
		},
		mounted() {
			console.log("页面渲染好了")
			console.log(document.getElementById("content")) //获取到了
		}
```



## 十、页面通信

**兄弟组件传值**

 1、 uni.$emit('evenName',{参数}) 

 触发全局的自定义事件，附加参数都会传给监听器回调函数 



2、 uni.$on('evenName',回调函数) 

 监听全局的自定义事件，事件由 `uni.$emit` 触发，回调函数会接收事件触发函数的传入参数。 

案例：

创建A组件、B组件并在index页面导入，并通过A组件向B组件发送一个num

A组件

```javascript
		<view class="AA"> 
			我是组件A
			<button @click="sendNum">发送给B组件</button>
		</view>

<script>
	export default {
		name:"pageA",
		data() {
			return {
				num:10
			};
		},
		methods:{
			sendNum () {
				uni.$emit('sendNum',this.num)
			}
		}
	}
</script>
```

B组件

```javascript
		<view class="BB">
			我是组件B
			<view>
				这是来自A组件的Num:{{num}}
			</view>
		</view>

<script>
	export default {
		name:"pageB",
		data() {
			return {
				num:null
			};
		},
		created() {
			uni.$on('sendNum',(res)=>{
				console.log(res)
				this.num = res
			})
		}
	}
</script>
```



## 十一、拓展组件

uni-ui是DCloud提供的一个跨端ui库，它是基于vue组件的、flex布局的、无dom的跨全端ui框架。

uni-ui不包括基础组件，**它是基础组件的补充**。

以安装日历插件为例

1、登录DCloud账号

2、登录插件市场，并选择使用HBuilderx导入插件

3、按照插件的使用规则使用即可

由于日历插件需要安装sass解释器，我们需要额外在工具栏中选择插件安装，前往安装

```javascript
//使用日历插件
<template>
<view>
    <uni-calendar 
    :insert="true"
    :lunar="true" 
    :start-date="'2019-3-2'"
    :end-date="'2019-5-20'"
    @change="change"
     />
</view>
</template>
```



## 十二、商城项目

### 12.1 初始化项目

在hbuilderx中创建一个默认模板的uniapp项目，并清空默认的内容

在globalStyle中初始化项目的导航栏样式（注：page中的样式会覆盖这里的样式）

```javascript
	"globalStyle": {
		"navigationBarTextStyle": "white",
		"navigationBarTitleText": "购物街",
		"navigationBarBackgroundColor": "#C82519",
		"backgroundColor": "#F8F8F8"
	}
```

**构建tabbar**

在阿里巴巴矢量图标库下载好tabbar所需要的的图标（包括活跃和不活跃两种状态），并导入到static文件夹中

在pages文件夹下，创建index、news、cart、profile四个页面，并在pages.json中配置对应的路径。

```javascript
"pages": [ //pages数组中第一项表示应用启动页，参考：https://uniapp.dcloud.io/collocation/pages
		// 首页
		{
			"path": "pages/index/index",
			"style": {
			}
		},
		// 资讯
		{
			"path":"pages/news/news"
		},
		// 购物车
		{
			"path":"pages/cart/cart"
		},
		// 用户
		{
			"path":"pages/profile/profile"
		}
	]
```

还需要将这四个页面添加到tabbar上，并设置相应的样式

```javascript
"tabBar":{
		"list":[
			// 首页
			{
				"text":"首页", //文本
				"pagePath":"pages/index/index", //路径
				"iconPath":"static/tabbar/home.png", //未选中时图标
				"selectedIconPath":"static/tabbar/home_active.png" //选中时的图标
			},
			// 资讯
			{
				"text":"资讯",
				"pagePath":"pages/news/news",
				"iconPath":"static/tabbar/news.png",
				"selectedIconPath":"static/tabbar/news_active.png"
			},
			// 购物车
			{
				"text":"购物车",
				"pagePath":"pages/cart/cart",
				"iconPath":"static/tabbar/cart.png",
				"selectedIconPath":"static/tabbar/mall_active.png"
			},
			// 用户
			{
				"text":"用户",
				"pagePath":"pages/profile/profile",
				"iconPath":"static/tabbar/profile.png",
				"selectedIconPath":"static/tabbar/profile_active.png"
			}
		],
		// tabbar的其他样式
		"selectedColor":"#E93B3D", //选中时的文本颜色
		"color":"#8B8B8B" //文本颜色
	}
```

### 12.2 轮播图与网络请求

在components文件夹下swiper组件，并在index页面引用

**获取轮播图数据**

封装一个获取数据的方法

```javascript
		methods:{
			// 获取轮播图的数据
			getSwiperInfo(){
				uni.request({
					url:"http://152.136.185.210:7878/api/m5/home/multidata",
					success:res=> {
						console.log(res.data)
						if(!res.data.success){ //如果获取数据失败
							return uni.showToast({
								title:"获取轮播图数据失败"
							})
						}
						this.swiperInfo = res.data.data
					}
				})
			}
		}
```

在实例创建完成后被立即调用，methods中的方法，并将获取到的res保存在data中

```javascript
		created() {
			// console.log("发送网络请求")
			// 页面创建时，调用发送网络请求的方法
			this.getSwiperInfo()
		},
		data() {
			return {
				swiperInfo:{}
			}
		}
```

**出现的问题**

由于本项目需要多次使用网络请求，如果每次都需要封装一次发送网络请求的代码，会显得代码十分臃肿，重复。而且，当发送网络请求的url发生改变时，需要对多个页面进行修改，维护起来十分麻烦。

所以，很有必要对网络请求单独封装成一个js文件，需要发送网络请求时，引入即可

```javascript
//在nerwork文件夹下创建request.js

const base_URL = "http://152.136.185.210:7878/api/m5"

export function request (options) {
	return new Promise((resolve,reject)=>{
		uni.request({
			url:base_URL+options.url,
			method:options.methods || 'GET' ,  //请求的方法
			data:options.data || {},  //参数项
			// 成功发送网络请求时
			success:res=>{
				if(!res.data.success){
					return uni.showToast({
						title:"获取数据失败"
					})
				}
				resolve(res) //外部可执行.then（）
			},
			fail:err=>{
				uni.showToast({
					title:"请求接口失败"
				})
				reject(err)
			}
			
		})
	})
}
```

在swiper.vue组件中就可以导入该函数就可以直接使用request函数了

```javascript
<script>
	import {request} from '../../network/request.js'
	
	export default{
		data() {
			return {
				swiperInfo:{}
			}
		},
		created() {
			// console.log("发送网络请求")
			// 页面创建时，调用发送网络请求的方法
			this.getSwiperInfo()
		},
		methods:{
			// 获取轮播图的数据
			getSwiperInfo(){
				request({
					url:"/home/multidata"
				}).then(res=>{
					console.log(res.data)
					this.swiperInfo = res.data
				})
			}
		}
	}
</script>
```

当然，如果觉得每次都要导入request有点麻烦，也可以将该方法保存在原型上

```javascript
//main.js

import {request} from 'network/request.js'

// 添加至原型
Vue.prototype.$request = request
```

之后可以不用调用`import {request} from ....`就可以直接使用网络请求的函数了

```javascript
<script>
	export default{
		methods:{
			// 获取轮播图的数据
			getSwiperInfo(){
				this.$request({
					url:"/home/multidata"
				}).then(res=>{
					// console.log(res.data.data.banner.list)
					this.swiperInfo = res.data.data.banner.list
				})
			}
		}
	}
</script>
```

将数据在页面进行渲染

注：swiper组件是uni-app内置的组件，直接使用即可

```javascript
	<view class="swiper">
		<swiper indicator-dots autoplay :interval="2500" :duration="1000" circular="true">
			<swiper-item v-for="item in swiperInfo" :key="item.index">
				<image :src="item.image" mode=""></image>
			</swiper-item>
		</swiper>
	</view>
```

### 12.3 goods展示

在index页面获取数据，并保存

```javascript
		created(){
			console.log("页面创建时加载")
			// 页面创建时加载三种类型的商品展示的数据
			this.getGoodsInfo("pop")
			this.getGoodsInfo("new")
			this.getGoodsInfo("sell")
		},
		methods:{
			getGoodsInfo(type){
				let page = this.goods[type].page +1 ;
				this.$request({
					url:'/home/data',
					data:{
						type:type,
						page:page
					}
				}).then(res=>{
					console.log(res.data.data.list)
					// 获取到的数据保存到goods中
					this.goods[type].list.push(...res.data.data.list)
					this.goods[type].page += 1
				})
			},}
```

获取到的数据到存到了data

```javascript
		data(){
			return{
				goods:{ //保存商品信息
					pop:{page:0,list:[]},
					new:{page:0,list:[]},
					sell:{page:0,list:[]},
				},
				currentType:'pop' //当前显示的类型
			}
		},
```

怎么通过点击“流行”、“新款”、“精选”中的任意一个，展示对应的数据？

```javascript
		methods:{
			changeIndex(index){
				this.currentIndex = index
				
				// 将用户点击的index传给index.vue
				this.$emit('getIndex',this.currentIndex)
			}
		}
```

在tabControl组件中将用户点击的页面发给index页面,通过switch将currentType转换为对应的类型

```javascript
			// 通过该函数动态决定currentType的值
			getIndex(index){
				switch(index){
					case 0 :
					this.currentType = "pop"
					break;
					case 1 :
					this.currentType = "new"
					break;
					case 2 :
					this.currentType = "sell"
					break
				}
			}
```

最后，将能由tabControl动态决定的currentType传给goods-list组件

```javascript
<goods-list :goodsInfo="goods[currentType].list" ></goods-list>
```

**下拉加载更多**

```javascript
			// 监听上拉加载更多（页面触底事件）
			onReachBottom(){
				console.log("触底了")
				this.getGoodsInfo(this.currentType)
			}
```

再次触发该函数，page+1，往goods的list增加新的商品数据，并会被传递向GoodsList组件

### 12.4 详情页

首先我们需要实现点击商品跳转到详情页的功能，并把对应商品的id传到详情页

实现步骤：在Goods-list中注册点击事件，将当前页面的索引传递给index父组件

```javascript
<view class="goods-item" v-for="(item,index) in goodsInfo" :key="item.index" @click="getIGoodIndex(index)">
</view>

		methods:{
			getIGoodIndex(index){
				this.$emit("GoodIndex",index)
			}
		}
```

首页的goods保存了所有商品的信息，可以通过index来获取我们需要的商品的信息，并传向详情页

```javascript
<goods-list :goodsInfo="goods[currentType].list" @GoodIndex="getGoodIndex"></goods-list>

			getGoodIndex(index){
				// 根据index获取对应商品的iid
				// console.log(this.goods[this.currentType].list[index].iid)
				const iid = this.goods[this.currentType].list[index].iid
				uni.navigateTo({
					url:"../detail/Detail?iid="+iid
				})
			}
```

在详情页中，可以通过`onLoad(options){console.log(options)}`来获取传过来的参数

现在就可以通过iid来发送网络请求了，但是这次请求的连接里边不会返回success状态，所以之前的request函数不能使用，我们就直接在详情页发送网络请求就行，不要再额外封装一个用于详情页的网络请求函数了

```javascript
		onLoad(options) {
			//因为传过来的options是一个对象
			// console.log(options)
			uni.request({
				url:'http://152.136.185.210:7878/api/m5/Detail?iid='+options.iid
			}).then(res=>{
				console.log(res[1])
			})
		}
```


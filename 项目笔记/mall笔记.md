# surpermall笔记

使用vue.js从零开始搭建一个APP商城项目



## 1、基础搭建

工具：vscode、node.js、vue-cli

这里使用的是vue-cli搭建的环境

基本的命令：

搭建脚手架：`vue create mall-v2.0`

运行项目：`npm run serve`

打包项目:`npm run build`

### 1.1 项目文件结构的划分

1、src为项目源码的地址

2、assert文件（存放了项目总的css和img两个文件夹）

3、components存放了项目需要用的组件（包括了common、content两个文件夹，其中，通用的组件放common文件夹，业务相关的组件放content文件夹）

4、router路由文件夹，存放相关路由的配置

5、创建view文件夹，用于存放项目的基础页面组件（如home页面的相关组件）

6、创建router文件夹，在index文件下，配置相关的路由映射关系

7、创建network文件夹，封装一些网络请求的js文件

8、childComps文件夹，这里存放相应父组件的子组件

9、创建common文件夹，存放普遍适用的代码

10、创建store文件加，存放应用中大部分的状态 (state) 

### 1.2 配置基础的css样式

1、配置base.css

​	这是项目总的css文件（定义了诸如背景色、文本颜色等样式）

​	在App.vue的css中引用该css样式表

`@import url('./assets/css/base.css');`

2、配置normalize.css

​	该css文件可标准化其他形式的css代码，在base.css中被引用

`@import './normalize.css';`

### 1.3 Tabbar

简介：App底部的导航，分为Home、Category、Cart、Profile四个可选择项。当点击选项时改变对应的url，并跳转到对应的组件页面中。这就需要路由技术

**安装路由**

`npm install vue-router`

**配置路由映射关系**

1、在router中创建index.js文件，导入vue、router

2、以懒加载的方式导入在view中创建的组件 例：`const Home =()=>import('../view/home/Home.vue')`

3、映射路由关系  例：` { path: '/home', component: Home }`

**使用路由**

在tabbaritem中添加单击事件，当点击对应组件时，将调用全局路由对象的push方法，为页面添加对应组件的url (可在maintabbar组件中将单击时对应的path传进来)

`this.$router.push(this.path)`

最后在App.vue中引用maintabbar，并使用`<router-view />`将对应组件内容显示出来

**单击对应路由改颜色**

tabbar的每个item处于被点击时，显示对应的颜色。

使用v-if，v-else。v-if为true时，显示该内容，false显示v-else上的内容

```javascript
    <div v-if="!isAcitve"></div>
    <div v-else></div>
	
   computed: {
      isAcitve(){
        // this.$route 表示当前路由对象
        // indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。没有该字符串则返回-1
        // 当当前的路由path与url中的相同时，该函数返回true
        return this.$route.path.indexOf(this.path) !== -1      
      } 
    }
```

至此，项目的基本结构已搭建完成，接下来只要在home、category、cart、profile四个组件中进行相关代码操作即可

## 2、Home 组件

​	Home即首页

### 2.1 NavBar

在component>common中封装nav-bar.vue

```javascript
      <div><slot name="left"></slot></div>
      <div><slot name="center"></slot></div>
      <div><slot name="right"></slot></div>
```

在Home.vue中使用

```javas
<nav-bar><div slot="center">购物街</div></nav-bar>
```

### 2.2 Swiper 轮播图

在components>common创建swiper（轮播图）文件夹，存放外部轮播图插件swiper.vue与swiperItem.vue。

在childComps中创建HomeSwiper,该子组件用于创建专属于首页的轮播图

由于需要发送网路请求获取轮播图的图片数据，这里也就需要安装axios

`npm install axios --save`

**封装发送网络请求**

在netwoek>request.js

统一封装在request.js中，之后重新发送网络请求就不用了重复编写代码了

```javascript
import axios from 'axios' 

export function request(config){
    return new Promise((resolve,reject)=>{
        // 1.创建axios实例
        const instance = axios.create({
            baseURL:'http://152.136.185.210:7878/api/m5',
            timeout:5000
        })
       	// 响应拦截
        instance.interceptors.response.use(res=>{
            return res.data  //每次获取到的结果，过滤掉axios添加的状态信息
        }, err =>{
            console.log(err);
        })          
        
        // 发送网络请求
        instance(config)
        .then(res=>{resolve(res)})
        .catch(err=>{reject(err)})
    })
}
```

将存放推荐栏与轮播图的具体url传入request(在network中创建home.js文件)

```javascript
import {request} from './request'
// 通过定义getHomeMultidata()返回轮播图中需要的数据
export function getHomeMultidata(){
    return request({
        url:'/home/multidata'
    })
}
```



**HomeSwiper**

在该组件中实现调用request函数发送网络请求，获取需要的数据

在methods中调用request函数，并将相关的结果数据存在data的banners中，之后在template中使用v-for遍历渲染到页面中

```javascript
methods:{
        getSwiperInfo(){
            getHomeMultidata().then(res=>{
                this.banners=res.data.banner.list 
                //将从etHomeMultidata()中获取的图片数据存在banners中
            })
        }
```

在home页面打开时，利用声明周期函数create(){}调用methods中的方法获数据

` created () {this.getRecommendInfo()} `

### 2.3 recommend 组件

recommend组件的实现原理与homeswiper相似

通过在页面中导入调用newwork中的home.js中的getHomeMultidata函数获取需要的数据

具体代码如下

```javascript
<template>
  <div id="recommend">
      <div class="recommenditem" v-for="item in RecommendInfo" :key="item.index">
          <a :href="item.link">
            <img :src="item.image" alt="">
            <span>{{item.title}}</span>
          </a>
      </div>
  </div>
</template>

<script>
import {getHomeMultidata} from '../../../network/home' //导入getHomeMultidata函数--获取轮播图数据

export default {
    name:'Recommendview',
    created () {
        this.getRecommendInfo() //组件运行时，发送网络请求
    },
    data () {
        return {
            RecommendInfo:[] //存放推荐组件的图片数据
        }
    },
    methods: {
        getRecommendInfo(){
            getHomeMultidata().then(res=>{
                this.RecommendInfo = res.data.recommend.list //将数据存入RecommendInfo
            })
        }
    }
}
</script>
```

### 2.4 FeatureView 组件

该组件制作较为简单，仅为导入一张准备好的图片，并设置好超链接

略

### 2.5 TabControl 组件

在content中创建TabControl .vue文件	

实现效果：单击“流行，新款，精选”其中之一，改变对应的颜色

```javascript
<template>
  <div class="tab-control">
      <div class="tab-control-item" 
      v-for="(item,index) in titles" 
      :key="item.index"
      :class="{active:currentIndex == index}"
      @click="changeTabItem(index)">
          <span>{{item}}</span>
      </div>
  </div>
</template>
<script>
data () {
        return {
            currentIndex:false //默认为不显示颜色
        }
    },
    methods: {
        changeTabItem(index){
            this.currentIndex = index //当点击选项时，将currentIndex 与index相等，从而将：class变为true
        }
    }
</script>
```

### 2.6 GoodsList 组件

在network中配置home.js，封装用于获取商品信息的函数getHomeGoods

```javasc
//获取商品的信息
export function getHomeGoods(type,page){
    return request({
        url:'home/data',
        params:{ //传递参数
            type,
            page
        }
    })
}
```

在Home.vue组件中调用该函数

通过methods中定义getHomeGoods方法获取所需要的数据（使用create（）函数在页面创建时调用），并存入data中

```javascript
 data () {
      return {
        // goods存储获取到的商品数据
        goods:{
          pop:{page:0,list:[]},
          new:{page:0,list:[]},
          sell:{page:0,list:[]},
        }
      }
    },
    created () {
      //组件创建时，调用methods里的方法，获取商品数据
      this.getGoodsInfo("pop") 
      this.getGoodsInfo("new") 
      this.getGoodsInfo("sell")
    },
    methods: {
      getGoodsInfo(type){
        let page = this.goods[type].page +1;
        getHomeGoods(type,page).then(res=>{
        this.goods[type].list.push(...res.data.list) //将请求的数据放进相应的list数组里
        this.goods[type].page+=1;
            
            this.$refs.scroll.scroll.finishPullUp() //再次调用上拉加载更多
        })
      },
    }
```

这样一来data中的goods中已存储了我们想要的商品数据

1、在commonents文件夹中创建GoodsList.vue

将goods对象中的存储商品的list传进来，存在GoodsList.vue自身的Goods上。在页面导入GoodsListItem组件，应用v-for将每件小商品的数据传递过去

```javascript
<template>
    <div id="goods"> 
        <goods-list-item v-for="item in goods" :key="item.index" :goodsItem="item"></goods-list-item>
    </div>
</template>创建GoodsListItem.vue
```

2、在小项目块中实现业务逻辑

```javascript
    <div>
      <!-- 大图 -->
      <img :src="eachGoodInfo.show.img" alt="">
      <!-- 文字描述 -->
      <div class="goods-info">
      <p>{{eachGoodInfo.title}}</p>
      <span class="price">{{eachGoodInfo.price}}</span>
      <img src="../../../assets/img/common/collect.png" alt="">
      <span class="collect">{{eachGoodInfo.cfav}}</span>
      </div>
    </div>
```



### 2.7 better-scroll

 BetterScroll 是一款重点解决移动端（已支持 PC）各种滚动场景需求的插件 

**安装**

`npm i better-scroll --save`

**封装**

由于APP多处需要用到better-scroll，所以给这个插件专门封装在commonpents的common文件夹下

```javascript
<template>
  <div class="wrapper" ref="wrapper">
      <div class="content"> 
          <slot></slot>
      </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
    name:'Scroll',
    data () {
        return {
            scroll:0
        }
    },
    props:{
        // 由使用该组件者决定是否开启滚动监听，默认不开启
        probeType:{
            type:Number,
            default:0
        },
        // 由使用该组件者决定是否开启上拉加载更多，默认不开启
        pullUpLoad:{
            type:Boolean,
            default:false
        }
    },
    mounted () {
        this.scroll = new BScroll(this.$refs.wrapper,{
            click:true,
            probeType:this.probeType,//侦听滚动，0、1都是不侦测实时位置；2在手指滚动的过程中侦测；3手指滚动、手指离开后的惯性滚动都侦测
            pullUpLoad:this.pullUpLoad,
            observeDOM:true //开启对 scroll 区域 DOM 改变的探测。当插件被使用后，当 scroll 的 dom 元素发生时，将会触发 scroll 的 refresh 方法。
        })
    }
}
</script>
```

在Home.vue组件中使用该scroll组件，便可取消js原生滚动，使用Better-scroll的滚动效果

```javascript
<template>
    <scroll class="content">
        //被包裹在content滚动效果下的组件内容
    </scroll>
</template>

//注意：使用该插件时，必须滚动区域content设置固定的高度
<style>
    .content{
    position: absolute;
    top: 44px;
    bottom: 49px;
    right: 0;
    left: 0;
    overflow: hidden;
  }
</style>
```

### 2.8 Back-Top 组件

当页面滚动到一定位置后，显示出返回顶部的图标，点击即可回到顶部

因此，我们需要实时监听页面的滚动位置，Better-scroll提供了probeType这个属性来监听页面滚动，由于我们在scroll.vue中设置props来接收probeType，所以需要从home.vue中传值过来

`<scroll class="content" :probeType="3">`

在scroll.vue中开启位置监听，并将位置position传递给父组件Home.vue

```javascript
    mounted () {
        //监听滚动位置
        this.scroll.on('scroll',(position)=>{
            this.$emit('getpos',position); //将位置信息传递给父组件
        })
    }
```

home.vue接受通过监听getpos，获取position

```javascript
<scroll class="content" :probeType="3" @getpos="getPostion">
    
    data () {
        isShowBackTop:false //决定是否显示BackTop图片，由getPostion函数获取到的位置>1000决定
      },

	methods: {
      // 获取bsroll的滚动位置
      getPostion(position){
        this.isShowBackTop = (-position.y)>1000 //滚动位置大于1000时，isShowBackTop为true
      }
    }
```

由此，我们已经获取到了isShowBackTop，可以来决定Back-Top组件是否显示

接下来，封装组件

```javascript
//在BackTop.vue中

<template>
  <div class="back-top">
      <img src="../../../assets/img/common/top.png" alt="">
  </div>
</template>

//Home.vue
<back-top v-show='isShowBackTop' />
```

下一步需要给BackTop组件绑定一个单击事件，当发生点击时，调用scroll组件中scroll实例的scrollTo函数，返回顶部

`<back-top @click.native="backClick" v-show="isShowBackTop"/>`

通过.native属性监听组件根元素的原生事件

```javascript
methods:{
	// 调用scroll组件中的scrollTo函数
      backClick(){
        this.$refs.scroll.scrollTo(0,0)
      }
}
```

这里的this.$refs.scroll永远指向的时页面中有ref="scroll"的组件，我们给的时scroll绑定了ref="scroll"，

这样子我们就可以this.$refs.scroll来访问到scroll组件

```javascript
    methods:{
        scrollTo(x,y,time=400){
            // 将scroll实例的scrollTO函数的调用，封装成scrollTo函数，方便外部调用
            this.scroll.scrollTo(x,y,time)
        }
    }
```

最后，我们通过`this.$refs.scroll.scrollTo(0,0)`调用了scroll中的scrollTo函数



### 2.9 首页细节完善

**1、上拉加载更多**

首先需要做的是启用better-scroll的pullUpLoad，通过Home.vue中的scroll标签

`<scroll  :pullUpLoad="true" '>`

```javascript
        //启动上拉加载更多
        this.scroll.on('pullingUp',()=>{
            this.$emit('pullingUp') 
            // console.log("加载更多");
        })
```

之后通过监听从scroll组件发送过来的pullingUp事件，来操作loadMore函数

```javascript
<scroll class="content" :probeType="3" @getpos="getPostion" ref="scroll" :pullUpLoad="true" @pullingUp='loadMore'>
```

调用loadMore函数，再一次触发methods中获取商品网络请求的信息的函数getGoodsInfo，每一次调用，都会使page+1，并且往goods增加新一页的所有商品。

```javascript
      // 上拉加载更多
      loadMore(){
        console.log("上拉加载更多",this.currentType);
        this.getGoodsInfo(this.currentType);
        this.$refs.scroll.scroll.refresh()
          ////当触发上拉加载更多后，重新刷新scroll，重新计算页面高度，以解决无法继续下拉的bug
      },

```

由于better-scroll的pullUpLoad只触发一次，就停用，为了可以多次加载更多商品数据，我们需要在每次执行getGoodsInfo函数时，在一次重置pullUpLoad

```javascript
      getGoodsInfo(type){
          ....
          this.$refs.scroll.scroll.finishPullUp() //再次调用上拉加载更多
      }
```



**2、切换Tab-Control**

我们不能简简单单给Home.vue组件的Tab-Control绑定上` @click.native="tabClick"`，这样确实能监听到Tab-Control组件发生了点击，但却没办法辨别点击了哪一个选项

重新回到Tab-Control组件中，将每次点击的选项的index传出来

```javascript
    methods: {
        changeTabItem(index){
            this.currentIndex = index //1、当点击选项时，将currentIndex 与index相等，从而将：class变为true

            this.$emit('tabClick',index) //2、当点击该组件时，将对应的index，绑定在tabClick事件上传出去
        }
    }
```

然后通过监听tabClick，来获取用户点击的选项的index

```javascript
      tabClick(index){       //切换tab-control
        console.log(index);
      }
```

当用户点击对应的index时，将currentIndex改成相应的title

```javascript
		tabClick(index){   //切换tab-control
        switch(index){
          case 0:
            this.currentType = 'pop'
            break;
          case 1:
            this.currentType = 'new'
            break;
          case 2:
            this.currentType = 'sell'
            break;
        }
      }
```

这里为什么切换currentIndex的值，就可以访问到不同的商品呢?

```javascript
currentType:'pop', // 默认传给GoodsList组件显示的商品类型

<goods-list :goods="goods[currentType].list"/> 
//我们在这里向goods-list组件传了goods,改变currentType就可以改变goods的内容
```



**3、切换路由保存原存状态**

将`<routre-view />`放在`<keep-alive>`中，可以使被包含的组件保留状态，避免重新渲染

在data中定义`saveY：0`用于保存页面滚动的y轴位置

```javascript
    // 页面活跃时
    activated () {
      // console.log("home处于活跃状态");
      this.$refs.scroll.refresh();
      this.$refs.scroll.scrollTo(0,this.saveY,0)
    },
    //页面不活跃时
    deactivated () {
      // console.log('home处于不活跃状态');
      // 不活跃时，将home的位置保存下来
      this.saveY=this.$refs.scroll.scroll.y
      console.log(this.saveY);
    }
```

当页面处于不活跃状态时，将页面的滚动位置保存在this.saveY中，之后页面处于活跃时，将调用scroll中的scrollTo函数，跳转到对应的位置(0秒内)



**4、tab-control的吸顶效果**

由于tab-control被纳入了better-scroll中，所以原生js的 position:sticky 或者 position:fixed 会失效

解决：制作两个tab-control组件，一个放better-scroll外边，一个放里边。当外边的tab-control滚动里边的相同位置时（v-show:true），启动吸顶效果，同时通过视觉上替换掉里边的tab-control

首先，我们需要计算滚动到哪一个位置时，把外tab-control组件的v-show改为true，我们通过offsettop来确定该距离（注意： 只有元素show（渲染完成）才会计算入offsetTop ，所以轮播图的图片未被加载出来时，计算的offsettop是不准确的）

ps(offsetTop:当前对象到其上级层顶部的距离)

监听Home-Swiper组件的图片是否加载出来

```javascript
      <swiper>
      <SwiperItem v-for="item in banners" :key="item.index">
        <a :href="item.link">
          <img :src="item.image" alt="" @load="imageLoad">
              // 当整个页面及所有依赖资源如样式表和图片都已完成加载时，将触发load事件。
        </a>
      </SwiperItem>
    </swiper>

	data(){
        return{
            isLoad:false
        }
    },
    methods:{
        imageLoad(){
        if(!this.isLoad){
           this.$emit('swiperImageLoad')  //这里只需要发送一次图片，就可以得到我们想要的tabcontrol的offsettop，没必要发送四次，浪费了性能
            this.isLoad=true
        }
        }
    }    
```

在Home.vue组件中监听swiperImageLoad事件

```javascript
<home-swiper :banners='banners'  
class="home-swiper" @swiperImageLoad="swiperImageLoad"/>
    
  swiperImageLoad(){
    this.tabOffsetTop=this.$refs.tabControl.$el.offsetTop;  
    //所有的组件都有一个$el属性，用于获取组件中的元素 (这里获取了tabcontrol的值)
  },
```

swiperImageLoad确实执行，说明轮播图的图片确实被加载出来了，因此可以为tabOffsetTop赋值

定义：`tabOffsetTop:0`、`isShowTabControl:false`

```javascript
      // 获取bsroll的滚动位置
      getPostion(position){
        this.isShowBackTop = (-position.y)>1000 //滚动位置大于1000时，isShowBackTop为true
          
        this.isShowTabControl = (-position.y)>this.tabOffsetTop 
      },
```

注意：如果获取到的tabOffsetTop还是错误的，那也有可能时因为recommend组件的图片没被加载出来。我们需要同时监听recommend组件与home-swiper组件的图片是否加载完成

```javascript
      //监听home-swiper图片是否加载完成,完成则调用recommendLoad函数
      swiperImgLoad(){
        this.isLoad = true; //在data中定义isLoad = false
      },      

      //监听recommend图片是否加载完成
      recommendLoad(){
        if(this.isLoad){
        this.tabOffsetTop = this.$refs.InTabControl.$el.offsetTop;
        //所有的组件都有一个$el属性，用于获取组件中的元素 (这里获取了tabcontrol的值)
        console.log(this.tabOffsetTop);
        }
      },
```

当以上步骤完成，给外部的tab-control添加上样式

```javascript
  .tab-control-out{
    position: relative;
    z-index: 9;
    top:-0.5px
  }
```

这样一来，该组件的吸顶效果基本实现了。

剩下的问题就是统一内外部tab-Control的选项点击显示了

```javascript
      //切换tab-control
      tabClick(index){
        switch(index){
          case 0:
            this.currentType = 'pop'
            break;
          case 1:
            this.currentType = 'new'
            break;
          case 2:
            this.currentType = 'sell'
            break;
        }
    //  保证两个tab-control可以保持一致
    this.$refs.outTabControl.currentIndex=index;
    this.$refs.InTabControl.currentIndex=index;
      }
```



项目到这里，home组件的基本功能已经全部实现	



##  3、Detail 详情页

### 3.1 基本搭建

```javascript
  //把Detail排除在外，才能保证不会每次从详情页退出，详情页会被保留，点击任意商品重复进入之前的详情页面，而不会根据iid进行刷新
	<keep-alive exclude="Detail">
  	<router-view /> <!-- 将对应路径的组件显示出来-->
  	</keep-alive>
```

在view文件夹中，创建detail>Detail.vue，并在router>inedx.js进行路由配置

```javascript
const Detail =()=>import('../view/detail/Detail')

const routes =[
    // 一个对象是一个映射关系,对应一个组件
    { path: '/detail/:iid', component: Detail } //详情页路由 /:接收参数
]
```

在GoodsListItem组件中，给商品添加路由跳转，并传递每件商品特有的iid

```javascript
    methods: {
      changeRouter(){
        this.$router.push('/detail/'+this.eachGoodInfo.iid)
        // console.log(this.$route.params.iid);
        // 访问当前的路由的iid
          }
      }
```

在Detail组件中，传递iid

```javascript
<script>
export default {
    name:'Detail',
    data () {
      return {
        iid:null //每件商品专有iid
      }
    },
    created () {
      //组件创建时，将路由的iid给data
      this.iid = this.$route.params.iid; 
    }
}
</script>
```

创建childComps文件夹，用来存放详情页的子组件



**详情页的nav-bar**

由于之前已经封装了Nav-bar组件，我们可以在详情页复用这个组件

在detail>childComps创建DetailNavBar组件(很多步骤与前同，略写)

```javascript
      <nav-bar class="nav-bar">
          <!-- 左边返回首页 -->
          <div slot="left" class="back">
              <img src="../../../assets/img/common/back.svg" alt="">
          </div>

          <!-- 中间的参数 -->
          <div slot="center" class="title">
              <div v-for="(item,index) in titles" 
              :key="item.index" 
              :class="{active:index == currentIndex}"
              @click="changeBtnColor(index)"
              class="title-item">{{item}}</div>
          </div>
      </nav-bar>      <nav-bar class="nav-bar">
          <!-- 左边返回首页 -->
          <div slot="left" class="back">
              <img src="../../../assets/img/common/back.svg" alt="">
          </div>

          <!-- 中间的参数 -->
          <div slot="center" class="title">
              <div v-for="(item,index) in titles" 
              :key="item.index" 
              :class="{active:index == currentIndex}"
              @click="changeBtnColor(index)"
              class="title-item">{{item}}</div>
          </div>
      </nav-bar>

    data () {
        return {
            titles:["商品","参数","评论","推荐"],
            currentIndex:0
        }
    },
    methods:{
        changeBtnColor(index){
            this.currentIndex = index
        }
    }
```

点击详情页的箭头图片返回首页

```javascript
<img src="../../../assets/img/common/back.svg" alt="" @click="btnBack">

methods:{
        btnBack(){
          // 点击返回首页
          this.$router.back();
        }    
}
```



### 3.2 详情页swiper

在Detail>childComps中创建Detailswiper,并在该子组件中导入之前定义好的Swiper,SwiperItem组件

此时，Detailswiper组件中还没有对应idd商品的数据，我们可以统一在Detail发送网络请求，获得详情页的数据，并发送到Detailswiper组件中

**发送网络请求**

```javascript
import {request} from './request'

export function getDetail(iid){
    return request({
        url:'/detail',
        params:{
            iid
        }
    })
}
```

商品url：http://152.136.185.210:7878/api/m5/detail?iid=1jw0sr2

当我们在detail调用getDetail()函数时，将路由返回的iid传入函数中，该函数将向着url返回数据

```javascript
      //当在network>detail文件夹中配置完之后，可以在详情页组件调用获取数据的函数
      getDetail(this.$route.params.iid).then(res=>{
        console.log(res);
      })
```

在detail中定义topImage，用来存放轮播图的数据

```javascript
      getDetail(this.$route.params.iid).then(res=>{
        console.log(res);
        this.topImage = res.result.itemInfo.topImages //存入数据
      })
```

将detail中获取到的topImage传入轮播图子组件

```javascript
<template>
<div id="swiper">
    <swiper>
        <swiper-item v-for="item in topImage" :key="item.index">
            <img :src="item" alt="">
        </swiper-item>
    </swiper>
</div>
</template>
```



### 3.3 基本信息与商家信息

由于该res数据十分复杂，我们可以把我们需要的数据封装为一个类，其他数据就可以忽略了

该res给我们返回的数据中，我们只需要用到其中的itemInfo,services,columns

在detail.js中定义类

```javascript
// 将我们detailBaseInfo组件所需的数据通过定义一个类，然后导出出去
export class BaseInfo {
    constructor (itemInfo,services,columns) {
      this.desc = itemInfo.desc;
      this.discountDesc = itemInfo.discountDesc;  //活动
      this.NowPrice = itemInfo.lowNowPrice;  //现在的价格
      this.oldPrice = itemInfo.oldPrice;  //活动前价格
      this.newPrice = itemInfo.price;  //新价格
      this.title = itemInfo.title;   //标题
      this.realPrice = itemInfo.lowNowPrice //用于购物车显示的价格
      this.columns = columns;   
      this.services = services;
    }
  }
```

在detail获取BaseInfo

```javascript
 getDetail(this.$route.params.iid).then(res=>{
        console.log(res);
        //轮播图图片
        this.topImage = res.result.itemInfo.topImages 

        //商品基本信息
        let data = res.result
        this.baseInfo = new BaseInfo(data.itemInfo,data.shopInfo.services,data.columns)
      })
```

在DetailBaseInfo组件中使用父组件传进来的数据

```javascript
<template>
  <div class="base-info" v-if="baseInfo"> <!-- 判断baseInfo是否是空的，空的就不渲染了-->
  <!-- 标题 -->
  <div class="title">{{baseInfo.title}}</div>
  <!-- 价格 -->
  <div class="price-info">
    <span class="NowPrice">￥{{baseInfo.NowPrice}}</span>
    <span class="oldPrice">{{baseInfo.oldPrice}}</span>
    <span class="discount">{{baseInfo.discountDesc}}</span>
  </div>
  <!-- 销量 收藏 模块 -->
  <div class="services">
    <span>{{baseInfo.columns[0]}}</span>
    <span>{{baseInfo.columns[1]}}</span>
    <span>{{baseInfo.columns[2]}}</span>
  </div>
  <!-- 无理由退货、发货模块 -->
  <div class="other-info">
    <span><img :src="baseInfo.services[0].icon" alt="">{{baseInfo.services[0].name}}</span>
    <span><img :src="baseInfo.services[1].icon" alt="">{{baseInfo.services[1].name}}</span>
  </div>
  </div>
</template>
```

商家信息部分与基本信息部分基本一致

同样为了节约代码量，我们可以现在detail.js中定义一个shopInfo的类

```javascript
//将店铺信息数据获取定义为一个类
export class shopInfo{
    constructor(shopInfo){
        this.name = shopInfo.name;
        this.shopLogo = shopInfo.shopLogo;
        this.fans = shopInfo.cFans;
        this.goods = shopInfo.cGoods;
        this.score = shopInfo.score;
        this.cSell = shopInfo.cSells;
    }
}
```

在详情页组件中

```javascript
    created () {
      //组件创建时，将路由的iid给data
      this.iid = this.$route.params.iid;
      
      //当在network>detail文件夹中配置完之后，可以在详情页组件调用获取数据的函数
      //根据iid获取到了商品数据res
      getDetail(this.$route.params.iid).then(res=>{
        console.log(res);
        //轮播图图片
        this.topImage = res.result.itemInfo.topImages 

        //商品基本信息
        let data = res.result
        this.baseInfo = new BaseInfo(data.itemInfo,data.shopInfo.services,data.columns)

        //获取商家信息
        this.shopInfo = new shopInfo(data.shopInfo)
      })
    }
```

最后在childComps文件夹下创建DetailShopInfo组件，并应用获取到的shopInfo信息

```javascript
<template>
  <div class="shopinfo" v-if="shopInfo"> //v-if="shopInfo"为判断shopInfo是否为空，空时停止渲染
      <!-- 商店logo与图片 -->
      <div class="shop-name-logo">
          <img :src="shopInfo.shopLogo" alt="">
          <span>{{shopInfo.name}}</span>
      </div>
    <!-- 商家的相关信息面板 -->
      <div class="allShopInfo">
          <!-- 左边的销量与全部宝贝数据 -->
          <div class="sell-info">
              <p class="sell-data">{{shopInfo.cSell | sellCountFilter}}</p> <!-- 过滤器函数总接收表达式的值作为第一个参数-->
              <p class="sell-word">总销量</p>
          </div>

          <div class="allGoods">
              <p class="goods-data">{{shopInfo.goods}}</p>
              <p class="goods-word">全部宝贝</p>
          </div>

          <!-- 右边的商店评分数据 -->
          <div class="score-info">
              <p v-for="item in shopInfo.score" :key="item.index">
                  <span>{{item.name}}</span>
                  <span class="shopScore" :style="changeColor(item.isBetter)">{{item.score}}</span>
                
              </p>
          </div>
          <!-- 店铺评分的高低 -->
            <div class="score-info2">
                <p v-for="item in shopInfo.score" :key="item.index">
                <span v-if="item.isBetter" class="score-height">高</span>
                  <span v-else class="score-low">低</span>
                </p>
            </div>

      </div>
                <!-- 进店按钮 -->
    <div class="shopBtn"><button>进店逛逛</button></div>   
  </div>
</template>
```

### 3.4 详情图与参数

在detail请求数据，存入detailInfo

```javascript
    created () {
      //组件创建时，将路由的iid给data
      this.iid = this.$route.params.iid;
      //根据iid获取到了商品数据res
      getDetail(this.$route.params.iid).then(res=>{
        console.log(res);

        //商品基本信息
        let data = res.result

        //获取商品图片
        this.detailInfo = data.detailInfo
      })
    }
```

在子组件文件夹中创建DetailGoodsInfo.vue组件

```javascript
<template>
<div v-if="detailInfo"> 
    <!-- 文字描述 -->
<div class="text">
    <div class="left-line"></div>
    <div class="text-content">{{detailInfo.desc}}</div>
    <div class="right-line"></div>
</div>

    <!-- 图片 -->
    <div class="wearer-effect">
        <div v-for="item in detailInfo.detailImage[0].list" :key="item.index" class="goodsImage">
            <img :src="item" alt="">
        </div>
    </div>
</div>
  
</template>
```

获取商品参数信息

```javascript
  // 定义详情页的商品参数的类
  export class GoodsParam{
    constructor(info,rule){
      // 注：images可能没有值（某些商品有值，某些没有）
      this.image = info.images ? info.images[0] : '';
      this.infos = info.set;
      this.sizes = rule.tables;
    }
  }
```

参数信息与上边功能的实现原理基本一致，这里就不展开说明



### 3.5 评论与猜你喜欢

创建DetailCommentInfo.vue

在detail中发送网络请求获得用户评论的数据

```javascript
created () {
      //组件创建时，将路由的iid给data
      this.iid = this.$route.params.iid;
      //根据iid获取到了商品数据res
      getDetail(this.$route.params.iid).then(res=>{
        console.log(res);
        let data = res.result
        // 获取商品评论信息
        if(data.rate.Crate !==0){
          this.commemtInfo = data.rate.list[0]
        }
      })
```

这里有一个重要知识点：就是将时间戳（即用户发表评论的时间），通过过滤器将其格式转为年/月/日/具体时间

由于经常有这样的需求，我们可以将转换格式的代码封装成一个独立的js文件：common>utils.js

具体代码如下

```javascript
// 时间格式化
  export function formatDate(date, fmt) {
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
  
    let o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds()
    };
  
    for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        let str = o[k] + "";
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str));
      }
    }
  
    return fmt;
  }
```

在用户评论子组件中使用数据

```javascript
<template>
  <div id="comment-info" v-if="commemtInfo">
      <!-- 评论——更多 -->
      <div class="more">
          <span>用户评价</span>
          <span>更多</span>
      </div>

      <!-- 用户信息 -->
      <div class="user">
          <img :src="commemtInfo.user.avatar" alt="">
          <span>{{commemtInfo.user.uname}}</span>
      </div>

      <!-- 评论部分 -->
      <div class="content">
          {{commemtInfo.content}}
      </div>

      <!-- 购买信息 -->
      <div class="detail">
          <span>{{commemtInfo.created |getData}}</span>
          <span>{{commemtInfo.style}}</span>
      </div>
  </div>
</template>

<script>
import {formatDate} from '../../../common/utils'

export default {
    name:'DetailCommentInfo',
    props:{
        commemtInfo:{
            type:Object,
            default(){
                return {}
            }
        }
    },
    filters: {
    getData: value => {
      // 将ms转化成固定格式
      let date = new Date(value * 1000);
      return formatDate(date,'yyyy-MM-dd hh:mm');
    }
  }
}
</script>
```

**商品展示**

由于商品展示的数据存放于另外url：http://152.136.185.210:7878/api/m5/recommend

所以我们需要重新配置发送网络请求

```javascript
import {request} from './request'

  //获取详情页商品展示的数据
  export function getDetailGoodsList(){
      return request({
          url:'/recommend'
      })
  }
```

在详情页获取数据并存入detailGoodsList

```javascript
        // 获取商品展示的数据
        getDetailGoodsList().then(res=>{
          this.detailGoodsList = res.data.list
        })
```

由于之前我们封装过了GoodsList.vue组件，这里我们可以复用这个组件

```javascript
    <goods-list :goods="detailGoodsList"/>
        //将数据传给GoodsList.vue中的goods
```

这里有一个问题，就是在由于home组件、detail组件同时使用了GoodsList.vue组件，但是在传数据给GoodsListItem时，两者传入的eachGoodInfo存放图片的位置不一样，所以我们需要在GoodsListItem组件中进行判断

```javascript
    computed: {
      showImage(){
            // 因为该组件被首页和详情页复用了，但是两者的goodsItem图片放在不同的位置，所以要做判断
            return this.eachGoodInfo.image||this.eachGoodInfo.show.img 
    }
    }

	<img :src="showImage" alt="" @click="changeRouter">
```

###  3.6 scroll滚动优化

导入之前封装好的scroll组件，并进行相关的设置

```javascript
    <scroll class="content" ref="scroll" :probeType="3" :pullUpLoad="true">
        ....
    </scroll>

	<style>
        .content{
          position: absolute;
          top: 44px;
          bottom: 49px;
          right: 0;
          left: 0;
          overflow: hidden;
        }
	</style>
```

**back-top**

在详情页复用之前的BackTop组件

```javascript
<back-top  v-show="isShowBackTop"/>
    //由isShowBackTop决定是否显示该组件
```

开启better-scroll的滚动监听，并将scroll传出的滚动监听事件绑定对应的方法

```javascript
<scroll class="content" ref="scroll" :probeType="3"  @getpos="getpos">
    
methods:{
    getpos(){
        this.isShowBackTop = (-position.y)>1000
        //当页面y轴滚动位置超过1000时，isShowBackTop为true，显示backtop
    }
}
```

为BackTop绑定单击响应函数

```javascript
<back-top v-show="isShowBackTop" @click.native="ClickBack"/>
    
methods:{
    ClickBack(){
        this.$refs.scroll.scrollTo(0,0)
        //找到并调用scroll组件中scrollTo函数
    }
}
```

**DetailNavBar优化**

实现效果：但我们点击NavBar的标题["商品","参数","评论","推荐"]时，页面跳转到对应的位置

实现这一功能，我们需要知道每个title具体的offsettop,点击时调用scroll的scrollTo（0，offsetTop），但是由于详情页的图片加载存在延时，当我们直接去获取各个title的垂直偏移量时，可能是没把图片的高度加进去的

解决方案：在图片加载完后在计算垂直偏移量

分别为三个title的组件添加ref

```javascript
    <detail-params :GoodsParam="GoodsParam" ref="params"/>
    <detail-comment-info :commemtInfo="commemtInfo" ref="comment"/>
    <goods-list :goods="detailGoodsList" ref="showgoods"/>
```

监听DetailGoodsList组件img的加载情况——@load

```javascript
    <!-- 图片 -->
    <div class="wearer-effect">
        <div v-for="item in detailInfo.detailImage[0].list" :key="item.index" class="goodsImage">
            <img :src="item" alt="" @load="imgLoad">
        </div>
    </div>
	
	methods:{
        imgLoad(){
            this.$emit('imgLoad') //每下载好一张图片，发射一次
            // console.log('打印好了一张照片'); //执行了（图片的张数）次
        }
    }
```

在详情页为imgLoad事件绑定响应函数

`<detail-goods-info :detailInfo="detailInfo" @imgLoad="imgLoad"/>`

创建`offsetTopTitle`（数组)，专门用来保存["商品","参数","评论","推荐"]的垂直偏移量

```javascript
methods:{
    // 监听图片是否加载完成
      imgLoad(){
        this.$refs.scroll.refresh(); // 每次有一张图片加载完成，重新刷新一次页面

        this.offsetTopTitle = []
        this.offsetTopTitle.push(0); // 商品的offsettop
        this.offsetTopTitle.push(this.$refs.params.$el.offsetTop)
        this.offsetTopTitle.push(this.$refs.comment.$el.offsetTop)
        this.offsetTopTitle.push(this.$refs.showgoods.$el.offsetTop)
        //console.log(this.offsetTopTitle);
      }
}
```

在DetailNavBar组件中 ，将用户点击了那个title的index发送去

```javascript
    methods:{
        changeBtnColor(index){
            this.currentIndex = index
            // 将index发送出去
            this.$emit('changePos',index)
        },
```

在详情页监听changePos事件

```javascript
<detail-nav-bar @changePos="changeNavPos"/>
    
methods:{
      //点击nav，传递响应的index，并将对应index的offsetTopTitle进行滚动
      changeNavPos(index){
        this.$refs.scroll.scrollTo(0,-this.offsetTopTitle[index])
      }
}
```

这样子，用户点击任意title，index会传给详情页，并找到对应的offsetTop进行跳转

**随着滚动位置改变NavBar颜色**

我们在此处已知DetailNavBar中各个title的offsetTop，已知title的颜色由DetailNavBar中的currentIndex控制

那么我们可以通过控制滚动(-position.y)在0~offsetTop[0]、offsetTop[0]~offsetTop[1]...来改变currentIndex,从而改变颜色

为DetailNavBar组件绑定ref，并监听scroll的滚动

```javascript
<detail-nav-bar @changePos="changeNavPos" ref="nav"/>

<scroll class="content" ref="scroll" :probeType="3" :pullUpLoad="true" @getpos="getpos">
```

在getpos中实现业务逻辑

```javascript
getpos(position){
        //1. 决定是否显示BackTop图标
        this.isShowBackTop = (-position.y)>1000;

        // 2. 监听position滚动到的位置，改变nav-bar中的currentIndex
        const positionY = -position.y;
            if(positionY>=0 && positionY<this.offsetTopTitle[1]){
                this.$refs.nav.currentIndex=0
            }
            else if(positionY>=this.offsetTopTitle[1] && positionY<this.offsetTopTitle[2]){
                this.$refs.nav.currentIndex=1
            }
            else if(positionY>=this.offsetTopTitle[2] && positionY<this.offsetTopTitle[3]){
                this.$refs.nav.currentIndex=2
            }
            else if(positionY>=this.offsetTopTitle[3]){
                this.$refs.nav.currentIndex=3
            }
      }
```



### 3.7 详情页的BottomTabbar

当我们进入详情页时，不希望使用的还是原来首页的tabbar，而是另外的一个DetailTabBar

由于mainTabbar时设置在App.vue中的，路由跳转到哪里都存在，所以我们可以通过样式将其遮住

```javascript
#detail{
    position: relative;
    z-index: 30; //层次要比maintabbar的高
    background-color: #fff;
    height: 100vh;
}
```

重新封装一个用于detail页面的DetailBottomBar

```javascript
<template>
  <div class="bottom-bar">
      <div class="customer-service">
          <img src="../../../assets/img/detail/service.png" alt="">
          <p>客服</p>         
      </div>
      <div class="store">
          <img src="../../../assets/img/detail/store.png" alt="">
          <p>店铺</p>
      </div>
      <div class="collect">
          <img src="../../../assets/img/detail/collect.png" alt="">
          <p>收藏</p>
      </div>
      <div id="shopping-cart">
          <p>加入购物车</p>
      </div>
      <div id="purchase">
          <p>购买</p>
      </div>
  </div>
</template>
```



##  4、购物车

### 4.1 配置Vuex

购物车页面使用了Vuex，通过将详情页的商品数据保存到Vuex，再通过Vuex传给购物车

安装Vuex `npm install vuex --save`

基本配置

```javascript
import Vuex from 'vuex'
import Vue from 'vue'

// 使用Vuex
Vue.use(Vuex);

export default new Vuex.Store({
    state:{},
    mutations:{}
})

//在main.js入口文件应用
import store from './store'
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

实现功能：点击“加入购物车”字样，创建一个包含详情页商品数据的对象，并发送至Vuex的state中

```javascript
//找到DetailBottomBar，将点击“加入购物车”的事件发送出去
      <div id="shopping-cart">
          <p @click="addCart">加入购物车</p>
      </div>

    methods: {
        addCart(){
            this.$emit('addCart')
        }
```

在详情页接收数据

```javascript
	<detail-bottom-bar @addCart="addCart"/>
    methods:{
      //将商品的信息传递到store
      addCart(){
        console.log("谁点我");
      }
    }
```

具体的代码如下

```javascript
methods:{
      //将商品的信息传递到store
      addCart(){
        // console.log("谁点我");
        // 将需要展示在封装成一个对象传到store中
        const product = {};
        product.image = this.topImage[0];
        product.title = this.baseInfo.title;
        product.desc = this.baseInfo.desc;
        product.price = this.baseInfo.realPrice;
        product.iid = this.iid;
        product.checked = false //自定义属性，false表示商品处于未加入购物车状态

        //发送至store
        this.$store.commit('addCart',product)
      }
}
```

在store中接收

```javascript
export default new Vuex.Store({
    state:{
        // 购物车数据
        cartList:[]
    },
    mutations:{
        addCart(state,payload){
            state.cartList.push(payload)
        }
    }
})
```

### 4.2 CartList组件

下边需要做的就是将商品cartList从score中取出，在cart中展示。在Cart文件夹中创建childComps文件夹，用于存放子组件

```javascript
//CartList组件
    data () {
        return {
            //返回保存在store中的数据
            cartList:this.$store.state.cartList
        }
    }
//取出数据，传给CartLIstItem组件
  <div class="cart-list">
      <cart-list-item v-for="item in cartList" :key="item.index" :cartListItem="item" />
  </div>
```

在CartLIstItem组件中实现购物车的结构样式

```javascript
<template>
  <div class="list-item">
      <!-- 是否选中商品 -->
        <div class="check-button">
            按钮
        </div>

      <!-- 图片 -->
      <div class="left-info">
          <img :src="cartListItem.image" alt="">
      </div>

      <!-- 右边的信息 -->
      <div class="right-info">
          <p class="title">{{cartListItem.title}}</p>
          <p class="desc">{{cartListItem.desc}}</p>
          <p class="price-count">
              <span>￥{{cartListItem.price}}</span>
          </p>
      </div>

  </div>
</template>
```

但是我们怎么知道用户到底往购物车中添加了几个同类商品呢？

现阶段下，就算用户点击了多次添加入购物车，同一个商品会在购物车中显示多次，这显然不是我们想要的结果。我们想要当用户多次添加的是同一个商品，只需要把商品的count增加1，并在购物车中显示出来

```javascript
export default new Vuex.Store({
    state:{
        // 购物车数据
        cartList:[]
    },
    mutations:{
        addCart(state,payload){
            // state.cartList.push(payload)
            let sameProduct = null; //初始化变量sameProduct为空
            //遍历出cartList中的每一件商品，如果cartList中的商品有跟payload一样的iid，说明存在同类商品，这时候给sameProduct赋值
            for(let item of state.cartList){
                if(payload.iid ==item.iid){
                    sameProduct = item //说明存在同类商品，为sameProduct赋值
                }
            }
            
            if(sameProduct){ //sameProduct有值，为true
                sameProduct.count+=1; 
            }else{
                //如果sameProduct为空，说明不存在同类商品，则为新添加进的商品添加count=1属性，并把该商品加入购物车
                payload.count = 1;
                state.cartList.push(payload)
            }          
        }
    },
})
```

**checkButon**

该按钮是CartListItem的子组件（即我们把按钮封装成了一个独立的组件）

```javascript
<template>
  <div class="check-button">
      <img src="../../../assets/img/common/checkButton.png" alt="">
  </div>
</template>
```

由外界动态决定checkButon的颜色（是否添加active样式）

```javascript
  <div class="check-button" :class="{active:isChecked}">
      <img src="../../../assets/img/common/checkButton.png" alt="">
  </div>

methods:{
    props:{
        isChecked:{
            type:Boolean
            //当外界传进来的isChecked为true时，active样式就会被添加上去
        }
    }
}
```

在CartListItem中，我们接收到了每一件添加进购物车商品cartListItem，cartListItem包含了一个checked的属性，默认为false

```javascript
//在CartListItem.vue中
//为checkbutton添加单击事件，点击则为cartListItem的checked取反，并传给并传给checkButton组件
<check-button @click.native="changeButton" :isChecked="cartListItem.checked" />

    props:{
        cartListItem:{
            type:Object,
            default(){
                return {}
            }
        }
    },
    methods:{
      changeButton(){
        this.cartListItem.checked = !this.cartListItem.checked 
      } 
    }
    
```

这样子，checkButon的颜色就有我们的点击决定了



**购物车商品纳入better-scroll中**

```javascript
      <!-- 加购的商品 -->
      <scroll class="content" :pullUpLoad="true" ref="scroll" :probeType="3">
      <cart-list></cart-list>
      </scroll>
		//需要设置content为固定高度
methods:{
    activated () {
      this.$refs.scroll.refresh(); //页面处于活跃状态时，重新刷新页面高度
    }
}
```



### 4.3 CartButtomBar 组件

即购物车商品的汇总，结算组件

```javascript
<template>
  <div class="bottom-bar">
      <!-- 全选按钮 -->
        <div class="select-all">
            <check-button class="check-btn"/>
            <span>全选</span>
        </div>

      <!-- 合计 -->
        <div class="sum-all">
            <p>合计：
                <span>￥</span>
            </p>
        </div>
      <!-- 去结算 -->
        <div class="buy-all">
            <p>
                去结算()
            </p>
        </div>
  </div>
</template>
```

剩下需要实现的功能有：点击全选全部商品改变颜色、合计所有选中的商品的价格、计算选中商品的数量...

**计算选中商品的数量**

```javascript
    <p>
    去结算({{checkLength}})
    </p>
	
//方法一：for遍历
computed: {
        checkLength(){
            let allNum = 0
            for(let item of this.$store.state.cartList){
                if(item.checked){
                    allNum++
                }
            }
            return allNum;
        }
    }

//方法二
checkLength(){
       return this.$store.state.cartList.filter(item => item.checked).length 
        },
```

**计算选中商品的总价格**

```javascript
//方法一：
// 计算选中商品的总价格
        totalPrice(){
            let allPrice = 0
            for(let item of this.$store.state.cartList){
                if(item.checked){
                    allPrice = allPrice+(item.price*item.count)
                }
            }
            return allPrice.toFixed(2);
        }

//方法二
        //计算商品的总价格
        totalPrice(){ 
            return this.$store.state.cartList.filter(item =>{
                return item.checked
            }).reduce((preValue,item)=>{   //reduce 用于计算数组的元素相加总和
                return preValue + item.price * item.count
            },0).toFixed(2)
        }
```

**全选按钮**

点击则全选购物车的所有商品、或者全部取消选中购物车的商品

```javascript
      <!-- 全选按钮 -->
        <div class="select-all">
            //注意计算属性是一种属性
            <check-button class="check-btn" :isChecked="isSelectAll" @click.native="checkClick"/>
            <span>全选</span>
        </div>


computed:{
    // 控制全选按钮是否随着商品全选时呈现选中状态
    //注意：只要碰到了return语句，函数就会立即停止执行并退出
    isSelectAll(){
            if(this.$store.state.cartList.length ===0){
                return false //当购物车没有商品时，将全选按钮样式取消
            }

            for(let item of this.$store.state.cartList){
                if(!item.checked){ //当item.checked中有一个是false时，则返回false，并停止循环
                    return false
                }
            }
            return true
        }
}
methods:{
    checkClick(){
            if(this.isSelectAll){ //全部选中
                this.$store.state.cartList.forEach(item => item.checked = false)
            }else{ //部分或全部不选中
                this.$store.state.cartList.forEach(item => item.checked = true)
            }
        }
}
```



## 5、项目优化

### 5.1 解决移动端300毫秒延迟问题

FastClick——专门为解决移动端浏览器300毫秒点击延迟问题的一个轻量级的库

安装`npm install fastclick --save`

在main.js使用

```javascript
//导入fastclick插件，解决移动端浏览器300毫秒延迟问题
import fastClick from 'fastclick'
//使用
fastClick.attach(document.body)
```



### 5.2 图片懒加载

图片需要显示在屏幕中时再加载图片，为用户节省流量

安装`npm i vue-lazyload -s`

修改:src为v-lazy 
ps:如果想要为正在懒加载的图片占位区更改统一的图片,可以使用loading属性

在main.js中使用

本项目中主要在GoodsListItem.vue与DetailGoodsInfo.vue中使用

```javascript
import VueLazyLoad from 'vue-lazyload'

//使用
Vue.use(VueLazyLoad,{
  // 未加载完成时的占位图片
  // loading:require('./assets/img/common/placeholder.jpg)
})
```



### 5.3 Toast弹窗效果

封装一个Toast插件

在component>common中创建toast文件夹

创建Toast.vue

```javascript
<template>
  <div class="toast" v-show="isShow">
    <div>{{message}}</div>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  data () {
    return {
      message: '',
      isShow: false
    }
  },
  methods: {
    show (message, duration=2000) {
      this.message = message
      this.isShow = true
      setTimeout(() => {
        this.isShow = false
        this.message = ' '
      } ,duration)
    }
  }
}
</script>

<style scoped>
  .toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    padding: 6px 8px;
    background-color: rgba(0, 0, 0, .75);
    color: #fff;
    z-index: 999;
  }
</style>
```

在该文件夹下创建index.js

```javascript
// 导入组件
import Toast from './Toast'

const obj = {}

// main里安装了这个文件插件，就会自动执行install函数
obj.install = function (Vue) {
//   console.log('执行了install函数')
//   console.log(Toast.$el) //执行时，组件还没渲染完成，所以获得undefied

  // 如何添加组件
  //1、创建组件构造器
  const toastConstrustor = Vue.extend(Toast)

  // 2、new的方式，根据组件构造器创建组件对象
  const toast = new toastConstrustor();

  // 3、将组件对象，收到挂在到某一个元素上
  toast.$mount(document.createElement('div'))

  // 4、toast.$el对应就是div
  document.body.appendChild(toast.$el)

  Vue.prototype.$toast = toast  // 要等与我们构造器构造出来的对象
  // 现在就是全局都可以通过this.$toast来直接调取组件内的东西
}

export default obj
```

在main.js中调用封装好的toast插件

```javascript
// 3、导入toast.js文件
import toast from './components/common/toast/index'
// 安装插件
Vue.use(toast)  //安装完自动执行那边的install函数,而且默认传递Vue过去
```



找到DetailBottomBar.vue，在添加进购物车函数addCart()中就可以使用toast了 

```javascript
    methods:{
        addCart(){
            this.$emit('addCart')
            // 引用弹窗插件
            this.$toast.show('已加入购物车')
        }
    }
```





##  6、用户界面

由于该页面的功能未开发，重要的的是构建思路，将不详细的分析

 **nav-bar组件**

导入之前封装好的NavBar组件

```javascript
        <!-- 导航栏 -->
        <nav-bar class="profile-nav">
            <div slot="center">个人信息</div>
        </nav-bar>
```

并设置好相应的css样式

**profile-login 组件**

```javascript
<template>
  <div class="login">
      <!-- 头像 -->
      <div class="Head-portrait">
          <img src="../../../assets/img/profile/user.png" alt="">
      </div>

      <!-- 登录信息 -->
      <div class="login-detail" @click="loginClick">
          <p>
              <span>登录</span>
              /
              <span>注册</span>
          </p>
          <p class="phone">
              
              <img src="../../../assets/img/profile/phone.png" alt="">
              暂未绑定手机号
          </p>
      </div>

      <!-- 返回箭头 -->
      <div>
          <img src="../../../assets/img/profile/arrow_right.png" alt="">
      </div>
  </div>
</template>
```

**user-assets 组件**

用户资产组件

为了代码更容易维护，分别在childComps文件夹下创建UserAssets.vue与UserAssetsItem.vue

```javascript
//UserAssets.vue

<template>
<div class="user-assets">
    <user-assets-item :AssetsInfoItem="item" v-for="item in AssetsInfo" :key="item.index"/>
</div>
</template>

<script>
import UserAssetsItem from './UserAssetsItem' //导入用户资产子组件

export default {
    name:'UserAssets',
    components:{
        UserAssetsItem
    },
    data () {
        return {
            AssetsInfo:{
            money:{
                count:"0.00",
                desc:"我的余额",
                unit:"元"
            },
            discount:{
                count:0,
                desc:"我的优惠",
                unit:'个'
            },
            integral:{
                count:0,
                desc:'我的积分',
                unit:'分'
            }
            }
        }
    }
} 
</script>

//UserAssetsItem.vue

<template>
<div class="assets-item">
    <!-- 数量 -->
    <p class="num">
        <span class="count">{{AssetsInfoItem.count}}</span>
        <span class="unit">{{AssetsInfoItem.unit}}</span>
    </p>

    <!-- 资产名称 -->
    <p class="desc">{{AssetsInfoItem.desc}}</p>

</div>
</template>

<script>
export default {
    name:'UserAssetsItem',
    props:{
        AssetsInfoItem:{
            type:Object,
            default(){
                return {}
            }
        }
    }
}
</script>
```

**profile-list 组件**

```javascript
<template>
  <div class="profile-list">
      <profile-list-item>
          <div slot="image"><img src="../../../assets/img/profile/profile-user.png" alt=""></div>
          <div slot="text">我的消息</div>
      </profile-list-item>

      <profile-list-item>
          <div slot="image"><img src="../../../assets/img/profile/profile-integral.png" alt=""></div>
          <div slot="text">积分商城</div>
      </profile-list-item>

      <profile-list-item>
          <div slot="image"><img src="../../../assets/img/profile/profile-vip.png" alt=""></div>
          <div slot="text">会员卡</div>
      </profile-list-item>

      <profile-list-item>
          <div slot="image"><img src="../../../assets/img/profile/profile-good.png" alt=""></div>
          <div slot="text">点赞购物APP</div>
      </profile-list-item>


  </div>
</template>

<script>
import ProfileListItem from './ProfileListItem' 

export default {
    name:'ProfileList',
    components:{
        ProfileListItem
    }
}
</script>

// profile-list-item

<template>
<div class="assets-item">
    <!-- 数量 -->
    <p class="num">
        <span class="count">{{AssetsInfoItem.count}}</span>
        <span class="unit">{{AssetsInfoItem.unit}}</span>
    </p>

    <!-- 资产名称 -->
    <p class="desc">{{AssetsInfoItem.desc}}</p>

</div>
</template>

<script>
export default {
    name:'UserAssetsItem',
    props:{
        AssetsInfoItem:{
            type:Object,
            default(){
                return {}
            }
        }   
    }
}
</script>
```



## 7、分类界面

### 7.1 SlideBar 组件

侧边导航栏

封装发送网络请求的js文件category.js

```javascript
import {request} from './request' 

//获取侧边导航栏的数据
export function getCategory(){
    return request({
        url:'/category'
    })
}
```

在category文件夹下创建存放子组件的文件夹childComps，并创建侧边导航栏子组件SlideBar.vue

在category.vue文件中导入发送侧边导航栏网络请求的 getCategory函数，并把通过getSlideBarInfo函数调用该函数，将获得的数据保存在data中的SlideBarInfo中，代码如下

```javascript
<template>
  <div id="category"> 
      <nav-bar>
          <div slot="center">商品分类</div>
      </nav-bar>
      <slide-bar :SlideBarInfo="SlideBarInfo"/>
  </div>
</template>

<script>
import NavBar from '../../components/common/navbar/NavBar' //导入nav-bar组件

import {getCategory} from '../../network/category' //导入发送网络请求的函数

import SlideBar from './childComps/SlideBar' //导入侧边导航栏组件

export default {
    name:'Category',
    components: {
        NavBar,
        SlideBar
    },
    data () {
        return {
            SlideBarInfo:null, //侧边导航栏的数据
        }
    },
    created () {
        this.getSlideBarInfo(); //组件创建时，调用该函数
    },
    methods:{
        //调用网络请求函数，并把数据传进SlideBarInfo中
        getSlideBarInfo(){
            getCategory().then(res=>{
                this.SlideBarInfo = res.data.category
                console.log(res.data.category);
            })
        }
    }
}
</script>
```

将获得的数据发送给SlideBar.vue子组件

将数据在页面中展示出来，并添加功能：当点击哪一个li时，为其改变样式

```javascript
\\SlideBar.vue

<template>
  <div class="slide-bar">
      <scroll class="content" :pullUpLoad="true">
      <ul>
          <li v-for="(item,index) in SlideBarInfo" :key="item.index" :class="{active:currentIndex==index}" @click="changeBtn(index)">{{item.title}}</li>
      </ul>
      </scroll>
  </div>
</template>

<script>
import scroll from '../../../components/common/scroll/Scroll' //导入beter-scroll组件

export default {
    name:'SlideBar',
    components:{
        scroll
    },
    data () {
        return {
            currentIndex:true
        }
    },
    methods: {
        changeBtn(index){
            this.currentIndex = index
        }
    },
    props:{
        SlideBarInfo:{
            type:Array,
            default(){
                return []
            }
        }
    }
}
</script>
```

### 7.2 SubCategory 组件

我们所需要的数据保存在如下的url中

`http://152.136.185.210:7878/api/m5/subcategory?maitKey=3627`

配置发送网络请求的函数

```javascript
import {request} from './request' 

// 右侧图文等数据
export function getSubcategory (maitKey) {
    return request({
      url: '/subcategory',
      params: {
        maitKey
      }
    }).catch(err => err)
  }
```

当我们在调用getSubcategory发送网络请求获取数据时，需要接收maitKey参数，这个参数被包含在我们之前所获取到的侧边栏数据中（这里我们统一在methods中的getSlideBarInfo函数里maitKey函数，并传入我们新创建的网络请求函数getSubcategory中，然后将请求到的数据以数组的方式保存在data中SubCategoryInfo

```javascript
    methods:{
        //调用网络请求函数
        getSlideBarInfo(){
            //1、获取侧边导航栏数据，存入SlideBarInfo中
            getCategory().then(res=>{
                this.SlideBarInfo = res.data.category.list
                // console.log(res.data.category.list);

            //2、获取所有的maitKey，并传给getSubcategory网络请求函数，用来获取右边的图文信息
                for(let item of this.SlideBarInfo){
                    getSubcategory(item.maitKey).then(res=>{
                        this.SubCategoryInfo.push(res.data) //16个图文信息已保存在SubCategoryInfo中
                    })
                }
                console.log(this.SubCategoryInfo);
            })
        },
```

我们需要获得用户点击侧边栏的那一项的index和maitKey，才能决定subCategory显示什么

```javascript
	<li v-for="(item,index) in SlideBarInfo" :key="item.index" :class="{active:currentIndex==index}" @click="changeBtn(index,item)">{{item.title}}</li>    

	methods: {
        changeBtn(index){
            this.currentIndex = index;
            const obj={
                index, 
                maitKey:item.maitKey
            };
            this.$emit("btnClick",obj) //将点击侧边栏的索引和maitKey传出去，才知道用户点击了哪一个
        }
    },
```



## 8、项目总结

### 1、背景介绍

1、项目非原创的

项目是一个模仿蘑菇街的、基于vue全家桶的H5的前端项目

在学习vue时，在网上找了这个项目进行练习。

2、项目的优点

有完善的项目接口地址

功能与细节都比较完善，

3、对项目的改进

在把握了整个项目的每个技术要点后，对项目进行了一些改进，增加了购物车页面、账户注册、登录验证

后来由了解到有uni-app这么一套跨平台的前端框架，觉得很新奇，又对这个这个项目进行了重构，使其成为一个移动端项目。



### 2、技术细节



### 3、项目成果



### 4、项目心得




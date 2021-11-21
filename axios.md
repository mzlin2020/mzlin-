# axios

功能特点：

- 在浏览器中发送XMLHttpRequests请求

- 在node.js中发送http请求

- 支持Promise API

- 拦截请求和相应

- 转换请求和相应数据...

  

  **axios请求方式**

  ```javascript
  axios(config)
  axios.request(config)
  axios.get(url[,config])
  axios.delete(url[,config])
  axios.head(url[,config])
  axios.post(url[,data[,config]])
  axios.put(url[,data[,config]])
  axios.patch(url[,data[,config]])
  ```

  **安装**

  在vue-cli中的安装方式

  `npm install axios --save`

  

  用于测试网络请求的网站：

  `http://123.207.32.32:8000/home/multidata`

  `http://152.136.185.210:7878/api/m5`

  `httpbin.org` 

  

  **基本使用**

  引入该插件

  `import axios from 'axios'`

  测试

  ```javascript
  import axios from 'axios' //引用该插件
  
  axios({
    url:'http://123.207.32.32:8000/home/multidata'
  }).then(res=>{
    console.log(res);
  })
  ```

  这里的axios({...})返回一个promise，并在内部执行了resolve，所以我们可以使用.then()对结果进行处理

  在上述例子中，axios({...})默认发送的是GET请求，如果想要指定请求方式，则需要添加method方法

  ```javascript
  axios({
    url:'http://123.207.32.32:8000/home/multidata', //该接口暂时不支持post请求
    method:'post'
  })
  ```

  当然，我们也可以通过其他方式发送post或者get请求

  `axios.post(url:'', ...)`

  `axios.get(url:'', ...)`

  

  有时候url过长，或者需要传入随着参数变化而变化的url，这时候应该这样做

  ```javascript
  axios({
    url:'http://152.136.185.210:7878/api/m5/home/data',
    params:{
      type:'sell',
      page:1
    }
  }).then(res=>{
    console.log(res);
  })
  ```

  最终呈现出的url是这样子的：

  `http://152.136.185.210:7878/api/m5/home/data?type=sell&page=1`

  axios会将params中的参数拼到url之后

  

  **状态信息**

  值得一说的是，在我们发送网路请求之后，axios会给服务器返回给我们的数据data中添加一些状态信息，如header,request,status,statusText等

  

  **axios发送并发请求**

  有时我们需要向服务器发送多个请求，并且需要等这些请求获取到之后才能执行下一步操作

  ```javascript
  axios.all([
      axios(), //请求一
      axios()  //请求二
  ]).then(result=>{
      console.log(result)
  })
  
  //该方法最终返回的是一个包含了两个请求数据的数组
  //访问请求一数据： console.log(result[0])
  ```

  也可将返回的包含多个数据的result展开

  ```javascript
  .then(axios.spread((res1,res2)=>{
      console.log(res1);
      console.log(res2);
  }
  ))
  ```

  

#### 全局配置

在开发中，可能很多的参数都是固定的。这时候我们可以进行一些抽取

```javascript
axios({
  url:'http://152.136.185.210:7878/api/m5/home/data',
  params:{
    type:'sell',
    page:1
  }
})
//由于在该baseURL在基本是固定的，可以抽取出来
axios({
  baseURL:'http://152.136.185.210:7878',
  url:'/api/m5/home/data',
  params:{
    type:'sell',
    page:1
  }
})
```

也可以利用axios的去全局配置

`axios.defaults.baseYRL = '123.207.32.32:8000'`

`axios.defaults.timeout = 5000`    //设置全局请求延时时间



#### axios的实例

创建实例：`axios.create({...})`

每个实例都可以拥有自己独立的配置

```javascript
// 创建实例
const instance1 = axios.create({
  baseURL:'http://152.136.185.210:7878/api/m5',
  timeout:5000
})

// 基于instance1的网络请求一
instance1({
  url:'/home/multidata'
}).then(res=>{
  console.log(res);
})

// 基于instance1的网络请求二
instance1({
  url:'/home/data',
  params:{
    type:'sell',
    page:1
  }
}).then(res=>{
  console.log(res);
})
```



**网络请求模块的封装**

为什么要单独封装发送axios请求的模块?

+ 单独封装一个axios模块，当页面需要发送网络请求时，只需要调用该模块即可，不必重新编写代码。
+ 有利于维护

例如将上方的代码封装成一个函数，当我们调用该函数，并传入简单的参数时，在函数内部创建axios实例并发送网络请求

在network文件夹下封装一个request.js模块

```javascript
import axios from 'axios'

export function request(config){ //向外导出一个包含发送网络请求的函数
    //将该网络请求封装在一个promise中。当我们调用函数时，直接返回一个promise，
    // 由于我们在实例中调用了resolve，reject，此时就可以使用.then()、.catch()对网络请求的数据进行下一步操作
    return new Promise((resolve,reject)=>{

    //创建axios实例
    const instance = axios.create({
        baseURL:'http://152.136.185.210:7878/api/m5',
        timeout:5000
    })

    //发送网络请求
    instance(config)
    .then(res=>{
        resolve(res)  //执行resovle
    })
    .catch(err=>{
        reject(err)
    })
    })
}
```





在其他组件中调用

```javascript
import {request} from './network/request'

//调用封装好的发送网络请求的函数
request({ 
  url:'/home/multidata'
}).then(res=>{ //调用该函数，返回一个promise，promise中执行了resolve函数
  console.log(res); 
})
```

值得注意的是，我们创建的instance实例本身也会返回一个promise对象，那么我们在封装request函数的时候是否有必要再return一个promise函数呢？

答案是：没必要，所以上方的代码可以改为

```javascript
export function request(config){
    const instance = axios.create({
        baseURL:'http://152.136.185.210:7878/api/m5',
        timeout:5000
    })

    return instance(config) //向外返回一个promise
}
```



**拦截器**

+ 请求拦截

使用过程(全局)

```javascript
axios.interceptors.request.use(config=>{
    //拦截下来后的具体操作
    ....
    return config; //当具体操作完成后，再把网络请求返回回去
})
```

在实例上使用

```javascript
instance.interceptors.request.use(config=>{
    //具体拦截操作
    //1.比如config中的一些信息不符合服务器的要求
    //2.比如每次发送网路请求时，都希望在界面中显示一个请求的图标
    //3.某些网络请求（比如登录token）,必须携带一些特殊的信息
    return config;
},err=>{
    console.log(err);
})
```

+ 响应拦截

  对已获取到的网络请求进行操作

```javascript
    // 利用响应拦截，把axios添加进res的响应状态信息给拦截下来
    instance.interceptors.response.use(res=>{
        return res.data    
    },err=>{
        console.log(err);
    })
```

之前提过，当我们发送网络请求时，服务器给我们返回的结果被axios添加了一些状态信息，此时我们就可以利用响应拦截将这些信息剔除

```javascript
export function request(config){
    const instance = axios.create({
        baseURL:'http://152.136.185.210:7878/api/m5',
        timeout:5000
    })

    // 利用响应拦截，把axios添加进res的响应状态信息给拦截下来
    instance.interceptors.response.use(res=>{
        return res.data    
    },err=>{
        console.log(err);
    })

    return instance(config) //向外返回一个promise
}
```








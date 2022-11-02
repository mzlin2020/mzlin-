# Node进阶



<img src="./img/node/node架构.png" alt="node架构" style="zoom:50%;" />



### 1、代理客户端

**基本结构**



**get请求**

```js
//server.js
const http = require('http')

const server = http.createServer((res, req) => {
  console.log('请求进来，相关处理内容')
})

server.listen(8080, () => {
  console.log('server is running')
})

```

```js
//agent-client.js 
const http = require('http')

// 发送get请求
http.get({host: 'localhost', port: 8080}, (res) => {})

```



**post请求**

```js
//server
const http = require('http')
const url = require('url')

const server = http.createServer((req, res) => {
  // post
  let arr = []
  req.on('data', (data) => {
    arr.push(data)
  })
  req.on('end', () => {
    let obj = Buffer.concat(arr).toString()
    let handleValue = JSON.parse(obj)
    handleValue.age = 22
    res.end(JSON.stringify(handleValue))
  })
})

server.listen(8080, () => {
  console.log('server is running')
})


//agent-client
const http = require('http')

const options = {
  host: 'localhost',
  port: 8080,
  method: 'post',
  path: '/?age=25',
  headers: {
    "Content-type": "application/json" //json格式
    //"Content-type": "application/x-www-form-urlencoded" //表单格式 
  }
}
// 发送post请求
let req = http.request(options, (res) => {
  let arr = []
  res.on('data', (data) => {
    arr.push(data)
  })
  res.on('end', () => {
    console.log(Buffer.concat(arr).toString())
  })
})

//发送json数据
req.end('{"name": "mzlin"}')

```



**使用代理**

为了解决跨域问题，我们可以将agent-client改造为代理服务器，浏览器通过这个代理服务器请求数据，而代理服务器直接向web服务器获取数据返回给客户端

```js
//服务器
const http = require('http')

const server = http.createServer((req, res) => {
  let arr = []
  req.on('data', (data) => {
    arr.push(data)
  })
  req.on('end', () => {
    console.log(Buffer.concat(arr).toString())
    // 返回数据
    res.end(JSON.stringify('来自web服务的msg'))
  })
})

server.listen(8080, () => {
  console.log('server is running')
})
```



```js
//代理服务器
const http = require('http')


const options = {
  host: 'localhost',
  port: 7777,
  path: '/',
  method: 'post'
}

const server = http.createServer((request, response) => {
  let req = http.request(options, (res) => {
    let arr = []
    res.on('data', (data) => {
      arr.push(data)
    })
    res.on('end', () => {
      let ret = Buffer.concat(arr).toString()
      response.setHeader('Content-type', 'text/hyml;charset=utf-8')
      response.end(ret)
    })
  })

  req.end('请求web服务器')
})

server.listen(7777, () => {
  console.log('agent server is running')
})
```



### 2、静态服务

目标：模拟服务器加载静态资源的过程

在本地准备`index.html / index.css `等静态资源，并创建 server.js用于提供服务



```js
//server.js初始代码
const http = require('http')

const server = http.createServer((req, res) => {
  console.log('请求进来了')
})

server.listen(8080, () => {
  console.log('server is start......')
})
```

当在浏览器请求`127.0.0.1:8080`时，就会进入到server中来



**路径处理**

```js
const http = require('http')
const url = require('url')
const path = require('path')

const server = http.createServer((req, res) => {
  //路径处理
  let { pathname } = url.parse(req.url)
  pathname = decodeURIComponent(pathname) //防止中文路径乱码
  let absPath = path.join(__dirname, pathname) //本地资源路径
  res.end(absPath)
})
```

当在浏览器请求`127.0.0.1:8080/index.html`时，能够正确解析路径



但是如果用户请求的是不存在的路径，也应当进行404处理

```js
const server = http.createServer((req, res) => {
  //路径处理
  let { pathname } = url.parse(req.url)
  pathname = decodeURIComponent(pathname) //防止中文路径乱码
  let absPath = path.join(__dirname, pathname) //本地资源路径

  // 目标资源处理
  fs.stat(absPath, (err, statObj) => {
    if(err) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }
  })
})
```



**读取资源**

```js
const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')

const server = http.createServer((req, res) => {
  //路径处理
  let { pathname } = url.parse(req.url)
  pathname = decodeURIComponent(pathname) //防止中文路径乱码
  let absPath = path.join(__dirname, pathname) //本地资源路径

  //目标资源处理
  fs.stat(absPath, (err, statObj) => {
    if(err) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }
    //如果路径是一个文件，直接读取即可
    if(statObj.isFile()) {
      fs.readFile(absPath, (err, data) => {
        res.setHeader('Content-type', 'text/html;chartset=utf-8')
        res.end(data)
      })
    }
    // 如果路径是一个文件夹，则读取其中的index.html
    else {
      fs.readFile(path.join(absPath, 'index.html'), (err, data) => {
        res.setHeader('Content-type', 'text/html;chartset=utf-8')
        res.end(data)
      })
    }
  })
})

server.listen(8000, () => {
  console.log('server is start......')
})
```

这样当我们输入`localhost:8000/index.html`时，就能够访问资源了



**边界处理**

1、处理响应头contetn-type错误问题

```js
//npm install mime
res.setHeader('Content-type', mime.getType(pathname)+';chartset=utf-8')
```



### 3、socket.io

Socket.io是基于Websocket封装的一个框架

官方案例：实时通信

`https://socket.io/zh-CN/get-started/chat`

**服务端**

```js
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

//处理HTTP协议（使用Express的实例的app）
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//处理Websocket协议的使用socket.io的实例io
io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(8888, () => {
  console.log('listening on *:8888');
});
```



**客户端**

```js
<!DOCTYPE html>
<html>
  <head>
    <title>Socket.IO chat</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

      #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
      #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
      #input:focus { outline: none; }
      #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }

      #messages { list-style-type: none; margin: 0; padding: 0; }
      #messages > li { padding: 0.5rem 1rem; }
      #messages > li:nth-child(odd) { background: #efefef; }
    </style>
  </head>
  <body>
    
    <ul id="messages"></ul>

    <form id="form" action="">
      <input id="input" autocomplete="off" /><button>Send</button>
    </form>

    <script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io();  

			socket.on('connect', () => {
        console.log('连接成功')
      })
      //断开了连接
      socket.on("disconnect", (reason) => {
        if(reason === "io server disconnect") {
          socket.connect() //尝试重连
        }
      })
      socket.on('connect_error', (error) => {
        console.log('连接失败', error)
      })
    </script>
  </body>
</html>
```



启动服务，就可以在浏览器看见服务器socket连接成功了`a user connected`，客户端打印连接成功





**客户端收发消息**

```js
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();

  var messages = document.getElementById('messages');
  var form = document.getElementById('form');
  var input = document.getElementById('input');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
</script>
```







**服务器收发消息**

```js
//处理Websocket协议的使用socket.io的实例io
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
```





**群发信息**

由于每个用户连接上服务器都回触发“connection”，并创建一个socket。可以利用这个特点群发信息

```js
//存储所有用户的socket通信端口
const clients = []

//连接成功只会发一次
io.on('connection', (socket) => {
  clients.push(socket)
  socket.on('chat message', (msg) => {
    console.log(msg)
    io.emit('chat message', msg);
  });

  // 发送给当前所有已连接的在线用户
  clients.forEach(item => {
    item.emit('chat message', '这是群发的信息')
  })
});
```



```js
  // 刷新或断开连接时，移除对应用户的socket
  socket.on("disconnect", () => {
    const index = clients.findIndex(item => item === socket)
    if(index !== -1) {
      clients.splice(index, 1)
    }
  })
```



事实上，socket.io提供了群发消息的api，我们不用自己实现

```js
//连接成功只会发一次
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    // 群发消息
    io.emit('chat message', msg)
    // 发送给不包括当前用户的其他用户
    // socket.broadcast('chat message', msg)
  })

```





**在vue中使用socket.io**

安装`npm install socket.io-client`

```vue
<template>
  <div class="home">
    <ul id="messages"></ul>

    <form id="form" action="">
      <input id="input" autocomplete="off" /><button>Send</button>
    </form>
  </div>
</template>

<script setup>
  import { io } from 'socket.io-client'
  const socket = io("http://localhost:8888", {
  //重连的延迟时间
  reconnectionDelayMax: 10000, 
  // 身份信息
  auth: {
    token: "123"
  },
  //自定义查询参数
  query: {
    "my-key": "my-value"
  }
});

socket.on('connect', () => {
    console.log('连接成功')
  })
socket.on('disconnect', () => {
  console.log('断开连接')
})

socket.on('connect_error', err => {
  console.log('连接失败', err)
})
</script>
<style>
body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
#form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
#input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
#input:focus { outline: none; }
#form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }
#messages { list-style-type: none; margin: 0; padding: 0; }
#messages > li { padding: 0.5rem 1rem; }
#messages > li:nth-child(odd) { background: #efefef; }
</style>  
```



```js
//server.js
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
  //   console.log(msg)
  //   io.emit('chat message', msg);
  // });

    // 群发消息
    io.emit('chat message', msg)
    // 发送给不包括当前用户的其他用户
    // socket.broadcast('chat message', msg)
  })



  // 刷新或断开连接时，移除对应用户的socket
  socket.on("disconnect", () => {
    const index = clients.findIndex(item => item === socket)
    if(index !== -1) {
      clients.splice(index, 1)
    }
  })

});

server.listen(8080, () => {
  console.log('listening on *:8888');
});
```

运行vue项目与app服务，即可看到项目成功打通了



如果前端项目与server存在跨域问题，则需要进行配置

```js
//添加
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*" // 允许所有
  }
});
```



### 4、NoSql

**背景**

传统的关系型数据库的弊端：

+ 难以应付每秒上万次的高并发数据写入
+ 查询上亿量级的速度及其缓慢
+ 分库、分表形式形成的子库到达一定规模后难以进一步拓展
+ 分库、分表的规则可能回因为需求变更而发生变更
+ 修改表结构困难

在数据量暴增的时代，若想用传统的关系型数据库来满足数据高并发读写、巨量数据的存储、数据库的扩展和高可用、则需要增加软硬件的规格、这将大幅度提高成本。

而NoSql，非关系型数据库把数据直接放进一个大仓库，不标号，不连线，单纯的堆起来，从而提高了对海量数据的高性能存储及访问需求



**NoSol分类**

（1）键值数据库

这类数据库主要使用数据结构中的key来查找特定数据的value。优势在于存储时不采用任何模式，因此极易添加数据。这类数据库有极高的读写性能，用于处理大量数据的高访问负载比较合适。主要代表：Redis、Flare

（2）文档型数据库

这类数据库满足了海量数据的存储和访问需求、同时对字段要求不严格、可以随意增加、删除、修改字段、且不需要预先定义表结构，适用于各类网络应用

主要代表：MongoDB

（3）列存储型数据库

这类数据库查找速度快，可扩展性强，适合用作分布式文件存储系统。

（4）图数据库

这类数据库利用“图结构”的相关算法来存储实体之间的关系信息，适合用于构建社交网络和推荐系统的关系图谱



### 5、MongoDB

#### 5.1 安装与基本使用

官网`https://www.mongodb.com/`

参考链接：`https://blog.csdn.net/weixin_44275686/article/details/125390302`

**在mac上安装**

【步骤 1】解压缩刚刚下载的压缩包，并将其重命名为 mongodb：

```shell
sudo tar -zxvf mongodb-macos-x86_64-4.4.3.tgz     # 解压 MongoDB 压缩包
sudo mv mongodb-osx-ssl-x86_64-4.0.17/ mongodb  # 重命名解压得到的文件夹
```

【步骤 2】在 /usr/local/mongodb 目录下新建两个文件夹 data 和 log，用于存储 MongoDB 的数据和日志。

```shell
sudo mkdir -p /usr/local/mongodb/data
sudo mkdir -p /usr/local/mongodb/log
```

使用如下命令为当前用户分配目录的读写权限：

```shell
sudo chown username /usr/local/mongodb/data
sudo chown username /usr/local/mongodb/log
```

其中“username”为当前的用户名，您需要修改为您当前系统的用户名。

【步骤 3】配置 PATH。在终端中输入`open -e .bash_profile`命令打开 bash_profile 配置文件，然后将 MongoDB 的安装目录下的 bin 目录添加到环境变量中，如下所示：

```shell
export PATH=${PATH}:/usr/local/mongodb/bin 
```

编辑完成后保存并退出，然后使用`source .bash_profile`命令使配置立即生效。

最后通过`mongod -version`命令查看是否安装成功



**启动与停止**

```js
mongod --dbpath="数据存储目录"
```

注：默认占用27017端口



> 注意：在新版的mac中，.bash_profile文件已弃用。更换终端都需要重新使用open -e .bash_profile命令。我们可以新建一个.zshrc文件，将该命令写入其中，并在终端运行source ~/.bash_profile，就解决了



停止服务在连接上客户端的命令行中进行

```js
use admin;
db.shutdownServer();
```



**mongo shell 是 MongoDB 的交互式 JavaScript 接口。可以使用mongo shell 来查询和更新数据以及执行管理操作。**

1、连接默认端口上的本地mongodb服务

```js
mongo
```

2、连接本地其他端口

```js
mongo --port 28015
```

3、连接远程主机上的服务

```js
mongo "mongodb://mongodb0.example.com:28015"
//或者
mongo --host mongodb0.example.com --port 28015
```

4、连接具有身份认证的服务

```js
mongo "mongodb://用户身份@mongodb0.examples.com:28015/?anthSource=admin"
//或者
mongo --username mzlin --password xxx --authenticationDatabase adlin --host mongodb0.example.com --port 28015
```



> 注意：在mac上使用mongosh工具，`brew install mongosh`  参考链接：https://www.cnblogs.com/Denny_Yang/p/16666375.html

连接成功后进入一个js环境的终端，可以通过执行`show dbs`等mongodb命令



#### 5.2 mongodb基础概念

存储结构：数据库 》 集合 〉文档

```js
{
  //数据库
  "dbname": {
    //集合collection，对应关系型数据库的table
    "users": [
      //文档document，对应关系型数据库的行row
      {
        //数据字段field，对应关系型数据库的列column
        "id": 1,
        "username": "mzlin",
        "password": "1234567"
      }
    ]
  }
}
```



**常见操作**

1、查看数据库列表 `show dbs`

2、查看当前数据库 `db`

3、创建/切换数据库 `use db_name`

> 只有数据库中有了数据，才会被真正创建出来
>
> d b.users.insert({ name: "mzlin", age: 22 })

4、删除数据库 `db.dropDatabase()`



**集合**

1、创建集合 `db.users.insert({ name: "mzlin" })`

> 往集合中创建数据，集合会被自动创建
>
> 也可以通过db.createCollection方法来创建自定义规则的集合

2、查看集合 `shwo collections`

3、删除集合 `db.集合名.drop()`



**文档**

mongodb将数据记录存储为BSON文档（json的二进制表示形式，拥有更多的数据类型）

```js
{
  field1: value1,
  name: "mzlin",
  status: 1,
 	groups: ["ddd"]
  ...
  fieldN: valueN
}
```

> 注意：字段名称_id保留作为主键（自动生成），它的值在集合中必须是唯一的，不可变，并且可以是除数组外的任何类型

| 用法                                  | 说明                         |
| ------------------------------------- | ---------------------------- |
| db.collection.insertOne()             | 插入单个文档到集合中         |
| db.collection.insertMany()            | 插入多个文档到集合中         |
| db.collection.insert()                | 将一个或多个文档插入到集合中 |
| db.collection.find(query, projection) | 查看集合中的所有文档         |
| db.collection.findOne()               | 返回符合查询结果的一个       |

  

#### 5.3 查询

创建一个集合，并往其中插入一些测试数据

```js
db.inventory.insertMany([
	{item: "journal", qty: 25, size: { h: 14, w: 21, uom: "cm"}, status: "A"},
	{item: "notebook", qty: 50, size: { h: 8.5, w: 11, uom: "im"}, status: "A"},
	{item: "paper", qty: 100, size: { h: 8.5, w: 11, uom: "im"}, status: "D"},
	{item: "planner", qty: 75, size: { h: 22.85, w: 30, uom: "cm"}, status: "D"},
	{item: "postcard", qty: 45, size: { h: 10, w: 25, uom: "cm"}, status: "A"},
])
```



**1、db.inventory.find({})**

默认查询所有内容，但也可以传入一些 查询参数



**返回指定字段**

```js
db.inventory.find({}, {
  item: 1, 
  qty: 1 
})
```

1表示包括,0表示不包括,二者不能同时出现



**想等条件查询**

```hs
db.inventory.find({status: "D"})
```

status===D等哪一行数据被查询



**指定AND条件**

```js
db.inventory.find({status: "A", qty: { $lt: 30 }})
```

$lt表示小于号，这个语句表示查询status=A，且qty小于30的哪一行内容

> 更多运算符可查看文档： https://www.mongodb.com/docs/manual/reference/operator/query/



**指定OR条件**

使用$or运算符

```js
db.inventory.find({
  $or:[
    { status: "A" },
    { qty: { $lt: 30  } }
  ]
})
```

 

**指定AND和OR条件**

```js
db.inventory.find({
  status: "A",
  $or: [
    { qty: { $lt: 30 } },
    { item: /^p/ } //以p开头 
  ]
})
```



**查询嵌套文档**

1、匹配嵌套文档

```js
db.inventory.find({
	size: { h: 14, w:21, uom: "cm" }
})
```

必须完全匹配每一项，更换顺序也不能被匹配到



2、查询嵌套字段

```js
db.inventory.find({
	"size.uom": "in"
})
```

```js
db.inventory.find({
	"size.h": { $lt: 15 }
})
```



3、指定AND条件

```js
db.inventory.find({
	"size.h": { $lt: 15 },
  "size.uom": "in",
  status: "D"
})
```



**指定从查询返回的项目字段**

默认情况下，mongodb回返回匹配文档的所有字段。我们也可以进行限制

 1、返回匹配的所有字段

```js
db.inventory.find({status: "A"})
```



2、仅返回指定字段和_id字段

 ```js
 db.inventory.find({ status: "A" }, { item: 1, status:1 })
 ```

不要_id字段

```js
db.inventory.find({ status: "A" }, { item: 1, status:1, _id:0 })
```



**查询空字段或缺少字段**

```js
db.inventory.insertMany({
  { _id: 1, item: null },
  { _id: 2 }
})
```

 

```js
db.inventory.find( { item: null  } )
```

查询将匹配包含其值为null的item字段或不包含item字段的文档



```js
db.inventory.find({ item: { $type: 10 } })
```

仅匹配包含item字段，其值为null的文档



```js
db.inventory.find( {item: {$exists: false}} )
```

查询仅返回不包含item字段的文档



**更新文档**

```js
db.collection.updateOne(<filter>, <update>, <options>)
db.collection.updateMany(<filter>, <update>, <options>)
db.collection.replaceOne(<filter>, <update>, <options>)
```

示例

```js
db.users.updateMany(
	{ age: { $lt: 18 } },
  { $set: { status: "reject" } }
)
```

$set用于修改字段



**删除文档**

```js
db.collection.deleteMany()
db.collection.deleteOne()
```



删除所有文档

```js
db.collection.deleteMany()
```



删除符合条件的文档

```js
db.inventory.deleteMany({status: "A"})
```



删除1个符合条件的文档

```js
db.inventory.deleteOne({status: "D"})
```



#### 2.4 查询数组

测试数据

```js
db.inventory2.insertMany([
	{item: "journal", qty: 25, tags: ["blank", "red"], dim_cm: [14, 21]},
	{item: "notebook", qty: 50, tags: ["red", "blank"], dim_cm: [14, 21]},
	{item: "paper", qty: 100, tags: ["red", "blank", "plain"], dim_cm: [14, 21]},
	{item: "planner", qty: 75, tags: ["blank", "red"], dim_cm: [22.85, 30]},
	{item: "postcard", qty: 45, tags: ["blue"], dim_cm: [10, 15.25]},
])
```



**匹配一个数组**

```js
db.inventory2.find({
  tags: ["red", "blank"]
})
```

顺序必须完成相同

```js
db.inventory2.find({
  tags: { $all: ["red", "blank"] }
})
```



**查询数组中的元素**

```js
db.inventory2.find({
  tags: "red"
})
```

包含tags：“red”都会被查询

```js
db.inventory2.find({
  dim_cm: { $gt: 25 }
})
```



**为数组元素指定多个条件**

```js
db.inventory2.find({
  dim_cm: { $gt: 15, $lt: 20 }
})
```



**查询满足多个条件的数组元素**

$elemMath可以在数组的元素上指定多个条件

```js
db.inventory2.find({
  dim_cm: { $eleMatch: { $gt: 22, $lt: 30 } }
})
```



**通过数组索引位置查询元素**

使用点符号（必须包括中引号内）

```js
db.inventory2.find( { "dim_cm.1": { $gt: 25 } } )
```

表示查询数组dim_cm中第二个大于25的所有文档



**通过数组长度查询数组**

使用$size运算符

```js
db.inventory2.find( { "tags": { $size: 3 } } )
```



**查询嵌套文档的数组**

测试数据

```js
db.inventory3.insertMany([
	{item: "journal", instock: [ { warehouse: "A", qty:5 } , {warehouse: "C", qty:5}]},
	{item: "notebook", instock: [ { warehouse: "C", qty:5 }]},
	{item: "paper", instock: [ { warehouse: "A", qty:60 } , {warehouse: "B", qty:5}]},
	{item: "planner", instock: [ { warehouse: "B", qty:40 } , {warehouse: "C", qty:5}]},
	{item: "postcard",instock: [ { warehouse: "B", qty:15 } , {warehouse: "C", qty:5}]},
])
```



1、查询嵌套在数组中的文档

```js
db.inventory3.find({
  "instock": { warehouse: "A", qty: 5 }
})
```



2、指定查询条件

```js
db.inventory3.find({
  "instock.qty": { $lte: 20 }
})
```

$lte小于等于



3、使用索引

```js
db.inventory.find({ 'instock.0.qty': { $lte:20 } })
```



4、满足多个查询条件

```js
db.inventory3.find({
  "instock" {
  		$eleMatch: { qty: 5, warehouse: "A" }
	}
})
```

表示同时包含qty等于5和warehouse等于A



5、元素组合满足标准

复合查询条件为使用$eleMatch运算符，则查询将选择其数组包含满足条件的元素的任意组合的文档

```js
db.inventory3.find({
  "instock.qty": { $gt: 10, $lte: 20 }
})
```



#### 2.5 Node连接数据库

 参考文档：https://docs.mongodb.com/driver/node

官方库安装：`npm install mongodb`

```js
const { MongoClient } = require('mongodb')

const client = new MongoClient('mongodb://127.0.0.1:27017')

async function run() {
  try {
    // 开始连接
    await client.connect()
    const testDB = client.db('test')
    const inventoryCollection = testDB.collection("inventory")
    const res = await inventoryCollection.find()
    console.log(await res.toArray())
  } catch (err) {
    console.log('连接失败', err)
  } finally {
    // 关闭连接
    await client.close()
  }
}

run()
```



**简单案例**

安装：`npm install express mongodb`

```js
const express = require('express')
const { MongoClient } = require('mongodb')

const client = new MongoClient('mongodb://localhost:27017')
const app = express()
app.use(express.json()) //解析json

app.post('/write', async(req, res) => {
  const { name, age } = req.body
  if(!name || !age) return 

  //连接数据库
  await client.connect()
  const usersCollection = client.db('test').collection('users')
  await usersCollection.insertOne({name, age})
  res.status(200).json({
    name,
    age
  })
})

app.listen(8888, () => {
  console.log('server is running.')
})
```



### 6、Redis

#### 6.1 概述

官网：`https://redis.io/`

推荐图形化工具：RDM

Redis是一个使用ANSI C编写的开源、支持网络、基于内存、可选持久性的键值对存储数据库

Redis数据库中的所有数据都存储在内存中。相对于磁盘，内存的数据读/写速度要快很多，所以Redis一般用做缓存数据库。在一台普通电脑上，Redis可以在一秒内读写超过10万个键值。

Redis也提供了持久化的支持，可以将内存中的数据异步写入到磁盘中，同时不影响继续提供服务



**功能**

（1）作为缓存系统

（2）作为队列系统

（3）“发布订阅”功能



**特点**

Redis是一个key-value存储系统，大部分情况下是因为其高性能的特性，被当作缓存使用。

+ 读写性能优异
+ 持久化
+ 数据类型丰富
+ 单线程
+ 数据自动过期
+ 发布订阅
+ 分布式 



**安装**

mac上安装： `brew install redis`

编译后在Redis源代码目录的src文件夹中会有以下几个可执行文件

`redis-server 服务`、`redus-cli 命令行`...

1、启动服务`redis-server`

默认使用6379端口

2、启动服务指定端口`redis-server --port 7777`

3、在后台运行redis `redis-server --daemonize yes`

验证`ps -ef | grep -i redis`



4、停止redis `redis-cli shutdown` 

5、连接服务 `redis-cli`

也可以指定服务器地址和端口连接`redis-cli -h 127.0.0.1 -p 7777` 

6、断开连接 `quit`



redis提供了一个配置文件的模板redis.conf，位于源代码的根目录

启动该配置文件`redis-server 配置文件目录`





#### 6.2 基本操作

**多数据库**

redis支持的数据类型`string / hash / List / Set / ZSet ...`

redis默认支持16个数据库，分别以0,1,2...15命令。不支持自定义数据库名字。可以配置参数`databases`修改支持的数据库个数

连接上redis后，默认选择0号数据库



**通用命令**

```js
// 返回所有key
	keys *
  
// 返回以 my 开头的key
	keys my*

// 获取key类型
  type key

//查询key是否存在
  exists key
  
//将key改名为newkey
  rename key newkey
  
//从当前数据库中随机返回
  randomkey
  
//清空当前数据库所有内容
  flushdb
  
//清空所有数据库内容
  flushall
 
```



**过期时间**

在redis中可以设置一个键的过期时间，到时间后redis会自动删除它

```js
//给定key设置生存时间，过期时自动清除
expire key seconds

// 查看剩余时间
ttl key

//清除过期时间
persist key
```







**字符串**

```js
SELECT 1 // 切换数据库

//String
//添加
SET key value

//修改指定key的value
GETSET key value

//只有key不存在时设置key的值
SETNX key value

//同时设置一个或多个key-value
MSET key value [key value...]

```

> 注意：在redis命令不区分大小写。但是一般约定以大写的形式确定是redis命令

查询

```js
//String

//获取指定key的值
get key

//返回key中字符串值的子字符
getrange key start end

// 获取所有给定的key的值
mget key1 key2 。。。

// 返回key所存储的字符串值的长度
strlen key

// 是否存在指定key
exists key

// 判断类型
type key
```

删除

```js
//删除1个或多个指定的key
del key1 key2
```



**数字值**

数字类型的操作与字符串大致相同，但有一些特有操作

 ```js
 //将key中存储的数字值增1
 incr key
 
 
 //将key所存储的值加上给定的增量值
 incrby key incement
 
 //-1
 decr key
 
 // -n
 decrby key decrement
 ```



**列表**

列表类似于数字，基于 双向链表实现，所以对于读取头部与尾部的效率非常高。

具体操作参考文档



**哈希**

哈希类型是一种字典结构，存储了字段和字段值的映射，且字符值只能是字符串。类似js对象



**集合**

集合中的元素是唯一的，无序的。可以理解为没有顺序且不重复的列表。

 利用集合常用的操作是向集合中加入或删除元素、判断某个元素是否存在等。这些操作的时间复杂度为O(1)

 

#### 6.3 持久化

redis性能好的一个原因是将数据存在内存中。但是当数据库重启或者宕机了，数据就会丢失。

持久化就是希望redis能将数据从内存中以某种形式同步到硬盘中，使得重启后可以根据硬盘的数据恢复数据



**RDB持久化**

根据指定规则“定时”将内存中的数据存储在硬盘上，在重启之后读取硬盘上的`.rdb`快照文件将数据恢复到内存中



**AOF持久化**

AOF持久化记录服务器执行的所有操作命令形成`.aof`日志文件保存到硬盘中，并在服务器启动时，通过重新执行这些命令来还愿数据



#### 6.4 node连接数据库

安装库：ioredis

```js
const ioredis = require('ioredis')

// 1.建立连接
const redis = new ioredis({
  port: 6379,
  host: '127.0.0.1'
})

// 2.操作redis数据库
const action = async() => {
  try {
    const res = await redis.set('name', 'mzlin')
    console.log('操作成功',res)
  } catch (error) {
    console.log('操作失败',error)
  }
}
action()
```



批量发送命令（性能较好）

```js
const ioredis = require('ioredis')

// 1.建立连接
const redis = new ioredis({
  port: 6379,
  host: '127.0.0.1'
})

// 2.操作redis数据库
const action = async() => {
  try {
    const pipeline = redis.pipeline()
    for(let i = 0; i < 20; i++) {
      pipeline.set(`friend-${i}`, `name${i}`)
    }
    const res = await pipeline.exec() //执行
    console.log(res)
  } catch (error) {
    console.log('操作失败',error)
  }
}
action()
```
































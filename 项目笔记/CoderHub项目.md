# CoderHub项目

coderHub，一个程序员分享生活动态的平台

## 一、基础构建

**基本结构**

初始化目录：`npm init -y`

安装koa：`npm install koa`

项目目录划分：

1、app 

2、service

3、router

4、controller

5、utils

6、main.js 入口文件

**启动服务**

```javascript
const koa = require('koa');

const app = new koa()


app.listen(8000,() => {
    console.log("服务器启动成功~");
})
```

为方便项目调试，可以在开发中安装`nodemon`，并配置到scripts脚本中

`npm install nodemon -dev`

```js
 "scripts": {
    "start":"nodemon ./src/main.js"
  },
```

之后就可以通过`npm start`启动项目



**配置信息写进环境变量里**

main.js作为项目的入口，其代码有必要简洁明了，之后编写的中间件有必要抽离出去

```js
//app/index.js
const koa = require('koa');

const app = new koa()

// 导出
module.exports = app

//main.js
const app = require('./app')

app.listen(8000,() => {
    console.log("服务器启动成功~");
})
```

关于端口，不难发现端口是写死的。这样子不利于项目的安全性、拓展性

可以将端口信息抽到环境变量中

```js
//创建.env存放环境变量(在项目根文件下创建)
APP_PORT = 8000
```

利用`npm install dotenv`库，将.env文件的数据读取出来

```js
//app/config.js
	const docenv = require('dotenv')
    //加载后，process.env.APP_PORT已经8000这个属性
    docenv.config()
	//结构并导出
	module.exports = {APP_PORT} =process.env
```

应用到main.js

```js
const app = require('./app')
const config = require('./app/config.js')

app.listen(config.APP_PORT,() => {
    console.log(`服务器在${config.APP_PORT}端口启动成功`);
})
```



## 二、用户注册接口

### 2.1 基本注册

koa是一个轻量级的框架，所以在使用很多功能时都需要安装第三方库

安装路由：`npm install koa-router`

```js
//注册用户注册账户的中间件
//app/index.js
const koa = require('koa');
const Router = require('koa-router');

const app = new koa()

const userRouter = new Router({prefix:'/users'});

// 注册中间件post
userRouter.post('/',(ctx,next) => {
    ctx.body = "创建用户成功~"
})

app.use(userRouter.routes());
// 如果用户用错了方法，给出提示
app.use(userRouter.allowedMethods());
// 导出
module.exports = app
```



### 2.1 代码结构封装

在真实开发中，不能将所有的代码逻辑放在app/index.js中，那样子代码十分复杂

所以，我们需要将各个功能的代码逻辑抽离出去。

为了理解整个抽取过程，我们分阶段进行

1、将userRouter的注册抽离出去，存放在router/user.router.js中，index.js中只保留对userRouter的使用

```javascript
//use.router.js
const Router = require('koa-router');

const userRouter = new Router({prefix:'/users'});

// 注册中间件
userRouter.post('/',(ctx,next) => {
    ctx.body = "创建用户成功~"
})

module.exports = userRouter;
```

这样子依一来，所有关于接口的使用就在index.js进行。代码会清晰很多

```js
//app/index.js

const koa = require('koa');
const userRouter = require('../router/user.router')

const app = new koa()

app.use(userRouter.routes());
app.use(userRouter.allowedMethods());// 如果用户用错了方法，给出提示

// 导出
module.exports = app
```



2、由于之后会在每个router中进行很多判断逻辑，所以也需要对user.router.js进行封装

```js
userRouter.post('/',(ctx,next) => {
    ctx.body = "创建用户成功~"  //需要将这一块内容抽离出去
})
```

封装到controller/user.controller.js中

```javascript
//controller/user.controller.js

class UserController {
    async create (ctx,next) {

    }
}
// 向外导出一个对象
module.exports = new UserController();
```

在user.router.js引用上方的模块

```javascript
const Router = require('koa-router');
const {create} = require('../controller/user.controller')

const userRouter = new Router({prefix:'/users'});

// 注册中间件
userRouter.post('/',create)

module.exports = userRouter;
```



3、在user.controller.js中，我们会进行很多的操作，最好也把数据库相关的操作封装到一个专门的文件夹中

这里我们先来解析用户通过post请求发送过来的账号密码，发过来的是json，需要解析成对象。

安装`npm install koa-bodyparser`

```javascript
//app/index.js 
const bodyParser = require('koa-bodyparser')

const app = new koa()

app.use(bodyParser()) //解析json  这样子就可以在中间件中通过ctx.request.body获取到用户的账号密码
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());// 如果用户用错了方法，给出提示
```

如何将数据库的相关操作抽离呢？

创建一个类，并向外导出

```js
//创建service/user.service.js

class UserService {
    async create(user) {
        console.log("将用户数据保存到数据库中:",user);
        return "创建用户成功~"
    }
}

module.exports = new UserService() //导出为对象
```

在controller/user.controller.js中使用这个对象

```js

const service = require('../service/user.service');

class UserController {
    async create (ctx,next) {
        // 获取用户请求传递的参数
        const user = ctx.request.body; //通过bodyparser解析得到账号密码
        // 查询数据
        const result = await service.create(user)

        // 返回数据
        ctx.body = result;
    }
}
```



### 2.3 连接数据库

连接数据库，首先得有这个数据库

创建coderhub数据库，并创建users表

```sql
#创建数据库
CREATE DATABASE IF NOT EXISTS coderHub;

#进入该数据库
USE coderHub;

#参看当前正在使用的数据库
SELECT DATABASE();

#创建用户表
CREATE TABLE IF NOT EXISTS `users` (
	id INT PRIMARY KEY AUTO_INCREMENT, #自动增加
	name VARCHAR(20) NOT NULL UNIQUE,
	password VARCHAR(50) NOT NULL,
	#自动更新创建时间，更改时间
	createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

使用数据库，需要安装驱动`npm install mysql2`

创建app/database.js

```js
const mysql = require('mysql2')
const config = require('./config') 

// 创建连接池，获取对象
const connections = mysql.createPool({
    // 这里不能写死
    host:config.MYSQL_HOST,
    port:config.MYSQL_PORT,
    database:config.MYSQL_DATABASE,
    user:config.MYSQL_USER,
    password:config.MYSQL_PASSWORD
})

// 验证是否连接成功
connections.getConnection((err,conn) => {
    conn.connect((err) => {
        if (err) {
            console.log("连接失败",err);
        }else {
            console.log("数据库连接成功~");
        }
    })
})

module.exports = connections.promise()
```

这里就体现出.env的优势，我们所有的数据库连接信息就可以统一封装在其中，再通过`require('./config')`导入。

为了测试数据库连接是否成功，可以在main.js导入

```js
//main.js
require('./app/database')
```

控制台输出：数据库连接成功~



现在可以编写语句向数据库插入用户信息了

```js
//user.service.js
const connection = require("../app/database"); 

class UserService {
    async create(user) {
        // 将用户名，密码从user中解构出来
        const {name,password} = user;
        const statement = `INSERT INTO users (name,password) VALUES (?,?);`;

        // 将user存到数据库Hong Kong
        const result = await connection.execute(statement,[name,password])
       
        return result
    }
}

module.exports = new UserService()  
```

这里`const {name,password} = user;`用户发送过来的账号密码通过解构获得，并传给了sql语句，最终成功将用户的账号密码插入到数据库中



### 2.4 错误处理

在实际的应用过程中，用户经常发生许多错误。例如用户注册没填账号、没填密码，或者账号已经存在。这些其实前端应该帮助我们去验证，但是不排除前端没有进行这方面的操作

这里，我们可以在`userRouter.post('/',create)`中间格外加入一个拦截中间件verifyUser，用于判断用户的注册过程是否有错误，有错误就不将其信息加入数据库

不过这一部分的代码还是要单独抽离出去，创建middleware文件夹

```javascript
//middlewaer/user.middleware.js (初步代码逻辑)

const verifyUser = (ctx,next) => {
    // 1.获取用户名和密码
    const {name,password} = ctx.request.body;

    // 2.判断用户名或者密码不能为空

    // 3.判断这次注册的用户名是没有注册过的

    // 如果前边没有返回值，则执行下一个中间件
    await next();
}

module.exports = {
    verifyUser
}
```

最后将这个错误处理的中间件，在user.router.js中导入使用

```js
const { verifyUser } = require('../middleware/user.middleware');

// 注册中间件
userRouter.post('/',verifyUser,create)

module.exports = userRouter;
```



之后我们就可以在user.middleware.js文件中对错误做出判断

```javascript
    // 2.判断用户名或者密码不能为空
    if (!name || !password) {
        const error = new Error("用户名或者密码不能为空~")
        return ctx.app.emit('error',error,ctx) //发送错误
    }
```

这里发射出去了一个错误，我们需要在app/index.js中做出相应的错误处理

```js
//app/index.js
const errorHander = require('./error.handle')
app.on('error',errorHander)
```

为了避免太多的错误处理代码堆积在这里，把错误处理抽取到error.handle.js中

```js
//error.handle.js
// 专门用于对错误进行处理
const errorHandler = (error,ctx) =>{
    console.log(error.message);

    ctx.status = 404;
    ctx.body = "发生了错误~"
}

module.exports = errorHandler;
```

我们可以将错误的类型常量专门定义文件来存放contants/error-types.js

```js
//contants/error-types.js
const NAME_OR_PASSWORD_IS_REQUIRED = "name_or_password_is_required";

module.exports = {
    NAME_OR_PASSWORD_IS_REQUIRED
}
```

```js
//user.middleware.js
	const errotTypes = require('../contants/error-types')

   // 2.判断用户名或者密码不能为空
    if (!name || !password) {
        const error = new Error(errotTypes.NAME_OR_PASSWORD_IS_REQUIRED)
        return ctx.app.emit(error,ctx)
    }
```

之后可以在error.handle.js中编写相关的代码逻辑

```javascript
const errorTypes = require('../contants/error-types')
// 专门用于对错误进行处理
const errorHandler = (error,ctx) =>{
    let status,message;
    switch (error.message) {
        case errorTypes.NAME_OR_PASSWORD_IS_REQUIRED: //如果是这种错误
            status = 400 //Bad Request
            message = "用户名或者密码不能为空~"
            break;
        default:
            status = 404;
            message = "NOT FOUND"
    }

    ctx.status = status;
    ctx.body = message;
}

module.exports = errorHandler;	
```



上边的代码实现了判断用户输入的账号或者密码为空时，进行报错。但是，如果是用户名已经存在的情况下，要怎么处理呢？

```js
//user.service.js

const connection = require("../app/database"); 

class UserService {
    // 获取数据库中用户的name，用于判断账号是否已存在
    async getUserByName(name) {
        const statement = `SELECT * FROM users WHERE name = ?;`
        const result = await connection.execute(statement,[name])

        return result;
    }
}

module.exports = new UserService() 
```

在这里发送网络请求，获取数据库中用户name，用来判断用户名是否已存在



在中间间verifyUser，即user.middleware.js处，判断数据库中的result是否有值，有值说明用户名已经存在，需要进行错误处理

```js
//user.middleware.js

    const errotTypes = require('../contants/error-types')
    const service = require('../service/user.service')


    // 3.判断这次注册的用户名是没有注册过的
    const result = await service.getUserByName(name);
    if(result.length) { //如果数据库有值，则返回错误
        const error = new Error(errotTypes.USER_ALREADY_EXISTS)
        return ctx.app.emit('error',error,ctx) //把错误发射出去

    }

    // 如果前边没有返回值，则执行下一个中间件
    await next();
}

module.exports = {
    verifyUser
}
```

同样的，我们需要重新编写一下，错误的类型

```js
//error.types.js

// 用户名或者密码是空值的错误
const NAME_OR_PASSWORD_IS_REQUIRED = "name_or_password_is_required";

// 用户名已存在的错误
const USER_ALREADY_EXISTS = 'user_already_exists'

module.exports = {
    NAME_OR_PASSWORD_IS_REQUIRED,
    USER_ALREADY_EXISTS
}
```

错误具体的处理逻辑，要交给error.handle.js处理

```js
const errorTypes = require('../contants/error-types')
// 专门用于对错误进行处理
const errorHandler = (error,ctx) =>{
    let status,message;
    switch (error.message) {
        case errorTypes.NAME_OR_PASSWORD_IS_REQUIRED: //如果是这种错误
            status = 400 //Bad Request
            message = "用户名或者密码不能为空~"
            break;
        case errorTypes.USER_ALREADY_EXISTS: //如果是这种错误
            status = 409 //conflict
            message = "用户名已经存在~"
            break;
        default:
            status = 404;
            message = "NOT FOUND"
    }

    ctx.status = status;
    ctx.body = message;
}

module.exports = errorHandler;
```



### 2.5密码加密处理

在实际的开发中，我们还必须对数据库中的密码进行加密处理。否则一旦数据库泄露，用户的账号密码将被他人获取，这是十分危险的



再创建一个中间件handlePassword，专门用来对用户传递过来的密码进行加密，再添加进数据库。

```js
//usej.router.js

const { verifyUser, handlePassword} = require('../middleware/user.middleware');
const userRouter = new Router({prefix:'/users'});

// 注册中间件
userRouter.post('/',verifyUser,handlePassword,create)

module.exports = userRouter;
```

在user.middleware.js中处理密码

```js
//user.middleware.js


    //对数据库密码进行加密
    const handlePassword = async(ctx,next) => {
        const {password} = ctx.request.body;
        ctx.request.body.password = md5password(password) //我们需要创建一个md5password函数
    }

module.exports = {
    verifyUser,
    handlePassword
}
```

在utils文件夹中创建password-handle.js

```js
const crypro = require('crypto')

const md5password = (password) => {
    const md5 = crypro.createHash('md5')
    const result = md5.update(password).digest('hex')
    return result
}

module.exports = md5password
```



## 三、用户登录接口

### 3.1 基本搭建

在router文件夹下创建auth.router.js文件,注册一个用于登录的路由

```js
const Router = require('koa-router')

const authRouter = new Router();

const {
    login
} = require('../controller/auth.controller.js')

authRouter.post('/login',login)

module.exports = authRouter
```

在app/index.js中，使用这个router

```js
const koa = require('koa');
const bodyParser = require('koa-bodyparser');

const userRouter = require('../router/user.router') //注册的路由
const authRouter = require('../router/auth.router') //登录的路由 
const errorHandler = require('./error.handle') //错误处理

const app = new koa()

app.use(bodyParser()) //解析json
app.use(userRouter.routes()); //使用
app.use(userRouter.allowedMethods());// 如果用户用错了方法，给出提示
app.use(authRouter.routes()); //使用
app.use(authRouter.allowedMethods());


// 错误处理
app.on('error',errorHandler)

// 导出
module.exports = app
```

有了上边的两个步骤后，就可以在controller/auth.controller.js中先把基本的逻辑搭建出来

```js
//controller/auth.controller.js
class AuthController {
    async login(ctx,next) {
        const { name } = ctx.request.body;
        ctx.body = `登录成功，欢迎${name}回来`
    }
}

module.exports = new AuthController();
```

在postman中发送POST请求，并携带用户账号、密码，就会响应：“登录成功，欢迎**回来”

当然，在这一步，没有跟数据库中的数据进行对比，任何账号密码都能成功响应

### 3.2 登录验证

**基本逻辑**

注册一个中间件verifyLogin，用于判断用户发送过来的登录信息是否正确，正确再执行下一个中间件login

```js
//auth.router.js

const Router = require('koa-router')

const authRouter = new Router();

const {
    login
} = require('../controller/auth.controller')

// 增加中间件：用于验证用户登录的信息是否正确
const {
    verifyLogin
} = require("../middleware/auth.middleware")

authRouter.post('/login',verifyLogin,login) //增加一层中间件verifyLogin，验证登录信息是否正确

module.exports = authRouter
```

verifyLogin的基本逻辑

```js
//auth.middleware.js

const verifyLogin  = async (ctx,next) => {
    // 1.获取用户名和密码
    const {name,password} = ctx.request.body

    // 2.判断用户名和密码是否为空

    // 3.判断用户是否存在

    //4. 判断密码是否和数据库中的密码是否一致（需要加密再对比）

    // 到这里还没错，就执行下一个中间件login
    await next();	
}

module.exports = {
    verifyLogin
}
```

具体的代码如下

```js
const errorTtypes = require('../contants/error-types')
const service = require('../service/user.service')
const md5password = require('../utils/password-handle')

const verifyLogin  = async (ctx,next) => {
    // 1.获取用户名和密码
    const {name,password} = ctx.request.body

    // 2.判断用户名和密码是否为空
    if(!name || !password) {
        const error = new Error(errorTtypes.NAME_OR_PASSWORD_IS_REQUIRED)
        return ctx.app.emit('error',error,ctx)
    }

    // 3.判断用户是否存在
    const result = await service.getUserByName(name) //取出来的result是数组
    const user = result[0]
    if(!user) {
        const error = new Error(errorTtypes.USER_DOES_NOT_EXISTS)
        return ctx.app.emit('error',error,ctx)
    }

    //4. 判断密码是否和数据库中的密码是否一致（需要加密再对比）
    if(md5password(password) !== user.password) {
        const error = new Error(errorTtypes.PASSWORD_IS_INCORRECT)
        return ctx.app.emit('error',error,ctx)
    }

    // 到这里还没错，就执行下一个中间件
    await next();
}

module.exports = {
    verifyLogin
}
```

针对步骤3、4还需要增加相应的错误类型和错误处理

```js
const errorTypes = require('../contants/error-types')
// 专门用于对错误进行处理
const errorHandler = (error,ctx) =>{
    let status,message;
    switch (error.message) {
		//省略。。。
        case errorTypes.USER_DOES_NOT_EXISTS: //如果是这种错误
            status = 400 //Bad Request
            message = "用户名不存在~"
            break;
        case errorTypes.PASSWORD_IS_INCORRECT: //如果是这种错误
            status = 400 //Bad Request
            message = "密码错误~"
            break;
        default:
            status = 404;
            message = "NOT FOUND"
    }

    ctx.status = status;
    ctx.body = message;
}

module.exports = errorHandler;
```



### 3.3 路由封装

之后我们会创建很多的路由，重复代码很多很相似，app文件夹下的index.js就需要注册使用这些路由。

我们可以将路由导入，对注册使用的这部分代码做一层封装。由router文件夹下的index.js统一导出

具体代码如下：

```js
//router/index.js
const fs = require('fs')

const useRoutes = (app) => { //readdirSync读取文件夹下的所有文件
    fs.readdirSync(__dirname).forEach(file => {
        if(file === 'index.js') return  //除了index.js
        const router = require(`./${file}`)
        app.use(router.routes())
        app.use(router.allowedMethods())
    })
}

module.exports = useRoutes
```

引用

```js
const koa = require('koa');
const bodyParser = require('koa-bodyparser');


const useRoutes = require("../router/index")  //统一导入路由
const errorHandler = require('./error.handle') //错误处理

const app = new koa() //创建koa实例

app.use(bodyParser()) //解析json

useRoutes(app); //使用路由

// 错误处理
app.on('error',errorHandler)

// 导出
module.exports = app
```



### 3.4 cookie

**概述**

Cookie,类型为“小型文本文件”，某些网站为了辨别用户身份而存在用户本地从终端上的数据。浏览器会在特定的情况下携带上cookie来发送请求，可以通过cookie来获取一些信息。



**分类**

cookie总是保存在客户端，按在客户端中的内存位置，cookie可以分为内存cookie和硬盘cookie

1、内存cookie由浏览器维护，保存在内存中，浏览器关闭时cookie就会消失，其存在时间是短暂的

2、硬盘cookie保存在硬盘中，有一个过期时间，用户手动清除或者过期时间到，才会清除

如何区分？

没有设置过期时间，默认情况下cookie是内存cookie，在关闭浏览器时会自动删除。

有设置过期时间，并且过期时间不为0或者负数的cookie，是硬盘cookie，需要手动或者过期时，才会删除

**cookie的生命周期**

默认情况下，cookie是内存cookie，也称之为**会话cookie**，在浏览器关闭时自动被删除。

另外，硬盘cookie可以通过max-age设置过期的秒钟。一旦过期，会被删除



**cookie的作用域**

1、Domain：指定哪些主机可以接受cookie

不指定，则默认是origin，不包括子域名。如果指定Domain，则包括子域名

2、Path：指定主机下哪些路径可以接受cookie



**客户端添加cookie**

```js
//cookie以键值对保存
document.cookie = 'name:linming'

//设置过期时间
document.cookie = 'name = linming;max-age=5;' //5s过期

//删除cookie
document.cookie = 'name = linming;max-age=0;'
```



**服务器添加cookie**

Koa中默认支持直接操作cookie。

​	

```js
//在/login中设置cookie，在/index中也可以读取到。
//过期时间一到，自动删除
const Koa = require('koa');
const Router = require('koa-router')

const app = new Koa()
const cookieRouter = new Router()

// 设置cookie
cookieRouter.get('/login',(ctx,next) => {
    // amxAge对应的是毫秒
    ctx.body = 'test'
    ctx.cookies.set("name","linming",{
        maxAge: 50 * 1000 //50s
    })
})

// 读取cookie
cookieRouter.get('/index',(ctx,next) => {
    const value = ctx.cookies.get('name');
    ctx.body = "你的cookie是" + value
})

// 使用路由
app.use(cookieRouter.routes())
app.use(cookieRouter.allowedMethods())


app.listen(8888,() => {
    console.log('服务器启动成功~');
})
```



### 3.5 session

session是基于cookie实现机制

**sesion的基本使用**

```js
const Koa = require('koa')
const Router = require('koa-router')
const KoaSession = require('koa-session') //安装

const app = new Koa()
const sessionRouter = new Router()

const session = KoaSession({
    keys:'sessionId',//cookie的key
    maxAge:20 * 1000, //过期时间
    signed:false //签名，默认true
},app)
app.keys = ['haha']
app.use(session)

//登录接口
sessionRouter.get('/login',(ctx,next) => {
    ctx.session.user = {
        id:'10010',
        name:"ming"
    }
    ctx.body = "session设置成功~"
})

//在demo页面，获取session
sessionRouter.get('/demo',(ctx,next) => {
    const user = ctx.session.user
    console.log(user);
    ctx.body = user 
})

// 使用路由
app.use(sessionRouter.routes())
app.use(sessionRouter.allowedMethods())


app.listen(8088,() => {
    console.log('服务器启动成功~');
})
```



### 3.6 token

**cookie和session的缺点**

1、cookie会附加在每个http请求中，增加了用户流量

2、cookie是明文传递的，存在安全性问题

3、cookie的大小限制是4kb，对复杂的需求来说是不够的

4、对于浏览器外的其他客户端（IOS、android），需要手动设置cookie和session

5、对于分布式系统和服务器集群，难以保证其他系统也可以正确解析session



**什么是token？**

token也可以翻译成令牌，就是在验证用户账号密码正确的情况下，给用户颁发一个令牌，这个令牌作为后续用户访问一些接口或者资源的凭证，服务器会根据这个凭证来判断用户是否有权限来访问。

具体可分为两步：

1、生成token：登录的时候，颁发token

2、验证token：访问某些资源或者接口时，验证token

**JWT实现tkoen**

`token：header+payload+signature`

jwt生成的token由三部分组成：

1、header

会通过base64Url算法进行编码

参数alg：采用的加密算法，默认是HMAC SHA256，采用同一密钥进行加密解密

参数typ：JWT，固定值，通常写成JWT

2、payload

表示携带的数据，会通过base64Url算法进行编码

可以携带用户的id，name，过期时间等信息，默认携带iat令牌的签发时间

3、signature

signature会将前两个结果合并进行HS256的算法（相当于加密）



**token的使用1——对称加密**



在真实开发中，我们可以直接使用一个库来完成： jsonwebtoken

安装`npm install jsonwebtoken`

```js
const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('jsonwebtoken')

const app = new Koa()
const useToken = new Router()

// 创建密钥
const SERCET_KEY = '123123abc';

//登录接口 
useToken.post('/login',(ctx,next) => {
    //假设获取用户登录的账号密码
    const user = {name:'小明',password:123123}
    // 生成token
    const token = jwt.sign(user,SERCET_KEY,{
        expiresIn:20 //过期时间（秒）
    })
    ctx.body = token
})

// 验证接口
useToken.get('/demo',(ctx,next) => {
    //获取包含在header中的token等信息
    const authorization = ctx.headers.authorization
    // 去除多余信息
    const token = authorization.replace('Bearer ','')
    try{
        const result = jwt.verify(token,SERCET_KEY) //验证token
        ctx.body = result
    }catch (error) {
        ctx.body = 'token是无效的~'
    }
})

app.use(useToken.routes())
app.use(useToken.allowedMethods())
app.listen(8888,() => {
    console.log("服务器启动成功~")
})
```

1、登录获取token

在postman中通过http://localhost:8888/login发送一个post请求，既可以获取token

2、验证token

在http://localhost:8888/demo的authorization中选择Bearer Token，并将token粘贴进去，即可获取验证成功

```js
{
    "name": "小明",
    "password": 123123,
    "iat": 1627631844, //token生成时间
    "exp": 1627631864 //过期时间
}
```



**token的使用2——非对称加密**

对称加密HS256算法是有弊端的，一旦密钥暴露是十分危险的

比如在分布式系统中，每一个子系统都需要获取密钥，那么拿到这个密钥后这个子系统既可以发布另外，也可以验证令牌。但是对于一些资源服务其来说，它们只需要有验证令牌的能力就可以了



使用非对称加密RS256可以解决这个问题

+ 私钥（private key）：用于发布令牌
+ 公钥（public key）：用于验证令牌

**创建公钥和私钥**

```shell
//git bash

>openssl 
>genrsa -out private.key 1024  //创建私钥
>rsa -in private.key -pubout -out public.key  //创建公钥
```

当在项目目录下生成了公钥和私钥，就可以应用进项目了

```js
//省略部分代码
const jwt = require('jsonwebtoken')
const fs = require('fs')


const SERCET_KEY = fs.readFileSync('./private.key')
const PUBLIC_KEY = fs.readFileSync('./public.key')

//登录接口 
useToken.post('/login',(ctx,next) => {
    //假设获取用户登录的账号密码
    const user = {name:'小明',password:123123}
    // 生成token
    const token = jwt.sign(user,SERCET_KEY,{
        expiresIn:20, //过期时间
        algorithm:'RS256' //重新设置加密算法
    })

    ctx.body = token
})

// 验证接口
useToken.get('/demo',(ctx,next) => {
    //获取包含在header中的token等信息
    const authorization = ctx.headers.authorization
    // 去除多余信息
    const token = authorization.replace('Bearer ','')
    try{
        const result = jwt.verify(token,PUBLIC_KEY,{
            algorithms:['RS256']
        })
        ctx.body = result
    }catch (error) {
        ctx.body = 'token是无效的~'
    }
})

```



### 3.7 为接口添加token

在verifyLogin中间间的代码中，我们获取了数据库中user的相关信息。（表明了用户登录成功），将其保存在ctx.user中，方面在login中生成token

```js
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname,'../app/keys/private.key'))
const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname,'../app/keys/public.key'))
class AuthController {
    async login(ctx,next) {
         //从上一个中间间传递来的数据库中user
        const {name,id} = ctx.user
        const token = jwt.sign({name,id},PRIVATE_KEY,{
            expiresIn:60*60*24, //24小时
            algorithm:'RS256'
        })
        //返回结果
        ctx.body = {
            id,
            name,
            token
        }
    }
}

module.exports = new AuthController();
```



### 3.8 验证jwt

在auth.router.js中增加一个路由，用于验证用户的操作，是否已经经过登录授权

```js
//auth.router.js
authRouter.get('/test',verifyAuth, success) //用于测试的路由，verifyAuth验证用户是否授权
```

如果经过verifyAuth中间件没有出现问题，执行success

```js
//auth.controller.js
class AuthController {

    async success(ctx,next) {
        ctx.body = "授权成功~"
    }
}

module.exports = new AuthController();
```

verifyAuth中间件中需要对用户的进行验证，是否已经登录过，携带着token

```js
const jwt = require("jsonwebtoken")
const errorTtypes = require('../contants/error-types')
const { PUBLIC_KEY } = require('../app/config')

const verifyLogin  = async (ctx,next) => {
    //省略代码
    // 到这里还没错，就执行下一个中间件
    await next();
}
    //验证用户用否已有登录授权
    const verifyAuth = async (ctx,next) => {
        console.log("验证授权的middleware");
        // 1.获取token
        const authorrization = ctx.headers.authorization
        
        // 如果authorrization为空直接报错(说明没有token)
        if(!authorrization) {
            const error = new Error(errorTtypes.UNAUTHORIZATION);
            return ctx.app.emit('error',error,ctx)
        }
        const token = authorrization.replace('Bearer ', '')

        // 2.验证token
        try{
            const result = jwt.verify(token,PUBLIC_KEY,{
                algorithms:['RS256']
            })
            ctx.user = result
            await next()
        } catch (err) {
            // 发现错误
            const error = new Error(errorTtypes.UNAUTHORIZATION)
            ctx.app.emit('error',error,ctx)
        }
    }

module.exports = {
    verifyLogin,
    verifyAuth
}
```



## 四、发布动态接口

### 4.1 基本搭建

创建moment.router.js文件

```js
const Router = require('koa-router')

const momentRouter = new Router({prefix: '/moment'})

const { create } = require('../controller/moment.controller.js')
const { verifyAuth } = require('../middleware/auth.middleware') //验证用户是否登录过的中间间

momentRouter.post('/', verifyAuth, create)


module.exports = momentRouter
```

其中的verifyAuth中间件，用于用户发表动态时，判断其是否已经登录过了



如果verifyAuth成功通过，则执行create

```js
class MomentControler {
    async create (ctx,next) {
        ctx.body = '发表动态成功~'
    }
}

module.exports = new MomentControler()
```



### 4.2 添加动态

创建一个存储用户动态的表

```sql
CREATE TABLE IF NOT EXISTS `moment`(
	id INT PRIMARY KEY AUTO_INCREMENT,
	content VARCHAR(1000) NOT NULL,
	user_id INT NOT NULL,
	createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY(user_id) REFERENCES users(id)
);
```

```js
//moment.controller.js具体逻辑
const service = require('../service/monent.service')

class MomentControler {
    async create (ctx,next) {
        // 1.获取数据（user_id,content）
        const user_id = ctx.user.id
        const content = ctx.request.body.content
        console.log(user_id,content);

        //2.向数据库插入数据
        const result =  await service.create(user_id,content)
        ctx.body = result
    }
}

module.exports = new MomentControler()
```

连接数据库，并插入数据

```js
const connection = require("../app/database")

class MomentService {
    async create(user_id,content) {
        const statement = `INSERT INTO moment (content,user_id) VALUES (?,?);`
        const [result] = await connection.execute(statement,[content,user_id])
        return result
    }
}

module.exports = new MomentService()
```



### 4.3 获取动态(单个)

在moment.router.js中增加一个路由，用于获取用户的动态(需要传参)

```js
momentRouter.get('/:momId',detail) //获取用户动态(单条)
```

在moment.controller.js中编写相关逻辑

```js
const service = require('../service/monent.service')

class MomentControler {
    async detail(ctx,next) {

        // 1.获取数据
        const id = ctx.params.momId //根据路由传递过来的参数
        console.log(id);
        // 2.向数据库查询数据
        const result = await service.getMonent(id)
        ctx.body = result
    }
}
module.exports = new MomentControler()
```

向数据库请求数据

```js
const connection = require("../app/database")

class MomentService {
    async getMonent(id) {
        const statement = `SELECT * FROM moment WHERE id = ?; `
        const result = await connection.execute(statement,[id])
        return result[0]
    }
}
module.exports = new MomentService()
```

通过postman发送`http://localhost:8000/moment/2`,以获取id为2的动态信息



获取到的json数据格式还可以进一步优化，将查询到的动态与用户关联起来。并将用户的信息保存在一列的json中

```js
const connection = require("../app/database")

class MomentService {
    async getMonent(id) {
        const statement = `
        SELECT 
            m.id id,m.content content,m.createAt createTime,m.updateAt updateTime,
            JSON_OBJECT('id',u.id,'name',u.name) user
        FROM moment m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.id = ?;
        `
        const result = await connection.execute(statement,[id])
        return result[0]
    }
}

module.exports = new MomentService()
```



### 4.4 获取动态(列表)

分页查询数据库中，用户动态的数据

```sql
SELECT
	m.id id,m.content content,m.createAt createTime,m.updateAt updateTime,
	JSON_OBJECT('id',u.id,'name',u.name) user
FROM moment m
LEFT JOIN users u ON m.user_id = u.id
LIMIT 0,10;
```

增加一个路由

```js
//moment.router.js
const Router = require('koa-router')

const momentRouter = new Router({prefix: '/moment'})

const { create , detail, list } = require('../controller/moment.controller.js')
const { verifyAuth } = require('../middleware/auth.middleware') //验证用户是否登录过的中间间

momentRouter.post('/', verifyAuth, create)
momentRouter.get('/',list) //获取用户动态（列表）
momentRouter.get('/:momId',detail) //获取用户动态(单条)
    
module.exports = momentRouter
```

代码逻辑

```js
//moment.controller.js
const service = require('../service/monent.service')

class MomentControler {
    async list(ctx,next) {
        // 1.获取数据
        const { offset, size } = ctx.request.query

        // 2.向数据库查询数据
        const result = await service.getMomentList(offset,size)
        ctx.body = result[0]
    }
}

module.exports = new MomentControler()
```

发送数据库请求

```js
//moment.service.js
const connection = require("../app/database")

class MomentService {
    async getMomentList(offset,size) {
        const statement = `
        SELECT
            m.id id,m.content content,m.createAt createTime,m.updateAt updateTime,
            JSON_OBJECT('id',u.id,'name',u.name) user
        FROM moment m
        LEFT JOIN users u ON m.user_id = u.id
        LIMIT ?,?;
        `
        const result = await connection.execute(statement,[offset,size])
        return result
    }
}

module.exports = new MomentService()
```

测试接口：

发送`http://localhost:8000/moment?offset=0&size=10`,并获取到10条用户动态即表示成功~



**补充(评论个数)：**

为查询结果增加一个评论个数的列

操作起来很简单，只需要在sql语句中增加一列

```js
    async getMomentList(offset,size) {
        const statement = `
        SELECT
            m.id id,m.content content,m.createAt createTime,m.updateAt updateTime,
            JSON_OBJECT('id',u.id,'name',u.name) user,
            (SELECT COUNT(*) FROM comment c WHERE c.moment_id = m.id) commentCount
        FROM moment m
        LEFT JOIN users u ON m.user_id = u.id
        LIMIT ?,?;
        `
        const result = await connection.execute(statement,[offset,size])
        return result
    }
```





### 4.5 修改动态

在moment.router.js中增加一个路由

```js
const Router = require('koa-router')

const momentRouter = new Router({prefix: '/moment'})

const { create , detail, list, update } = require('../controller/moment.controller.js')
//验证用户是否登录过的中间件
const { verifyAuth, verifyPermission } = require('../middleware/auth.middleware') 

//...省略

// 修改动态的条件：1.用户必须已经登录 2.用户具备权限（只能修改自己的）
momentRouter.patch('/:momId',verifyAuth,verifyPermission,update) //修改用户动态
    
module.exports = momentRouter
```

上边的代码中，

1、verifyAuth中间件用于验证是否登录，没有登录不能进行更新动态操作

2、verifyPermission中间件用于控制用户只能修改自己的动态

3、update中间件，前边的检验都通过后，在这个中间件中进行修改动态操作

```js
//auth.middleware.js

const authService = require('../service/auth.service')

//省略部分代码

    // 判断用户是否具备操作权限
    const verifyPermission = async (ctx,next) => {
        console.log("验证权限的middleware~");

        // 获取参数
        const { momId } = ctx.params;
        const { id } = ctx.user;
        // 查询是否具备权限
        const isPermission = await authService.checkMoment(momId,id)
        if(!isPermission) {
            const error = new Error(errorTtypes.UNPERMISSION)
            return ctx.app.emit('error',error,ctx)
        }
        await next()

    }

module.exports = {
    verifyLogin,
    verifyAuth,
    verifyPermission
}
```

封装auth.Service.js文件，用于之后检验用户是否有权限进行某一个操作

```js
const connection = require('../app/database')

class authService {
    async checkMoment(momId,id) {
        const statement = `SELECT * FROM moment WHERE id = ? AND user_id = ?;`
        const [result] = await connection.execute(statement,[momId,id])
        return result.length === 0 ? false : true
    }
}

module.exports = new authService()
```

update相关的代码逻辑

```js
//moment.controller.js
const service = require('../service/monent.service')

class MomentControler {
    //省略代码...

    // 修改用户动态
    async update(ctx,next) {
        // 1.获取数据
        const {momId} = ctx.params
        const {content} = ctx.request.body

        // 修改数据
        const result = await service.update(content,momId)
        ctx.body =result
    }
}

module.exports = new MomentControler()


//moment.service.js
const connection = require("../app/database")

class MomentService {
	//更新数据的数据库查询
    async update (content,id) {
        const statement = ` UPDATE moment SET content = ? WHERE id = ?;`
        const result = await connection.execute(statement,[content,id])
        return result
    }
}

module.exports = new MomentService()
```





### 4.6 删除动态

```js
//moment.router.js
// 删除动态
momentRouter.delete('/:momId',verifyAuth,verifyPermission,remove)
```

代码逻辑如下

```js
//moment.controller.js
const service = require('../service/monent.service')

class MomentControler {

    async remove(ctx,next) {
        // 1.获取数据
        const {momId} = ctx.params
        
        // 2.删除数据
        const result = await service.remove(momId)
        ctx.body = result
    }
}

module.exports = new MomentControler()
```

```js
//moment.service.js
const connection = require("../app/database")

class MomentService {

    // 删除动态
    async remove (momId) {
        const statement =  `DELETE FROM moment WHERE id = ?;`
        const result = await connection.execute(statement,[momId])
        return result
    }
}

module.exports = new MomentService()
```



### 4.7 给动态添加标签

添加标签的任务，还是要再动态接口中进行

基本逻辑

路径：`http://localhost:8000/moment/2/labels`

```js
{
    "labels":["前端","后端"]
}
```

```js
//moment.router.js

// 给动态添加标签
momentRouter.post('/:momentId/labels',verifyAuth,verifyPermission,addLabels)
```

```js
//moment.controller.js
    // 给动态添加标签
    async addLabels(ctx,next) {
        // 获取数据
        const { labels } = ctx.request.body
        console.log(labels);
        ctx.body = "获取成功" + labels
    }
```

问题：因为用户添加的标签是可以自己决定的，所以需要判断数据库中是否已经存在这个标签，如果不存在，需要将不存在的标签添加进去

增加一个中间件，做出判断

```js
// 给动态添加标签
momentRouter.post('/:momentId/labels',verifyAuth,verifyPermission,
                  verifyLabelExists,addLabels)
```

```js
//label.middleware.js
const service = require('../service/label.service')

const verifyLabelExists = async (ctx,next) => {
  // 1.取出要添加的所有的标签
  const { labels } = ctx.request.body;

  // 2.判断每一个标签在label表中是否存在
  const newLabels = [];
  for (let name of labels) {
    const labelResult = await service.getLabelByName(name);
    const label = { name };
    if (!labelResult) {
      // 创建标签数据
      const result = await service.create(name);
      label.id = result.insertId;
    } else {
      label.id = labelResult.id;
    }
    newLabels.push(label);
  }
  ctx.labels = newLabels;
  await next();
}

module.exports = {
    verifyLabelExists
}
```

```js
//label.service.js
	//获取数据库中的label名
    async getLabelByName(name) {
        const statement =  `select * from label where name = ?;`
        const [result] = await connection.execute(statement,[name])
        return result[0]
    }
```

最后，将动态与标签的关系填写进关系表中

```js
//moment.controller.js
    // 给动态添加标签
    async addLabels(ctx,next) {
    // 1.获取标签和动态id
    const { labels } = ctx;
    const { momentId } = ctx.params;

    // 2.添加所有的标签
    for (let label of labels) {
      // 2.1.判断标签是否已经和动态有关系
      const isExist = await service.hasLabel(momentId, label.id);
      if (!isExist) {
        await service.addLabel(momentId, label.id);
      }
    }

    ctx.body = "给动态添加标签成功~"; 
    }
```







### 五、用户评论接口

### 5.1 基本搭建

创建用户评论表

```sql
CREATE TABLE IF NOT EXISTS `comment` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	content varchar(1000) NOT NULL,
	moment_id INT NOT NULL,
	user_id INT NOT NULL,
	comment_id INT DEFAULT NULL,
	createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	
	FOREIGN KEY(moment_id) REFERENCES moment(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(comment_id) REFERENCES comment(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```



创建comment.router.js

```js
const Router = require('koa-router')

const {verifyAuth} = require('../middleware/auth.middleware')
const {create} = require('../controller/comment.controller')

const commentRouter = new Router({prefix:'/comment'})

commentRouter.post('/',verifyAuth,create)

module.exports = commentRouter
```

当通过验证后，进入create中间件，进行插入评论等操作

```js
class CommentController {
    async create(ctx,next) {
        ctx.body = "评论成功~"
    }
}

module.exports = new CommentController()
```



### 5.2 发表评论

在动态底下发表评论

```js
//comment.controller.js
const service = require('../service/comment.service.js')

class CommentController {
    async create(ctx,next) {
        const {momentId,content} = ctx.request.body
        const {id} = ctx.user
        const result = service.create(momentId,content,id)
        ctx.body = result
    }
}

module.exports = new CommentController()
```

执行数据库相关操作

```js
//comemt.service.js
const connection = require('../app/database')
class CommentService {
    async create (momentId,content,id) {
        const statement = 
        `
		INSERT INTO comment (content,momment_id,user_id) VALUES (?,?,?);
		` 
        const [result] = await connection.execute(statement,[content,momentId,id])
        return result
    }
}
module.exports = new CommentService()
```



### 5.3 回复评论接口

发送请求的路径包含了commentID`http://localhost:8000/comment/2/reply`



创建路由：

```js
//comment.router.js
// 回复评论的评论接口
commentRouter.post('/:commentId/reply',verifyAuth,reply)
```

```js
//comment.controller.js

class CommentController {
    //回复评论
    async reply(ctx,next) {
        const {momentId,content} = ctx.request.body
        const {commentId} = ctx.params
        const {id} = ctx.user
        const result = await service.reply(momentId,content,id,commentId)
        ctx.body = result 
    }
}

module.exports = new CommentController()
```

插入数据库

```js
    // 回复评论
    async reply (momentId,content,id,commentId) {
        const statement = `
		INSERT INTO comment (content,moment_id,user_id,comment_id) VALUES (?,?,?,?);` 
        const [result] = await connection.execute(statement,
                                                  [content,momentId,id,commentId])
        return result
    }
```



### 5.4 修改评论接口

路径：`http://localhost:8000/comment/3`

增加路由

```js
//comment.router.js
// 更新、修改评论的接口
commentRouter.patch('/:commentId',verifyAuth,update)
```

```js
//comment.controller.js
    // 修改评论
    async update(ctx,next) {
        const {content} = ctx.request.body
        const {commentId} = ctx.params

        const result = await service.update(content,commentId)
        ctx.body = result
        // ctx.body = "修改评论成功~" + content + commentId
    }
```

```js
//comment.service.js
    // 修改评论你
    async update (content,commentId) {
        const statement = `UPDATE comment SET content = ? WHERE id = ?`
        const [result] = await connection.execute(statement,[content,commentId])
        return result
    }
```



**存在的问题**

1、修改评论、删除评论只能修改自己的！上边的代码只是通过了登录认证，并没有进行权限认证

2、复用之前的verifyPermission中间件，但是该中间件的查询的moment数据表，并不适用于这里



**解决方案**

修改verifyPermission，使其成为更加通用的中间件

```js
//auth.middleware.js

const verifyLogin  = async (ctx,next) => {
    // 判断用户是否具备操作权限
    const verifyPermission = async (ctx,next) => {
        console.log("验证权限的middleware~");

         // 1.获取参数 { commentId: '1' }
        const [resourceKey] = Object.keys(ctx.params);
        const tableName = resourceKey.replace('Id', '');
        const resourceId = ctx.params[resourceKey];
        const { id } = ctx.user;

        // 查询是否具备权限
        const isPermission = await authService.checkResource(tableName,resourceId,id)
        if(!isPermission) {
            const error = new Error(errorTtypes.UNPERMISSION)
            return ctx.app.emit('error',error,ctx)
        }
        await next()

    }

module.exports = {
    verifyLogin,
    verifyAuth,
    verifyPermission
}
```



```js
//auth.service.js
const connection = require('../app/database')

class authService {
    async checkResource(tableName,momId,id) {
        const statement = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?;`
        const [result] = await connection.execute(statement,[momId,id])
        return result.length === 0 ? false : true
    }
}

module.exports = new authService()
```



### 5.5 删除评论接口

```js
//comment.router.js
// 删除评论
commentRouter.delete('/:commentId',verifyAuth,verifyPermission,remove)
```

```js
//comment.controller.js
    // 删除评论
    async remove(ctx,next) {
        const {commentId} = ctx.params
        const result = await service.remove(commentId)
        ctx.body = result
    }
```

```js
//comment.service.js
    // 删除评论
    async remove(commentId) {
        const statement = `DELETE FROM comment WHERE id = ?;`
        const [result] = await connection.execute(statement,[commentId])
        return result
    }
```



### 5.6 获取评论接口

根据momentID来获取该动态下的所有评论

```js
// 获取评论
commentRouter.get('/',list)
```

```js
    // 获取评论
    async list(ctx,next) {
        const {momentId} = ctx.query
        const result = await service.getCommentsByMomentId(momentId);
        ctx.body = result
    }
```

```js
    // 获取评论
    async getCommentsByMomentId(momentId) {
        const statement = `SELECT * FROM comment WHERE moment_id = ?;`
        const [result] = await connection.execute(statement,[momentId])
        return result
    }
```

也可以进一步优化sql语句，在查询评论是，将作者信息也查询出来

```js
    // 获取评论
    async getCommentsByMomentId(momentId) {
        const statement = `
        SELECT
            m.id,m.content,m.comment_id commentId,m.createAt createTime,
            JSON_OBJECT('id',u.id,'name',u.name) user
        FROM comment m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE moment_id = ?;`
        const [result] = await connection.execute(statement,[momentId])
        return result
    }
```



### 六、标签数据接口

### 6.1 基本搭建

创建标签表

```sql

CREATE TABLE IF NOT EXISTS `label` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(10) NOT NULL UNIQUE,
	createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

创建路由

```js
//label.router.js
const Router = require('koa-router')

const labelRouter = new Router({prefix:'/label'})
const {verifyAuth} = require('../middleware/auth.middleware')
const {create} = require('../controller/label.controller.js')

// 创建标签
labelRouter.post('/',verifyAuth,create)

module.exports = labelRouter
```

创建标签逻辑

```js
//label.controller.js
const service = require('../service/label.service.js')

class LabelController {
    async create(ctx,next) {
        const {name} = ctx.request.body
        const result = await service.create(name)
        ctx.body =result
    }
}

module.exports = new LabelController()
```

数据库操作

```js
const connection = require('../app/database')

class LabelService {
     async create(name) {
        const statement = `INSERT INTO label (name) VALUES (?)`
        const [result] = await connection.execute(statement,[name])
        return result
    }
}

module.exports = new LabelService()
```



### 6.2 创建关系表

```sql
CREATE TABLE IF NOT EXISTS `moment_label`(
	moment_id INT NOT NULL,
	label_id INT NOT NULL,
	createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(moment_id,label_id),
	FOREIGN KEY(moment_id) REFERENCES moment(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(label_id) REFERENCES label(id) ON DELETE CASCADE ON UPDATE CASCADE
	);
```



具体的添加动态与标签的关系在4.7节



### 6.3 获取标签列表接口

创建路由

路径：`http://localhost:8000/label?limit=5&offset=0`

```js
//label.router.js
labelRouter.get('/', list);
```

```js
//label.controller.js
  async list(ctx, next) {
    const { limit, offset } = ctx.query;
    const result = await service.getLabels(limit, offset);
    ctx.body = result;
  }
```

```js
//lable.service.js
  async getLabels(limit, offset) {
    const statement = `SELECT * FROM label LIMIT ?, ?;`;
    const [result] = await connection.execute(statement, [offset, limit]);
    return result;
  }
```



### 七、上传图像接口

### 7.1 上传头像接口

**1、基本搭建**

安装：`npm install koa-multer`

创建文件上传的路由

```js
//file.router.js
const Router = require('koa-router')
const Multer = require('koa-multer')

const {
    verifyAuth
} = require('../middleware/auth.middleware')
const avatarUpload = Multer({
    dest:'./upload/avatar' //保存头像的位置
})
const avatarHandler = avatarUpload.single('avatar')
const fileRouter = new Router({prefix:'/upload'})

fileRouter.post('/avatar',verifyAuth,avatarHandler)

module.exports = fileRouter
```

路径：`http://localhost:8000/upload/avatar`

在postman中上传图片(body选择form-data，key：avater，value：文件)

上边的文件上传代码可以封装到中间件中



代码变为

```js
//file.router.js
const Router = require('koa-router')


const {
    verifyAuth
} = require('../middleware/auth.middleware')
const {avatarHandler} = require('../middleware/file.middleware')

const fileRouter = new Router({prefix:'/upload'})

fileRouter.post('/avatar',verifyAuth,avatarHandler)

module.exports = fileRouter
```

```js
//file.middleware.js
const Multer = require('koa-multer')

// 头像上传
const avatarUpload = Multer({
    dest:'./upload/avatar' //保存头像的位置
})
const avatarHandler = avatarUpload.single('avatar')


module.exports = {
    avatarHandler
}
```



**2、保存图片信息**

创建数据表

```sql
	CREATE TABLE IF NOT EXISTS `avatar`(
		id INT PRIMARY KEY AUTO_INCREMENT,
		filename VARCHAR(255) NOT NULL UNIQUE,
		mimetype VARCHAR(30),
		size INT,
		user_id INT,
		createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
	);
```

创建路由

```js
//file.router.js
fileRouter.post('/avatar',verifyAuth,avatarHandler,saveAvatarInfo) //保存头像信息
```

控制器逻辑

```js
//file.controller.js
const fileService = require('../service/file.service.js')

class FileController {
    async saveAvatarInfo(ctx,next) {
        //获取信息
        // console.log(ctx.req.file); //打印图片上传时的附带的所有信息
        const { filename, mimetype, size } = ctx.req.file
        const { id } = ctx.user

        // 将图像信息数据保存到数据库中
        const result = await fileService.createAvatar(filename,mimetype,size,id)
        ctx.body = result
    }
}

module.exports = new FileController()
```

写入数据库

```js
//file.service.js
const connection = require('../app/database')

class fileService {
    async createAvatar(filename,mimetype,size,id) {
        const statement = `INSERT INTO avatar (filename,mimetype,size,user_id)
						   VALUES(?,?,?,?);`
        const [result] = await connection.execute(statement,[filename,mimetype,size,id])
        return result
    }
}

module.exports = new fileService()
```



**3、通过接口获取图片**

在浏览器中，我们看到一个路径保存着一整图片。这种接口是怎么实现的呢？

或者说，怎么才能把保存着的图片获取到，并在浏览器中显示出来呢？



```js
//file.router.js
// 在浏览器显示图片
fileRouter.get('/:userId/avatar',showAvatarInfo)
```

控制器逻辑

```js
//file.controller.js
    async showAvatarInfo(ctx,next) {
        // 用户的头像是哪一个文件
        const {userId} = ctx.params
        const avatarInfo = await fileService.getAvatarByUserId(userId)
        // console.log(avatarInfo);
        ctx.body = avatarInfo
        // // 提供图像信息
        ctx.response.set('content-type',avatarInfo.mimetype)
        ctx.body = fs.createReadStream(`${AVATAR_PATH}/${avatarInfo.filename}`);
    }
```

```js
//file.service.js
//通过user_id获取到对应的图片
    async getAvatarByUserId(userId) {
        const statement = `SELECT * FROM avatar WHERE user_id = ?;`
        const [result] = await connection.execute(statement,[userId])
        return result[0]
    }
```

`ctx.response.set('content-type',avatarInfo.mimetype)`给响应的数据设置格式，就可以让接口直接在浏览器显示出图片，没有这一句，那么浏览器就直接将图片下载下来

上边的代码中，也将读取图片的路径写成了变量，便于后期修改

```js
//constants/file-path.js
const AVATAR_PATH = './upload/avatar'

module.exports = {
    AVATAR_PATH
}
```

假设用户ID:13，上传了一张头像，现在就可以在 `http://localhost:8000/upload/13/avatar`直接访问到



**将url动态地写入其他接口中**

为users表添加一个字段，用于保存图片路径

```sql
ALTER TABLE `users` ADD `avatar_url` VARCHAR(200); 
```

什么时候将图片url写入这个字段中呢？当用户上传图片成功时

找到用户上传图片的路由

```js
//file.router.js
fileRouter.post('/avatar',verifyAuth,avatarHandler,saveAvatarInfo) //保存头像信息
```

需要对saveAvatarInfo进行修改

```js
    async saveAvatarInfo(ctx,next) {
        //1.获取信息
        // console.log(ctx.req.file); //打印图片上传时的附带的所有信息
        const { filename, mimetype, size } = ctx.req.file
        const { id } = ctx.user

        // 2.将图像信息数据保存到数据库中
        const result = await fileService.createAvatar(filename,mimetype,size,id)
        
        // 将用户的头像路径保存到avatar_url中
        const avatarUrl = `${AVATAR_PATH}/${filename}` //图片路径
        await userService.updateAvatarUrlById(avatarUrl,id)

        ctx.body = '上传图片成功~'

    }   
```

数据库相关

```js
//user.service.js
    // 更新数据库中，users表的头像url
    async updateAvatarUrlById(avatarUrl,userId) {
        const statement = `UPDATE users SET avatar_url = ? WHERE id = ?;`
        const [result] = await connection.execute(statement,[avatarUrl,userId])
        return result
    }
```



上方的图片路径`avatarUrl`写成了相对路径，当域名改变时，不能跟着改变。

这样一来，当我们点击上传用户图片时，就可以看到对应users表后有一个保存图片的路径了



### 7.2 动态配图上传接口

创建保存配图的表

```sql
CREATE TABLE IF NOT EXISTS `file` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	filename VARCHAR(100) NOT NULL UNIQUE,
	mimetype VARCHAR(30),
	size INT,
	moment_id INT,
	user_id INT,
	createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(moment_id) REFERENCES moment(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```



创建路由

```js
//file.router.js
// 上传动态配图接口
fileRouter.post('/picture',verifyAuth,pictureHandler,savePictureInfo)
```

`pictureHandler`用于解析保存图片

```js
//file.middle.js
const Multer = require('koa-multer')
const { AVATAR_PATH, PICTURE_PATH } = require('../contants/file-path')

// 配图上传
const pictureUpload = Multer({
    dest:PICTURE_PATH //保存头像的位置
})
const pictureHandler = pictureUpload.array('picture',9) //最大限制9张

module.exports = {
    pictureHandler
}
```

`savePictureInfo`用于保存图片信息，并存入数据库

```js
//file.controller.js
    async savePictureInfo(ctx,next) {
        // 获取数据
        const files = ctx.req.files
        const { id } = ctx.user
        const { momentId } = ctx.query

        // 将所有图片信息保存到数据库中(多张图片)
        for(let file of files) {
            const  {filename, mimetype ,size } = file
            await fileService.createFile(filename, mimetype ,size,id,momentId)
        }
        ctx.body = '动态配图上传完成~'
    }
```

`createFile`执行数据库操作

```js
//file.service.js
    // 将动态配图插入数据库
    async createFile(filename,mimetype,size,id,momentId) {
        const statement = `INSERT INTO file (filename,mimetype,size,user_id,moment_id)
						   VALUES(?,?,?,?,?);`
        const [result] = await connection.execute(statement,
                                                  [filename,mimetype,size,id,momentId])
        return result
    }
```

发送的路径：`http://localhost:8000/upload/picture?momentId=25`





## 八、项目部署

### 8.1连接服务器

环境：git bash

1、`ssh root@公网IP`

2、输入密码



### 8.2 安装node

安装软件使用的⼯具：dnf

**DNF**，全称**Dandified**（时髦的、华丽的） **Yum**，是Yum的下⼀个版本，也被称之为Yum的替代品；

如果服务器选择的是centos8，所以是⾃带dnf的；

检查dnf是否可⽤：`dnf --help`

```shell
#搜索软件包
dnf search nodejs

#查看软件包信息：noedjs的版本是10.21.0
dnf info nodejs

#安装nodejs
dnf install nodejs
```

我们会发现版本其实是10.21.0：

我们其实希望使用更高的版本，比如最新的LTS或者Current版本；

```shell
# 安装
npm install n -g

#通过n安装最新的lts和current
n install lts
n install latest

#通过n切换版本
n
```



### 8.3 安装数据库

使用dnf安装mysql

```shell
#查看mysql
dnf search mysql-server

#查看mysql详情
dnf info mysql-server

#安装mysql，-y表示依赖的内容也安装
dnf install mysql-server -y
```

启动

```shell
#开启mysql后台服务
systemctl start mysqld

#查看mysql服务：active(running)表示启动成功
systemctl status mysql

#随着系统一起启动
systemctl enable mysqld
```

**配置mysql**

```shell
mysql_secure_installation

#密码强度推荐选择2
```

操作数据库

```shell
mysql -u root -p
#输入密码
password


#显示所有的数据库
show datebases;

```

### 8.4 GUI工具连接服务器

1、配置安全组

通过命令行操作数据库显示不太方便，我们也可以通过GUI工具连接远程服务器，直接在GUI工具中操作数据库

但是连接GUI工具需要配置mysql3306端口，默认阿里云的这个端口是不放行的，需要自己去配置**安全组配置**

2、修改默认mysql数据库

修改mysql中的user表，使其能够添加其他用户登录。不只限于本地连接

```shell
#显示当前所有数据库
show databases;

#进入mysql数据库
use mysql;

#查看user表中的host、user
select host,user from user;

#修改
update user set host ='%' where user = 'root';
```

3、连接远程服务器

4、数据库迁移

将项目的数据库保存到本地，并在服务器中上传



### 8.5 通过git仓库部署项目

先来了解一下简单的Linux命令：

```shell
#退出
exit

#当前文件夹下的所有文件
ls

#当前位置
pwd

#创建文件夹
mkdir 文件夹名
```

1、在服务器终端的根目录下，创建一个项目文件夹coderhub，进行文件夹，并将项目从git上克隆下来

2、为服务器安装git`dnf install git`

3、克隆项目：`git clone 地址`

4、安装vscode插件（remote SSH），使得我们可以通过vscode连接远程服务器，直接操作服务器中的项目

使用remote SSH需要输入：`ssh root@服务器公网ip`，连接时需要输入密码（选择linux）

注：如果报错了“试图写入的管道不存在”，需要修改.ssh文件夹下deconfig的权限

5、在vscode打开服务器的项目，并修改env

6、启动项目 `node ./src/main.js`,如果还不能访问的话，需要去配置安全组（端口）

尝试打开保存项目中的图片`http://47.106.182.193:8000/upload/12/avatar`成功！！



### 8.6 pm2启动项目

在真实的部署过程中，我们会使用⼀个⼯具pm2来管理Node的进程：

PM2是⼀个Node的进程管理器，我们可以使用它来管理Node的后台进程；

这样在关闭终端时，Node进程会继续执行，那么服务器就可以继续为前端提供服务了；

安装`npm install pm2 -g`

常用命令

```shell
#命令进程
pm2 start app.js --name my-api

#显示所有进程状态
pm2 list

#停止指定进程
pm2 stop 0

#停止所有进程
pm2 stop all

#重启所有进程
pm2 restart all

#重启指定进程
pm2 restart 0

#杀死指定的进程
pm2 delete 0 

#杀死全部进程
pm2 delete all 

#后台运行pm2 启动4个app.js，实现负载均衡
pm2 start app.js -i 4
```

启动coderhub项目

`pm2 start ./src/main.js --name coderhub`
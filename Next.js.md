# Next.js

## 一、概述

nest14默认使用服务端渲染（SSR），这导致了许多客户端行之有效的API无法使用。如果想要使用客户端渲染，next也提供了简洁的方式进行声明，在组件中`use client`

| 如何选择                                      | 服务端组件 | 客户端组件 |
| --------------------------------------------- | ---------- | ---------- |
| 获取数据                                      | ✓          | ✗          |
| 直接访问后端资源                              | ✓          | ✗          |
| 在服务器上保留敏感信息(访问令牌，API秘钥等)   | ✓          | ✗          |
| 在服务器上保留大型依赖项/减少客户端js         | ✓          | ✗          |
| 添加交互性和事件监听器                        | ✗          | ✓          |
| 使用状态和生命周期效果                        | ✗          | ✓          |
| 使用仅浏览器API                               | ✗          | ✓          |
| 使用依赖于状态，效果或仅浏览器API的自定义钩子 | ✗          | ✓          |
| 使用React类组件                               | ✗          | ✓          |



## 二、路由

App Router 模式

next基于app文件夹下的目录结构，使用文件系统创建路由，支持更高级的路由模式和UI布局

>  以`page.ts`来呈现一个页面，以`route.ts`呈现一个api，二者不能同时存在。优先匹配route

```js
//以下代码均在app文件夹之下
aaa/bbb/page.tsx 可以定义 /aaa/bbb 的路由。
aaa/[id]/bbb/[id2]/page.tsx 中的 [id] 是动态路由参数，可以在组件里取出来。
aaa/[...xxx]/page.tsx 可以匹配 /aaa/xxx/xxx/xxx 的任意路由，叫做 catch-all 的动态路由。但它不匹配 /aaa
aaa/[[...xxx]]/page.tsx 同上，但匹配 /aaa，叫做 optional catch-all 的动态路由。
aaa/(xxx)/bbb/page.tsx 中的 (xxx) 只是分组用，不参与路由，叫做路由组
aaa/@xxx/page.tsx 可以在 layout.tsx 里引入多个，叫做平行路由
aaa/(..)/bbb/page.js 可以拦截 /bbb 的路由，重写对应的组件，但是刷新后依然渲染原组件，叫做拦截路由。
```



**Rest Api**

在App Router的app目录下书写`route.ts`文件

```typescript

// 分别对应 http 协议请求中的 get post put delete head 和 options 请求协议

export async function GET(request: Request) {}

export async function POST(request: Request) {}

export async function PUT(request: Request) {}

export async function DELTE(request: Request) {}

export async function HEAD(request: Request) {}

export async function OPTIONS(request: Request) {}

```

在 Next.js 中`next/server`中提供 NextResponse 的静态类方法。它和 w3c 定义中的 Response 类型基本的实现

```typescript

import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
return NextResponse.json({ num: 0 }); // 默认http 响应状态码 为200

// 可通过第二参数进行设置，它是一个 ResponseInit 的参数类型
// return NextResponse.json({ num: 0 }, { status: 500 });
}
```

如何获取请求的query和params等

```typescript
import { NextResponse } from "next/server";

export async function POST(request: Request, params: { id: string }) {

// get query
const { searchParams } = new URL(request.url);
const allSearchParams = Object.fromEntries(searchParams);

// get params
const id = params.id;

// get formdata
const formdata = await request.formData();
const formdataJson = Object.fromEntries(formdata);

// get json 如果是 formdata 模式下不要请求
// const json = await request.json();

return NextResponse.json({ allSearchParams, id,formdataJson});
}
```

获取cookie和headers操作

```typescript
export async function PUT(request: NextRequest) {
    const cookies = request.cookies.getAll()
    const headers = request.headers;
    const ContentType = headers.get('Content-Type')    
}
```

重定向

```typescript
import { redirect } from "next/navigation"
export async function GET(request: NextRequest) {
    redirect('https://nextjs.org/')
}
```



**中间件**

在src下创建`middleware.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	console.log("do something");
	return NextResponse.next();
}
```

## 三、数据

如果是在客户端渲染时获取数据，则使用一般的ajax技术，可以使用`fetch, axios`等

**在服务端渲染时获取数据**

推荐使用`fetch`

```js
//优势
1、可以直接访问后端数据源
2、通过防止敏感数据向客户端泄露
3、在统一环境中获数据并呈现，减少客户端和服务端的来回通信
4、减少请求瀑布
```

示例

```typescript
//get请求
const data = await fetch("http://localhost:3300/").then((res) => res.json());
//post请求
const data = await fetch("http://localhost:3300/pp", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
}).then((res) => res.json());
```



**服务端缓存数据**

在服务器端缓存耗性能的数据操作，可以减少数据库和 API 服务器的负载，并提高应用程序的性能

```ts
import { cache } from 'next/cache'; 
async function getPosts() { 
    const cachedPosts = await cache.get('posts'); 
    if (cachedPosts) { return cachedPosts; } 
    const posts = await fetch('/api/posts'); 
    await cache.set('posts', posts); 
    return posts; 
 }
```





## 四、项目搭建

1、创建项目

```shell
npx create-next-app@latest
```

![](C:\Users\mzlin\Desktop\mzlin-notes\img\next\终端创建.jpeg)

测试一下能够打包`pnpm run build`，建议停止项目后执行此命令



2、配置**Eslint**和**Prettier**

建议vscode安装这两个插件

由于创建项目时已经安装过了`Eslint`，这里只需安装`Prettier`

```shell
pnpm add prettier -D
```

```js
//.prettierrc
{
  "trailingComma": "es5", //多行逗号分隔语法中，在最后一个元素后面加逗号(默认)
  "printWidth": 120,
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2
}
```

```js
//.prettierignore
node_modules
.next
dist
```

```js
//package.json
"prettier": "prettier --write ."
```

配置vscode文件，每次保存时自动执行prettier

```js
//.vscode/settings.json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": true,
      "source.organizeImports": true
    }
  }
```

`eslint`如果需要关闭某些限制，可以直接改

```js
//.eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "globals": {
    "React": "readonly"
  },
  "rules": {}
}
```



3、css

安装sass `pnpm add sass -D`，并将目录下的css文件改为`.scss`，即可生效

如果项目使用了` tailwind css`，建议安装`Tailwind CSS IntelliSense`插件，提供智能提示

如果觉得`globals.css`中`@tailwind`的不雅，可以这样子做——忽略这些警告

```js
//.vscode/settings.json
{
    "css.lint.unknownAtRules": "ignore",
}
```


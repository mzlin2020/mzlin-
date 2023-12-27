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

> 注：使用 "use client"（通常是通过 `next/dynamic` 实现的）来指定某个页面或组件在客户端渲染，类似于单页应用程序（SPA）的行为。Next.js 作为一个框架，同时支持服务器端渲染（SSR）和静态站点生成（SSG），这意味着即使部分页面或组件是在客户端渲染的，其他部分的内容可能仍然是在服务器端渲染的
>
> 如果希望完全由客户端js渲染生成：const YourComp = dynamic(() => import('./YourComp '), { ssr: false })，这样一来才能使用浏览器相关的api



> 注：next14默认使用严格模式，导致组件会重复渲染两次。其原因是为了模拟立即卸载组件和重新挂载组件。帮助开发者提前发现重复挂载造成的Bug，提供的调试机制

```js
//强制关闭 next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, //关闭严格模式
}
module.exports = nextConfig

```



> 使用next提供的Image组件，报错——`next/image` 未配置的主机
>
> 原因：利用该`next/image`组件的页面之一传递了一个值，`src`该值使用 URL 中的主机名，而该主机名未在`images.remotePatterns`in中定义`next.config.js`。

```js
//修复 next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.example.com',
        port: '',
        pathname: '/account123/**',
      },
    ],
  },
}

//或者直接写域名
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "assets.example.com",
    ],
  },
};

module.exports = nextConfig;
```



> 遇到控制台警告如下
>
> Nested CSS was detected, but CSS nesting has not been configured correctly.
> Please enable a CSS nesting plugin *before* Tailwind in your configuration.

```javascript
//postcss.config.js
module.exports = {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

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

### 1、创建项目 

```shell
npx create-next-app@latest
```

![](https://mzlin2020-notes.oss-cn-shenzhen.aliyuncs.com/img/next/%E7%BB%88%E7%AB%AF%E5%88%9B%E5%BB%BA.jpeg)

测试一下能够打包`pnpm run build`，建议停止项目后执行此命令



### 2、配置**Eslint**和**Prettier**

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



### 3、css

安装sass `pnpm add sass -D`，并将目录下的css文件改为`.scss`，即可生效

如果项目使用了` tailwind css`，建议安装`Tailwind CSS IntelliSense`插件，提供智能提示

如果觉得`globals.css`中`@tailwind`的不雅，可以这样子做——忽略这些警告

```js
//.vscode/settings.json
{
    "css.lint.unknownAtRules": "ignore",
}
```

如果想要为`tailwind`的类名顺序做排序，也可以安装`npm install -D prettier prettier-plugin-tailwindcss`

```js
{
  "trailingComma": "es5",
   // ....
  "plugins": ["prettier-plugin-tailwindcss"] //拓展插件
}
```



### 4、安装组件库antd

`npm install antd`

> 在测试中，antd5.11.3以下版本可用以下方式解决

安装后需解决antd与tailwind的样式冲突

```js
// tailwind.config.ts
{
    corePlugins: {
      preflight: false,
    },
}
```

问题：试着刷新页面的时候，我们可以看到，首屏加载时，Ant Design的样式没有立即加载出来，导致开始一段时间样式缺失，然后才恢复正常

Ant Design 提供了解决方案来解决这个问题

`npm install @ant-design/cssinjs --save`

```tsx
//src/lib/AntdRegistry.tsx
'use client'

import React from 'react'
import {createCache, extractStyle, StyleProvider} from '@ant-design/cssinjs'
import type Entity from '@ant-design/cssinjs/es/Cache'
import {useServerInsertedHTML} from 'next/navigation'

const StyledComponentsRegistry = ({ children }: React.PropsWithChildren) => {
  const cache = React.useMemo<Entity>(() => createCache(), []);
  const isServerInserted = React.useRef<boolean>(false);
  useServerInsertedHTML(() => {
    if (isServerInserted.current) return;
    isServerInserted.current = true;
    return <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />;
  });
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

export default StyledComponentsRegistry;

export default StyledComponentsRegistry
```

```tsx
//src/app/layout.tsx
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import StyledComponentsRegistry from '../lib/AntdRegistry'
import './globals.scss'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
	<StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}
```



### 5、布局

以下是 tailwindcss 默认的 5 个断点：`sm、md、lg、xl、zxl`，自定义新增一个针对手机的断点`xs`

| 断点前缀 | 宽度   | css                                |
| -------- | ------ | ---------------------------------- |
| xs       | 480px  | @media (min-width: 480px) { ... }  |
| sm       | 640px  | @media (min-width: 640px) { ... }  |
| md       | 768px  | @media (min-width: 768px) { ... }  |
| lg       | 1024px | @media (min-width: 1024px) { ... } |
| xl       | 1280px | @media (min-width: 1280px) { ... } |
| 2xl      | 1536px | @media (min-width: 1536px) { ... } |

```js
// tailwind.config.js
import defaultTheme from "tailwindcss/defaultTheme";
module.exports = {
    ...,// 其他配置
    theme: {
        screens: {
            xs: '480px',
            ...defaultTheme.screens,
        },
    },
}
```

> 屏幕尺寸小于 480px 为手机端，480px 到 1024px 为平板端，1024px 到 1280px 之间为大 pad 尺寸和小笔记本屏幕的混合区。大于 1280px 为 PC 端



6、状态管理

安装`npm install zustand`

```js
import { create } from "zustand";

interface ConfigState {
  pageToken: PageToken;
  breakpoint: Breakpoint;
  screenWidth: number;
  updatePageToken: (params: PageToken) => void;
  updateBreakpoint: (params: Breakpoint) => void;
  updateScreenWidth: (params: number) => void;
}

const useConfigStore = create<ConfigState>((set) => ({
  pageToken: {
    cbg: "#EDEFF3",
    fHeight: "60px",
    fbg: "#7DBCEA",
    sPlacement: "left",
    sWidth: "280px",
    sMobileWidth: "240px",
  },
  breakpoint: "", //断点
  screenWidth: 0, //尺寸

  updatePageToken: (newToken) => set({ pageToken: newToken }),
  updateBreakpoint: (newVal) => set({ breakpoint: newVal }),
  updateScreenWidth: (newVal) => set({ screenWidth: newVal }),
}));

export default useConfigStore;

```

```js
//应用
const {  pageToken, updateScreenWidth } = useConfigStore();

// updateScreenWidth(newVal)
```



6、markdown笔记

参考链接：`https://blog.csdn.net/Sakuraaaa_/article/details/128400497`

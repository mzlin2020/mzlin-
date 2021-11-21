## Promise

promise是异步编程的一种解决方案

promise是ES6的一个类

**模拟网络请求**

```javascript
setTimeout(()=>{
    console.log("请求的网络数据")
},1000)
```

promise(参数)要求传入一个函数作为参数，该函数又包含两个参数：resolve、reject。同时，resolve与reject本身也是函数

`promise((resolve,reject)=>{})`

**Promise的三种状态**

+ pending：等待状态，比如正在进行网络请求，或者定时器没有到时间
+ fulfill：满足状态，当我们主动回调了resolve时，就处于该状态，并且会回调.then()
+ reject:拒绝状态，当我们主动回调了reject，就处于状态，并且会回调.catch()



当在promise中调用resolve时，promise会执行then()函数。

resolve函数会把接收到的参数传给then()函数，一般情况下在promise中执行异步操作，在then中执行异步操作所获取到的数据

```javascript
new Promise((resolve,reject)=>{
    resolve('hello promise')
}).then((data)=>{
    console.log(data)
})  //打印出 hello promise
```



**模拟回调地狱**

缺点：代码结构复杂，难以维护

```javascript
        setTimeout(()=>{
            //第一次回调
            console.log("你是光");
            console.log("你是光");
            console.log("你是光");
            console.log("你是光");
			//第二次回调
            setTimeout(()=>{
                console.log("你是火");
                console.log("你是火");
                console.log("你是火");
                console.log("你是火");
			//第三次回调
                setTimeout(()=>{
                    console.log('你是未来');
                    console.log('你是未来');
                    console.log('你是未来');
                    console.log('你是未来');
                },1000)
            },1000)
        },1000)
```

通过promise可以使上方的代码更优雅，增强可读性，方便维护

```javascript
       new Promise((resolve,reject)=>{
            setTimeout(()=>{
                resolve();
            },1000)
        }).then(()=>{
            console.log("你是光"); // ...

            return new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    resolve();
                },1000)
            })
        }).then(()=>{
            console.log("你是火"); //....

            return new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    resolve();
                },1000)
            })
        }).then(()=>{
            console.log('你是未来'); //...        
        })
```

当然，promise中异步操作成功的时候调用的是resolve函数，但是失败则会调用reject函数

```javascript
    new Promise((resolve,reject)=>{
        reject('异步操作失败了')
    }).catch(data=>{
        console.log(data);
    })
```

**Promise的链式调用**

前面的例子体现了Promise的链式调用思想，现在我们真正认识一下

```javascript
    new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('我是网络请求的数据')
        },1000)
        
    }).then(res=>{
        console.log(res,"第一层");
        
        return new Promise((resolve)=>{
            resolve(res+'，我被处理了')
        })
    }).then(res=>{
        console.log(res,'第二层');
        
        return new Promise((resolve)=>{
            resolve(res+'，TMD我又被操作了一顿')
        })
    }).then(res=>{
        console.log(res,"第三层");
    })
```

当然，这样子的代码看起来有点冗长，因为也可以进行一下简写

```javascript
return new Promise((resolve)=>{
            resolve(res+'，我被处理了')
        })
//简写为
return Promise.resolve(res+',我被处理了')
```

当然，如果是异步执行失败，则是`return Promise.reject(res+',我被处理了')`

甚至可以更加简洁

```javascript
return new Promise((resolve)=>{
            resolve(res+'，我被处理了')
        })
//简写为
return res+',我被处理了'
```

最终上方的代码为：

```javascript
    new Promise((resolve,reject)=>{
        setTimeout(()=>{
        resolve('我是网络请求的数据')
        },1000)
    }).then(res=>{
        console.log(res,"第一层");
        return res+'，我被处理了'
    }).then(res=>{
        console.log(res,'第二层');
        return res+'，TMD我又被操作了一顿'
    }).then(res=>{
        console.log(res,"第三层");
    })
```

**Promise.all()方法的使用**

 该方法的作用是将多个`Promise`对象实例包装，生成并返回一个新的`Promise`实例。 

```javascript
Promise.all([
    new Promise((resolve, reject) => {
        resolve("hello")
    }),
    new Promise((resolve, reject) => {
        resolve("world")
    })  
]).then(res => {
    console.log(res);
})

//输出：[ 'hello', 'world' ]
```


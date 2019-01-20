# Hooks API 在 Vue 中的实现分析

初次听到 React Hooks，是在其刚发布的那几天，网上铺天盖地的文章介绍它。看字面意思是 ‘React 钩子’，就想当然地理解应该是修改 React 组件的钩子吧。React 延伸的概念非常多，高阶组件、函数式、Render Props、Context、等等。又来了一个新概念，前端开发已经够复杂了，我心里这样想着。近两年一直用 Vue，觉得 React 的诸多特性，在 Vue 中也都有类似的解决方案，所以就没有立即去了解它。

后来看到尤大在[Vue 3.0 最近进展](https://www.bilibili.com/video/av36787459/)的视频中也提到了 Hooks API，并写了一个在 [Vue 中使用 Hooks 的 POC](https://github.com/yyx990803/vue-hooks)。看来 Hooks 还是挺重要的，于是马上找到 React 官方文档与发布会的视频 --- 又一轮的恶补。

看了相关资料，觉得 Hooks 的应用前景还是挺诱人的，解决了目前前端开发中的诸多痛点。不过 React Hooks 目前还在 alpha 阶段，不太完善，内置 Hooks 也不丰富。而 Vue 只有个 Hooks POC，Vue3.0 很可能会加上，但需要再等几个月。所以暂不建议在正式代码中使用。

本篇文章着重解释一下我对 Hooks 的理解，以及 Hooks API 在 Vue 中的源码实现。也说明一下 Hooks 是个中立的概念，可以在任何框架中使用，非 React 所独有 :)


## Hooks解决了什么问题

在开始之前，我们先复述一下 Hooks 会帮我们解决什么问题。

按照 Dan 的说法，React 项目的开发中有以下几个痛点：
1. 跨组件代码复用问题。
2. 大组件，难以维护。
3. 组件树层级很深。
4. 类组件不容易理解。

当然 Vue 项目也是一样，其实这些问题也是相关联的。

组件化的开发方式，我们将页面拆分成不同的组件，按自上而下的数据流，层层嵌套。代码结构的最小颗粒是组件。

如果某些组件太大，我们就继续拆分成更小的组件，然后在父组件中调用它。
如果多组件之间有不少通用逻辑，我们就用 mixin 或 构建组件的继承体系。

但是组件拆分，会使我们很容易不小心就把组件的层级搞得很深，增加系统复杂度不说，性能也可能受到影响。并且，有些组件的交互逻辑确实比较复杂，拆分不得，系统长期迭代下来，累积的代码量很大，难以维护。

跨组件逻辑复用更加棘手！mixin是一个双刃剑(参考：[mixin 是有害的](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html))；组件继承也不可取，虽然在强类型的面向对象语言(如：Java/C#)中，继承用着很好，但在 JavaScript 中总感到力不从心，也使得代码晦涩难懂；抽取 util 包也是一个惯用的做法，但如果要抽取的公用逻辑需要关联组件的本地状态呢，如果相关联的公用逻辑需要分散在组件的不同生命周期中呢，就搞不定了！这时候，我们往往就妥协了 --- 大组件/重复逻辑产生了。

上文提到类组件的问题，虽然用面向对象的方式建模系统是很好的做法，但我个人觉得在 JavaScript 中，特别是在基于 React/Vue 组件的开发中，并不很合适，很容易出错。我们经常需要把函数 bind 到某个上下文，以确保 this 的正确指向。JavaScript 的语法过于灵活，我们知道 JavaScript 的基于静态作用域的，就是说从源码上看，就能够推断变量的作用域。但 this 是个例外，它是基于动态作用域的，就是说 this 的值是由调用者决定的。同一个方法，用不同的方式调用，其 this 指向完全不一样。感兴趣的同学，请参考：[详解this](http://dmitrysoshnikov.com/ecmascript/chapter-3-this/)。

如何解决这些痛点呢 --- Hooks!


## Hooks 是什么

wikipedia 上关于 [hooks](https://en.wikipedia.org/wiki/Hooking) 的定义是：

> The term hooking covers a range of techniques used to alter or augment the behavior of an operating system, of applications, or of other software components by intercepting function calls or messages or events passed between software components. Code that handles such intercepted function calls, events or messages is called a hook.

翻译成中文含义是：

Hooks 包含了一系列技术，用于改变或增强操作系统、应用程序、软件组件的行为。这些技术通过拦截软件运行过程中的函数调用、消息、事件来实现。

就是说通过 Hooks，我们能够后期改变或增强已有系统的运行时行为。对应到 React/Vue，则 Hooks 是可以改变或增强组件运行时行为的代码模块。

通过阅读 React Hooks 的技术文档，React 中强调 Hooks 只能在函数式组件中使用。函数式组件本质上是一个单纯的渲染函数，无状态，数据来源于外部。那么如何给组件添加本地状态，以及各种生命周期相关的逻辑呢？答案是：通过 Hooks。

React 团队希望未来 '函数式组件 + Hooks' 成为开发组件的主要方式，那么 Hooks 应该有能力侵入组件生命周期的每个环节。虽然目前 React 提供的 Hooks 还不够丰富，后续会逐渐完善。

综上所述，我们发现，Hooks 可以使我们模块化开发的粒度更细，更函数式。组件的功能变成了由 Hooks 一点点地装配起来。这样的特性，恰恰解决了上面提到的4个痛点：代码复用、大组件、组件树过深、类组件问题。

> 本篇稍微理论化一点，关于 React Hooks 的背景及示例，请参考：[Introducing Hooks](https://reactjs.org/docs/hooks-intro.html)

React 提供了两个重要的内置 Hooks :
- useState -- 为组件添加本地响应式状态。
- useEffect -- 为组件添加状态更新后，需要执行的副作用逻辑。

还有其它一些组件特性相关的 Hooks：useContext、useReducer、useMemo、useRef 等等。未来应该会出现更多的内置 Hooks。我们也可以基于这些内置 Hooks，实现自己的自定义 Hooks。

对于 Vue ，除了 useState、useEffect、useRef 与 React 一致外，还可以实现 useComputed、useMounted、useUpdated、useWatch 等内置 Hooks，以便能够更细致地为组件添加行为。


## Hooks API 的 Vue 实现

这里解析一下[尤大的Hooks POC of Vue](https://github.com/yyx990803/vue-hooks) 的源码实现，以便加深对 Hooks 的理解。

### withHooks

我们知道 React Hooks 只能在函数式组件中使用，Vue 中也要这样定义。

withHooks 用于包装一个 Vue 版的函数式组件，在这个函数式组件中，您可以使用 Hooks 相关的功能。

如，withHooks 使用示例：
```javascript
import {
  withHooks,
  useData,
  useComputed
} from "vue-hooks"

const Foo = withHooks(h => {
  const data = useData({
    count: 0
  })
  const double = useComputed(() => data.count * 2)
  return h('div', [
    h('div', `count is ${data.count}`),
    h('div', `double count is ${double}`),
    h('button', { on: { click: () => {
      data.count++
    }}}, 'count++')
  ])
})
```
代码中 withHooks 包装了一个函数式组件(渲染函数)，函数中通过 Hooks 为组件添加了一个本地状态 data，及一个计算属性 double。
注意：代码中的 useData 与 useState 类似，下文会解释。

withHooks 实现细节：
```javascript
let currentInstance = null
let isMounting = false
let callIndex = 0

function ensureCurrentInstance() {
  if (!currentInstance) {
    throw new Error(
      `invalid hooks call: hooks can only be called in a function passed to withHooks.`
    )
  }
}

export function withHooks(render) {
  return {
    data() {
      return {
        _state: {}
      }
    },
    created() {
      this._effectStore = {}
      this._refsStore = {}
      this._computedStore = {}
    },
    render(h) {
      callIndex = 0
      currentInstance = this
      isMounting = !this._vnode
      const ret = render(h, this.$attrs, this.$props)
      currentInstance = null
      return ret
    }
  }
}
```
代码中：

withHooks 为组件添加了一个私有本地状态 \_state，用于存储 useState/useData 所关联的状态值。

在 created 中，为组件注入了一些支持 Hooks 所需要的变量。

重点是代码中的 render 函数：

- callIndex，为 Hooks 相关的存储对象提供 key。这里每次渲染，都重置为 0，是为了能够根据调用次序匹配对应的 Hooks，这样处理也限制了 Hooks 只能在顶级代码中调用。
- currentInstance，结合 ensureCurrentInstance 函数，用于确保 Hooks 只能在函数式组件中使用。
- isMounting，用于标识组件的挂载状态


### useState

useState 用于为组件添加一个响应式的本地状态，及该状态相关的更新器。

方法签名为：
> const [state, setState] = useState(initialState);

setState 用于更新状态：
> setState(newState);

如，useState 使用示例：
```javascript
import { withHooks, useState } from "vue-hooks"
const Foo = withHooks(h => {
  const [count, setCount] = useState(0)
  return h("div", [
    h("span", `count is: ${count}`),
    h("button", { on: { click: () => setCount(count + 1) } }, "+" )
  ])
})
```
代码中，通过 useState 为组件添加了一个本地状态 count 与更新状态值用的函数 setCount。


useState 实现细节:
```javascript
export function useState(initial) {
  ensureCurrentInstance()
  const id = ++callIndex
  // 获取组件实例的本地状态。
  const state = currentInstance.$data._state
  // 本地状态更新器，以自增id为键值，存储到本地状态中。
  const updater = newValue => {
    state[id] = newValue
  }
  if (isMounting) {
    // 通过$set保证其是响应式状态。
    currentInstance.$set(state, id, initial)
  }
  // 返回响应式状态与更新器。
  return [state[id], updater]
}
```
以上代码很清晰地描述了 useState 是在组件中创建了一个本地的响应式状态，并生成了一个状态更新器。

需要注意的是：
- 函数 ensureCurrentInstance 是为了确保 useState 必须在 render 中执行，也就是限制了必须在函数式组件中执行。
- 以 callIndex 生成的自增 id 作为存储状态值的 key。说明 useState 需要依赖第一次渲染时的调用顺序来匹配过去的 state（每次渲染 callIndex 需要重置为0）。这也限制了 useState 必须在顶层代码中使用。
- 其它 hooks 也必须遵循以上两点。


### useEffect

useEffect 用于添加组件状态更新后，需要执行一些副作用逻辑。

#### 方法签名：
> void useEffect(rawEffect, deps)

useEffect 指定的副作用逻辑，会在组件挂载后执行一次、在每次组件渲染后根据指定的依赖有选择地执行、并在组件卸载时执行清理逻辑(如果指定了的话)。

#### 调用示例 1：
```javascript
import { withHooks, useState, useEffect } from "vue-hooks"

const Foo = withHooks(h => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    document.title = "count is " + count
  })
  return h("div", [
    h("span", `count is: ${count}`),
    h("button", { on: { click: () => setCount(count + 1) } }, "+" )
  ])
})
```
代码中，通过 useEffect 使每当 count 的状态值变化时，都会重置 document.title。

注意：这里没有指定 useEffect 的第二个参数 deps，表示只要组件重新渲染都会执行 useEffect 指定的逻辑，不限制必须是 count 变化时。useEffect 详细的参数说明，请参考：[Using the Effect Hook](https://reactjs.org/docs/hooks-effect.html)

#### 调用示例 2：
```javascript
import { withHooks, useState, useEffect } from "vue-hooks"

const Foo = withHooks(h => {
  const [width, setWidth] = useState(window.innerWidth)
  const handleResize = () => {
    setWidth(window.innerWidth)
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return h("div", [
    h("div", `window width is: ${width}`)
  ])
})
```
代码中，通过 useEffect 控制在窗口改变时重新获取其宽度。

useEffect 逻辑的返回值，如果是函数的话，则定义其为清理逻辑。清理逻辑会在组件需要重新执行 useEffect 逻辑之前，或组件被销毁时执行。

这里在 useEffect 逻辑中，为 window 对象添加了 resize 事件，那么就需要在组件销毁时或需要重新执行该副作用逻辑时，先把 resize 事件注销掉，以避免不必要的事件处理。

另外，需要注意，这里 useEffect 的第二个参数的值是 []，表明无依赖项，只在组件创建后执行一次，这样处理也符合这里的业务场景。


#### useEffect 实现细节:

```javascript
export function useEffect(rawEffect, deps) {
  ensureCurrentInstance()
  const id = ++callIndex
  if (isMounting) {
    const cleanup = () => {
      const { current } = cleanup
      if (current) {
        current()
        cleanup.current = null
      }
    }
    const effect = () => {
      const { current } = effect
      if (current) {
        cleanup.current = current() // rawEffect的返回值，如果是一个函数的话，则定义为useEffect副作用的清理函数。
        effect.current = null
      }
    }
    effect.current = rawEffect
    // 在组件实例上，存储useEffect相关逻辑。
    currentInstance._effectStore[id] = {
      effect,
      cleanup,
      deps
    }
    // 组件实例mounted时，执行useEffect逻辑。
    currentInstance.$on('hook:mounted', effect)
    // 组件实例destroyed时，执行useEffect相关清理逻辑。
    currentInstance.$on('hook:destroyed', cleanup)
    // 若未指定依赖项或存在明确的依赖项时，当组件实例updated时，执行useEffect逻辑。
    // 若指定依赖项为 [], 则useEffect只在mounted时执行一次。
    if (!deps || deps.length > 0) {
      currentInstance.$on('hook:updated', effect)
    }
  } else {
    const record = currentInstance._effectStore[id]
    const { effect, cleanup, deps: prevDeps = [] } = record
    record.deps = deps
    if (!deps || deps.some((d, i) => d !== prevDeps[i])) {
      // 依赖的状态值有变动时，清理useEffect的副作用并重新执行。
      cleanup()
      // useEffect 执行完毕后，会将 current 的属性置为 null. 这里将 current 的值设置为 rawEffect，
      // 是为了在 updated 时执行 useEffect 逻辑。
      effect.current = rawEffect
    }
  }
}
```
可以看到 useEffect 所指定的副作用逻辑，涉及到了组件的三个生命周期：mounted、updated、destroyed。

通过参数，可以为 useEffect 指定 3 种信息：
- rawEffect - 副作用逻辑内容。
- 清理逻辑 - 通过 rawEffect 的返回值定义。
- 依赖 - 定义何时需要重复执行副作用逻辑。

副作用逻辑的执行细节由 deps 控制：
- mounted 时，固定地执行一次。
- 如果 deps 未指定，则每次 updated 后都执行一次。
- 如果 deps 为空数组，则 updated 后不执行。
- 如果 deps 指定了依赖项，则当相应的依赖项的值改变时，执行一次。

清理逻辑，会在 2 种情况下执行：
- rawEffect 需要重复执行之前，清理上次运行所带来的副作用。
- 组件销毁时。


### useRef

相当于为组件存储一个本地变量 --- 非状态。

#### 方法签名：
> const refContainer = useRef(initialValue)

#### useRef 实现细节：

```javascript
export function useRef(initial) {
  ensureCurrentInstance()
  const id = ++callIndex
  const { _refsStore: refs } = currentInstance
  return isMounting ?
    (refs[id] = {
      current: initial
    }) :
    refs[id]
}
```


### useMounted

添加需要在 mounted 事件中执行的逻辑。

useMounted 实现细节：
```javascript
export function useMounted(fn) {
  useEffect(fn, [])
}
```
通过 useEffect 实现，如果 deps 的值为空的话，fn 就不在 updated 中执行了 --- 即仅在 mounted 时执行一次.



### useDestroyed

添加需要在 destroyed 阶段执行的逻辑。

```javascript
export function useDestroyed(fn) {
  useEffect(() => fn, [])
}
```
上面提到 useEffect 的副作用逻辑的返回值，如果是函数的话，会在 destroyed 阶段作为清理逻辑执行。
这里通过设置 deps 的值为[]，并把 fn 指定为 useEffect 的副作用逻辑的返回值，使 fn 在 destroyed 阶段执行。



### useUpdated

添加只在组件更新后执行的逻辑。

```javascript
export function useUpdated(fn, deps) {
  const isMount = useRef(true)  // 通过 useRef 生成一个标识符。
  useEffect(() => {
    if (isMount.current) {
      isMount.current = false // 跳过 mounted.
    } else {
      return fn()
    }
  }, deps)
}
```
通过 useEffect 实现，fn 定义在了清理逻辑的位置，每次组件更新都会执行，详细请参考 useEffect 的实现细节。



### useWatch

为组件添加 watch.

```javascript
export function useWatch(getter, cb, options) {
  ensureCurrentInstance()
  if (isMounting) {
    currentInstance.$watch(getter, cb, options)
  }
}
```
直接通过组件实例的 $watch 实现。



### useComputed

为组件添加 computed 属性。

```javascript
export function useComputed(getter) {
  ensureCurrentInstance()
  const id = ++callIndex
  const store = currentInstance._computedStore
  if (isMounting) {
    store[id] = getter()
    currentInstance.$watch(
      getter,
      val => { store[id] = val },
      { sync: true }
    )
  }
  return store[id]
}
```
本质上也是通过组件实例的 $watch 实现。


### 完整代码及示例

请参考：[POC of vue-hooks](https://github.com/yyx990803/vue-hooks)


## 结论

1. Hooks 有能力切入组件生命周期的各个环节。
2. 以 纯组件 + Hooks 的方式开发组件，我们基本上告别 this 了。我们由面向对象编程转到了函数式编程。
3. 通过 Hooks，使我们能够根据业务逻辑的相关性组织代码模块，摆脱了组件类型格式的限制。

## 疑问

1. Hooks 能否替代全局状态管理库，如redux、vuex等。目前来看不可以，useState处理的本地状态，全局状态如何处理？

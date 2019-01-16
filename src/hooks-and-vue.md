# 理解React Hooks及在Vue中Hooks的使用

初次听到 React Hooks，是在其刚发布的那几天，网上铺天盖地的大量文章介绍它。看字面意思是 ‘React 钩子’，就想当然地理解应该是修改 React 组件生命周期的钩子吧。React 延伸的概念非常多，高阶组件、函数式组件、Render Props、Context、...，又来了一个新概念，使得前端开发越来越复杂，我心里这样想着。近两年一直用 Vue，觉得 React 的诸多特性，在 Vue 中也都有类似的解决方案，所以就没有立即去了解它。

后来看到尤大在[Vue3.0 最近进展](https://www.bilibili.com/video/av36787459/)的视频也提到了 Hooks API，并写了一个在 [Vue 中使用 Hooks 的 POC](https://github.com/yyx990803/vue-hooks)。看来 React Hooks 还是挺重要的，于是马上找到 React 官方文档与发布会的视频 -- 又一轮的恶补。

这篇文章着重解释一下我对 Hooks API 的理解，及在 Vue 中的实现。

## Hooks 是什么

Hooks 跟 React 没有特别直接的关联，作用为一种逻辑的复用机制，是一个可以在任何框架内被使用的概念。

我总结它的作用是：
> 切入组件的生命周期，以更细的粒度，为组件装配功能。

这样理解也符合 hooks 的定义，[wikipedia](https://en.wikipedia.org/wiki/Hooking)上关于 hooks 的定义是
> hooking covers a range of techniques used to alter or augment the behavior of an operating system, of applications。

即：hooks 可用于修改或增加应用程序的功能。

## Hooks解决了什么问题

按照 Dan 的说法，Hooks 解决了以下几个问题：
1. 代码复用
2. 大组件
3. 组件树层级很深
4. 类组件不容易理解

其实这些问题是相关联的.

组件化的开发方式，我们将页面拆分成不同的组件，按照自上而下的数据流，层层嵌套。代码的最小颗粒是组件。如果某些组件太大，我们就继续拆分成更小的组件，然后在父组件中调用它!

这种方式一直用得也不错，但也有不少痛点:

1. 有些组件的交互逻辑确实比较复杂，难以拆分，系统长期迭代下来，累积的代码量很大，难于维护。

2. 即便是把大组件拆分了，又很容易使组件嵌套层次很深。如有时候我们为了使代码更简洁一些，一个图标都会对应一个组件。这样造成了很深层级的组件树，增加系统复杂度不说，性能也可能会受影响。

3. 不同的组件中，往往包含一些通用逻辑，很难剥离出来。我们惯用的做法是，拆出来一个 util.js 做为工具包，然后在不同组件中调用。这种方式是很好的，可以把业务无关的逻辑剥离出来，使业务组件代码更精简一些。但是，如果这些公用逻辑需要关联组件的本地状态，或者需要分散在组件不同的生命周期中，就搞不定了。这时候我们不得不妥协性地在多个组件中包含一些重复逻辑。

> 为了解决代码复用的问题，出现了各种招式，其中常用的有 mixin，但每种方式都有各自的弊病，要么是增加了系统的复杂度，要么使代码更脆弱，要么是可读性不好，比如：[mixin 是有害的](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)。

4. React/Vue组件的概念，还是继承了面向对象的思想。有时代码并不容易理解，特别是 this，我们经常需要把函数 bind 到某个上下文。我们知道 js 的基于静态作用域的，就是说从源码上看，就能够推断变量的作用域。但 this 是个例外，this可以认为是一个特殊的只读变量，基于动态作用域的，就是说 this 的值是由调用者决定的。同一个方法，用不同的方式调用，其 this 指向完全不一样。

如何解决这些痛点呢 --- Hooks!

老代码不需要重构，hooks是为前端工具箱中的一个，当我们碰到诸如以上的问题时，可以采用 hooks 更优雅的解决方案。


## Hooks API

Hooks 应该有能力侵入组件生命周期的每个环节。React 团队也希望未来 '函数式组件 + Hooks' 成为开发组件的主要方式。目前 React 提供的 Hooks 还不够丰富，后续会逐渐完善。

这里结合 React Hooks API 与 [尤大的Hooks POC of Vue](https://github.com/yyx990803/vue-hooks) 分析一下 Hooks API 在 Vue 中的实现。

> React Hooks 只在 alpha 阶段，而 Vue 只是有个 Hooks POC，目前这种机制还很不完善，不建议在正式代码中使用。但 Hooks 带来的应用前景非常诱人，这里分析 Hooks 的 Vue 实现是为了更好地理解 Hooks，以及说明 Hooks 是个中立的概念，非 React 所独有(Vue3.0 很可能会加上，但需要再等几个月)。

### useState

可以为组件添加一个响应式的本地状态，及该状态相关的更新器。

方法签名为：
> const [state, setState] = useState(initialState);

setState 用于更新状态：
> setState(newState);

Vue 中实现 useState:
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
1. 函数 ensureCurrentInstance 是为了确保 useState 必须在 render 中执行，也就是限制了必须在函数式组件中执行。
2. 以 callIndex 生成的自增id作为存储状态值的key。说明 useState 需要依赖第一次渲染时的调用顺序来匹配过去的 state（每次渲染 callIndex 为重置为0）。这也限制了 useState 必须在顶层代码中使用。
3. 其它 hooks 也必须遵循以上两点。

### useEffect

useEffect 是为了在组件的生命周期中，执行一些带有副作用的逻辑。

方法签名：
> void useEffect(rawEffect, deps);

Vue 中实现 useEffect:

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
可以看到 useEffect 所指定的副作用逻辑，会在组件的 mounted、updated、destroyed 三个时期执行。执行的细节由 deps 控制。

需要注意：
1. 如果 deps 为 null/undefined，则副作用逻辑在每次渲染都会执行。
2. 如果 deps 指定了依赖的状态，则相应状态改变时，会执行副作用逻辑。
3. 如果 deps 指定为 []，则副作用逻辑仅会在 mounted 时执行。
4. 每次需要执行副作用逻辑时，都会先执行清理逻辑 -- rawEffect 的返回值。
5. 组件 destroyed 时，会执行清理逻辑。

### useRef

相当于为组件存储一个本地变量 --- 非状态。

方法签名：
> const refContainer = useRef(initialValue)

Vue 中 useRef 的实现：

```javascript
export function useRef(initial) {
  ensureCurrentInstance()
  const id = ++callIndex
  const { _refsStore: refs } = currentInstance
  return isMounting ?
    (refs[id] = {
      current: initial
    })
    :
    refs[id]
}
```

### useMounted

添加需要在 mounted 事件中执行的逻辑。

Vue 中 useMounted 的实现：
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
      val => {
        store[id] = val
      },
      {
        sync: true
      }
    )
  }
  return store[id]
}
```
本质上也是通过组件实例的 $watch 实现。


### 包装函数式组件

把指定的渲染函数封装成 Vue 组件。

```javascript
export function withHooks(render) {
  return {
    data() {
      return {
        _state: {}  // 存储 hook state.
      }
    },
    created() {
      // 存储 hooks 相关辅助变量。
      this._effectStore = {}
      this._refsStore = {}
      this._computedStore = {}
    },
    render(h) {
      callIndex = 0 // 重置索引，以便根据调用次序匹配对应的 hooks.
      currentInstance = this  // 当前组件实例
      isMounting = !this._vnode // 标识组件的挂载状态。
      const ret = render(h, this.$attrs, this.$props) // 渲染
      currentInstance = null
      return ret
    }
  }
}
```
Vue 中函数式组件不多见，这里是为了模拟 React 的函数式组件。

本质上函数式组件就是一个渲染函数，只负责渲染，渲染数据来源于外部，本身无状态 --- 相当于赤裸裸的组件。它的状态、生命周期中需要执行的逻辑从那里来呢? --- 由 hooks 提供。

因此更直观地说明了，hooks使我们模块化的开发粒度更细了，更函数式了。组件的功能变成了由 hooks 一点点地装配起来。

### 全局支持 hooks

将hooks逻辑以vue插件的方式注入，所有vue组件全局生效。

```javascript
export function hooks(Vue) {
  Vue.mixin({
    beforeCreate() {
      const { hooks, data } = this.$options
      if (hooks) {
        this._effectStore = {}
        this._refsStore = {}
        this._computedStore = {}
        this.$options.data = function () {
          const ret = data ? data.call(this) : {}
          ret._state = {}
          return ret
        }
      }
    },
    beforeMount() {
      const { hooks, render } = this.$options
      if (hooks && render) {
        this.$options.render = function (h) {
          callIndex = 0
          currentInstance = this
          isMounting = !this._vnode
          const hookProps = hooks(this.$props)
          Object.assign(this._self, hookProps)
          const ret = render.call(this, h)
          currentInstance = null
          return ret
        }
      }
    }
  })
}
```

完整代码及示例请参考：[POC of vue-hooks](https://github.com/yyx990803/vue-hooks)

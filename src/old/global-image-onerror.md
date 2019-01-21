# 如何在图片加载失败时，显示默认图片

一般地:
```javascript
imgEl.onerror(function(){
	this.src = './assets/pic404.png';
});
//或批量地：
imgEls.forEach(function(imgEl){
	imgEl.src = './assets/pic404.png';
});
```

1. 不能处理后期追加的图片，如通过ajax获取数据的表格行内图片.
2. 要在每个图片上监听onerror事件

上面两点本质上是，写着太麻烦，性能应该不是问题，有没有可能写一个全局的处理图片404的功能呢？

首先想到 window.onerror,顾名思义，它用于监听页面内的错误事件，监听 JS 运行时错误很好用，可不可以监听图片资源的加载错误呢？

先看定义：
1. When a JavaScript runtime error occurs, an error event using interface ErrorEvent is fired at window and window.onerror() is invoked (as well as handlers attached by window.addEventListener (not only capturing)).

2. When a resource (such as an &lt;img&gt; or &lt;script&gt;) fails to load, an error event using interface Event is fired at the element, that initiated the load, and the onerror() handler on the element is invoked. <b>These error events do not bubble up to window, but (at least in Firefox) can be handled with a single capturing window.addEventListener</b>.

发现：image 或 script 等相关资源加载失败时，确实会触发 onerror 事件，但仅在 image 或 script 本身上触发，且不支持冒泡.

但，可以支持捕获阶段的 window.addEventListener('error')，所以想到如下代码:

```javascript
import nonImagePath from './assets/pic404.png'
window.addEventListener( 'error', function(e){
	if(e.type == 'error' && e.target.constructor === window.HTMLImageElement){
		e.target.src = nonImagePath;
	}
}, true )	//注意加true,使用事件的捕获阶段
```

可行 :)

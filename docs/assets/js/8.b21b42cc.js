(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{177:function(t,s,a){"use strict";a.r(s);var n=a(0),e=Object(n.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"content"},[a("h1",{attrs:{id:"如何在图片加载失败时，显示默认图片"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#如何在图片加载失败时，显示默认图片","aria-hidden":"true"}},[t._v("#")]),t._v(" 如何在图片加载失败时，显示默认图片")]),t._v(" "),a("p",[t._v("一般地:")]),t._v(" "),a("div",{staticClass:"language-javascript extra-class"},[a("pre",{pre:!0,attrs:{class:"language-javascript"}},[a("code",[t._v("imgEl"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("onerror")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("src "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'./assets/pic404.png'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//或批量地：")]),t._v("\nimgEls"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("forEach")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("imgEl"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\timgEl"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("src "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'./assets/pic404.png'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("ol",[a("li",[t._v("不能处理后期追加的图片，如通过ajax获取数据的表格行内图片.")]),t._v(" "),a("li",[t._v("要在每个图片上监听onerror事件")])]),t._v(" "),a("p",[t._v("上面两点本质上是，写着太麻烦，性能应该不是问题，有没有可能写一个全局的处理图片404的功能呢？")]),t._v(" "),a("p",[t._v("首先想到 window.onerror,顾名思义，它用于监听页面内的错误事件，监听 JS 运行时错误很好用，可不可以监听图片资源的加载错误呢？")]),t._v(" "),a("p",[t._v("先看定义：")]),t._v(" "),a("ol",[a("li",[a("p",[t._v("When a JavaScript runtime error occurs, an error event using interface ErrorEvent is fired at window and window.onerror() is invoked (as well as handlers attached by window.addEventListener (not only capturing)).")])]),t._v(" "),a("li",[a("p",[t._v("When a resource (such as an <img> or <script>) fails to load, an error event using interface Event is fired at the element, that initiated the load, and the onerror() handler on the element is invoked. "),a("b",[t._v("These error events do not bubble up to window, but (at least in Firefox) can be handled with a single capturing window.addEventListener")]),t._v(".")])])]),t._v(" "),a("p",[t._v("发现：image 或 script 等相关资源加载失败时，确实会触发 onerror 事件，但仅在 image 或 script 本身上触发，且不支持冒泡.")]),t._v(" "),a("p",[t._v("但，可以支持捕获阶段的 window.addEventListener('error')，所以想到如下代码:")]),t._v(" "),a("div",{staticClass:"language-javascript extra-class"},[a("pre",{pre:!0,attrs:{class:"language-javascript"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" nonImagePath "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'./assets/pic404.png'")]),t._v("\nwindow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("addEventListener")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'error'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("e"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("e"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("type "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("==")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'error'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" e"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("target"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("constructor "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" window"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("HTMLImageElement"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t\te"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("target"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("src "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" nonImagePath"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\t"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//注意加true,使用事件的捕获阶段")]),t._v("\n")])])]),a("p",[t._v("可行 😃")])])}],!1,null,null,null);e.options.__file="global-image-onerror.md";s.default=e.exports}}]);
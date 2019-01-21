# JavaScript 数组 Sort 函数的坑

## 案例

最近在调试一个 js bug 时，最终发现，是由于对原生数组排序函数 sort 的不正确使用导致的。

sort 函数接收一个函数参数 comparefn，用于指定自定义排序的比对逻辑，如下：
```javascript
arrayObject.sort(comparefn)
```
其中，参数 comparefn 函式中需要返回 1/0/-1，而非true/false。

一般写自定义比对逻辑时，往往随手写成了类似 function(a,b){ return a>b; } 的函式，导致出错。

其实 comparefn 的返回值，本应该返回三种状态：大于、等于、小于。惯例的做法是返回 1、0、-1 三个值。这里 comparefn 正是这样设计的。如果返回的不是一个数值类型，如，返回一个bool值，则在 sort 的内部实现中，将会被隐式转换为数值类型.

如下代码:
```javascript
//正确
arr.sort(function(a,b){
	return a > b ? 1 : -1
});
//错误
arr.sort(function(a,b){
	//相当于 return Number(a>b);
	//javascript中 Number(true) == 1、Number(false) == 0
 	return a > b;
});
```

Array sort 函数的详细用法参考：[MDN Array.prototype.sort ](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

## sort 函数内部是如何实现的

这里以 V8 为例，V8 中 JavaScript 原生函数是用 JS 实现的，先看看为什么会存在隐式转换。

如下代码：
```javascript
//插入排序
function InsertionSort(a, from, to) {
  for (var i = from + 1; i < to; i++) {
    var element = a[i];
    for (var j = i - 1; j >= from; j--) {
      var tmp = a[j];
      var order = comparefn(tmp, element);
      if (order > 0) {
        a[j + 1] = tmp;
      } else {
        break;
      }
    }
    a[j + 1] = element;
  }
};
//快速排序
function QuickSort(a, from, to) {
  while (true) {
    // ...
    var c01 = comparefn(v0, v1);
    if (c01 > 0) {
			// ...
    }
    var c02 = comparefn(v0, v2);
    if (c02 >= 0) {
			// ...
    } else {
      var c12 = comparefn(v1, v2);
      if (c12 > 0) {
				// ...
      }
    }
    // ...
    for (var i = low_end + 1; i < high_start; i++) {
      var element = a[i];
      var order = comparefn(element, pivot);
      if (order < 0) {
        // ...
      } else if (order > 0) {
        do {
          // ...
          order = comparefn(top_elem, pivot);
        } while (order > 0);
        if (order < 0) {
					// ...
        }
      }
    }
    // ...
  }
}
```
看到代码中，如何使用 comparefn 函数的返回值，就知道为什么了。

它直接拿来与 0 比较，未做返回值是 bool 类型的兼容处理，而 bool 类型与数值类型比较时会被隐式转换为数值。


## sort 函数为什么不是纯函数

前些日子还碰到一个 bug，也是由于未正确使用 arrayObject.sort(comparefn) 引起的。

由于 arrayObject 是引用传递的，在系统的多处用到了 arrayObject。并且也是由两个同事不同的时间操作的这个 arrayObject, 其中一个同事有了排序的需求，没有将 arrayObject 深拷贝一份，上来直接 arrayObject.sort(comparefn)。最终导致了所以依赖于 arrayObject 的 UI 的次序都被改变了，产生了副使用！

解决这个问题的方法很多，如：
```javascript
1. arrayObject.filter(()=>true).sort(comparefn)
2. arrayObject.slice(0).sort(comparefn)
```
其本质，都是生成一副数组拷贝.

数组的原生函数，大都是 Immutable 的，如 concat、slice、filter、... ；字符串的原生函数，全部是 Immutable 的。

为什么数组的sort函数不是呢？

原因在于 Immutable 也不是万能的，一些情况下使用它会造成很大的不便，因为事物的本质是 Mutation 的。

Mutation 的 sort 函数也很容易被重写成 Immutable sort，如下：

```javascript
let sort = Array.prototype.sort;
Array.prototype.sort = function(){
	let args = this.slice.call(arguments);
	return sort.apply(this.slice(), args);
}
```

此时，我体会到了 Immutable 编程模式的必要之处。

回想之前，处理过很多的隐藏较深的 bug 都是由于系统的数据(或状态)被无意间改变了(Mutation)导致的.

系统状态被多个模块所操作，就像是多线程竞争资源那样极易产生问题(buggy).

原则上，在主流的 Mutation 编程模式上配合使用 Immutable 的方式，会使系统状态更易预测，不容易出bug。如，在参数传递时尽可能使用 Immutable, 其实就是避免引用传递，clone 一份使用值传递，减小函数的执行产生副作用的可能性.

## Mutation 与 Immutable

TODO:
「可变与不可变」这两种编程模式，我理解还不深刻，有待遇深入学习。

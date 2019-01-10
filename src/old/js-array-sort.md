# 关于JavaScript Array Sort函数的坑

最近在调试一个js bug时，最终发现是由于对原生数组函数sort的不正确使用导致的。

数组的sort函数接收一个函式参数comparefn, 指定自定义排序的比对逻辑，如下：
```javascript
arrayObject.sort(comparefn)
```
其中参数comparefn函式中需要返回1/0/-1，而非true/false.
一般写自定义比对逻辑时，往往随手写成了类似function(a,b){return a>b;}的函式，导致出错。

其实comparefn的返回值本应该返回三种状态：大于、等于、小于。惯例的做法是返回：1、0、-1三个值。这里comparefn正是这样设计的。
如果返回的不是一个数值类型，如返回一个bool值，在sort的内部实现中将会被隐式转换为数值类型.

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

Array sort函数的详细用法参考：[MDN Array.prototype.sort ](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

# sort函数内部是如何实现的？

这里以V8为例，V8中JavaScript原生函数是用JS实现的，先看看为什么会存在隐式转换，如下代码：
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
看到其中的如何使用comparefn函数的返回值，就知道为什么了。
它直接拿来与0比较，未做返回值是bool类型的兼容处理，而bool类型与数值类型比较时会被隐式转换为数值。


# sort函数为什么不是纯函数?

前些日子还碰到一个bug，也是由于未正确使用arrayObject.sort(comparefn)引起的。由于arrayObject的引用传递，在系统的多处用到了arrayObject.
并且也是由两个同事不同的时间操作的这个arrayObject, 其中一个同事有了排序的需求，没有将arrayObject拷贝一份，上来直接arrayObject.sort(comparefn). 最终导致了所以依赖于arrayObject的UI的次序都被改变了，产生了副使用！！！

解决这个问题的方法很多，如：
```javascript
arrayObject.filter(()=>true).sort(comparefn)
arrayObject.slice(0).sort(comparefn)
```
其本质都是生成一副数组拷贝.

数组的原生函数大都是Immutable的，如concat,slice,filter ... , 字符串的原生函数全部是Immutable的， 为什么数组的sort函数不是呢？
原因在于Immutable也不是万能的，一些情况下使用它会造成很大的不便，因为事物的本质是Mutation的.
Mutation 的sort函数也很容易被重写成Immutable sort，如下

```javascript
let sort = Array.prototype.sort;
Array.prototype.sort = function(){
	let args = this.slice.call(arguments);
	return sort.apply(this.slice(), args);
}
```

此时体会到了 Immutable 编程模式的必要之处。回想之前处理过很多的隐藏较深的bug都是由于系统的数据(或状态)被无意间改变了(Mutation)导致的.

系统状态被多个模块所操作，就像是多线程竞争资源那样极易产生问题(buggy).



原则上在主流的Mutation编程模式的基本上配合使用Immutable的方式，会使系统状态更易预测，不容易出bug.
如在参数传递时尽可以使用Immutable, 其实就是避免引用传递，clone一份使用值传递，减小函数的执行产生副作用的可能性.


详细整理解释，待续

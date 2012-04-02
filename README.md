iSlider v0.0331
===========================

幻灯片，基于HTML5与响应式设计，尤其在移动设备上有良好的体验。

a simple slider based on html5, with responsive design and mobile devices optimization.

## 兼容性(Compatibility)
- tested on: iOS(5+), Android(2.3+), Chrome for Android, Desktop Webkit;
- FireFox supported flexbox in it's own way, I'm not gonna to make it compatible;

## 使用方法
编辑template.html

其中slide template部分为幻灯内容。

###API
获取当前页码：

``` js
Slider.current();
```

移动至第index页：

``` js
Slider.to(index);
```

##Todo
- no-flexbox browser supported;
- if you got any idea, let me know!
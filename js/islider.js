$(function(){
  slider = {
  
    //设置slide宽度占其父容器百分比
    slideWidth: 70,
	
    //设备检测
    device:{
      phone: window.matchMedia("(max-device-width:767px)"),
      pad: window.matchMedia("(min-device-width:768px) and (max-device-width:1024px)"),
      landscape: window.matchMedia("(orientation:landscape)"),
      touch: Modernizr.touch,
      css3d: Modernizr.csstransforms3d,
      flexbox: Modernizr.flexbox,
      isWebkit: (/webkit/i).test(navigator.appVersion),
      useiscroll: Modernizr.touch || !Modernizr.flexbox
    },
    
	//slider页数
    length: $(".slides li").length,
	
    //current(): 获取当前页面index
	//current(index): 设置当前页面index
	//description: 获取、修改当前页数，所有操作通过修改该参数后调用update更新页面
    current: (function(){
		var curr = curr || Number(location.hash.substring(1)) || 0;
		return function(index){
			if (index == undefined) return curr;
			else if (Number(index) == NaN || index<0 || index>=slider.length) return false;
			else curr = index;
		}
	})(),
    
    _slides: {
      dom:$(".slides"),
      moveTo:function(index){
        if (slider.device.useiscroll){
          if (slider.scroll.currPageX != index) {slider.scroll.scrollToPage(index);}
        }
        else {
          //if (slider.device.css3d) {
            //this.dom[0].style[Modernizr.prefixed("transform3d")] = "translate(" + (-slider.slideWidth * index) +"%, 0, 0)";
          //}
          //else{
            this.dom[0].style[Modernizr.prefixed("transform")] = "translate(" + (-slider.slideWidth * index) +"%, 0)";
          //}
        }
      }
    },
    _pager: {
      dom:$(".pager"),
	  //页码按钮的位置数据，包括width（按钮宽度）, gap（按钮间距）, start（首个按钮X轴位置）
      position:{},
      moveTo:function(index){
        $(this.dom.find("li").removeClass("current")[index]).addClass("current");
        this.dom.find(".btn-ctrl").removeClass("disabled");
        if (index == 0){ 
            this.dom.find(".previous").addClass("disabled"); 
		}
		if (index == slider.length-1){
			this.dom.find(".next").addClass("disabled"); 
        }  
      },
	  //para：Touch.pageX
	  //return: index of the current touched button 
	  //description: 返回当前触摸位置的页码
      getIndex: function(pageX){
        var index = Math.floor((pageX - this.position.start)/this.position.width);
        return ((index<0) || (index>slider.length-1)) ? -1 : index;
      },
	  //recalculate this.position
      refresh: function(){
        var first = $(this.dom.find("li")[0]);
        this.position.width = first.next().length ? first.next().position().left - first.position().left : first.outerWidth();
        this.position.gap =this.position.width - first.outerWidth();
        this.position.start = first.position().left - this.position.gap/2;
      }
    },
	
	//使用iScroll时的实例
    scroll: {},
    
	//改变当前页面hash值
    _hash: function(index){
      if (index<0 || index>=slider.length) return;
      location.hash = index;
    },
	
	//刷新dom
    update: function(){
      this._hash(this.current());
      this._slides.moveTo(this.current());
      this._pager.moveTo(this.current());
    },
    previous: function(){
      this.current(this.current() - 1);
	  this.update();
    },
    next: function(){
      this.current(this.current() + 1);
	  this.update();
    },
    
    init: function(){
      //生成页码
      var dom = [];
      for (var i=0; i<this.length; i++){
        dom.push($("<li class='box box-wrapper'><a class='box' href='#"+i+"'>"+i+"</a></li>")[0]);
      }
      this._pager.dom.find("ol").append(dom);
      this._pager.refresh();
      
      //监听事件
	  //hashchange事件
      window.onhashchange = function(e){
        var hash = Number(location.hash.substring(1));
        if (hash == slider.current() || hash<0 || hash>=slider.length) {
          slider._hash(slider.current());
          return;
        }
        slider.current(hash);
        slider.update();
      };
	  //键盘左右键
      $(document).bind("keydown", function(e){
        switch (e.keyCode){
            case 37:
              slider.previous();
              break
            case 39:
              slider.next();
              break
        }
      });
	  //导航箭头
      $(".pager .previous").bind("click", function(){slider.previous();});
      $(".pager .next").bind("click", function(){slider.next();});
      //移动设备onorientationchange或resize
      var fnResize = function(){
        window.scroll(0,0);
        window.setTimeout(function(){
          if (slider.device.useiscroll) { 
            slider.scroll.refresh();
            slider.scroll.scrollToPage(slider.current(), 0, 0); 
          }
          if (slider.device.touch) { slider._pager.refresh();}
        },0);
      };
      if ('onorientationchange' in window && slider.device.landscape.addListener) {
        slider.device.landscape.addListener(fnResize);
      }
      else{
        $(window).bind( 'resize', fnResize);
      }
      document.addEventListener("touchstart",function(e){e.preventDefault();});
      
      //touch部分
      if (this.device.useiscroll){
        //实例化iScroll
        this.scroll = new iScroll('slider', {
          snap: 'li',
          momentum: false,
          hScrollbar: false,
          onScrollEnd: function(){
            if (slider.current() !== this.currPageX){
              slider.current(this.currPageX);
              slider.update();
             }
          }
        });
        $("#slider").css("overflow","visible");
        
        //页码部分touch支持        
        var touchStart = function(event){
          if (event.srcElement.className.indexOf("btn-ctrl") !== -1) {
            $(event.srcElement).click();
            return;
          }
          event.preventDefault();
          var pager = slider._pager;
          var index = pager.getIndex(event.touches[0].pageX);
          if ( index != -1 ){
          $(pager.dom.find("li").removeClass("highlight current")[index]).addClass("highlight current");
          if ( slider.current() !== index ){
              slider.current(index);
              slider.update();
            }
          }
        };
        var touchEnd = function(event){
          event.preventDefault();
          slider._pager.dom.find("li").removeClass("highlight");
        };
        var footer = this._pager.dom.parent()[0];
        footer.addEventListener("touchstart", touchStart, false);
        footer.addEventListener("touchmove", touchStart, false);
        footer.addEventListener("touchend", touchEnd, false);
      }
          
    }
      
  };
  
  slider.init();
  slider.update();
  
});
 
//挖了个大坑，比想象中的要复杂
//已使用Modernizr.prefix()替代
/* $.fn.extend({
  css3: function(attr, value){
      var prefix = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
		(/firefox/i).test(navigator.userAgent) ? 'Moz' :
		(/trident/i).test(navigator.userAgent) ? 'ms' :
		'opera' in window ? 'O' : '';
      
      function formatAttr(attr){
        var sub = attr.split("-");
        for (var i=0; i<sub.length; i++){
          sub[i] = sub[i].substring(0,1).toUpperCase() +  sub[i].substring(1);
        }        
        sub = sub.join("");
        //sub = sub.substring(0,1).toLowerCase() +  sub.substring(1);
        return sub;
      }
      
      for (var i=0; i<prefix.length; i++){
        this.css(prefix+formatAttr(attr), value);
      }
      return this;    
  }
}); */
(function (global, factory) {
	typeof module === 'object' && typeof module.exports === 'object' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define([], factory) :
	(global.ImgsPreview = factory());
}(typeof window !== "undefined" ? window : this, (function () { 
	function NoDocument() {
		this.err();
	};
	NoDocument.prototype.err = function() {
		throw new Error( "current environment without a window with a document" );
	};
	if (typeof window === 'undefined' || typeof document === 'undefined') //无法通过窗口获取元素的时候
	return NoDocument;
	
  function ImgsPreview(ele) {
    this.imgs = this.getImgs(ele); //获取图片集合，可传入class、id、元素对象或元素标签(不推荐)
    this.body = document.body || document.getElementsByTagName('body')[0]; //body元素
    this.winW = window.innerWidth || document.body.clientWidth; //窗口宽度、单张图片宽度
    this.winH = window.innerHeight || document.body.clientHeight; //窗口高度
    this.imgsSrc = [] ; //储存图片src数组
    this.length = 0; //图片张数
    this.clickedIndex = 0; //初始状态下被点击的图片index值
    this.imgsViewWrapper = null; //整个显示图片容器的wrapper
    this.imgsViewBox = null; //显示图片的容器元素
    this.wrapper = null; //显示图片的wrapper元素ul
    this.items = null; //显示图片的元素li集合
    this.viewImgs = null; //显示出来的图片集合
    this.wrapLeft = 0; //图片wrapper的left值
    this.transitionTime = '0s'; //图片wrapper过渡时间
	this.startLeft = 0; //图片wrapper的touchstart初始left值
	this.imgLeft = this.winW/2; //图片的touchstart初始left值
	this.imgTop = this.winH/2; //图片的touchstart初始top值
	this.imgWidth = 0; //图片的touchstart初始width值
	this.imgHei = 0; //图片touchstart初始height值
	this.activeIndex = 0; //预览组件中被操作的图片记录index值
	this.activeImg = null; //当前操作的图片元素
	this.isImgBig = false; //图片是否处于放大状态
	this.fingers = 0; //手指个数
	this.twoFingers = false; //是否两个手指触摸
	this.opacity = 1; //背景透明度
	this.touchs = {//touchstart初始坐标
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0
	};
	this.moveDown = false; //先向下移动
	this.moveNotDown = false; //非先向下移动
	this.timer = null; //计时器
	this.canDo = true; //可以进行操作
	this.clickCount = 0; //点击次数
	this.timeStamp = 0; //时间戳
	this.timeout = null; //延时器
    this.init(); //初始化监听ele下所有图片的点击事件
  };
  
  ImgsPreview.prototype.getImgs = function(ele) {//获取图片集合，可传入class、id、元素对象或元素标签(不推荐)
    if (typeof ele === 'string') return document.querySelectorAll(ele + ' img');
    else if (typeof ele === 'object') {
      try {
        var eleToStr = Object.prototype.toString.call(ele).toLowerCase();
        if (eleToStr.indexOf('html') > -1 && eleToStr.indexOf('element') > -1) {
          return ele.getElementsByTagName('img');
        }else {
          throw new Error('please introduction a true element!');
        }
      }
      catch(err) {
        throw new Error('please introduction a true element!');
      }
    }
  };

  ImgsPreview.prototype.init = function() {//初始化监听ele下所有图片的点击事件
    this.length = this.imgs.length;//设置图片张数
    this.imgsSrc = []; //重置src数组
    for (var i = 0; i < this.length; i++) {
			this.getImgsSrc(this.imgs[i]);
			this.hideClick(i);
    };
  };
  
  ImgsPreview.prototype.getStyle = function(el, prop) {
  	return (window.getComputedStyle ? window.getComputedStyle(el, null)[prop].replace('px', '') : el.currentStyle[prop].replace('px', '')) - 0;
  };
  
  ImgsPreview.prototype.getImgsSrc = function(img) { //图片src数组
  	this.imgsSrc.push(img.src);
  };
  
  ImgsPreview.prototype.hideClick = function(i) {//监听所传入元素下的所有图片的点击事件
  	var that = this;
  	this.imgs[i].addEventListener('click', function(event) {
  		var evt = event || window.event;
			evt.preventDefault();
			that.opacity = 1; //重置背景透明度
			that.clickedIndex = i; //设置初始状态下被点击的图片index值
			that.wrapLeft = -that.clickedIndex * that.winW;
			that.showView();
  	}, false);
	};
  
  ImgsPreview.prototype.showView = function() {
  	var viewHeadStr = '<div class="imgs-preview" >' +
  										'<ul class="wrapper" >',
  			viewMiddStr = '',
  			viewFootStr = '</ul></div>',
  			fragment = document.createDocumentFragment(),
  			div = document.createElement('div');
  	for (var i = 0; i < this.length; i++) {
  		viewMiddStr += '<li class="item" >' + 
										'<img src="' + this.imgsSrc[i] + '" alt="" />' +
  									'</li>'
  	};
  	div.innerHTML = viewHeadStr + viewMiddStr + viewFootStr;
  	div.className = 'imgs-preview-wrapper';
  	div.style.cssText = "width: 100%; height: 100%; position: fixed; left: 0; top: 0; background: transparent;";
  	fragment.appendChild(div);
  	this.body.appendChild(fragment);
  	this.imgsViewWrapper = document.querySelector('.imgs-preview-wrapper');
  	this.imgsViewBox = document.querySelector('.imgs-preview');
  	this.wrapper = document.querySelector('.imgs-preview .wrapper');
  	this.items = document.querySelectorAll('.imgs-preview .wrapper .item');
  	this.viewImgs = document.querySelectorAll('.imgs-preview .wrapper .item img');
  	this.setDefaultCSS();
  	this.initListeners();
  };
  
  ImgsPreview.prototype.setDefaultCSS = function() {
  	var that = this;
  	this.imgsViewBox.style.cssText = "width: 100%;height: 100%;position: fixed;left: 0;top: 0;z-index: 999;overflow: hidden;background: rgba(0,0,0," + this.opacity + ");";
  	this.wrapper.style.cssText = "position: absolute;left: 0;top: 0;height: 100%;width: " + 100*this.length + "%;left: " + this.wrapLeft + "px;transition: all " + this.transitionTime + ";";
  	for (var i = 0; i < this.length; i++) {
  		(function(i) {
  			that.items[i].style.cssText = "position: relative;height: 100%;width: 100%;float: left;width: " + that.winW + "px;overflow: hidden;";
  			that.viewImgs[i].style.cssText = "width: 100%;height: auto;position: absolute;left: " + that.winW/2 + "px;top: " + that.winH/2 + "px;transform: translate(-50%, -50%);";
  			i = null;
  		})(i);
  	};
  };
  
  ImgsPreview.prototype.initListeners = function() {
  	var that = this;
  	this.imgsViewBox.ontouchmove = function(event) {
  		that.disabledScroll(event);
  	};
  	this.imgsViewBox.onmousewheel = function(event) {
  		that.disabledScroll(event);
  	};
  	for (var i = 0; i < this.length; i++) {
  		(function(i) {
  			that.viewImgs[i].addEventListener('click', function(event) {//阻止像微信浏览器等对图片的默认点击事件
  				var evt = event || window.event;
  				evt.preventDefault();
  			}, false);
  			that.items[i].ontouchstart = function(event) {
  				that.touchStart(event, i);
  			};
  			that.items[i].ontouchmove = function(event) {
  				that.touchMove(event, i);
  			};
  			that.items[i].ontouchend = function(event) {
  				that.touchEnd(event, i);
  			};
  			that.items[i].ontouchcancel = function(event) {
  				that.touchEnd(event, i);
  			};
  		})(i);
  	};
  };
  
  ImgsPreview.prototype.disabledScroll = function(event) {
  	var evt = event || window.event;
  	evt.preventDefault();
  };
  ImgsPreview.prototype.touchStart = function(event, index) {
  	var e = event || window.event;
  	this.fingers ++;
		if (this.fingers > 2) {
			this.fingers = 2;
			return false;
		}; 
		if (e.touches.length > 2) return false;
		if ((this.moveDown || this.moveNotDown) && e.touches.length === 2) {//侧滑或者下滑过程中禁止双指操作
			e.preventDefault();
			return false;
		};   
		if (e.touches[1]) {//存在第二个手指时记录第二个手指的x、y轴点
			if (this.activeIndex !== index) return false; //若操作的不是同一张图片，禁止操作
			this.touchs.x2 = e.touches[1].pageX || e.touches[1].clientX;
			this.touchs.y2 = e.touches[1].pageY || e.touches[1].clientY;
		}else {//第一个手指触屏时，记录当前操作图片的index值
			this.activeIndex = index;
			this.activeImg = e.target.tagName.toLowerCase() === 'img' ? e.target : e.target.children[0] ;
		};
		//设置图片wrap初始left值
		if (Math.abs(this.wrapLeft)%this.winW === 0) {//当图片wrap的left值取余屏幕宽度等于0时，记录left值
			this.startLeft = this.wrapLeft;
		};
		this.touchs.x1 = e.touches[0].pageX || e.touches[0].clientX;
		this.touchs.y1 = e.touches[0].pageY || e.touches[0].clientY;
		//重置方向和图片wrap过渡时间,  记录点击时间戳
		this.timeStamp = e.timeStamp;
		this.moveDown = false;
		this.moveNotDown = false;
		this.transitionTime = '0s';
		this.wrapper.style.transition = "all " + this.transitionTime ;
		//设置图片初始left和top值
		this.imgLeft = this.getStyle(this.activeImg, 'left');
		this.imgTop = this.getStyle(this.activeImg, 'top');
		this.imgWidth = this.getStyle(this.activeImg, 'width');
		this.imgHei = this.getStyle(this.activeImg, 'height');
  };
  ImgsPreview.prototype.touchMove = function(event, index) {
  	var e = event || window.event;
  	e.preventDefault();
		if (e.touches.length > 2) return false;
		var img = this.activeImg,
				x = e.touches[0].pageX || e.touches[0].clientX,
				y = e.touches[0].pageY || e.touches[0].clientY,
		    moveDistanceX = (x - this.touchs.x1),
		    moveDistanceY = (y - this.touchs.y1);
		if (e.touches.length === 1) {//一个触点
			if (this.twoFingers) return false; //当两个手指，离开一个手指后，此时滑动无效果
			this.fingers = 1;
			if (!this.isImgBig) {//图片未处于放大状态
				if (moveDistanceY > 15 && !this.moveNotDown) this.moveDown = true; //先向下滑
				else if ((Math.abs(moveDistanceX) > 10 || moveDistanceY < -10) && !this.moveDown) this.moveNotDown = true; //非先向下滑
				if (this.moveNotDown) {//非向下滑
					if (index !== 0 && index !== (this.imgs.length - 1)) {//非第一张和最后一张
						this.wrapLeft = this.startLeft + moveDistanceX;
						this.wrapper.style.left = this.wrapLeft + 'px';
					}else if (index === 0) {//第一张
						if (this.imgs.length > 1) {//图片大于一张
							if (moveDistanceX < 0) {//向左滑
								this.wrapLeft = this.startLeft + moveDistanceX;
								this.wrapper.style.left = this.wrapLeft + 'px';
							}else {//向右滑
								this.wrapLeft = this.startLeft + moveDistanceX/3;
								this.wrapper.style.left = this.wrapLeft + 'px';
							};
						}else {//图片只有一张
							this.wrapLeft = this.startLeft + moveDistanceX/3;
							this.wrapper.style.left = this.wrapLeft + 'px';
						};
					}else {//最后一张
						if (moveDistanceX > 0) {//向右滑
							this.wrapLeft = this.startLeft + moveDistanceX;
							this.wrapper.style.left = this.wrapLeft + 'px';
						}else {//向左滑
							this.wrapLeft = this.startLeft + moveDistanceX/3;
							this.wrapper.style.left = this.wrapLeft + 'px';
						};
					};
				};
				if (this.moveDown) {//向下滑
					img.style.left = this.imgLeft + moveDistanceX + 'px';
					img.style.top = this.imgTop + moveDistanceY + 'px';
					img.style.width = (moveDistanceY > 0 ? ((moveDistanceY/1.5) <= this.winW*0.8 ? this.winW - moveDistanceY/1.5 : this.winW*0.2) : this.winW) + 'px';
					this.opacity = moveDistanceY > 0 ? 1 - moveDistanceY/600 : 1;
					this.imgsViewBox.style.background = 'rgba(0,0,0,' + this.opacity + ')';
					//防止操作太快，导致wrap的left值还未到屏幕的整数倍时就被向下拖动操作，造成屏幕边缘显示上一张图片或者下一张图片
					this.wrapLeft = this.startLeft;
					this.wrapper.style.left = this.wrapLeft + 'px';
				};
			}else {//图片处于放大状态
				var imgLeft = (this.imgLeft + moveDistanceX*2),
					imgTop = (this.imgTop + moveDistanceY*2),
					imgWidth = this.getStyle(img, 'width'),
					imgHei = this.getStyle(img, 'height');
				//水平方向 
				if (Math.abs(moveDistanceX) > 10) {
					if (imgLeft >= imgWidth/2 && moveDistanceX > 0) {//向右滑到图片最左侧，超出后
						img.style.left = Math.floor(imgWidth/2) + 'px'; //向下取整
						//滑过总距离减去此图片被改变的left值，为wrap的move距离
						var wrapDistance = (moveDistanceX*2 - (imgWidth/2 - this.imgLeft));
						wrapDistance = wrapDistance <= 30 ? (wrapDistance/12) : wrapDistance/4 ;
						if (index !== 0) {//不是第一张
							this.wrapLeft = this.startLeft + wrapDistance;
							this.wrapper.style.left = this.wrapLeft + 'px';
						}else if (index === 0) {//第一张
							this.wrapLeft = this.startLeft + wrapDistance/1.5;
							this.wrapper.style.left = this.wrapLeft + 'px';
						};
					}else if (imgLeft <= (this.winW - imgWidth/2) && moveDistanceX < 0) {//向左滑到图片最右侧，超出后
						img.style.left = Math.ceil(this.winW - imgWidth/2) + 'px'; //向上取整
						var wrapDistance = (Math.abs(moveDistanceX*2) - (this.imgLeft - (this.winW - imgWidth/2)));
						wrapDistance = wrapDistance <= 30 ? (wrapDistance/12) : wrapDistance/4 ;
						if (index !== (this.imgs.length - 1)) {//非最后一张
							this.wrapLeft = this.startLeft - wrapDistance;
							this.wrapper.style.left = this.wrapLeft + 'px';
						}else {//最后一张
							this.wrapLeft = this.startLeft - wrapDistance/1.5;
							this.wrapper.style.left = this.wrapLeft + 'px';
						};
					}else {
						img.style.left = imgLeft + 'px';
					};
				};
				//垂直方向
				if (imgHei > this.winH) {//若图片放大时高度大于屏幕高度, 垂直方向才可以移动
					if (imgTop - imgHei/2 >= 0 && moveDistanceY > 0) {//图片超出最顶部的时候
						img.style.top = (imgHei/2) + (moveDistanceY*2 - (imgHei/2 - this.imgTop))/8 + 'px';
					}else if (imgTop - imgHei/2 <= (this.winH - imgHei) && moveDistanceY < 0) {//图片超出最底部的时候
						img.style.top = (this.winH - imgHei/2) - (Math.abs(moveDistanceY*2) - Math.abs(this.winH - imgHei/2 - this.imgTop))/8 + 'px';
					}else {
						img.style.top = imgTop + 'px';
					};
				};
			};
		}else if (e.touches.length === 2){//两个触点
			if (this.moveDown || this.moveNotDown) return false; //侧滑或者下滑过程中禁止双指操作
			if (this.activeIndex !== index) return false; //若操作的不是同一张图片，禁止操作
			this.fingers = 2;
			var x2 = e.touches[1].pageX || e.touches[1].clientX,
					y2 = e.touches[1].pageY || e.touches[1].clientY,
			    touchDistanceX = Math.abs(x2 - x),//移动时两个触点x轴间距
			    touchDistanceY = Math.abs(y2 - y),//移动时两个触点y轴间距
			    moveHypotenuse = Math.sqrt(touchDistanceX*touchDistanceX + touchDistanceY*touchDistanceY),//移动时两个触点斜边长度
			    touchStartDisX = Math.abs(this.touchs.x2 - this.touchs.x1),//初始两个触点x轴间距
			    touchStartDisY = Math.abs(this.touchs.y2 - this.touchs.y1), //初始两个触点y轴间距
			    startHypotenuse = Math.sqrt(touchStartDisX*touchStartDisX + touchStartDisY*touchStartDisY); //初始时两个触点斜边长度
			img.style.width = this.imgWidth + (moveHypotenuse - startHypotenuse)*3 > this.winW*0.5 ? this.imgWidth + (moveHypotenuse - startHypotenuse)*3 + 'px' : this.winW*0.5 + 'px';
			//图片超出时设置left和top值
			this.overSetLeftTop(img, 'move');
		};
  };
  ImgsPreview.prototype.touchEnd = function(event, index) {
  	var e = event || window.event, that = this;
  	var img = this.activeImg,
				x = e.changedTouches[0].pageX || e.changedTouches[0].clientX,
				y = e.changedTouches[0].pageY || e.changedTouches[0].clientY,
		    moveDistanceX = (x - this.touchs.x1),
		    moveDistanceY = (y - this.touchs.y1);
		if (this.fingers === 2) {
			this.fingers --;
			if (!this.moveDown && !this.moveNotDown) this.twoFingers = true; //侧滑或者下滑过程中禁止双指操作
			if (e.touches.length === 0) {//ios某些设备两个手指离开，不触发最后一次touchend事件时
				this.fingers = 0;
				if (this.wrapLeft !== this.startLeft) {//当先用单指滑动图片超出后，增加一个手指操作时，恢复wrapLeft值
					this.bigImgSetWrapLeft(index, img, moveDistanceX);
				};
				if (this.getStyle(img, 'width') > this.winW*4) this.imgStyleReset(img, 'special');
				else if (this.getStyle(img, 'width') < this.winW) this.imgStyleReset(img);
				else this.twoFingers = false;
			};
			return false;
		}else {
			this.fingers = 0;
		};
		if (!this.twoFingers) {//一个触点移动状态下离开手指
			//测试是否点击事件
			this.checkClick(e, moveDistanceX, moveDistanceY);
			if (this.isImgBig) {//图片处于放大状态
				var imgLeft = this.getStyle(img, 'left'),
						imgTop = this.getStyle(img, 'top'),
						imgWidth = this.getStyle(img, 'width'),
						imgHei = this.getStyle(img, 'height');
				//水平方向
				if (this.wrapLeft !== this.startLeft) {
					this.bigImgSetWrapLeft(index, img, moveDistanceX);
				};
				//垂直方向
				if (imgHei > this.winH) {
					if (imgTop > imgHei/2 && moveDistanceY > 0) {
						this.canDo = false;
						this.timer = setInterval(function() {
							imgTop -= 20;
							if (imgTop <= imgHei/2) {
								imgTop = imgHei/2;
								clearInterval(that.timer);
								that.timer = null;
								that.canDo = true;
							};
							img.style.top = imgTop + 'px';
						}, 1000/60);
					}else if (imgTop < (this.winH - imgHei/2) && moveDistanceY < 0) {
						this.canDo = false;
						this.timer = setInterval(function() {
							imgTop += 20;
							if (imgTop >= (that.winH - imgHei/2)) {
								imgTop = that.winH - imgHei/2;
								clearInterval(that.timer);
								that.timer = null;
								that.canDo = true;
							}
							img.style.top = imgTop + 'px';
						}, 1000/60);
					};
				};
			}else {//图片未处于放大状态
				if (this.moveNotDown) {//非向下滑
					if (Math.abs(moveDistanceX) < 50) {
						this.transitionTime = '0.15s';
						this.wrapper.style.transition = "all " + this.transitionTime ;
						this.setWrapLeft();
					}else {
						if (index !== 0 && index !== (this.imgs.length - 1)) {
							this.transitionTime = '0.3s';
							this.wrapper.style.transition = "all " + this.transitionTime ;
							if (moveDistanceX > 0) {//向右滑
								this.setWrapLeft('right');
							}else {//向左滑
								this.setWrapLeft('left');
							};
						}else {
							if (index === 0) {//第一张
								if (this.imgs.length > 1) {//图片大于一张
									if (moveDistanceX < 0) {//向左滑
										this.transitionTime = '0.3s';
										this.wrapper.style.transition = "all " + this.transitionTime ;
										this.setWrapLeft('left');
									}else {//向右滑
										this.transitionTime = '0.15s';
										this.wrapper.style.transition = "all " + this.transitionTime ;
										this.setWrapLeft();
									};
								}else {//图片只有一张
									this.transitionTime = '0.15s';
									this.wrapper.style.transition = "all " + this.transitionTime ;
									this.setWrapLeft();
								};
								
							}else {//最后一张
								if (moveDistanceX > 0) {//向右滑
									this.transitionTime = '0.3s';
									this.wrapper.style.transition = "all " + this.transitionTime ;
									this.setWrapLeft('right');
								}else {//向左滑
									this.transitionTime = '0.15s';
									this.wrapper.style.transition = "all " + this.transitionTime ;
									this.setWrapLeft();
								};
							};
						};
					};
				};
				if (this.moveDown) {//向下滑
					if (moveDistanceY > 60) this.imgClick(e, 'notNative');//移除图片预览组件
					else {
						//图片样式恢复
						this.imgStyleReset(img);
					};
				};
			};
		}else {//两个触点移动状态下离开手指
			if (this.wrapLeft !== this.startLeft) {//当先用单指滑动图片超出后，增加一个手指操作时，恢复wrapLeft值
				this.bigImgSetWrapLeft(index, img, moveDistanceX);
			};
			if (this.getStyle(img, 'width') > this.winW*4) this.imgStyleReset(img, 'special');
			else if (this.getStyle(img, 'width') < this.winW) this.imgStyleReset(img);
			else this.twoFingers = false;
		};
  };
  
  ImgsPreview.prototype.overSetLeftTop = function(img, type) {//图片超出时设置left和top值
  	var imgWidth = this.getStyle(img, 'width'),
				imgHei = this.getStyle(img, 'height'),
				imgLeft = this.getStyle(img, 'left'),
				imgTop = this.getStyle(img, 'top');
		if (imgWidth > this.winW) {//图片当前宽度大于屏幕宽度
			if (type === 'move') this.isImgBig = true;
			if (imgLeft >= imgWidth/2) {//图片超出最左侧
				img.style.left = Math.floor(imgWidth/2) + 'px';
			}else if (imgLeft <= (this.winW - imgWidth/2)) {//图片超出最右侧
				img.style.left = Math.ceil(this.winW - imgWidth/2) + 'px';
			};
		}else {//图片当前宽度小于或等于屏幕宽度
			if (type === 'move') this.isImgBig = false;
			img.style.left = this.winW/2 + 'px';
		};
		if(imgHei > this.winH) {//图片当前高度大于屏幕宽度
			if (imgTop - imgHei/2 >= 0) {//图片超出最顶部
				img.style.top = Math.floor(imgHei/2) +'px';
			}else if (imgTop - imgHei/2 <= (this.winH - imgHei)) {//图片超出最底部
				img.style.top = Math.ceil(this.winH - imgHei/2) + 'px';
			};
		}else {//图片当前宽度小于或等于屏幕宽度
			img.style.top = this.winH/2 + 'px';
		};
  };
  
  ImgsPreview.prototype.setWrapLeft = function(type) {//设置wrapper的left值, 结合transition属性达到过渡的效果
  	this.canDo = false;
		var delay = type ? 300 : 150, that = this;
		setTimeout(function() {
			if (type === 'left') {
				that.wrapLeft = that.startLeft - that.winW;
				that.wrapper.style.left = that.wrapLeft + 'px';
			}else if (type === 'right') {
				that.wrapLeft = that.startLeft + that.winW;
				that.wrapper.style.left = that.wrapLeft + 'px';
			}else {
				that.wrapLeft = that.startLeft;
				that.wrapper.style.left = that.wrapLeft + 'px';
			}; 
		}, 0);
		setTimeout(function() {
			that.canDo = true;
		}, delay);
  };
  
  ImgsPreview.prototype.bigImgSetWrapLeft = function(index, img, moveDistanceX) {
  	var that = this;
  	if (index !== 0 && index !== (this.imgs.length - 1)) {//非第一张  非最后一张
			if (Math.abs(this.wrapLeft - this.startLeft) < 50) {
				this.transitionTime = '0.15s';
				this.wrapper.style.transition = "all " + this.transitionTime ;
				this.setWrapLeft();
			}else {
				this.transitionTime = '0.3s';
				this.wrapper.style.transition = "all " + this.transitionTime ;
				this.setWrapLeft(this.wrapLeft > this.startLeft ? 'right' : 'left');
				setTimeout(function() {
					img.style.width = that.winW + 'px';
					img.style.left = that.winW/2 + 'px';
					img.style.top = that.winH/2 + 'px';
					that.isImgBig = false;
				}, 300);
			};
		}else {//第一张或最后一张
			if (index === 0 && moveDistanceX < 0 && Math.abs(this.wrapLeft - this.startLeft) > 50) {
				this.transitionTime = '0.3s';
				this.wrapper.style.transition = "all " + this.transitionTime ;
				this.setWrapLeft('left');
				setTimeout(function() {
					img.style.width = that.winW + 'px';
					img.style.left = that.winW/2 + 'px';
					img.style.top = that.winH/2 + 'px';
					that.isImgBig = false;
				}, 300);
			}else if (index === (this.imgs.length - 1) && moveDistanceX > 0 && Math.abs(this.wrapLeft - this.startLeft) > 50) {
				this.transitionTime = '0.3s';
				this.wrapper.style.transition = "all " + this.transitionTime ;
				this.setWrapLeft('right');
				setTimeout(function() {
					img.style.width = that.winW + 'px';
					img.style.left = that.winW/2 + 'px';
					img.style.top = that.winH/2 + 'px';
					that.isImgBig = false;
				}, 300)
			}else {
				this.transitionTime = '0.15s';
				this.wrapper.style.transition = "all " + this.transitionTime ;
				this.setWrapLeft();
			};
		};
  };
  
  ImgsPreview.prototype.imgStyleReset = function(img, special) {
  	this.canDo = false;
  	var that = this;
		this.timer = setInterval(function() {
			var wid = that.getStyle(img, 'width');
			that.opacity = that.opacity < 1 ? that.opacity + 0.05 : 1;
			that.imgsViewBox.style.background = 'rgba(0,0,0,' + that.opacity + ')';
			if (!special) {//正常从小于整屏的宽度恢复到整屏宽度
				wid += 15;
				img.style.left = that.winW/2 + 'px';
				img.style.top = that.winH/2 + 'px';
				if (wid >= that.winW) {
					wid = that.winW;
					clearInterval(that.timer);
					that.canDo = true;
					that.twoFingers = false;
					that.timer = null;
				};
			}else {//特殊情况，从大于4倍整屏宽度恢复到4倍整屏宽度
				wid -= 40*(wid/that.winW);
				if (wid <= that.winW*4) {
					wid = that.winW*4;
					clearInterval(that.timer);
					that.canDo = true;
					that.twoFingers = false;
					that.timer = null;
				};
			};
			img.style.width = wid + 'px';
		}, 1000/60);
  };
  
  ImgsPreview.prototype.checkClick = function(e, moveX, moveY) {
  	if ((e.timeStamp - this.timeStamp) < 160 && Math.abs(moveX) <=2 && Math.abs(moveY) <= 2) {
			this.imgClick(e);
		};
  };
  
  ImgsPreview.prototype.imgClick = function(e, notNative) {
  	e.preventDefault();
		if (!this.canDo) return false;
		this.clickCount ++;
		var img = e.target.tagName.toLowerCase() === 'img' ? e.target : e.target.children[0],
				delay = !notNative ? 180 : 0 ,
				that = this;
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function() {
			if (that.clickCount === 1) {//单击事件
				that.canDo = false;
				that.timer = setInterval(function() {
					var wid = that.getStyle(img, 'width');
					wid = wid - 60*(wid/that.winW);
					that.opacity -= 0.05;
					that.imgsViewBox.style.background = 'rgba(0,0,0,' + that.opacity + ')';
					img.style.width = wid + 'px';
					//图片超出时设置left和top值
					!notNative && that.overSetLeftTop(img, 'click');
					if (that.opacity <= 0) {
						clearInterval(that.timer);
						that.opacity = 0;
						that.imgsViewBox.style.background = 'rgba(0,0,0,' + that.opacity + ')';
						that.timer = null;
						that.canDo = true;
						//移除整个图片预览元素
						if (typeof that.imgsViewWrapper === 'object' && Object.prototype.toString.call(that.imgsViewWrapper).toLowerCase().indexOf('htmldivelement') > -1)//判断为DOM元素对象，进行删除操作
						that.body.removeChild(that.imgsViewWrapper);
						that.imgsViewWrapper = null;
					};
				}, 1000/60);
			}else if (that.clickCount === 2) {//双击事件
				that.canDo = false;
				that.timer = setInterval(function() {
					var wid = that.getStyle(img, 'width'),
							aspectRatio = that.imgWidth/that.imgHei, //宽高比
							times = aspectRatio > 2 ? 4: (aspectRatio < 0.7 ? 2 : 3), //放大倍数
							bigFinalWid = that.winW*times; //放大后最终宽度
					wid = that.isImgBig ? (wid - 80) : (wid + 80);
					if (wid >= bigFinalWid && !that.isImgBig) {
						clearInterval(that.timer);
						wid = bigFinalWid;
						that.isImgBig = true;
						that.timer = null;
						that.canDo = true;
					}else if (wid <= that.winW && that.isImgBig) {
						clearInterval(that.timer);
						wid = that.winW;
						that.isImgBig = false;
						that.timer = null;
						that.canDo = true;
					};
					img.style.width = wid + 'px';
					//图片超出时设置left和top值
					that.overSetLeftTop(img, 'dblclick');
				}, 1000/60);
			};
			that.clickCount = 0;
			that.timeout = null;
		}, delay);
  };
	
	var ImgsPreview = window.ImgsPreview = ImgsPreview;
  	return ImgsPreview;
})));
# imgs-preview-native

a images-preview plugin using native-js


## Github

https://github.com/famoushappy/imgs-preview-native.git


## Install

npm install imgs-preview-native -S


## Usage

组件化开发时，在组件中引入

import ImgsPreview from 'imgs-preview-native';

或ES5写法：   var ImgsPreview = require('imgs-preview-native');

或者直接script标签引入js

<script src="dist/imgs-preview.min.js"></script>

当页面加载完成时，进行实例化。

实例化时传入需要预览的所有图片的父元素;

可传class（如： ".imgsParent"）、id（如： "#imgsParent"）、

或直接传入父元素（如： document.querySelector(".imgsParent")）。

var imgsPreview = new ImgsPreview(parent element);


##Notice

注：一定要保证在实例化前，当前需要预览的所有图片元素已经加载，可理解为DOMContentLoaded。
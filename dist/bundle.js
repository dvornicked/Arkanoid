(()=>{"use strict";function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}var e=new(function(){function e(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),this.ctx=null,this.sprites={background:null,ball:null,platform:null}}var n,i;return n=e,(i=[{key:"init",value:function(){this.ctx=document.getElementById("myCanvas").getContext("2d")}},{key:"preload",value:function(t){var e=0,n=Object.keys(this.sprites).length;for(var i in this.sprites)this.sprites[i]=new Image,this.sprites[i].src="./img/".concat(i,".png"),this.sprites[i].addEventListener("load",(function(){++e>=n&&t()}))}},{key:"run",value:function(){var t=this;window.requestAnimationFrame((function(){t.render()}))}},{key:"render",value:function(){this.ctx.drawImage(this.sprites.background,0,0),this.ctx.drawImage(this.sprites.ball,0,0),this.ctx.drawImage(this.sprites.platform,0,0)}},{key:"start",value:function(){var t=this;this.init(),this.preload((function(){t.run()}))}}])&&t(n.prototype,i),e}());window.addEventListener("load",(function(){e.start()}))})();
## 婚礼邀请函上海版源码

婚礼邀请函源码，只上传了上海版。做的比较粗糙，动画都是用css3书写的，假如有需要，可以借鉴一下，注意，视频和图片不要用我的哦！有版权，严禁用于除学习之外的其他任何用途。

## perspective 动画透视效果



透视效果是近大远小，我的邀请函中，图片垂直翻转效果，用到了perspective 。让图片透视旋转。

    @-webkit-keyframes rotater {
      0% {
        -webkit-transform: perspective(1200px) rotateY(-120deg);
                transform: perspective(1200px) rotateY(-120deg);
      }
    100% {
        -webkit-transform:perspective(800px) rotateY(180deg);
                transform:perspective(800px) rotateY(180deg);
      }
    }
    
    @keyframes rotater {
      0% {
        -webkit-transform: perspective(1200px) rotateY(-120deg);
                transform: perspective(1200px) rotateY(-120deg);
      }
    100% {
        -webkit-transform:perspective(800px) rotateY(180deg);
                transform:perspective(800px) rotateY(180deg);
      }
    
    }

perspective()可以指定透视距离，值越小，显示越大，离你越近。

## 关于邀请函用到的知识点

请看文章http://www.haorooms.com/post/h5_animation_zj

有些知识点后来删掉了，例如font face特殊字体的应用

## 手机扫描预览

![手机扫描预览](https://github.com/confidence68/invitePage/blob/master/qrcode.png)




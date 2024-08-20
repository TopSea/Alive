
<div align="center" style="display: flex; flex-direction: column; align-items: center;">
<img style="width: 156px; height: 156px; border-radius: 12px;" src="./assets/app-icon.png" alt="App Icon"/></a>
<br>
<br>
<i>Alive：支持 Live2d 和 MMD 模型的开源桌宠软件。</i>
<br>
<br>
<a href="https://github.com/TopSea/Alive/stargazers"><img src="https://img.shields.io/github/stars/TopSea/Alive" alt="Stars Badge"/></a>
<a href="https://github.com/TopSea/Alive/pulls"><img src="https://img.shields.io/github/issues-pr/TopSea/Alive" alt="Pull Requests Badge"/></a>
<a href="https://github.com/TopSea/Alive/issues"><img src="https://img.shields.io/github/issues/TopSea/Alive" alt="Issues Badge"/></a>
<a href="https://github.com/TopSea/Alive/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/TopSea/Alive?color=2b9348"></a>
<br>
<a href="https://github.com/TopSea/Alive/blob/master/LICENSE"><img src="https://img.shields.io/github/license/TopSea/Alive?color=2b9348" alt="License Badge"/></a>
<a href="https://github.com/TopSea/Alive/releases"><img src="https://img.shields.io/github/downloads/TopSea/Alive/total" alt="Download Badge"/></a>
</div>

## [Englisg Doc](./docs/en/README.md)

## 开发进度
Tauri 0.0.2 版已发布！之后 Tauri 版将停止开发。   
Electron 版全力开发中。   
关注我（[GoAHi](https://space.bilibili.com/307219768)），更快获得发布信息。

## 安装使用
Live2d 最后的支持版本是：[Alive v0.0.2]()    
Tauri 版参考这个视频：[https://www.bilibili.com/video/BV1B6421g7p9/](https://www.bilibili.com/video/BV1B6421g7p9/)      
**关于 alive_mmd.json 的编写规范：[关于 .alive_mmd.json](./docs/alive_mmd.md) 。**

## 功能实现计划
### 已实现的功能
- [x] Live2d 和 MMD 模型的展示和交互操作（Live2d 最后的支持版本是：[Alive v0.0.2]()）
- [x] 鼠标点击穿透
- [x] 保存窗口的位置和大小
- [x] 多语言切换（窗口部分）
- [x] 开放 API 接口
- [x] 深色模式
- [x] 自动检查更新
- [x] 缩放成图标

### 0.0.3 计划实现的功能
- [ ] AI 聊天功能

## 适配计划
Windows：Windows 11/10 。windows 10 之前的版本不会进行测试和适配，不保证能否运行。  
Linux 和 MacOS：Tauri 版没有适配。Electron 版可能会打包，但不会测试（没有设备）。

## Build
如果你想自己 build 的话。  
Electron 版不提供源码，Tauri 版请选择对应的分支。   
```
git clone https://github.com/TopSea/Alive --branch tauri-v1
cd Alive
yarn

yarn tauri dev
```
环境和依赖可参考：[Tauri 官方文档](https://tauri.app/zh-cn/v1/guides/getting-started/prerequisites)    
因为就我一个人开发，代码写得比较杂乱，东一榔头西一棒槌的，主打一个自己看得懂就行 :stuck_out_tongue_winking_eye: 。   

## 关于项目
因为文档和一些缺陷放弃了 Tauri，0.0.3 及之后的版本都将是使用 Electron。之前选择开源，因为想做的功能太多，希望有大佬能一起开发，我也可以学到很多东西，但是没人来 :sob: 。现在的话，大体都开发的差不多了。很多可以优化的地方就按照自己的节奏慢慢来吧，就不再开源了，之前设置自动更新的 key 的密码都给忘了，不开源就可以把密码放到项目里了。当然，之前开源的代码不会删除，选择对应的分支即可。

*一切的开始是因为碧蓝航线之前更新了一个拉菲的兔女郎服装（对兔女郎毫无抵抗力.jpg）。*  

*然后就搜怎么提取怎么展示。搜到了 PPet，但是用着不太符合我的想法而且 PPet 项目也好久没更新了。所以就打算自己改改来用，但是 electron 这个包死活下不下来，换镜像用代理都不行。淦！刚好当时学 Tauri 和 React 有一段时间了，干脆再造个轮子。*  

*最开始是用 Tauri 和 React 写的（[Live2d-Tauri](https://github.com/TopSea/Live2d-Tauri)），但是写的不是很好。就打算用 vue 再再造个轮子顺便也让我在原神中的老婆们能展示展示，所以 Alive 就诞生了。*




[app-icon]: ./assets/app-icon.png

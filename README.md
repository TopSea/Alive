
<div align="center" style="display: flex; flex-direction: column; align-items: center;">
<img style="width: 156px; height: 156px; border-radius: 12px;" src="./public/app-icon.png" alt="App Icon"/></a>
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

## 开发进度
0.0.1-beta 已发布！
正式版全力开发中。   
关注我（[GoAHi](https://space.bilibili.com/307219768)），更快获得发布信息。

## 安装使用
参考这个视频：[https://www.bilibili.com/video/BV1B6421g7p9/](https://www.bilibili.com/video/BV1B6421g7p9/)      
**关于 alive_mmd.json 的编写规范：[关于 .alive_mmd.json](./docs/alive_mmd.md) 。**

## 功能实现计划
### 已实现的功能
- [x] Live2d 和 MMD 模式切换
- [x] Live2d 和 MMD 模型的展示和交互操作
- [x] Live2d 和 MMD 更换展示的模型
- [x] 鼠标点击穿透
- [x] 保存窗口的位置和大小
- [x] 多语言切换（窗口部分）
- [x] 深色模式
- [x] 自动检查更新

### 0.0.3 计划实现的功能
- [ ] MMD 播放卡顿优化
- [ ] 开放 API 接口
- [ ] 缩放成图标

### 后期计划实现的功能
- [x] 开机启动（尚存在一些问题，后续会修复）
- [ ] 升级 Tauri v2
- [ ] 多语言切换完善（系统托盘部分。在升级 Tauri v2 后才会做）
- [ ] 适配安卓系统

## 适配计划
Windows：Windows 11/10 。windows 10 之前的版本不会进行测试和适配，不保证能否运行。  
Linux 和 MacOS：我自己没有适配打算了。如果有人愿意支持的话，可以 PR。

## Build
如果你想自己 build 的话。  
必须条件：Rust 环境、Nodejs 和 yarn
```
git clone https://github.com/TopSea/Alive
cd Alive
yarn

yarn tauri dev
```
Linux 和 MacOS 可能还需要一些依赖，可参考：[Tauri 官方文档](https://tauri.app/zh-cn/v1/guides/getting-started/prerequisites)    
因为目前就我一个人开发，代码写得比较杂乱，东一榔头西一棒槌的，主打一个自己看得懂就行 :stuck_out_tongue_winking_eye: 。   
所以不建议不懂 rust 的自行 build。

## 主要依赖
Live2d：pixijs 和 pixi-live2d-display。   
MMD：babylonjs 和 babylon-mmd。

## 关于模型和动作
**MMD**：  
* 芙卡洛斯模型 ==> 作者：原神 | [给你柠檬椰果养乐多你会跟我玩吗](https://space.bilibili.com/32704665)，下载地址：[水神 芙卡洛斯](https://www.aplaybox.com/details/model/ZftsfJMVgQsx)
* 丘丘摇动作 ==> 作者：原神 | [Ponx_迫奈熏](https://space.bilibili.com/345268724)，下载地址：[胡桃待机动作-丘丘摇](https://www.aplaybox.com/details/motion/HDLRono2SdAG)   

**模型和动作文件不为本项目所有。本项目对模型和动作的使用已征得作者同意，如果你要将模型和动作用在他处请遵守作者的使用要求。**    

## 关于项目
一切的开始是因为碧蓝航线之前更新了一个拉菲的兔女郎服装（对兔女郎毫无抵抗力.jpg）。  

然后就搜怎么提取怎么展示。搜到了 PPet，但是用着不太符合我的想法而且 PPet 项目也好久没更新了。所以就打算自己改改来用，但是 electron 这个包死活下不下来，换镜像用代理都不行。淦！刚好当时学 Tauri 和 React 有一段时间了，干脆再造个轮子。  

最开始是用 Tauri 和 React 写的（[Live2d-Tauri](https://github.com/TopSea/Live2d-Tauri)），但是写的不是很好。就打算用 vue 再再造个轮子顺便也让我在原神中的老婆们能展示展示，所以 Alive 就诞生了。




[app-icon]: ./public/app-icon.png

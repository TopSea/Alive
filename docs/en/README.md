
<div align="center" style="display: flex; flex-direction: column; align-items: center;">
<img style="width: 156px; height: 156px; border-radius: 12px;" src="../../assets/app-icon.png" alt="App Icon"/></a>
<br>
<br>
<i>Alive: Open-source desktop pet software support for Live2D and MMD models.</i>
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

## Development Progress
Tauri version 0.0.2 has been released! Development of the Tauri version will be discontinued henceforth.   
Electron version is under active development.   
Follow me ([GoAHi](https://space.bilibili.com/307219768)), To get release information more quickly.

## Installation and Use
The last supported version of Live2d is: [Alive v0.0.2]()    
Tauri version please refer to this video: [https://www.bilibili.com/video/BV1B6421g7p9/](https://www.bilibili.com/video/BV1B6421g7p9/)      
**Regarding the writing standards for alive_mmd.json : [About .alive_mmd.json](./alive_mmd.md) 。**

## Function implementation plan
### The implemented functions
- [x] The display and interactive operation of Live2d and MMD model (The last supported version of Live2d is: [Alive v0.0.2]())
- [x] Mouse click through
- [x] Save the position and size of the window
- [x] Multilingual switching (window part)
- [x] Open API interface
- [x] Dark mode
- [x] Automatic check for updates
- [x] Zoom into an icon

### 0.0.3 planned implemented functions
- [ ] AI chat function

## Adaptation plan
Windows: Windows 11/10 , Previous versions of Windows 10 will not be tested and adapted, and it is not guaranteed whether they can run.  
Linux & MacOS: The Tauri version is not adapted. The Electron version may be packaged, but it will not be tested (I have no equipment).

## Build
If you want to build it yourself.  
The Electron version does not provide the source code. For the Tauri version, please select the corresponding branch.   
```
git clone https://github.com/TopSea/Alive --branch tauri-v1
cd Alive
yarn

yarn tauri dev
```
Environment and dependencies can be referred to: [Tauri official documents](https://tauri.app/zh-cn/v1/guides/getting-started/prerequisites)    
Because I am the only one developing, the code is written rather chaotically, here and there randomly. The main point is that I myself can understand it :stuck_out_tongue_winking_eye: .   

## About Alive
The previously open-sourced code will not be deleted. Just select the corresponding git branch.

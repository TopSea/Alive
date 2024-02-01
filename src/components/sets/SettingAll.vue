<script setup lang="ts">
import { Store } from "tauri-plugin-store-api";
import { join, resourceDir } from "@tauri-apps/api/path";
import { enable, disable } from "tauri-plugin-autostart-api";
import { WebviewWindow } from '@tauri-apps/api/window';
import { Ref, onBeforeMount, ref } from "vue";
import {
  CursorArrowRaysIcon, ArrowUpTrayIcon, RocketLaunchIcon, ArrowDownOnSquareStackIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline'

import { FileEntry, readDir } from "@tauri-apps/api/fs";
import { checkUpdate } from "@tauri-apps/api/updater";
import { getVersion, getName } from "@tauri-apps/api/app";

import AddModelDialog from "./AddModelDialog.vue";
import SettingModels from "./SettingModels.vue";

const aliveVersion = ref(await getVersion());
const aliveAppName = ref(await getName());
// const tauriVersion = ref(await getTauriVersion());
const showUpdate = ref(false);

const resourceDirPath = await resourceDir();
const pathAlive = await join(resourceDirPath, 'data', 'sets_alive.json');
const pathLive = await join(resourceDirPath, 'data', 'sets_live2d.json');
const pathMMD = await join(resourceDirPath, 'data', 'sets_mmd.json');

const storeAlive = new Store(pathAlive);
const storeLive = new Store(pathLive);
const storeMMD = new Store(pathMMD);
const addingModel = ref(false);

// 获取设置信息
const sClickThroughe = ref(await storeAlive.get("click_through") as boolean)
const sStayTop = ref(await storeAlive.get("stay_top") as boolean)
const sAutoStart = ref(await storeAlive.get("auto_start") as boolean)
const sAutoCheck = ref(await storeAlive.get("auto_check") as boolean)
const isMMD = ref(await storeAlive.get("is_mmd") as boolean);
const sLiveHttps = ref(await storeLive.get("http_models") as string[])
const sLiveUrl = ref(await storeLive.get("model_url") as string)
const sMmdHttps = ref(await storeMMD.get("http_models") as string[])
const sMmdUrl = ref(await storeMMD.get("mmd_alive_url") as string)
console.log("sLiveUrl: ", sLiveUrl, "sMmdUrl: ", sMmdUrl)
const currMmdModel = ref("")
const currLiveModel = ref("")

// 样式
const txt = ref("text-blue-950")
const txtLight = ref("text-blue-400")
const txtLink = ref("hover:text-blue-800")
const bg = ref("bg-blue-50")
const bgActive = ref("bg-blue-300")
const bgInactive = ref("bg-gray-300")

const allLiveNames: Ref<string[]> = ref([]);
const allLivePaths: Ref<string[]> = ref([]);
const allMmdNames: Ref<string[]> = ref([]);
const allMmdPaths: Ref<string[]> = ref([]);

const activeTab = ref(isMMD ? 'MMD' : 'Live2d')

function changeTab(tab: string) {
  activeTab.value = tab
}

async function aliveCheckUpdate() {
  console.log("checking update...");
  const { shouldUpdate } = await checkUpdate();
  showUpdate.value = shouldUpdate;
}

onBeforeMount(() => {
  const sCurrLive = sLiveUrl.value
  allLivePaths.value[0] = sCurrLive
  const modelLive = getModelName(sCurrLive)
  currLiveModel.value = modelLive
  allLiveNames.value[0] = modelLive

  const sCurrMmd = sMmdUrl.value
  allMmdPaths.value[0] = sCurrMmd
  const modelMmd = getModelName(sCurrMmd)
  currMmdModel.value = modelMmd
  allMmdNames.value[0] = modelMmd

  // 添加网络中的模型
  sLiveHttps.value.forEach(element => {
    const httpName = getModelName(element);
    if (httpName !== modelLive) {     // 不重复添加
      allLivePaths.value.push(element)
      allLiveNames.value.push(httpName)
    }
  });
  console.log(allLiveNames);
  sMmdHttps.value.forEach(element => {
    const httpName = getModelName(element);
    if (httpName !== modelMmd) {
      allMmdPaths.value.push(element)
      allMmdNames.value.push(httpName)
    }
  });

  // 都刷新一下
  refreshModels(false)
  refreshModels(true)
})

function getModelName(modelUrl: string): string {
  const lastSlash = (modelUrl.startsWith("http") || modelUrl.startsWith("/")) ? modelUrl.lastIndexOf("/") : modelUrl.lastIndexOf("\\")
  return modelUrl.substring(lastSlash + 1)
}

async function refreshModels(_is_mmd: boolean) {
  console.log("refreshModels: ", _is_mmd);
  const modelPath = _is_mmd ? await join(resourceDirPath, 'mmd') : await join(resourceDirPath, 'live2d');
  const entries = await readDir(modelPath, { recursive: true });
  findModels(entries, _is_mmd);
}
async function findModels(models: FileEntry[], _is_mmd: boolean) {
  for (const model of models) {

    if (model.children) {
      findModels(model.children, _is_mmd)
    } else {
      if (_is_mmd) {
        if (model.name?.endsWith(".alive_mmd.json")) {
          if (allMmdNames.value.indexOf(model.name) === -1) {
            allMmdNames.value.push(model.name);
            allMmdPaths.value.push(model.path);
          }
        }
      } else {
        if (model.name?.endsWith(".model3.json") || model.name?.endsWith(".model.json")) {
          if (allLiveNames.value.indexOf(model.name) === -1) {
            allLiveNames.value.push(model.name);
            allLivePaths.value.push(model.path);
          }
        }
      }
    }
  }
}

async function setSettings(key: string, val: any) {
  console.log("setSettings-", key, ": ", val);
  const mainWindow = WebviewWindow.getByLabel('main')

  switch (key) {
    case "click_through": {
      sClickThroughe.value = val as boolean
      if (val) {
        mainWindow?.setIgnoreCursorEvents(true);
      } else {
        mainWindow?.setIgnoreCursorEvents(false);
      }
      await storeAlive.set(key, val);
      await storeAlive.save();
      break;
    }
    case "stay_top": {
      sStayTop.value = val as boolean
      if (val) {
        mainWindow?.setAlwaysOnTop(true);
      } else {
        mainWindow?.setAlwaysOnTop(false);
      }
      await storeAlive.set(key, val);
      await storeAlive.save();
      break;
    }
    case "auto_start": {
      sAutoStart.value = val as boolean
      if (val) {
        enable();
      } else {
        disable();
      }
      await storeAlive.set(key, val);
      await storeAlive.save();
      break;
    }
    case "auto_check": {
      sAutoCheck.value = val as boolean
      if (val) {
        enable();
      } else {
        disable();
      }
      await storeAlive.set(key, val);
      await storeAlive.save();
      break;
    }
    default: { }
  }
}
async function setModel(model: string) {
  console.log("setModel: ", model);
  const mainWindow = WebviewWindow.getByLabel('main')

  if (activeTab.value === "MMD") {
    var foundURL = allMmdPaths.value.find(
      (element) => {
        const path = element.replace(/\\/g, "/");
        return path.indexOf(model) !== -1;
      }
    );

    if (foundURL !== undefined) {
      const http = foundURL.replace(resourceDirPath, "https://asset.localhost/");
      const url = http.replace(/\\/g, "/");
      console.log("foundURL: ", url);
      currMmdModel.value = model
      await storeMMD.set("mmd_alive_url", url);
      await storeMMD.save();
      mainWindow?.emit('event_mmd_url', url);
    }
  } else {
    var foundURL = allLivePaths.value.find(
      (element) => {
        const path = element.replace(/\\/g, "/");
        return path.indexOf(model) !== -1;
      }
    );

    if (foundURL !== undefined) {
      const http = foundURL.replace(resourceDirPath, "https://asset.localhost/");
      const url = http.replace(/\\/g, "/");
      console.log("foundURL: ", url);
      currLiveModel.value = model
      await storeLive.set("model_url", url);
      await storeLive.save();
      mainWindow?.emit('event_live2d_url', url);
    }
  }
}

  async function addModel(modelURL: string) {
    console.log("addModel: ", modelURL);
    const modelName = getModelName(modelURL)
    if (modelURL === "") return

    if (activeTab.value === "MMD" && modelURL.startsWith("http") && (modelURL.endsWith("alive_mmd.json"))) {
      sMmdHttps.value.push(modelURL)
      allMmdPaths.value.push(modelURL)
      allMmdNames.value.push(modelName)

      await storeMMD.set("http_models", sMmdHttps.value)
      await storeMMD.save()
      addingModel.value = false

    } else if (activeTab.value === "Live2d" && modelURL.startsWith("http") && (modelURL.endsWith("model3.json") || modelURL.endsWith("model.json"))) {
      sLiveHttps.value.push(modelURL)

      allLivePaths.value.push(modelURL)
      allLiveNames.value.push(modelName)

      await storeLive.set("http_models", sLiveHttps.value)
      await storeLive.save()
      addingModel.value = false
    }
  }

</script>

<template>
  <div :class="[bg,'flex flex-col w-lvw h-lvh']">
    <div class="flex space-x-2 mt-1 mx-1">
      <button @click="() => changeTab('Alive')"
        :class="activeTab === 'Alive' ? [bgActive,txt,'sets-tab'] : [bgInactive,txt,txtLink,'sets-tab']">Alive</button>
      <button @click="() => changeTab('Live2d')"
        :class="activeTab === 'Live2d' ? [bgActive,txt,'sets-tab'] : [bgInactive,txt,txtLink,'sets-tab']">Live2d</button>
      <button @click="() => changeTab('MMD')" 
        :class="activeTab === 'MMD' ? [bgActive,txt,'sets-tab'] : [bgInactive,txt,txtLink,'sets-tab']">MMD</button>
      <button @click="() => changeTab('About')" 
        :class="activeTab === 'About' ? [bgActive,txt,'sets-tab'] : [bgInactive,txt,txtLink,'sets-tab']">About</button>
    </div>

    <div v-if="activeTab === 'Alive'" :class="activeTab === 'Alive' ? 'sets-content' : ''">
      <ul class="h-20 grid grid-cols-2 grid-rows-2">
        <li class="flex h-full items-center mx-4 space-x-3">
          <CursorArrowRaysIcon :class="[txt,'w-6 h-6']" />
          <span :class="[txt,'w-44 text-left']">Click Through</span>
          <input type="checkbox" :class="[txtLight,'sets-check']" :checked="sClickThroughe"
            @change="() => { setSettings('click_through', !sClickThroughe) }" />
        </li>
        <li class="flex h-full items-center mx-4 space-x-3">
          <ArrowUpTrayIcon :class="[txt,'w-6 h-6']" />
          <span :class="[txt,'w-44 text-left']">Stay at top</span>
          <input type="checkbox" :class="[txtLight,'sets-check']" :checked="sStayTop"
            @change="() => { setSettings('stay_top', !sStayTop) }" />
        </li>
        <li class="flex h-full items-center mx-4 space-x-3">
          <RocketLaunchIcon :class="[txt,'w-6 h-6']" />
          <span :class="[txt,'w-44 text-left']">Start at launch</span>
          <input type="checkbox" :class="[txtLight,'sets-check']" :checked="sAutoStart"
            @change="() => { setSettings('auto_start', !sAutoStart) }" />
        </li>
        <li class="flex h-full items-center mx-4 space-x-3">
          <ArrowDownOnSquareStackIcon :class="[txt,'w-6 h-6']" />
          <span :class="[txt,'w-44 text-left']">Auto download update</span>
          <input type="checkbox" :class="[txtLight,'sets-check']" :checked="sAutoCheck"
            @change="() => { setSettings('auto_check', !sAutoCheck) }" />
        </li>
      </ul>
    </div>

    <div v-else-if="activeTab === 'Live2d'" :class="activeTab === 'Live2d' ? 'sets-content' : ''">
      <SettingModels :txt="txt" :txt-link="txtLink" :bg-active="bgActive" :bg-inactive="bgInactive" 
      :models-title="'Choose Live2d model: '" :curr-model="currLiveModel" :models="allLiveNames"
        @refresh-models="refreshModels" @set-model="setModel" @add-model="addingModel = !addingModel" />
    </div>

    <div v-else-if="activeTab === 'MMD'" :class="activeTab === 'MMD' ? 'sets-content' : ''">
      <SettingModels :txt="txt" :txt-link="txtLink" :bg-active="bgActive" :bg-inactive="bgInactive" 
       :models-title="'Choose MMD model: '" :curr-model="currMmdModel"
       :models="allMmdNames" @refresh-models="refreshModels" @set-model="setModel"
        @add-model="addingModel = !addingModel" />

      <!-- <div id="add_model_dialog" v-show="addingModel" class=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 z-10 py-4 px-6 
     rounded-xl border-[3px] border-slate-600 shadow-xl space-y-2">
      <h2 class="text-md pb-3 font-bold">Url path of your live2d model: </h2>
      <div class=" flex items-center space-x-2">
      <input type="text" class=" h-8 w-96 bg-slate-200 rounded-md border-2 border-slate-500" />
      <button class="font-bold hover:text-blue-400">submit</button>
      </div>
    </div> -->
    </div>
    
    <div v-else="activeTab === 'About'" :class="activeTab === 'About' ? 'sets-content' : ''">
      <div class="flex pt-6 px-8 items-center">
        <div class=" relative h-32 w-32 rounded-lg shadow-md bg-slate-400 group/app-icon hover:shadow-blue-300">
          <img class="object-cover h-32 w-32 rounded-lg" src="/app-icon.png" alt="" />
          <p class="w-full invisible group-hover/app-icon:visible absolute bottom-0 italic bg-gray-300 text-blue-300 justify-self-center">{{ aliveAppName + ', by TopSea' }}</p>
        </div>
        <ul class="pl-8 flex flex-col space-y-2">
          <li class="flex">
            <h3 :class="[txt,'font-bold']">开源项目地址：</h3>
            <a href="https://github.com/TopSea/Alive" target="_blank" :class="[txt,txtLink]">https://github.com/TopSea/Alive</a>
          </li>
          <li class="flex">
            <h3 :class="[txt,'font-bold']">关于作者：</h3>
            <a href="https://space.bilibili.com/307219768" target="_blank" :class="[txt,txtLink]">https://space.bilibili.com/307219768</a>
          </li>
          <li class="flex">
            <h3 :class="[txt,'font-bold']">支持项目：</h3>
            <a href="https://afdian.net/a/GoAHi" target="_blank" :class="[txt,txtLink]">https://afdian.net/a/GoAHi</a>
          </li>
          <li class="flex">
            <div class="flex">
              <h3 :class="[txt,'font-bold']">当前版本：</h3>
              <p :class="txt">{{ aliveVersion + '-alpha'}}</p>
              <div class=" relative flex group/build-info">
                <InformationCircleIcon class="w-5 h-5 ml-2 justify-self-end self-center text-orange-300"/>
                <p class=" invisible group-hover/build-info:visible w-44 absolute left-5 top-5 px-4 py-2 rounded-lg border-2 shadow-md border-orange-300 bg-orange-50">当前为 alpha 版本，运行时很可能会遇到问题！</p>
              </div>
            </div>
            <button :class="[txt,txtLink,'ml-8 font-bold']" @click="aliveCheckUpdate">检查更新</button>
          </li>
        </ul>
      </div>

      <div class="grow flex flex-col pt-4 px-8">
        <h3 class="font-bold text-blue-950">赞助者：</h3>
        <ul class="pl-8 flex flex-col space-y-2">
          <li class="flex">
            <a href="https://afdian.net/a/GoAHi" target="_blank" :class="[txt,txtLink]">
              当前没有赞助者，快来占据沙发吧~
            </a>
          </li>
        </ul>
      </div>
    </div>

    <AddModelDialog v-if="addingModel" @event-close="addingModel = false" @event-submit="addModel" />
  </div>
</template>
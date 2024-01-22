<script setup lang="ts">
import { Store } from "tauri-plugin-store-api";
import { join, resourceDir } from "@tauri-apps/api/path";
import { enable, disable } from "tauri-plugin-autostart-api";
import { WebviewWindow } from '@tauri-apps/api/window';
import { FileEntry, readDir } from "@tauri-apps/api/fs";
import { onBeforeMount, ref } from "vue";
import {
  SpeakerWaveIcon, CursorArrowRaysIcon, ArrowUpTrayIcon, RocketLaunchIcon,
  ArrowPathIcon, PlusIcon
} from '@heroicons/vue/24/outline'
import AddModelDialog from "./AddModelDialog.vue";

const resourceDirPath = await resourceDir();
const pathAlive = await join(resourceDirPath, 'data', 'sets_alive.json');
const pathLive2d = await join(resourceDirPath, 'data', 'sets_live2d.json');

const storeAlive = new Store(pathAlive);
const storeLive2d = new Store(pathLive2d);
const addingModel = ref(false);

const allModelNames = ref([""]);
const allModelPaths = ref([""]);

// 获取设置信息
const sModelVoice = ref(await storeLive2d.get("model_voice") as boolean)
const sClickThroughe = ref(await storeAlive.get("click_through") as boolean)
const sStayTop = ref(await storeAlive.get("stay_top") as boolean)
const sAutoStart = ref(await storeAlive.get("auto_start") as boolean)
const sHttpModels = ref(await storeLive2d.get("http_models") as string[])
const modelUrl = ref(await storeLive2d.get("model_url") as string)
console.log("modelUrl ", modelUrl)
const currModelName = ref("")

onBeforeMount(() => {
  const sCurrModel = modelUrl.value
  allModelPaths.value[0] = modelUrl.value
  const lastSlash = (sCurrModel.startsWith("http") || sCurrModel.startsWith("/")) ? sCurrModel.lastIndexOf("/") : sCurrModel.lastIndexOf("\\")
  const modelName = sCurrModel.substring(lastSlash + 1)
  currModelName.value = modelName
  allModelNames.value[0] = modelName

  if (sHttpModels.value === null) {
    console.log("sHttpModels.value === null");

    sHttpModels.value = []
  } else {
    sHttpModels.value.forEach(element => {
      const httpLastSlash = element.lastIndexOf("/")
      const httpName = element.substring(httpLastSlash + 1)
      if (httpName !== modelName) {     // 不重复添加
        console.log("element: ", element);
        allModelPaths.value.push(element)
        console.log("httpName: ", httpName);
        allModelNames.value.push(httpName)
      }
    });
  }

  refreshLive2dModels()
})

async function refreshLive2dModels() {
  const modelPath = await join(resourceDirPath, 'live2d');
  const entries = await readDir(modelPath, { recursive: true });
  findLive2dModels(entries);
}
async function findLive2dModels(models: FileEntry[]) {
  for (const model of models) {
    // console.log(`Entry: ${model.path}`);

    if (model.children) {
      findLive2dModels(model.children)
    } else {
      if (model.name?.endsWith(".model3.json") || model.name?.endsWith(".model.json")) {
        if (allModelNames.value.indexOf(model.name) === -1) {
          allModelNames.value.push(model.name);
          allModelPaths.value.push(model.path);
          console.log(model.path);
        }
      }
    }
  }
}


async function setSettings(key: string, val: any) {
  console.log("setSettings-", key, ": ", val);
  const mainWindow = WebviewWindow.getByLabel('main')

  switch (key) {
    case "model_voice": {
      sModelVoice.value = val as boolean

      if (val) {
        mainWindow?.emit('model_voice', true);
      } else {
        mainWindow?.emit('model_voice', false);
      }
      await storeLive2d.set(key, val);
      await storeLive2d.save();
      break;
    }
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
    case "model_url": {
      var foundURL = allModelPaths.value.find(
        (element) => {
          const path = element.replace(/\\/g, "/");
          return path.indexOf(val) !== -1;
        }
      );
      if (foundURL !== undefined) {
        const http = foundURL.replace(resourceDirPath, "https://asset.localhost/");
        const url = http.replace(/\\/g, "/");
        console.log("foundURL: ", url);
        await storeLive2d.set(key, url);
        mainWindow?.emit('event_model_url', url);
      }
      await storeLive2d.save();
      break;
    }
    default: { }
  }
}

async function addModel(modelURL: string) {
  console.log("addModel: ", modelURL);

  if (modelURL !== "" && modelURL.startsWith("http") && (modelURL.endsWith("model3.json") || modelURL.endsWith("model.json"))) {

    sHttpModels.value.push(modelURL)

    allModelPaths.value.push(modelURL)
    const lastSlash = (modelURL.startsWith("http") || modelURL.startsWith("/")) ? modelURL.lastIndexOf("/") : modelURL.lastIndexOf("\\")
    const modelName = modelURL.substring(lastSlash + 1)
    allModelNames.value.push(modelName)

    await storeLive2d.set("http_models", sHttpModels.value)
    await storeLive2d.save()
    addingModel.value = false
  }
}

</script>

<template>
  <div class="static w-full h-full bg-gray-100">
    <div class="basis-1/5 w-full h-20 grid grid-cols-2 grid-rows-2">
      <button class="flex h-full items-center mx-4 px-4 space-x-3">
        <SpeakerWaveIcon class=" w-6 h-6" />
        <span class="w-28 text-left">Model Voice</span>
        <input type="checkbox" class="w-4 h-4" :checked="sModelVoice"
          @change="() => { setSettings('click_through', !sClickThroughe) }" />
      </button>
      <button class="flex h-full items-center mx-4 px-4 space-x-3">
        <CursorArrowRaysIcon class=" w-6 h-6" />
        <span class="w-28 text-left">Click Through</span>
        <input type="checkbox" class="w-4 h-4" :checked="sClickThroughe"
          @change="() => { setSettings('click_through', !sClickThroughe) }" />
      </button>
      <button class="flex h-full items-center mx-4 px-4 space-x-3">
        <ArrowUpTrayIcon class=" w-6 h-6" />
        <span class="w-28 text-left">Stay at top</span>
        <input type="checkbox" class="w-4 h-4" :checked="sStayTop"
          @change="() => { setSettings('click_through', !sClickThroughe) }" />
      </button>
      <button class="flex h-full items-center mx-4 px-4 space-x-3">
        <RocketLaunchIcon class=" w-6 h-6" />
        <span class="w-28 text-left">Start at launch</span>
        <input type="checkbox" class="w-4 h-4" :checked="sAutoStart"
          @change="() => { setSettings('click_through', !sClickThroughe) }" />
      </button>
    </div>
    <div class="basis-4/5 px-4 w-full bg-gray-300 mb-8">
      <div class="flex w-full justify-between items-center">
        <h2 class=" px-4 py-2">Choose live2d model: </h2>

        <div class=" flex space-x-2 mx-4">
          <button class="flex" @onClick="">
            <PlusIcon @click="addingModel = !addingModel" class="stroke-2 w-6 h-6 text-slate-900 hover:text-slate-500" />
          </button>
          <button class="flex" @onClick="refreshLive2dModels">
            <ArrowPathIcon class="stroke-2 w-6 h-6 text-slate-900 hover:text-slate-500" />
          </button>
        </div>
      </div>

      <div class="h-72 space-y-2 overflow-y-auto">
        <div v-for="live2dModel in allModelNames" :class="currModelName === live2dModel ? 'flex flex-row items-center justify-between border-2 rounded-xl mx-4 hover:mx-0 border-green-300' :
          'flex flex-row items-center justify-between border-2 rounded-xl mx-4 hover:mx-0 border-gray-400'"
          @onClick="() => { setSettings('model_url', live2dModel); currModelName = live2dModel; }">

          <h2 :class="currModelName === live2dModel ? 'w-4/5 px-2 py-2 truncate rounded-l-md bg-green-300' :
            'w-4/5 px-2 py-2 truncate rounded-l-md bg-gray-400'">{{ live2dModel }}</h2>
          <input type="checkbox" class="w-5 h-5 mx-4" :checked="currModelName === live2dModel" @change="() => {
            setSettings('model_url', live2dModel);
            currModelName = live2dModel;
          }" />
        </div>
      </div>
    </div>

    <!-- <div id="add_model_dialog" v-show="addingModel" class=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 z-10 py-4 px-6 
     rounded-xl border-[3px] border-slate-600 shadow-xl space-y-2">
      <h2 class="text-md pb-3 font-bold">Url path of your live2d model: </h2>
      <div class=" flex items-center space-x-2">
      <input type="text" class=" h-8 w-96 bg-slate-200 rounded-md border-2 border-slate-500" />
      <button class="font-bold hover:text-blue-400">submit</button>
      </div>
    </div> -->

    <AddModelDialog v-if="addingModel" @event-close="addingModel = false" @event-submit="addModel" />
  </div>
</template>
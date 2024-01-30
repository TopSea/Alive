<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { onBeforeMount, onMounted, ref } from "vue";
import * as PIXI from 'pixi.js';
import { config, Live2DModel } from 'pixi-live2d-display/cubism4';
import {
  ArrowPathIcon, ArrowsRightLeftIcon, ArrowsUpDownIcon, Cog6ToothIcon, MagnifyingGlassPlusIcon, SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/vue/24/solid'
import NumChange from "../NumChange.vue";
import { Store } from "tauri-plugin-store-api";
import { join, resourceDir } from "@tauri-apps/api/path";
import { listen, emit as tauriEmit } from "@tauri-apps/api/event";

onBeforeMount(() => {
  (window as any).PIXI = PIXI;
})

const resourceDirPath = await resourceDir();
const path = await join(resourceDirPath, 'data', 'sets_live2d.json');
const store = new Store(path);
const modelURL = await store.get("model_url") as string;
const sModelVoice = ref(await store.get("model_voice") as boolean)
const sModelScale = ref(await store.get("model_scale") as number)
const sModelX = ref(await store.get("model_x") as number)
const sModelY = ref(await store.get("model_y") as number)

console.log("modelURL:", modelURL);

const live2d_canvas = ref();
const model = Live2DModel.fromSync(modelURL);

var isModelReady = ref(false);
var isModelZooming = ref(false);
var isModelLRing = ref(false);
var isModelUDing = ref(false);

async function changeModelVoice(openVoice: boolean) {
  sModelVoice.value = openVoice
  config.sound = openVoice
  await store.set("model_voice", openVoice)
  await store.save()
}
async function changeModelZoom(isPlus: boolean) {
  if (isPlus) {
    sModelScale.value += 0.01
  } else {
    sModelScale.value -= 0.01
  }
  model.scale.set(sModelScale.value)
  await store.set("model_scale", sModelScale.value)
  await store.save()
}
async function changeModelLR(isPlus: boolean) {
  if (isPlus) {
    model.x = model.x + 10
  } else {
    model.x = model.x - 10
  }
  await store.set("model_x", model.x)
  await store.save()
}
async function changeModelUD(isPlus: boolean) {
  if (isPlus) {
    model.y = model.y + 10
  } else {
    model.y = model.y - 10
  }
  await store.set("model_y", model.y)
  await store.save()
}


async function listenEvents() {
  await listen('event_live2d_url', (_event: any) => {
    reloadPage()
  });
}

function reloadPage() {
  location.reload()
}

async function openSettings() {
  await tauriEmit('event_open_settings', true);
}

onMounted(() => {
  console.log("Live2d onMounted");
  listenEvents()
  const app = new PIXI.Application({
    view: live2d_canvas.value as HTMLCanvasElement,
    autoStart: true,
    resizeTo: window,
    backgroundColor: 0x00ffffff,
    backgroundAlpha: 0,
    useContextAlpha: 'notMultiplied'
  });
  // https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json
  // https://asset.localhost/live2d/buleisite_2/buleisite_2.model3.json
  model.once('ready', () => {
    app.stage.addChild(model);
    model.scale.set(sModelScale.value)
    model.x = sModelX.value
    model.y = sModelY.value

    // 交互
    model.on("hit", (hitAreas) => {
      if (hitAreas.includes("Body")) {
        model.motion("Tap");
      }

      if (hitAreas.includes("Head")) {
        model.expression();
      }
    });

    isModelReady.value = true
  });

})
</script>


<template>
  <div class="w-full h-full static group/menu-mmd">
    <canvas ref="live2d_canvas" class="w-full h-full group-hover/menu-mmd:border border-dashed border-gray-100"></canvas>

    <ul v-if="isModelReady" data-tauri-drag-region
      class=" invisible group-hover/menu-mmd:visible absolute flex flex-col inset-y-0 right-0 mx-4 my-4 py-4 px-2 space-y-4 backdrop-blur-3xl bg-white/30">
      <li class="w-8 h-8" @click="reloadPage">
        <ArrowPathIcon class="icon-menu" />
      </li>
      <li class="w-8 h-8">
        <SpeakerWaveIcon v-if="sModelVoice" class="icon-menu" @click="changeModelVoice(!sModelVoice)" />
        <SpeakerXMarkIcon v-else class="icon-menu" @click="changeModelVoice(!sModelVoice)" />
      </li>

      <li class=" w-8 h-8">
        <MagnifyingGlassPlusIcon v-if="isModelZooming" :class="'w-8 h-8 text-blue-800 brightness-200 blur-sm'" />
        <MagnifyingGlassPlusIcon
          @click="() => { isModelZooming = !isModelZooming; isModelUDing = false; isModelLRing = false; }"
          :class="isModelZooming ? 'w-8 h-8 text-blue-800 relative -top-8 ' : ' w-8 h-8 text-zinc-700 hover:text-zinc-500'" />
        <NumChange v-if="isModelZooming" v-bind:posTop="112" @minus-event="() => { changeModelZoom(false) }"
          @plus-event="() => { changeModelZoom(true) }" />
      </li>
      <li class="w-8 h-8">
        <ArrowsRightLeftIcon v-if="isModelLRing" :class="'w-8 h-8 text-blue-800 brightness-200 blur-sm'" />
        <ArrowsRightLeftIcon
          @click="() => { isModelLRing = !isModelLRing; isModelUDing = false; isModelZooming = false; }"
          :class="isModelLRing ? 'w-8 h-8 text-blue-800 relative -top-8 ' : 'icon-menu'" />
        <NumChange v-if="isModelLRing" v-bind:posTop="159" @minus-event="() => { changeModelLR(false) }"
          @plus-event="() => { changeModelLR(true) }" />
      </li>
      <li class=" w-8 h-8 group/tb">
        <ArrowsUpDownIcon v-if="isModelUDing" :class="'w-8 h-8 text-blue-800 brightness-200 blur-sm'" />
        <ArrowsUpDownIcon @click="() => { isModelUDing = !isModelUDing; isModelLRing = false; isModelZooming = false; }"
          :class="isModelUDing ? 'w-8 h-8 text-blue-800 relative -top-8 ' : ' w-8 h-8 text-zinc-700 hover:text-zinc-500'" />
        <NumChange v-if="isModelUDing" v-bind:posTop="206" @minus-event="() => { changeModelUD(false) }"
          @plus-event="() => { changeModelUD(true) }" />
      </li>
      <li class="w-8 h-8" @click="openSettings">
        <Cog6ToothIcon class="icon-menu" />
      </li>
    </ul>
  </div>
</template>

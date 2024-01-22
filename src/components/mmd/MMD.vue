<script setup lang="ts">
import { Engine } from "@babylonjs/core/Engines/engine";

import { BaseRuntime } from "./MMDRuntime";
import { SceneBuilder } from "./MMDSceneBuilder";
// import { SceneBuilder } from "./MMDBuilder";
import { onMounted, ref } from "vue";
import { ArrowPathIcon, CameraIcon, PlayIcon, PauseIcon, Cog6ToothIcon, FilmIcon as DancingIcon } from '@heroicons/vue/24/solid'
import { FilmIcon } from '@heroicons/vue/24/outline'
import { emit as tauriEmit } from '@tauri-apps/api/event';
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";

const resourceDirPath = await resourceDir();
const path = await join(resourceDirPath, 'data', 'sets_mmd.json');
const store = new Store(path);
const mmdAliveUrl = await store.get("mmd_alive_url") as string;
const pausedAnimation = ref(await store.get("is_pausing") as boolean)

const dancing = ref(false)

const mmd_canvas = ref();

function reloadPage() {
  location.reload()
}

async function changeCamera() {
  await tauriEmit('event_change_camera', true);
}
async function pauseAnimation() {
  pausedAnimation.value = !pausedAnimation.value
  await tauriEmit('event_pause_animation', pausedAnimation.value);
}
async function mmdDancing() {
  dancing.value = !dancing.value
  await tauriEmit('event_mmd_dancing', dancing.value);
}
async function openSettings() {
  await tauriEmit('event_open_settings', true);
}

onMounted(() => {
  console.log("MMD onMounted");
  const mmdCanvas = mmd_canvas.value as HTMLCanvasElement

  const engine = new Engine(mmdCanvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    alpha: true,
    powerPreference: "high-performance",
    doNotHandleTouchAction: true,
    doNotHandleContextLost: true,
    audioEngine: false
  }, true);

  BaseRuntime.Create({
    canvas: mmdCanvas,
    engine,
    sceneBuilder: new SceneBuilder(),
    mmdAliveUrl
  }).then(runtime => runtime.run());

})
</script>


<template>
  <div class="w-full h-full static border border-gray-100 border-dashed">
    <canvas ref="mmd_canvas" class="w-full h-full" ></canvas>
    <ul data-tauri-drag-region
      class="absolute flex flex-col inset-y-0 right-0 mx-4 my-4 py-4 px-2 space-y-4 backdrop-blur-3xl bg-white/30">
      <li class="w-8 h-8" @click="reloadPage">
        <ArrowPathIcon class="icon-menu" />
      </li>
      <li class="w-8 h-8" @click="changeCamera">
        <CameraIcon class="icon-menu" />
      </li>
      <li class="w-8 h-8" @click="pauseAnimation">
        <PauseIcon v-if="!pausedAnimation" class="icon-menu" />
        <PlayIcon v-else class="icon-menu" />
      </li>
      <li class="w-8 h-8" @click="mmdDancing">
        <FilmIcon v-if="dancing"/>
        <DancingIcon v-else/>
      </li>
      <li class="w-8 h-8" @click="openSettings">
        <Cog6ToothIcon class="icon-menu" />
      </li>
    </ul>
  </div>
</template>


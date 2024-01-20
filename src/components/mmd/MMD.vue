<script setup lang="ts">
import { Engine } from "@babylonjs/core/Engines/engine";

import { BaseRuntime } from "./MMDRuntime";
import { SceneBuilder } from "./MMDSceneBuilder";
// import { SceneBuilder } from "./MMDBuilder";
import { onMounted, ref } from "vue";
import { ArrowPathIcon, CameraIcon, PlayIcon, PauseIcon } from '@heroicons/vue/24/solid'
import { emit as tauriEmit } from '@tauri-apps/api/event';

const mmd_canvas = ref();
const pausedAnimation = ref(false)

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
    sceneBuilder: new SceneBuilder()
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
    </ul>
  </div>
</template>


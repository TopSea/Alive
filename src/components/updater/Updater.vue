<script setup lang="ts">
import { getVersion } from "@tauri-apps/api/app";
import { txt, txtHover, bg, } from "../../theme/color";
import { relaunch } from '@tauri-apps/api/process'
import { onUnmounted, onBeforeMount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { installUpdate, checkUpdate, onUpdaterEvent } from "@tauri-apps/api/updater";
import { UnlistenFn } from "@tauri-apps/api/event";
import { ArrowDownOnSquareStackIcon } from '@heroicons/vue/24/outline'
import { appWindow } from '@tauri-apps/api/window';

const { t } = useI18n();
var unlistenUpdate: UnlistenFn | null = null;
const aliveVersion = ref("_")
const version = ref()
const date = ref()
const content = ref()
const downloading = ref(false)

async function updateAlive() {
  downloading.value = true
  await installUpdate()
  await relaunch()
}
async function closeUpdate() {
  await appWindow.close()
}

onBeforeMount(async () => {
  aliveVersion.value = await getVersion();

  unlistenUpdate = await onUpdaterEvent(({ error, status }) => {
    // This will log all updater events, including status updates and errors.
    console.log('Updater event', error, status)
  })
  const { manifest } = await checkUpdate();
  console.log('manifest： ', manifest)
  version.value = manifest?.version
  const rDate = manifest?.date as string
  const rDayI = rDate.indexOf(" ")
  date.value = rDate.substring(0, rDayI)
  const body = manifest?.body as string
  content.value = body.split(';')

})
onUnmounted(() => {
  if (unlistenUpdate !== null) {
    unlistenUpdate();
  }
})
</script>

<template>
  <div :class="[bg,'w-lvw h-lvh flex flex-col']">
    <div class="flex pt-6 px-6 items-center">
      <div class=" relative h-44 w-44 rounded-lg shadow-md bg-slate-400 group/app-icon hover:shadow-blue-300">
        <img class="object-cover h-44 w-44 rounded-lg" src="/app-icon.png" alt="" />
        <p
          class="w-full invisible group-hover/app-icon:visible absolute bottom-0 italic bg-gray-300 text-blue-300 justify-self-center rounded-b-lg">
          {{ t('updater.info') }}</p>
      </div>
      <ul class="pl-6 flex flex-col space-y-2">
        <li class="flex">
          <h3 :class="[txt, 'font-bold']">{{ t('updater.version') }}</h3>
          <p :class="[txt, txtHover]">{{ aliveVersion + ' ===> ' + version }}</p>
        </li>
        <li class="flex">
          <h3 :class="[txt, 'font-bold']">{{ t('updater.date') }}</h3>
          <p :class="[txt, txtHover]">{{ date }}</p>
        </li>
        <li class="flex flex-col">
          <h3 :class="[txt, 'font-bold']">{{ t('updater.content') }}</h3>
          <div :class="[txt, txtHover, 'flex pl-5']" v-for="c in content">
            <h3 :class="['text-inherit hover:text-inherit font-bold']"> - </h3>
            <p :class="['text-inherit hover:text-inherit pl-2']">{{ c }}</p>
          </div>
        </li>
      </ul>
    </div>
    <div :class="['flex justify-end space-x-4 mx-8']">
      <button :class="['py-2 px-4 border-2 border-alive-inactive rounded-lg']" @click="closeUpdate">取消</button>
      <button :class="['py-2 px-4 border-2 border-alive-active rounded-lg']" @click="updateAlive">下载更新</button>
    </div>
  </div>


  <div v-show="downloading" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center bg-alive-bg py-4 px-6 
     rounded-2xl border-2 border-alive-input shadow-2xl space-y-2">
    
     <ArrowDownOnSquareStackIcon :class="['animate-bounce w-6 h-6']"/>
     <p :class="[txt,'pl-2']">{{ t('updater.downloading') }}</p>
  </div>
</template>
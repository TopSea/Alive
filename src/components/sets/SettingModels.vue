<script setup lang="ts">
import {
    PlusIcon, ArrowPathIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({ modelsTitle: String, currModel: String, models: Array<String> })
const emit = defineEmits(['addModel', 'refreshModels', 'setModel'])
const isMMD = props.modelsTitle?.indexOf("MMD") !== -1

</script>

<template>
  <div class="flex justify-between items-center">
    <h2 class=" mx-3 py-2 text-lg">{{modelsTitle}}</h2>

    <div class=" flex space-x-2 mx-3">
      <button class="flex" @click="">
        <PlusIcon @click="$emit('addModel')" class="stroke-2 w-6 h-6 text-slate-900 hover:text-slate-500" />
      </button>
      <button class="flex" @click="$emit('refreshModels', isMMD)">
        <ArrowPathIcon class="stroke-2 w-6 h-6 text-slate-900 hover:text-slate-500" />
      </button>
    </div>
  </div>

  <div class="grow space-y-2 overflow-y-auto">
    <div v-for="model in models" :class="currModel === model ? 'sets-item-selected' : 'sets-item'"
      @click="$emit('setModel', model)">

      <h2 :class="currModel === model ? 'w-4/5 px-2 py-2 rounded-l-md' :
        'w-4/5 px-2 py-2 rounded-l-md'">{{ model }}</h2>
    </div>
  </div>
</template>
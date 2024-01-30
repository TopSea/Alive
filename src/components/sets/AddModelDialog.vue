<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['event-close', 'event-submit'])
const modelURL = ref("")

function handleInput(event: any) {
  modelURL.value = event.target.value
}

function submitModel() {
    console.log("url", modelURL.value);
    
    emit('event-submit', modelURL.value)
}
</script>

<template>
    <div
     @click="$emit('event-close')" 
     class=" absolute top-0 left-0 w-full h-full flex bg-transparent justify-center items-center">
      <div id="add_model_dialog" class=" bg-slate-200 z-10 py-4 px-6 
     rounded-xl border-[3px] border-slate-600 shadow-xl space-y-2" @click.stop="">
        <h2 class="text-md pb-3 font-bold">Url path of your live2d model: </h2>
        <div class=" flex items-center space-x-2">
          <input :value="modelURL" @input="handleInput" type="text" class=" h-8 w-96 bg-slate-200 rounded-md border-2 border-slate-500 px-1" />
          <button @click.stop="submitModel" class="font-bold hover:text-blue-400">submit</button>
        </div>
      </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import {
    PlusIcon, MinusIcon
} from '@heroicons/vue/24/solid'

defineProps({ stireKey: String, posTop: Number })
const emit = defineEmits(['plus-event', 'minus-event'])

const longPressed = ref(false)
const longPressInterval = ref()
const onMouseDown = (isPlus: boolean) => {
    // 当鼠标按下时，设置一个定时器
    longPressInterval.value = setInterval(() => {
        longPressed.value = true
        if (isPlus) {
            
            emit('plus-event')
            console.log('mouseDown plus-event');
            
        } else {
            emit('minus-event')
            console.log('mouseDown minus-event');
        }
    }, 200); // 200 毫秒确认是长按，每 200 毫秒执行一次
}

const onMouseUp = (isPlus: boolean) => {
    // 当鼠标抬起时，清除定时器
    clearInterval(longPressInterval.value)

    if (longPressed.value) {
        if (isPlus) {
            console.log('mouseUp plus-event');
            
        } else {
            console.log('mouseUp minus-event');
        }
    } else {
        click(isPlus)
    }
    longPressed.value = false
}

//点击事件函数
const click = (isPlus: boolean) => {
    if (isPlus) {
        emit('plus-event')
        console.log('click plus-event');
        
    } else {
        emit('minus-event')
        console.log('click minus-event');
    }
}

</script>


<template>
    <div class=" absolute flex h-8 items-center rotate-90 space-x-2" :style="{ top: posTop + 'px', left: -48 + 'px' }">
        <button class="flex items-center w-7 h-7 border-2 border-slate-700 drop-shadow-md rounded-md hover:rounded-2xl "
         @mousedown="onMouseDown(true)"
         @mouseup="onMouseUp(true)"
         >
            <PlusIcon class="w-7 h-7 border-slate-700" />
        </button>
        <button class="flex items-center w-7 h-7 border-2 border-slate-700 drop-shadow-md rounded-md hover:rounded-2xl"
         @mousedown="onMouseDown(false)"
         @mouseup="onMouseUp(false)"
         >
            <MinusIcon class="w-7 h-7 border-slate-700 rotate-90" />
        </button>
    </div>
</template>
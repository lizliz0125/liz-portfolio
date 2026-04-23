<script setup>
import ArrowIcon from '@/icons/ArrowIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** 若设置，右侧箭头为外链（点击不触发展开） */
  arrowHref: { type: String, default: '' },
  /** 若设置：整行点击直接打开链接，不展开、不 emit toggle */
  linkHref: { type: String, default: '' },
})

const emit = defineEmits(['toggle', 'hover', 'leave']);

function onHeaderClick() {
  if (props.linkHref) {
    window.open(props.linkHref, '_blank', 'noopener,noreferrer');
    return;
  }
  emit('toggle');
}
</script>

<template>
  <div class="flex-1 flex flex-col w-full " @mouseover="emit('hover')" @mouseleave="emit('leave')">

    <div
      class="flex-1 group relative p-4 w-full items-center font-rubik cursor-pointer text-xl lg:text-[2dvw] overflow-hidden transition-all"
      @click="onHeaderClick"
    >
      <!-- black overlay -->
      <div
        class="absolute inset-0 bg-black -z-10 pointer-events-none group-hover:translate-y-0 transition-transform duration-500"
        :class="props.open ? 'translate-y-0' : 'translate-y-[98%]'"
      >
      </div>

      <!-- content -->
      <div class="z-10 w-full h-full flex justify-between items-center text-white">
        <slot name="header"></slot>
        <div class="lg:w-[2dvw] w-6 aspect-square flex justify-center items-center">
          <a
            v-if="props.arrowHref"
            :href="props.arrowHref"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-full w-full items-center justify-center text-white transition-opacity hover:opacity-90"
            aria-label="打开文档"
            @click.stop
          >
            <ArrowIcon class="block h-full w-full" />
          </a>
          <ArrowIcon
            v-else
            class="block transition-all"
            :class="props.open ? 'rotate-90' : 'rotate-0'"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!props.linkHref"
      class="w-full overflow-hidden bg-black text-white"
      :class="props.open ? 'h-auto' : 'h-0'"
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>

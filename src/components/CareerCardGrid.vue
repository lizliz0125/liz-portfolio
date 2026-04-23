<script setup>
defineProps({
  items: { type: Array, required: true },
  career: { type: Object, required: true },
  /** 当前展开项索引，-1 表示全部收起 */
  openIndex: { type: Number, default: -1 },
  /** 移动端略小字号 */
  dense: { type: Boolean, default: false },
});

const emit = defineEmits(['toggle']);

function isOpen(i, idx) {
  return idx === i;
}

function onHeaderClick(i) {
  emit('toggle', i);
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-5 lg:grid-cols-2"
    :class="dense ? 'gap-3' : 'md:gap-6'"
  >
    <article
      v-for="(item, i) in items"
      :id="'career-card-' + item.id"
      :key="'card-' + item.id"
      class="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-black/25 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-amber-400/25 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
    >
      <!-- 可点击标题区：展开 / 收起 -->
      <div
        class="cursor-pointer select-none border-b border-white/[0.08] px-4 pb-3 pt-4 md:px-5 md:pb-4 md:pt-5"
        role="button"
        tabindex="0"
        :aria-expanded="isOpen(i, openIndex)"
        @click="onHeaderClick(i)"
        @keydown.enter.prevent="onHeaderClick(i)"
        @keydown.space.prevent="onHeaderClick(i)"
      >
        <p
          class="border-l-2 border-amber-400/75 pl-3 font-career font-semibold leading-snug text-amber-100/95"
          :class="dense ? 'text-[11px] leading-tight' : 'text-xs md:text-[13px]'"
        >
          {{ item.headline }}
        </p>
        <p
          v-if="!isOpen(i, openIndex)"
          class="mt-2.5 font-career leading-relaxed text-white/78"
          :class="dense ? 'text-xs' : 'text-sm md:text-[15px]'"
        >
          {{ item.short }}
        </p>
        <div class="mt-3 flex items-center justify-between gap-2">
          <span
            class="font-career text-white/40"
            :class="dense ? 'text-[10px]' : 'text-xs'"
          >
            {{ isOpen(i, openIndex) ? career.collapseHint : career.expandHint }}
          </span>
          <span
            class="font-career text-white/25 transition-transform duration-200"
            :class="[isOpen(i, openIndex) ? '-rotate-180' : '', dense ? 'text-xs' : 'text-sm']"
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
      </div>

      <div
        v-show="isOpen(i, openIndex)"
        class="flex flex-col gap-4 px-4 pb-4 pt-1 md:px-5 md:pb-5"
        @click.stop
      >
        <p
          class="font-career leading-relaxed text-white/82"
          :class="dense ? 'text-xs' : 'text-sm md:text-[15px]'"
        >
          {{ item.intro }}
        </p>

        <div>
          <p
            class="mb-2.5 font-career font-medium uppercase tracking-[0.2em] text-white/45"
            :class="dense ? 'text-[9px]' : 'text-[10px] md:text-[11px]'"
          >
            {{ career.capabilityHeading }}
          </p>
          <ul class="space-y-2.5 font-career text-white/76" :class="dense ? 'text-xs' : 'text-sm md:text-[15px]'">
            <li
              v-for="(b, bi) in item.bullets"
              :key="bi"
              class="relative border-l border-white/10 pl-3 leading-relaxed"
            >
              <span
                class="absolute -left-px top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-400/80"
                aria-hidden="true"
              />
              {{ b }}
            </li>
          </ul>
        </div>

        <p
          class="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 font-career leading-relaxed text-white/72"
          :class="dense ? 'text-[11px]' : 'text-xs md:text-sm'"
        >
          {{ item.closing }}
        </p>

        <a
          v-if="item.link?.href"
          :href="item.link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-fit items-center gap-1.5 font-career font-medium text-amber-200/95 underline decoration-amber-400/40 underline-offset-4 transition-colors hover:text-amber-100"
          :class="dense ? 'text-xs' : 'text-sm'"
          @click.stop
        >
          {{ item.link.label }}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';
import FramedMainSection from '@/layouts/FramedMainSection.vue';
import CareerCardGrid from '@/components/CareerCardGrid.vue';
import { useI18n } from '@/i18n';

const { msg } = useI18n();
const career = computed(() => msg.value.career);
const items = computed(() => career.value.items);

const careerBgUrl = '/career/liz-career-photo.jpg';

const openIndex = ref(-1);

function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i;
}

function openFromTimeline(i) {
  openIndex.value = i;
  nextTick(() => {
    const id = items.value[i]?.id;
    if (!id) return;
    document.getElementById(`career-card-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  });
}
</script>

<template>
  <FramedMainSection id="career" class="min-h-[100dvh] w-full flex items-center py-12">
    <div class="relative w-full min-h-[75dvh] rounded-4xl overflow-hidden p-4">
      <div class="absolute inset-0 overflow-hidden rounded-4xl">
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.58]"
          :style="{ backgroundImage: `url(${careerBgUrl})` }"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/78 via-black/68 to-black/84"
        />
      </div>

      <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 text-white">
        <header>
          <h2 class="font-ledger text-2xl tracking-tight">
            {{ career.title }}
          </h2>
        </header>

        <div class="flex flex-col gap-3 border-l border-white/20 pl-3">
          <button
            v-for="(item, i) in items"
            :key="'tl-' + item.id"
            type="button"
            class="relative rounded-lg py-1 pl-3 text-left transition-colors hover:bg-white/5"
            @click="openFromTimeline(i)"
          >
            <span
              class="absolute -left-[17px] top-2 h-2 w-2 rounded-full border border-white/35 bg-amber-400/90"
              aria-hidden="true"
            />
            <div class="font-career text-[10px] text-white/55">{{ item.period }}</div>
            <div
              class="max-w-[calc(100vw-3.5rem)] overflow-hidden text-ellipsis font-career text-[15px] font-bold leading-none tracking-[-0.02em] text-white whitespace-nowrap"
            >
              {{ item.title }}
            </div>
            <div class="font-career text-[11px] text-red-custom">{{ item.role }}</div>
          </button>
        </div>

        <CareerCardGrid
          :items="items"
          :career="career"
          :open-index="openIndex"
          dense
          @toggle="toggle"
        />
      </div>
    </div>
  </FramedMainSection>
</template>

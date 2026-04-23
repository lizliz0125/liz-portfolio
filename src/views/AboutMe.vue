<script setup>
import { computed, ref, nextTick } from 'vue';
import FramedMainSection from '@/layouts/FramedMainSection.vue';
import CareerCardGrid from '@/components/CareerCardGrid.vue';
import { useI18n } from '@/i18n';

const { msg } = useI18n();
const career = computed(() => msg.value.career);
const items = computed(() => career.value.items);

/** 经历区底图（摄影图 + 压暗遮罩） */
const careerBgUrl = '/career/liz-career-photo.jpg';

/** -1 = 全部收起 */
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
  <FramedMainSection id="career" class="min-h-[100dvh] w-full flex items-center py-14 md:py-20">
    <div class="relative w-full min-h-[80dvh] rounded-4xl overflow-hidden p-5 md:p-[3dvw]">
      <div class="absolute inset-0 overflow-hidden rounded-4xl">
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.58]"
          :style="{ backgroundImage: `url(${careerBgUrl})` }"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/78 via-black/68 to-black/84"
        />
      </div>

      <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 text-white md:gap-10">
        <header>
          <h2 class="font-ledger text-3xl tracking-tight md:text-4xl">
            {{ career.title }}
          </h2>
        </header>

        <!-- 桌面：横向时间线 -->
        <div class="hidden w-full md:block">
          <div class="flex w-full items-start">
            <template v-for="(item, i) in items" :key="'tl-d-' + item.id">
              <button
                type="button"
                class="min-w-0 flex-1 rounded-xl px-1 py-3 text-center transition-colors hover:bg-white/5 md:px-1.5"
                @click="openFromTimeline(i)"
              >
                <div class="font-career text-[10px] leading-tight text-white/55 md:text-[11px]">
                  {{ item.period }}
                </div>
                <div
                  class="mx-auto mt-2 block max-w-full overflow-hidden text-ellipsis font-career text-[clamp(0.8125rem,1.45vw,1.1875rem)] font-bold leading-none tracking-[-0.02em] text-white whitespace-nowrap md:tracking-tight"
                >
                  {{ item.title }}
                </div>
                <div class="mt-1.5 font-career text-[11px] leading-snug text-red-custom md:text-xs">
                  {{ item.role }}
                </div>
              </button>
              <div
                v-if="i < items.length - 1"
                class="mx-0.5 mt-8 h-px w-4 shrink-0 self-start bg-gradient-to-r from-white/10 via-white/35 to-white/10 md:w-7"
                aria-hidden="true"
              />
            </template>
          </div>
        </div>

        <div class="flex w-full flex-col gap-3 border-l border-white/20 pl-4 md:hidden">
          <button
            v-for="(item, i) in items"
            :key="'tl-m-' + item.id"
            type="button"
            class="relative rounded-lg py-1 pl-3 text-left transition-colors hover:bg-white/5"
            @click="openFromTimeline(i)"
          >
            <span
              class="absolute -left-[21px] top-2 h-2.5 w-2.5 rounded-full border border-white/40 bg-amber-400/90"
              aria-hidden="true"
            />
            <div class="font-career text-[11px] text-white/55">{{ item.period }}</div>
            <div
              class="max-w-[calc(100vw-3rem)] overflow-hidden text-ellipsis font-career text-[15px] font-bold leading-none tracking-[-0.02em] text-white whitespace-nowrap"
            >
              {{ item.title }}
            </div>
            <div class="font-career text-xs text-red-custom">{{ item.role }}</div>
          </button>
        </div>

        <CareerCardGrid
          :items="items"
          :career="career"
          :open-index="openIndex"
          :dense="false"
          @toggle="toggle"
        />
      </div>
    </div>
  </FramedMainSection>
</template>

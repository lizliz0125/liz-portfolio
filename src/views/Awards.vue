<script setup>
import { computed, ref } from 'vue';
import FramedMainSection from '@/layouts/FramedMainSection.vue';
import Parallax from '@/components/Parallax.vue';
import { useI18n } from '@/i18n';

const { msg } = useI18n();
const rec = computed(() => msg.value.recommend);

const showAllVideos = ref(false);
const showAllPeople = ref(false);

const videoPreview = 5;
const peoplePreview = 6;

const videos = computed(() => rec.value?.videos ?? []);
const people = computed(() => rec.value?.people ?? []);

const visibleVideos = computed(() =>
  showAllVideos.value ? videos.value : videos.value.slice(0, videoPreview),
);

const visiblePeople = computed(() =>
  showAllPeople.value ? people.value : people.value.slice(0, peoplePreview),
);

const hasMoreVideos = computed(() => videos.value.length > videoPreview);
const hasMorePeople = computed(() => people.value.length > peoplePreview);
</script>

<template>
  <FramedMainSection id="ai-tools" class="min-h-dvh md:h-dvh">
    <Parallax>
      <div
        class="recommend-paper relative h-full min-h-0 w-full overflow-hidden rounded-4xl text-stone-900 shadow-[inset_0_0_80px_rgba(62,54,46,0.08)]"
      >
        <div
          class="recommend-scroll relative z-10 flex h-full max-h-[100dvh] flex-col gap-12 overflow-y-auto px-5 py-10 md:px-10 md:py-12 lg:px-14"
        >
          <header class="max-w-3xl flex-shrink-0">
            <h2 class="font-ledger text-2xl tracking-tight text-stone-900 md:text-3xl lg:text-4xl">
              {{ rec.title }}
            </h2>
            <p class="font-career mt-3 text-sm leading-relaxed text-stone-700 md:text-base">
              {{ rec.subtitle }}
            </p>
          </header>

          <!-- Featured videos：版式 A 左栏标题 + 右栏列表 -->
          <section
            class="grid flex-shrink-0 grid-cols-1 gap-8 md:grid-cols-[minmax(6.5rem,9.5rem)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(7.5rem,11rem)_minmax(0,1fr)] lg:gap-14"
          >
            <div class="md:sticky md:top-20 md:self-start">
              <h3
                class="font-ledger text-[0.65rem] leading-snug tracking-[0.28em] text-stone-500 uppercase md:text-xs"
              >
                {{ rec.videosHeading }}
              </h3>
            </div>
            <div>
              <ul class="border-t border-stone-900/10">
                <li
                  v-for="(item, i) in visibleVideos"
                  :key="'v-' + i + item.url"
                  class="border-b border-stone-900/10 py-5 last:border-b-0"
                >
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-ledger text-base leading-snug text-stone-900 underline decoration-stone-400/50 underline-offset-4 transition-colors hover:decoration-red-800/70 md:text-lg"
                  >
                    {{ item.title }}
                  </a>
                  <p
                    class="font-career mt-2.5 text-sm leading-relaxed text-stone-700 md:text-[0.9375rem]"
                  >
                    {{ item.reason }}
                  </p>
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-career mt-2 inline-block text-xs font-medium tracking-wide text-red-900/90 underline decoration-red-900/25 underline-offset-4 hover:text-red-950"
                  >
                    {{ rec.openOnYoutube }} ↗
                  </a>
                </li>
              </ul>
              <button
                v-if="hasMoreVideos"
                type="button"
                class="font-career mt-4 text-sm font-medium tracking-wide text-stone-600 underline decoration-stone-400/50 underline-offset-4 transition-colors hover:text-stone-900"
                @click="showAllVideos = !showAllVideos"
              >
                {{ showAllVideos ? rec.viewLess : rec.viewMore }}
              </button>
            </div>
          </section>

          <!-- People on X -->
          <section
            class="grid flex-shrink-0 grid-cols-1 gap-8 md:grid-cols-[minmax(6.5rem,9.5rem)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(7.5rem,11rem)_minmax(0,1fr)] lg:gap-14"
          >
            <div class="md:sticky md:top-20 md:self-start">
              <h3
                class="font-ledger text-[0.65rem] leading-snug tracking-[0.28em] text-stone-500 uppercase md:text-xs"
              >
                {{ rec.peopleHeading }}
              </h3>
            </div>
            <div>
              <ul class="border-t border-stone-900/10">
                <li
                  v-for="(item, i) in visiblePeople"
                  :key="'p-' + i + item.url"
                  class="border-b border-stone-900/10 py-5 last:border-b-0"
                >
                  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <a
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="font-ledger text-base text-stone-900 underline decoration-stone-400/50 underline-offset-4 transition-colors hover:decoration-red-800/70 md:text-lg"
                    >
                      {{ item.name }}
                    </a>
                    <span class="font-career text-sm text-stone-500">{{ item.handle }}</span>
                  </div>
                  <p
                    class="font-career mt-2.5 text-sm leading-relaxed text-stone-700 md:text-[0.9375rem]"
                  >
                    {{ item.reason }}
                  </p>
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-career mt-2 inline-block text-xs font-medium tracking-wide text-red-900/90 underline decoration-red-900/25 underline-offset-4 hover:text-red-950"
                  >
                    {{ rec.openProfile }} ↗
                  </a>
                </li>
              </ul>
              <button
                v-if="hasMorePeople"
                type="button"
                class="font-career mt-4 text-sm font-medium tracking-wide text-stone-600 underline decoration-stone-400/50 underline-offset-4 transition-colors hover:text-stone-900"
                @click="showAllPeople = !showAllPeople"
              >
                {{ showAllPeople ? rec.viewLess : rec.viewMore }}
              </button>
            </div>
          </section>

        </div>
      </div>
    </Parallax>
  </FramedMainSection>
</template>

<style scoped>
.recommend-paper {
  background-color: #e9e2d8;
  background-image:
    linear-gradient(185deg, rgba(255, 252, 248, 0.75) 0%, transparent 38%),
    linear-gradient(to bottom, rgba(58, 48, 40, 0.04), rgba(58, 48, 40, 0.1)),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(58, 48, 40, 0.045) 1px,
      rgba(58, 48, 40, 0.045) 2px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 23px,
      rgba(58, 48, 40, 0.03) 23px,
      rgba(58, 48, 40, 0.03) 24px
    );
}

.recommend-scroll::-webkit-scrollbar {
  width: 6px;
}
.recommend-scroll::-webkit-scrollbar-thumb {
  background: rgba(58, 48, 40, 0.2);
  border-radius: 999px;
}
.recommend-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(58, 48, 40, 0.25) transparent;
}
</style>

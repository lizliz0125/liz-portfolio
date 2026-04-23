<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import FramedMainSection from '@/layouts/FramedMainSection.vue';
import ToggleSection from '@/components/ToggleSection.vue';
import { useSingleToggle } from '@/composables/useSingleToggle.js';
import ImageAsCursor from '@/components/ImageAsCursor.vue';
import { useImageAsCursor } from '@/composables/useImageAsCursor';
import CustomA from '@/components/CustomA.vue';
import RetroMonitor from '@/components/RetroMonitor.vue';
import { useI18n } from '@/i18n';

const { msg } = useI18n();
const allProjects = computed(() => msg.value.projects);
const vibeCoding = computed(() => msg.value.vibeCoding ?? {});

const { setImage, setIsUrl, setIsOpen, setIsSmall } = useImageAsCursor();
const { isOpen, toggle, openIndex } = useSingleToggle();

const showAll = ref(false);
/** 与旧版「三行折叠」一致：默认展示 3 条，第 4 条由「查看全部」展开 */
const previewCount = 3;

const visibleProjects = computed(() =>
  showAll.value ? allProjects.value : allProjects.value.slice(0, previewCount),
);

const hasMore = computed(() => allProjects.value.length > previewCount);

const frameRef = ref();
const containerRef = ref();

function rowNumber(project) {
  const i = allProjects.value.findIndex((p) => p.link === project.link);
  return i >= 0 ? i + 1 : 1;
}

function isArticle(project) {
  const imgs = project.images;
  const hasImgs = Array.isArray(imgs) && imgs.length > 0;
  return !hasImgs && !project.desktop_pic && !project.mobile_pic;
}

watch(showAll, () => {
  openIndex.value = null;
});

onMounted(() => {
  containerRef.value = frameRef.value.sectionRef;
});
</script>

<template>
  <ImageAsCursor v-if="containerRef" :contentSection="containerRef" />
  <FramedMainSection ref="frameRef" id="vibe-coding" class="min-h-[100dvh] flex h-auto">
    <div class="flex-1 w-full bg-fit flex flex-col text-center pt-20">
      <div class="flex h-full w-full flex-col">
        <ToggleSection
          v-for="(project, pi) in visibleProjects"
          :key="project.link"
          :open="isArticle(project) ? false : isOpen(pi)"
          :arrow-href="project.link"
          :link-href="isArticle(project) ? project.link : ''"
          @toggle="toggle(pi)"
          @hover="
            setImage(project.background),
              setIsOpen(true),
              openIndex == pi ? setIsSmall(true) : setIsSmall(false)
          "
          @leave="setIsOpen(false), setIsSmall(false)"
        >
          <template #header>
            <img
              :src="project.background"
              alt=""
              class="pointer-events-none absolute top-0 left-0 -z-20 h-full w-full object-cover brightness-50"
            />
            <div class="z-10 flex min-w-0 flex-1 items-center gap-3 text-left md:gap-6">
              <h1
                class="shrink-0 font-rubik text-[0.65rem] tracking-[-0.02em] text-white/90 tabular-nums md:text-[2dvw] md:tracking-[-0.3dvw]"
              >
                00-{{
                  rowNumber(project).toLocaleString('en-US', { minimumIntegerDigits: 2 })
                }}
              </h1>
              <h1
                class="min-w-0 flex-1 font-rubik text-[clamp(0.7rem,3.2vw,2dvw)] leading-tight font-bold tracking-wide whitespace-normal text-white uppercase md:tracking-tight"
              >
                {{ project.title }}
              </h1>
            </div>
          </template>
          <template #content>
            <div v-if="!isArticle(project)" class="px-6 pb-6">
              <div
                class="relative flex h-fit w-full flex-col items-start gap-6 overflow-hidden text-black"
              >
                <div class="my-4 flex w-full flex-col items-center gap-8 lg:my-8 lg:flex-row">
                  <RetroMonitor
                    :images="project.images"
                    :desktopPic="project.desktop_pic"
                    :mobilePic="project.mobile_pic"
                  />
                  <div class="z-20 w-full p-4 text-left text-white lg:w-1/2">
                    <p class="text-base lg:text-lg" v-html="project.description"></p>
                    <p v-if="project.stage" class="mt-3 text-xs text-white/60 lg:text-sm">
                      {{ project.stage }}
                    </p>
                  </div>
                </div>
                <a
                  class="relative flex w-full bg-cover bg-center bg-white"
                  :href="project.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  @mouseenter="setIsUrl(true)"
                  @mouseleave="setIsUrl(false)"
                >
                  <CustomA
                    :text="msg.viewMore"
                    :href="project.link"
                    target="_blank"
                    class="z-10 h-full w-full p-4"
                  />
                </a>
              </div>
            </div>
          </template>
        </ToggleSection>

        <div
          v-if="hasMore"
          class="flex border-t border-black/40 bg-black/20 px-4 py-3 md:px-6"
        >
          <button
            type="button"
            class="mx-auto font-rubik text-sm tracking-wide text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white/50 md:text-base"
            @click="showAll = !showAll"
          >
            {{ showAll ? vibeCoding.viewLess : vibeCoding.viewAll }}
          </button>
        </div>
      </div>
    </div>
  </FramedMainSection>
</template>

<style>
@keyframes bg-move {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 3dvh -3dvh;
  }
}
</style>

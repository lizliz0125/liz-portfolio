<script setup>
import { onMounted, ref, computed, onBeforeUnmount } from 'vue';
import FramedMainSection from '@/layouts/FramedMainSection.vue';
import { useScrollContext } from '@/composables/useScrollContext'
import { AnimatedComponent } from '@/services/AnimatedComponent';
import CustomA from '@/components/CustomA.vue';
import Parallax from '@/components/Parallax.vue';
import LikeButton from '@/components/LikeButton.vue';
import { useI18n } from '@/i18n';

const { msg } = useI18n();
const contact = computed(() => msg.value.contact);

const component = ref(null)
const frameRef = ref(null)
const { containerRef } = useScrollContext()
const contactSectionRef = ref(null)
const translationRef = ref(0)
const paddingTopRef = ref(0)

const handleScroll = () => {
    const section = frameRef.value?.sectionRef;
    if (!section) return;
    const relativeScrollPosition = section.getBoundingClientRect().top;
    translationRef.value = Math.round(relativeScrollPosition + paddingTopRef.value * 1.5);
};

onMounted(() => {
    if (!contactSectionRef.value || !frameRef.value?.sectionRef) return;
    paddingTopRef.value = parseFloat(getComputedStyle(contactSectionRef.value).paddingTop);
    component.value = new AnimatedComponent(frameRef.value.sectionRef);
    component.value.tick = handleScroll;
    if (containerRef.value) {
        component.value.addAnimationTrigger(containerRef.value, "scroll");
    }
    handleScroll();
});

onBeforeUnmount(() => {
    component.value?.reset();
});
</script>

<template>
    <FramedMainSection ref="frameRef" id="contact" class="h-dvh">
        <Parallax>
            <div ref="contactSectionRef" class="h-full w-full relative rounded-4xl flex flex-col pt-24">
                <div class="absolute h-full w-full top-0 left-0 rounded-4xl brightness-[.85] bg-[url('/contact/background.jpg')] bg-cover bg-center -z-10 overflow-hidden">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-8 px-8 text-white">
                    <div v-for="(value, key) in contact" :key="key" class="h-full w-full">
                        <h2 class="font-rubik border-b-2 border-dashed border-neutral-400 text-xl">{{ key }}</h2>
                        <ul class="pt-4 text-2xl flex flex-col gap-2">
                            <li v-for="(h, index) in value" :key="index" class="w-fit"><CustomA v-if="!h.hidden" :text="h.text" :href="h.href" :target="h.target"/></li>
                        </ul>
                    </div>
                </div>

                <!-- 点赞按钮：独立区块，居中 -->
                <div class="flex justify-center items-center py-6">
                    <LikeButton />
                </div>

                <!-- 大标题 -->
                <div class="flex flex-col justify-center items-center text-[10dvw] leading-none w-full h-full font-rubik">
                    <h1 class="text-white">{{ msg.letsWork }}</h1>
                    <h1 class="text-red-custom z-10">{{ msg.together }}</h1>
                </div>

                <div
                    class="h-full w-full flex justify-end items-end absolute inset-x-0 bottom-0 pointer-events-none pr-2 sm:pr-4 md:pr-7"
                    :style="`transform: translateY(${translationRef}px)`"
                >
                    <div class="relative w-[58%] max-w-md origin-bottom-right scale-[1.5] md:w-[46%] md:max-w-lg lg:w-[40%]">
                        <img src="/contact/portrait.png" alt="" data-parallax-value=".15" class="w-full h-auto object-contain parallax"/>
                    </div>
                </div>
            </div>
        </Parallax>
    </FramedMainSection>
</template>

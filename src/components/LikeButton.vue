<script setup>
import { ref, onMounted } from 'vue';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const count = ref(null);
const isLiking = ref(false);
const showBounce = ref(false);
const floats = ref([]);
let floatId = 0;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact',
};

async function fetchCount() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/likes?select=id`, {
      headers: { ...headers },
    });
    const range = res.headers.get('Content-Range');
    if (range) {
      const total = range.split('/')[1];
      count.value = total === '*' ? 0 : parseInt(total, 10);
    } else {
      const data = await res.json();
      count.value = Array.isArray(data) ? data.length : 0;
    }
  } catch {
    count.value = 0;
  }
}

function formatCount(n) {
  if (n === null) return '···';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
}

async function handleLike() {
  if (isLiking.value) return;
  isLiking.value = true;

  if (count.value !== null) count.value += 1;

  showBounce.value = false;
  requestAnimationFrame(() => { showBounce.value = true; });

  const id = floatId++;
  floats.value.push(id);
  setTimeout(() => { floats.value = floats.value.filter(f => f !== id); }, 900);

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/likes`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({}),
    });
  } catch { /* 乐观更新不回滚 */ }

  setTimeout(() => {
    showBounce.value = false;
    isLiking.value = false;
  }, 600);
}

onMounted(fetchCount);
</script>

<template>
  <div class="flex flex-col items-center gap-3 select-none">
    <!-- 提示文字 -->
    <p class="text-white text-base font-ledger tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">喜欢的话，帮我点个赞吧～</p>

    <!-- 按钮主体 -->
    <button
      class="relative flex items-center gap-4 px-7 py-3.5 rounded-full border border-white/30 bg-black/30 hover:bg-black/45 backdrop-blur-md transition-all duration-300 cursor-pointer shadow-lg shadow-black/20"
      @click="handleLike"
      aria-label="点赞"
    >
      <!-- 心形 -->
      <span
        class="text-3xl leading-none will-change-transform"
        :class="showBounce ? 'scale-bounce' : 'text-white/80'"
      >♥</span>

      <!-- 竖线分隔 -->
      <span class="w-px h-6 bg-white/20"></span>

      <!-- 数字 -->
      <span class="font-rubik text-white text-xl tracking-wider min-w-[2rem] text-left tabular-nums">
        {{ formatCount(count) }}
      </span>

      <!-- 浮起 +1 -->
      <span
        v-for="id in floats"
        :key="id"
        class="float-up absolute -top-6 left-1/2 -translate-x-1/2 text-white text-sm font-rubik pointer-events-none"
      >+1</span>
    </button>
  </div>
</template>

<style scoped>
.scale-bounce {
  animation: heartBounce 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes heartBounce {
  0%   { transform: scale(1);    color: rgba(255,255,255,0.8); }
  30%  { transform: scale(1.5);  color: #DE2E2E; }
  55%  { transform: scale(0.88); color: #DE2E2E; }
  75%  { transform: scale(1.18); color: #DE2E2E; }
  100% { transform: scale(1);    color: #DE2E2E; }
}

.float-up {
  animation: floatUp 0.9s ease-out forwards;
}

@keyframes floatUp {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-28px); }
}
</style>

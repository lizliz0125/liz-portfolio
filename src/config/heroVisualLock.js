/**
 * Hero 视觉定稿参数（底图叠层 + lightMode 粒子）。
 *
 * 锁定说明：此处数值与文案为已确认效果，请勿在未收到明确改版需求时改动。
 * 若未来要迭代，建议复制为 heroVisualLock.v2.js 或在本文件内新增 V2 常量组并切换引用，便于对比与回滚。
 *
 * Locked: 2026-04-23 — LIZ personal site hero
 */

export const HERO_VISUAL_LOCK_VERSION = '2026-04-23';

/** 底图位图层的 CSS filter（与粒子底图为同一张图时由 Home 单独应用） */
export const heroBaseImageFilter =
  'brightness(0.76) contrast(1.22) saturate(1.06)';

/** 底图上的压暗渐变（Tailwind 工具类拼接） */
export const heroBaseGradientClass =
  'absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60';

/** 底图内阴影暗角 */
export const heroBaseVignetteBoxShadow =
  'inset 0 0 min(18dvw, 120px) rgba(0,0,0,0.58)';

/**
 * ParticleImage 在 lightMode 下使用的可调项（与 Home 底图组合后的最终观感）。
 * 非 lightMode 的页面若使用该组件，不会读取此组中的 alpha/size 等（仍走组件内默认逻辑）。
 */
export const heroParticleLightLocked = {
  /** 略提亮度，避免在深色底图上「像没有粒子」 */
  alpha: 0.66,
  size: 0.82,
  colorGain: 1.42,
  colorFloor: 0.1,
  alphaCutoff: 0.02,
  maxDistMul: 0.045,
  pushStrengthMul: 0.03,
  /** 片元里 smoothstep(edge0, edge1, dist)，dist 为点内 UV 到中心距离 */
  fragmentSmoothstepEdge0: 0.5,
  fragmentSmoothstepEdge1: 0.35,
};

/**
 * src/pages/Home.tsx
 * 余生：暗影之下 · 单页面文字冒险游戏主入口。
 *
 * 说明：
 * - 本文件实现主游戏界面（启动页 / 游戏中）的全部核心逻辑。
 * - 本次修改：
 *   1. 删除原来的独立 "Never give up!" 按钮。
 *   2. 将“休息”行为扩展为：周内第一次正常恢复体力并显示原提示；周内第二次及以后点击会减少体力 -5 且在事件文本框显示 "Never give up!"。
 *   3. 记录本周内点击休息次数；若本周点击休息累计达到 10 次，直接触发彩蛋结局 "死后亦能长眠" 并停止游戏流程。
 */

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { weeklyStories } from '../game/data/stories'
import { endings } from '../game/data/endings'
import { achievements as allAchievements } from '../game/data/achievements'
import {
  dailyRandomEvents,
  exploreRandomEvents,
  npcDoorEvents,
} from '../game/data/randomEvents'
import type {
  Achievement,
  Alignment,
  DailyAction,
  ExploreDangerLevel,
  GameEnding,
  GamePhase,
  NpcDoorEvent,
  WeeklyStory,
  WeeklyOption,
} from '../game/types'
import { GameContext } from '../contexts/GameContext'
import useGame from '../hooks/useGame'

/**
 * GameStats
 * 当前角色的核心数值。
 */
export interface GameStats {
  stamina: number
  satiety: number
  hydration: number
  health: number
  combat: number
  social: number
  sanity: number
  money: number
}

/**
 * TypingTextProps
 * 打字机文本组件参数。
 */
interface TypingTextProps {
  text: string
  speed?: number
  onDone?: () => void
}

/**
 * TypingText
 * 简单打字机效果文本组件。
 */
function TypingText({ text, speed = 18, onDone }: TypingTextProps) {
  const [visibleChars, setVisibleChars] = useState(0)

  useEffect(() => {
    setVisibleChars(0)
    if (!text) return
    let frame: number
    let current = 0

    const step = () => {
      current += 1
      if (current >= text.length) {
        setVisibleChars(text.length)
        if (onDone) onDone()
        return
      }
      setVisibleChars(current)
      frame = window.setTimeout(step, speed)
    }

    frame = window.setTimeout(step, speed)
    return () => {
      window.clearTimeout(frame)
    }
  }, [text, speed, onDone])

  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">
      {text.slice(0, visibleChars)}
    </p>
  )
}

/**
 * ViewMode
 * 页面模式：启动页 or 游戏中。
 */
type ViewMode = 'start' | 'game'

/**
 * GameSnapshot
 * 存档所需的最小快照。
 */
interface GameSnapshot {
  week: number
  phase: GamePhase
  stats: GameStats
  alignCounts: Record<Alignment, number>
}

/**
 * GameState
 * 运行时完整游戏状态。
 */
interface GameState {
  week: number
  phase: GamePhase
  stats: GameStats
  currentStory?: WeeklyStory
  selectedOption?: WeeklyOption
  alignCounts: Record<Alignment, number>

  unlockedAchievements: string[]
  unlockedItems: string[]
  neverGiveUpClicks: number
  reachedEnding?: GameEnding

  positiveChoiceCount: number
  rationalChoiceCount: number
  slackChoiceCount: number

  totalDailyEvents: number
  totalExploreEvents: number
  totalNpcEvents: number
  totalItemsBought: number
  totalItemsSold: number

  weeksHighSanity: number
  weeksHealthy: number
  weeksHungerOrThirst: number
  staminaZeroWeeks: number

  neverRest: boolean
  visitedSuburb: boolean
  visitedCity: boolean
  visitedMall: boolean

  debtWorkCount: number
  catPlayCount: number
}

/**
 * defaultStats
 * 新局默认属性。
 */
const defaultStats: GameStats = {
  stamina: 100,
  satiety: 100,
  hydration: 100,
  health: 100,
  combat: 15,
  social: 30,
  sanity: 100,
  money: 500,
}

/**
 * STORAGE_KEY
 * localStorage 存档键。
 */
const STORAGE_KEY = 'shadow-afterlife-save-v2'

/**
 * loadSavedState
 * 从 localStorage 读取存档快照。
 */
function loadSavedState(): GameSnapshot | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as GameSnapshot
    if (!parsed || typeof parsed.week !== 'number') return undefined
    return parsed
  } catch {
    return undefined
  }
}

/**
 * saveSnapshot
 * 写入存档快照。
 */
function saveSnapshot(snapshot: GameSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // 隐私/离线模式可能失败，忽略
  }
}

/**
 * findStoryByWeek
 * 根据周数查找主线剧情。
 */
function findStoryByWeek(week: number): WeeklyStory | undefined {
  return weeklyStories.find((s) => s.week === week)
}

  /**
   * 结局判定：死亡 → 彩蛋 → 极限 → 特殊 → 普通。
   */
  const computeEnding = (): GameEnding => {
    const getById = (id: string) =>
      endings.find((e) => e.id === id) ?? endings[0]

    // 1. 死亡结局
    if (health <= 0) return getById('death-blood')
    if (sanity <= 0) return getById('death-madness')
    if (debtWorkCount >= 3) return getById('death-debt')

    // 2. 彩蛋：Never give up! ≥10
    if (neverGiveUpClicks >= 10) {
      const easter = endings.find((e) => e.type === 'easter')
      if (easter) return easter
    }

    // 3. 极限结局
    if (combat >= 160) return getById('extreme-war-god')
    if (social >= 160) return getById('extreme-social-king')
    if (weeksHighSanity > 36) return getById('extreme-steel-will')
    if (positiveChoiceCount > 36)
      return getById('extreme-active-survivor')
    if (rationalChoiceCount > 36)
      return getById('extreme-rational-survivor')
    if (slackChoiceCount > 36)
      return getById('extreme-lie-flat-master')
    if (totalExploreEvents > 80)
      return getById('extreme-explorer')
    if (totalDailyEvents > 50)
      return getById('extreme-daily-master')
    if (totalNpcEvents > 30) return getById('extreme-helper')
    if (totalItemsBought > 50)
      return getById('extreme-hoarder')
    if (totalItemsSold > 80)
      return getById('extreme-merchant')
    if (weeksHealthy > 36)
      return getById('extreme-healthy-life')
    if (weeksHungerOrThirst > 20)
      return getById('extreme-pain-bearer')
    if (!visitedSuburb && !visitedCity && !visitedMall)
      return getById('extreme-hermit')
    if (neverRest) return getById('extreme-never-rest')
    if (staminaZeroWeeks >= 44)
      return getById('extreme-zero-stamina')

    // 4. 特殊结局
    const healthyNow = satiety >= 60 && hydration >= 60
    const neverHelpNpc = totalNpcEvents === 0
    const midSanity = sanity >= 40 && sanity <= 70

    if (
      social >= 100 &&
      totalNpcEvents >= 20 &&
      totalItemsBought >= 30 &&
      healthyNow
    ) {
      return getById('special-rebuilder')
    }

    if (
      social <= 20 &&
      neverHelpNpc &&
      combat >= 120 &&
      !visitedCity &&
      !visitedMall
    ) {
      return getById('special-lonely-king')
    }

    if (
      totalExploreEvents >= 70 &&
      totalDailyEvents >= 50 &&
      midSanity
    ) {
      return getById('special-truth-seeker')
    }

    if (catPlayCount >= 30 && sanity >= 60) {
      return getById('special-cat-servant')
    }

    // 5. 普通结局
    const normal =
      endings.find((e) => e.type === 'normal') ??
      endings[endings.length - 1]
    return normal
  }

/**
 * StartScreenProps
 * 启动画面参数。
 */
interface StartScreenProps {
  hasSave: boolean
  onStartNew: () => void
  onContinue: () => void
}

/**
 * StartScreen
 * 游戏启动界面。
 */
function StartScreen({
  hasSave,
  onStartNew,
  onContinue,
}: StartScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 text-center">
      <div className="mb-6 rounded-3xl border border-slate-800/80 bg-slate-900/80 px-4 py-4 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-3 py-1 text-xs text-indigo-200">
          <span>🌒</span>
          <span>2048 · 新黑暗时代 · 文本生存</span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-wide text-indigo-100">
          余生：暗影之下
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-slate-300">
          一切在轰鸣中戛然而止。你和一只橘猫被困在祖宅——
          外面是崩塌的文明，里面是逐渐见底的水和粮。
          每一周，你都要在活下去、活得像个人，或干脆躺平之间做出选择。
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={onStartNew}
          className="w-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/40 transition-all hover:brightness-110 active:scale-95"
        >
          ▶️ 开始新游戏
        </button>
        <button
          type="button"
          onClick={hasSave ? onContinue : undefined}
          disabled={!hasSave}
          className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
            hasSave
              ? 'border border-cyan-400/70 bg-slate-900 text-cyan-200 hover:bg-slate-800 active:scale-95'
              : 'cursor-not-allowed border border-slate-700 bg-slate-900 text-slate-500'
          }`}
        >
          ⏯ 继续游戏
        </button>
        <p className="mt-1 text-[0.7rem] text-slate-500">
          存档仅保存在本地浏览器中，清空缓存或更换设备会导致进度丢失。
        </p>
      </div>
    </div>
  )
}

/**
 * HeaderBarProps
 * 顶部栏参数。
 */
interface HeaderBarProps {
  onNewGame: () => void
  onSaveGame: () => void
  isSaving: boolean
  onOpenAchievements: () => void
  onOpenSettings: () => void
}

/**
 * HeaderBar
 * 游戏内顶部导航栏。
 */
function HeaderBar({
  onNewGame,
  onSaveGame,
  isSaving,
  onOpenAchievements,
  onOpenSettings,
}: HeaderBarProps) {
  return (
    <header className="flex-none border-b border-slate-800 bg-slate-950/90 px-4 pt-3 pb-2 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌒</span>
          <div className="leading-tight">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              余生：暗影之下
            </div>
            <div className="text-[0.7rem] text-slate-500">
              文字冒险 · 末日生存 · 橘猫监督
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveGame}
            disabled={isSaving}
            className={`rounded-full border px-2 py-1 text-xs font-medium transition-all ${
              isSaving
                ? 'cursor-wait border-slate-700 bg-slate-900 text-slate-500'
                : 'border-cyan-400/70 bg-slate-900 text-cyan-200 hover:bg-cyan-500/10 active:scale-95'
            }`}
          >
            💾 {isSaving ? '保存中…' : '保存游戏'}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 active:scale-95"
          >
            ⚙️ 设置
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 active:scale-95"
          >
            🔁 新局
          </button>
        </div>
      </div>
      <nav className="mt-2 flex items-center justify-end gap-2 text-[0.7rem]">
        <button
          type="button"
          onClick={onOpenAchievements}
          className="flex items-center gap-1 rounded-full border border-amber-400/70 bg-slate-900 px-2 py-1.5 text-amber-200 transition-all hover:bg-amber-500/10 active:scale-95"
        >
          🏆 成就
        </button>
      </nav>
    </header>
  )
}

/**
 * BottomStatusBarProps
 * 底部状态栏参数。
 */
interface BottomStatusBarProps {
  stats: GameStats
  onOpenBag: () => void
  onOpenLog: () => void
  unlockedAchievementsCount: number
}

/**
 * BottomStatusBar
 * 显示核心数值与背包/日志入口。
 */
function BottomStatusBar({
  stats,
  onOpenBag,
  onOpenLog,
  unlockedAchievementsCount,
}: BottomStatusBarProps) {
  return (
    <footer className="flex-none border-t border-slate-800 bg-slate-950/90 px-3 pb-3 pt-2 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 text-[0.65rem]">
        <div className="grid flex-1 grid-cols-4 gap-1">
          <StatusPill icon="💪" label="体力" value={stamina} />
          <StatusPill icon="🍚" label="饱腹" value={satiety} />
          <StatusPill icon="💧" label="水分" value={hydration} />
          <StatusPill icon="❤️" label="血量" value={health} />
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between text-[0.65rem]">
        <div className="grid flex-1 grid-cols-4 gap-1">
          <StatusPill icon="🗡️" label="战力" value={combat} subtle />
          <StatusPill icon="🗣️" label="社交" value={social} subtle />
          <StatusPill icon="🧠" label="精神" value={sanity} subtle />
          <StatusPill icon="💰" label="金钱" value={money} subtle />
        </div>
        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenBag}
            className="rounded-full bg-slate-800 px-2 py-1 text-slate-100 transition-all hover:bg-slate-700 active:scale-95"
          >
            🎒 背包
          </button>
          <button
            type="button"
            onClick={onOpenLog}
            className="rounded-full bg-slate-800 px-2 py-1 text-slate-100 transition-all hover:bg-slate-700 active:scale-95"
          >
            📜 日志
          </button>
          <div className="flex items-center gap-1 rounded-full border border-amber-400/70 px-2 py-1 text-amber-200">
            🏅
            <span>{unlockedAchievementsCount}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/**
 * StatusPillProps
 * 单个状态胶囊参数。
 */
interface StatusPillProps {
  icon: string
  label: string
  value: number
  subtle?: boolean
}

/**
 * StatusPill
 * 状态值小胶囊。
 */
function StatusPill({ icon, label, value, subtle }: StatusPillProps) {
  const textColor = subtle ? 'text-slate-300' : 'text-slate-100'
  const bgColor = subtle ? 'bg-slate-800/70' : 'bg-slate-800'
  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-full px-2 py-1 ${bgColor}`}
    >
      <span className="flex items-center gap-1">
        <span className="text-xs">{icon}</span>
        <span className={`text-[0.6rem] ${textColor}`}>{label}</span>
      </span>
      <span className={`font-mono text-[0.65rem] ${textColor}`}>
        {value}
      </span>
    </div>
  )
}

/**
 * ModalProps
 * 通用模态框参数。
 */
interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
}

/**
 * Modal
 * 通用模态弹窗。
 */
function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-3 flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200 transition-all hover:bg-slate-700 active:scale-95"
          >
            ✖ 关闭
          </button>
        </div>
        <div className="px-3 py-2">{children}</div>
      </div>
    </div>
  )
}

/**
 * WeeklySummaryModalProps
 * 周结算弹窗参数。
 */
interface WeeklySummaryModalProps {
  week: number
  startStats: GameStats
  endStats: GameStats
  actionCounts: Partial<Record<string, number>>
  onNextWeek: () => void
  onClose: () => void
}

/**
 * WeeklySummaryModal
 * 展示本周属性变化与行动统计。
 */
function WeeklySummaryModal({
  week,
  startStats,
  endStats,
  actionCounts,
  onNextWeek,
  onClose,
}: WeeklySummaryModalProps) {
  const statEntries: Array<{ key: keyof GameStats; label: string }> = [
    { key: 'stamina', label: '体力' },
    { key: 'satiety', label: '饱腹' },
    { key: 'hydration', label: '水分' },
    { key: 'health', label: '血量' },
    { key: 'combat', label: '战力' },
    { key: 'social', label: '社交' },
    { key: 'sanity', label: '精神' },
    { key: 'money', label: '金钱' },
  ]

  const hasActions = Object.values(actionCounts).some(
    (v) => (v ?? 0) > 0,
  )

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-3 flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-indigo-500/60 bg-slate-950 shadow-2xl">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-indigo-100">
            📊 第 {week} 周结算
          </h2>
          <p className="mt-1 text-[0.7rem] text-slate-400">
            回顾这一周，你在废墟里又撑过了七天。
          </p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 pr-5 text-xs">
          <div>
            <h3 className="mb-1 text-[0.75rem] font-semibold text-slate-200">
              属性变化
            </h3>
            <div className="space-y-1 rounded-xl bg-slate-900/80 p-2">
              {statEntries.map(({ key, label }) => {
                const startVal = startStats[key]
                const endVal = endStats[key]
                const diff = endVal - startVal
                const sign = diff > 0 ? '+' : diff < 0 ? '-' : '±'
                const absDiff = Math.abs(diff)
                const diffColor =
                  diff > 0
                    ? 'text-emerald-300'
                    : diff < 0
                    ? 'text-rose-300'
                    : 'text-slate-400'
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between text-[0.7rem]"
                  >
                    <span className="text-slate-300">{label}</span>
                    <span className="font-mono text-slate-200">
                      {startVal}{' '}
                      <span className="mx-1 text-slate-500">→</span>
                      {endVal}{' '}
                      <span className={diffColor}>
                        ({sign}
                        {absDiff})
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-[0.75rem] font-semibold text-slate-200">
              行动统计
            </h3>
            <div className="space-y-1 rounded-xl bg-slate-900/80 p-2">
              {hasActions ? (
                Object.entries(actionCounts)
                  .filter(([, v]) => (v ?? 0) > 0)
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between text-[0.7rem]"
                    >
                      <span className="text-slate-300">{k}</span>
                      <span className="font-mono text-slate-200">
                        {v} 次
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-[0.7rem] text-slate-500">
                  本周你把时间大多花在发呆和存活上，没什么值得记录的行动。
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 active:scale-95"
          >
            暂不前进
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-indigo-500/40 hover:brightness-110 active:scale-95"
          >
            ⏭ 进入下一周
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * EndingModalProps
 * 结局弹窗参数。
 */
interface EndingModalProps {
  ending: GameEnding
  stats: GameStats
  onRestart: () => void
  onBackToStart: () => void
}

/**
 * EndingModal
 * 展示结局与最终数值。
 */
function EndingModal({
  ending,
  stats,
  onRestart,
  onBackToStart,
}: EndingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-3 flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-violet-500/70 bg-slate-950 shadow-2xl">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-violet-100">
            结局：{ending.name}
          </h2>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 pr-5 text-xs">
          <p className="whitespace-pre-line text-slate-100">
            {ending.body}
          </p>
          <div className="mt-2 rounded-xl bg-slate-900/80 p-2">
            <h3 className="mb-1 text-[0.75rem] font-semibold text-slate-200">
              最终数值
            </h3>
            <div className="grid grid-cols-2 gap-1 text-[0.7rem] text-slate-300">
              <span>体力：{stamina}</span>
              <span>饱腹：{satiety}</span>
              <span>水分：{hydration}</span>
              <span>血量：{health}</span>
              <span>战力：{combat}</span>
              <span>社交：{social}</span>
              <span>精神：{sanity}</span>
              <span>金钱：{money}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={onBackToStart}
            className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 active:scale-95"
          >
            返回主菜单
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:brightness-110 active:scale-95"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Home
 * 主页组件：承载启动页与游戏主界面以及全部核心逻辑。
 */
export default function Home() {
  const saved = useMemo(loadSavedState, [])
  const hasSave = !!saved

  const [viewMode, setViewMode] = useState<ViewMode>('start')

  const gameContext = useGame()
  const { week, phase, currentStory, selectedOption, alignCounts, unlockedAchievements, unlockedItems, neverGiveUpClicks, reachedEnding, positiveChoiceCount, rationalChoiceCount, slackChoiceCount, totalDailyEvents, totalExploreEvents, totalNpcEvents, totalItemsBought, totalItemsSold, weeksHighSanity, weeksHealthy, weeksHungerOrThirst, staminaZeroWeeks, neverRest, visitedSuburb, visitedCity, visitedMall, debtWorkCount, catPlayCount, stamina, satiety, hydration, health, combat, social, sanity, money } = gameContext

  const [weekStartStats, setWeekStartStats] = useState<GameStats>({
    stamina,
    satiety,
    hydration,
    health,
    combat,
    social,
    sanity,
    money,
  })
  const [weekActionCounts, setWeekActionCounts] = useState<
    Partial<Record<string, number>>
  >({})

  const [showBag, setShowBag] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEndingModal, setShowEndingModal] = useState(false)
  const [showWeeklySummary, setShowWeeklySummary] = useState(false)
  const [pendingWeeklySummary,
    setPendingWeeklySummary] = useState(false)

  const [logEntries, setLogEntries] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const [showActionPanel, setShowActionPanel] = useState(false)
  const [showMapPanel, setShowMapPanel] = useState(false)

  const [currentEventTitle, setCurrentEventTitle] = useState('')
  const [currentEventText, setCurrentEventText] = useState('')
  const [showEventModal, setShowEventModal] = useState(false)

  const [npcEvent, setNpcEvent] = useState<NpcDoorEvent | null>(null)
  const [showNpcModal, setShowNpcModal] = useState(false)

  const [justUnlocked, setJustUnlocked] = useState<Achievement | null>(
    null,
  )
  const [showAchievementToast, setShowAchievementToast] =
    useState(false)

  /**
   * restClicksThisWeek
   * 记录本周内“休息”按钮的点击次数。
   * - 第一次点击按正常行为生效（恢复体力等）
   * - 第二次及以后点击会消耗体力 -5 并在事件文本框显示 "Never give up!"
   * - 若本周点击累计达到 10 次，则触发彩蛋结局 "死后亦能长眠"
   */
  const [restClicksThisWeek, setRestClicksThisWeek] = useState(0)

  /**
   * 周数改变时，刷新周起始属性和统计，并重置本周休息计数。
   */
  useEffect(() => {
    setWeekStartStats({
      stamina,
      satiety,
      hydration,
      health,
      combat,
      social,
      sanity,
      money,
    })
    setWeekActionCounts({})
    setRestClicksThisWeek(0)
  }, [week, stamina, satiety, hydration, health, combat, social, sanity, money])

  /**
   * 成就提示自动隐藏。
   */
  useEffect(() => {
    if (!showAchievementToast) return
    const timer = window.setTimeout(
      () => setShowAchievementToast(false),
      2500,
    )
    return () => window.clearTimeout(timer)
  }, [showAchievementToast])

  /**
   * 注册简单 service worker（PWA 占位）。
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker
        .register('/sw.js')
        .catch(() => undefined)
    }
  }, [])

  /**
   * 追加日志。
   */
  const appendLog = (entry: string) => {
    setLogEntries((prev) => [...prev, entry])
  }

  /**
   * 解锁成就。
   */
  const handleUnlockAchievement = (id: string) => {
    unlockAchievement(id)
    const achievement = allAchievements.find((a) => a.id === id) || null
    setJustUnlocked(achievement)
    setShowAchievementToast(Boolean(achievement))
  }

  /**
   * 写入存档。
   */
  const handleSaveGame = () => {
    if (isSaving || phase === 'ended') return
    setIsSaving(true)
    const snapshot: GameSnapshot = {
      week: week,
      phase: phase,
      stats: {
        stamina,
        satiety,
        hydration,
        health,
        combat,
        social,
        sanity,
        money,
      },
      alignCounts: alignCounts,
    }
    saveSnapshot(snapshot)
    window.setTimeout(() => setIsSaving(false), 500)
  }

  /**
   * 开启新游戏。
   */
  const handleNewGame = () => {
    // 使用页面重载确保所有状态完全重置
    window.location.reload()
  }

  /**
   * 从存档继续游戏。
   */
  const handleContinue = () => {
    if (!saved) return
    // 标记为从存档继续游戏，然后重载页面
    localStorage.setItem('shadow-afterlife-continue-from-save', 'true')
    window.location.reload()
  }

  /**
   * 主线选项选择。
   */
  const handleSelectOption = (option: WeeklyOption) => {
    if (phase !== 'story') return
    
    // 更新alignment计数
    updateAlignCount(option.alignment)
    
    // 根据alignment更新stats
    if (option.alignment === 'positive') {
      if (stamina >= 5) {
        consumeStamina(5)
      }
      updateCombat(combat + 3)
    } else if (option.alignment === 'rational') {
      updateSanity(Math.min(120, sanity + 3))
    } else {
      updateSanity(Math.min(120, sanity + 5))
    }

    const label =
      option.alignment === 'positive'
        ? '积极向抉择'
        : option.alignment === 'rational'
        ? '理智向抉择'
        : '躺平向抉择'
    appendLog(
      `第${week}周：${label} ${option.id} - ${option.label}`,
    )

    // 更新选择计数
    incrementChoiceCount(option.alignment)
    
    // 更新其他状态
    setSelectedOption(option)
    setPhase('actions')
  }

  /**
   * 统计本周结束时的长期计数。
   */
  const accumulateWeeklyMeta = (prev: GameState): GameState => {
    const updated: GameState = { ...prev }
    const s = prev.stats
    if (s.sanity >= 80) updated.weeksHighSanity += 1
    if (s.satiety >= 60 && s.hydration >= 60)
      updated.weeksHealthy += 1
    if (s.satiety < 60 || s.hydration < 60)
      updated.weeksHungerOrThirst += 1
    if (s.stamina <= 0) updated.staminaZeroWeeks += 1
    return updated
  }

  /**
   * 处理日常行为点击。
   */
  const handleDailyAction = (action: DailyAction) => {
    if (phase !== 'actions' || phase === 'ended') return
    
    // 根据不同的action更新stats
    switch (action) {
      case 'exercise':
        consumeStamina(10)
        updateCombat(2)
        updateHealth(1)
        incrementDailyEvent()
        break
      case 'cook':
        consumeStamina(5)
        updateSatiety(12)
        updateSanity(2)
        incrementDailyEvent()
        break
      case 'drink':
        updateHydration(15)
        updateSanity(2)
        incrementDailyEvent()
        break
      case 'playWithCat':
        updateSanity(6)
        incrementDailyEvent()
        break
      case 'read':
        updateSanity(5)
        updateSocial(1)
        incrementDailyEvent()
        break
      case 'rest': {
        /**
         * 新逻辑（按需求）：
         * - 本周第一次点击“休息”：按原有规则（恢复体力 +15，精神 +5）
         * - 本周第二次及以后点击：体力 -5，文本框显示 "Never give up!"（不显示原有提示）
         * - 如果本周累积点击达到 10 次：触发彩蛋结局 “死后亦能长眠”
         */
        if (restClicksThisWeek === 0) {
          // 首次休息，正常恢复（保留原有数值）
          recoverStamina(15)
          updateSanity(5)

          // 显示常规提示（使用现有随机日常事件池）
          const pool = dailyRandomEvents.filter((e) => e.action === 'rest')
          if (pool.length > 0) {
            const event = pool[Math.floor(Math.random() * pool.length)]
            setCurrentEventTitle(event.title)
            setCurrentEventText(event.description)
            setShowEventModal(true)

            appendLog(`【日常】休息：${event.title}`)

            // 成就判定示例（沿用已有）
            if (event.id === 'rest-7' || event.id === 'rest-7-follow') {
              unlockAchievement('doom-birthday')
            }
          } else {
            setCurrentEventTitle('休息')
            setCurrentEventText('你休息了一会儿，感觉好些了。')
            setShowEventModal(true)
          }

          setRestClicksThisWeek(1)
        } else {
          // 第二次及以后：体力减少 5，显示 Never give up!
          consumeStamina(5)
          setCurrentEventTitle('Never give up!')
          setCurrentEventText('Never give up!')
          setShowEventModal(true)

          const nextCount = restClicksThisWeek + 1
          setRestClicksThisWeek(nextCount)

          // 触发彩蛋结局：达到 10 次
          if (nextCount >= 10) {
            const easter = endings.find((e) => e.id === 'easter-sleep')
            setPhase('ended')
            setReachedEnding(easter)
            setShowEndingModal(true)
          }
        }
        incrementDailyEvent()
        break
      }
      default:
        break
    }

    const prettyNameMap: Record<DailyAction, string> = {
      exercise: '锻炼',
      cook: '做饭',
      drink: '喝水',
      playWithCat: '逗猫',
      read: '看书',
      rest: '休息',
    }

      const pretty = prettyNameMap[action]
      setWeekActionCounts((prevCounts) => ({
        ...prevCounts,
        [pretty]: (prevCounts[pretty] ?? 0) + 1,
      }))

      // 随机事件（除休息外行为）
      if (action !== 'rest') {
        const pool = dailyRandomEvents.filter((e) => e.action === action)
        if (pool.length > 0) {
          const event = pool[Math.floor(Math.random() * pool.length)]
          setCurrentEventTitle(event.title)
          setCurrentEventText(event.description)
          setShowEventModal(true)

          appendLog(`【日常】${pretty}：${event.title}`)

          // 成就判定
          if (
            event.id === 'exercise-5' ||
            event.id === 'exercise-5-follow'
          ) {
            unlockAchievement('funny-shout')
          }
          if (
            event.id === 'exercise-8' ||
            event.id === 'exercise-8-follow'
          ) {
            unlockAchievement('self-love')
          }
          if (
            event.id === 'drink-7' ||
            event.id === 'drink-7-follow'
          ) {
            unlockAchievement('science-survivor')
          }
          if (
            event.id === 'cook-9' ||
            event.id === 'cook-9-follow'
          ) {
            unlockAchievement('sweet-memory')
          }
        }
      }

  }

  /**
   * 处理探索行为点击。
   */
  const handleExplore = (level: ExploreDangerLevel) => {
    if (phase !== 'actions' || phase === 'ended') return

    // 消耗体力和其他资源
    if (level === 'suburb') {
      consumeStamina(8)
      updateSatiety(-2)
      updateHydration(-2)
    } else if (level === 'city') {
      consumeStamina(15)
      updateSatiety(-5)
      updateHydration(-5)
    } else if (level === 'mall') {
      consumeStamina(20)
      updateSatiety(-8)
      updateHydration(-8)
    }

    // 更新探索事件计数
    incrementExploreEvent()

    // 设置已访问地图
    setVisitedMap(level, true)

    // 随机探索事件
    const pool = exploreRandomEvents.filter(
      (e) => e.level === level,
    )
    if (pool.length > 0) {
      const event = pool[Math.floor(Math.random() * pool.length)]
      setCurrentEventTitle(event.title)
      setCurrentEventText(event.description)
      setShowEventModal(true)

      const areaName =
        level === 'suburb'
          ? '近郊探索'
          : level === 'city'
          ? '城区探索'
          : '购物中心探索'
      appendLog(`【探索】${areaName}：${event.title}`)

      setWeekActionCounts((prevCounts) => ({
        ...prevCounts,
        [areaName]: (prevCounts[areaName] ?? 0) + 1,
      }))
    }
  }

  /**
   * 结束本周：更新长期统计 + 可能触发 NPC 事件 + 打开结算。
   */
  const handleEndWeek = () => {
    if (phase !== 'actions' || phase === 'ended') return

    // 更新长期统计
    updateLongTermStats()

    // 按社交值概率触发 NPC 敲门事件（周末）
    const chance = Math.min(1, social / 100) // 按社交百分比
    const roll = Math.random()

    if (roll < chance && npcDoorEvents.length > 0) {
      const event =
        npcDoorEvents[
          Math.floor(Math.random() * npcDoorEvents.length)
        ]
      setNpcEvent(event)
      setShowNpcModal(true)
      setPendingWeeklySummary(true)
    } else {
      setShowWeeklySummary(true)
    }
  }

  /**
   * NPC 敲门事件处理。
   */
  const handleNpcChoice = (help: boolean) => {
    if (!npcEvent) {
      setShowNpcModal(false)
      return
    }
    const currentId = npcEvent.id

    // 更新统计数值
    if (help) {
      updateSocial(5)
      updateSanity(3)
      updateSatiety(-5)
      updateHydration(-5)
    } else {
      updateSanity(-5)
    }

    // 增加NPC事件计数
    incrementNpcEvent()

    appendLog(
      `【NPC】${npcEvent.title}：${help ? '你选择了帮助。' : '你选择了拒绝。'}`,
    )

    if (help && currentId === 'npc-18-teacher') {
      unlockAchievement('future-hope')
    }

    setShowNpcModal(false)
    setNpcEvent(null)

    if (pendingWeeklySummary) {
      setPendingWeeklySummary(false)
      setShowWeeklySummary(true)
    }
  }

  /**
   * 进入下一周 / 触发结局。
   */
  const handleNextWeek = () => {
    const isFinalWeek = week >= 45
    setShowWeeklySummary(false)

    if (isFinalWeek) {
      // 直接结局
      const endedState = computeEnding()
      setPhase('ended')
      setReachedEnding(endedState)
      setShowEndingModal(true)
      return
    }

    // 进入下一周
    nextWeek()
  }

  /**
   * 主内容区渲染：故事 + 行动 / 地图区。
   */
  const renderMainContent = () => {
    if (phase === 'ended') {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-300">
          <p>本周目已经到达结局，可在结局面板中查看详情。</p>
        </div>
      )
    }

    return (
      <div className="flex h-full flex-col">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>第 {week} 周</span>
          <span>
            当前阶段：
            {phase === 'story' ? '主线剧情' : '自由行动'}
          </span>
        </div>

        {currentStory && phase === 'story' && (
          <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <h2 className="text-sm font-semibold text-indigo-100">
              {currentStory.title}
            </h2>
            <div className="mt-2 text-sm text-slate-100">
              <TypingText text={currentStory.body} />
            </div>
            <div className="mt-3 space-y-2">
              {currentStory.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="flex w-full flex-col items-start rounded-xl bg-slate-800 px-3 py-2 text-left text-xs text-slate-100 transition-colors hover:bg-slate-700 active:scale-[0.99]"
                >
                  <span className="font-semibold">
                    {opt.id}. {opt.label}
                  </span>
                  <span className="mt-1 text-[0.7rem] text-slate-300">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'actions' && (
          <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            {selectedOption && (
              <p className="mb-2 text-[0.75rem] text-slate-400">
                你选择了{' '}
                <span className="text-slate-100">
                  {selectedOption.label}
                </span>
                ，接下来的一周由你自由支配。
              </p>
            )}
            <p className="text-xs text-slate-300">
              通过「行动」处理日常，通过「地图」外出探索并获取资源。感觉差不多时点击「结束本周」进行结算。
            </p>

            {showActionPanel && (
              <div className="mt-3 rounded-2xl border border-sky-500/40 bg-slate-900/90 p-3">
                <h3 className="mb-2 text-xs font-semibold text-sky-200">
                  日常行动
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDailyAction('exercise')}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-center text-slate-100 hover:bg-slate-700 active:scale-95"
                  >
                    💪 锻炼
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyAction('cook')}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-center text-slate-100 hover:bg-slate-700 active:scale-95"
                  >
                    🍳 做饭
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyAction('drink')}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-center text-slate-100 hover:bg-slate-700 active:scale-95"
                  >
                    💧 喝水
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyAction('playWithCat')}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-center text-slate-100 hover:bg-slate-700 active:scale-95"
                  >
                    🐱 逗猫
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyAction('read')}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-center text-slate-100 hover:bg-slate-700 active:scale-95"
                  >
                    📖 看书
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyAction('rest')}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-center text-slate-100 hover:bg-slate-700 active:scale-95"
                  >
                    😴 休息
                  </button>
                </div>
              </div>
            )}

            {showMapPanel && (
              <div className="mt-3 rounded-2xl border border-violet-500/40 bg-slate-900/90 p-3">
                <h3 className="mb-2 text-xs font-semibold text-violet-200">
                  地图 · 外出探索
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 px-3 py-2">
                    <div>
                      <div className="font-semibold text-slate-100">
                        祖宅 / 安全屋
                      </div>
                      <div className="text-[0.7rem] text-slate-400">
                        在家里整理环境、和伙伴互动。
                      </div>
                    </div>
                    <span className="text-[0.7rem] text-slate-500">
                      基础据点
                    </span>
                  </div>

                  <MapRow
                    label="近郊 / 恍如隔世"
                    danger="★ ★ ★"
                    unlocked={week >= 2}
                    onClick={() => handleExplore('suburb')}
                    requirementText="第 2 周自动解锁"
                  />

                  <MapRow
                    label="城区 / 物是人非"
                    danger="★ ★ ★ ★ ★"
                    unlocked={
                      combat >= 30 || week >= 12
                    }
                    onClick={() => handleExplore('city')}
                    requirementText="战力 ≥ 30 或 第 12 周自动解锁"
                  />

                  <MapRow
                    label="购物中心 / 几近摧毁"
                    danger="★ ★ ★ ★ ★ ★ ★ ★"
                    unlocked={
                      combat >= 60 || week >= 25
                    }
                    onClick={() => handleExplore('mall')}
                    requirementText="战力 ≥ 60 或 第 25 周自动解锁"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setShowActionPanel((v) => !v)
              if (!showActionPanel) setShowMapPanel(false)
            }}
            disabled={phase !== 'actions'}
            className={`flex-1 rounded-full px-3 py-2 text-center font-semibold transition-all ${
              phase === 'actions'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/40 hover:brightness-110 active:scale-95'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            }`}
          >
            🏃 行动
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMapPanel((v) => !v)
              if (!showMapPanel) setShowActionPanel(false)
            }}
            disabled={phase !== 'actions'}
            className={`flex-1 rounded-full px-3 py-2 text-center font-semibold transition-all ${
              phase === 'actions'
                ? 'bg-violet-500 text-slate-950 shadow-md shadow-violet-500/40 hover:brightness-110 active:scale-95'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            }`}
          >
            🗺️ 地图
          </button>
          <button
            type="button"
            onClick={handleEndWeek}
            disabled={phase !== 'actions'}
            className={`flex-1 rounded-full px-3 py-2 text-center font-semibold transition-all ${
              phase === 'actions'
                ? 'bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-950 shadow-md shadow-emerald-500/40 hover:brightness-110 active:scale-95'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            }`}
          >
            ⏭ 结束本周
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex-1 flex-col">
      <div className="flex h-full flex-col">
        <HeaderBar
          onNewGame={handleNewGame}
          onSaveGame={handleSaveGame}
          isSaving={isSaving}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        <main className="flex-1 p-3">{viewMode === 'start' ? (
          <StartScreen hasSave={hasSave} onStartNew={handleNewGame} onContinue={handleContinue} />
        ) : (
          renderMainContent()
        )}</main>

        <BottomStatusBar
          stats={{
            stamina,
            satiety,
            hydration,
            health,
            combat,
            social,
            sanity,
            money,
          }}
          onOpenBag={() => setShowBag(true)}
          onOpenLog={() => setShowLog(true)}
          unlockedAchievementsCount={unlockedAchievements.length}
        />
      </div>

      {showEventModal && (
        <Modal title={currentEventTitle} onClose={() => setShowEventModal(false)}>
          <div className="text-sm text-slate-100">
            {currentEventText}
          </div>
        </Modal>
      )}

      {showNpcModal && npcEvent && (
        <Modal title={npcEvent.title} onClose={() => setShowNpcModal(false)}>
          <div className="text-sm text-slate-100">
            <p className="mb-2">{npcEvent.description}</p>
            <div className="flex gap-2">
              <button onClick={() => handleNpcChoice(true)} className="rounded-full bg-emerald-500 px-3 py-1 text-xs text-slate-900">帮助</button>
              <button onClick={() => handleNpcChoice(false)} className="rounded-full bg-rose-500 px-3 py-1 text-xs text-slate-900">拒绝</button>
            </div>
          </div>
        </Modal>
      )}

      {showWeeklySummary && (
        <WeeklySummaryModal
          week={week}
          startStats={weekStartStats}
          endStats={{
            stamina,
            satiety,
            hydration,
            health,
            combat,
            social,
            sanity,
            money,
          }}
          actionCounts={weekActionCounts}
          onNextWeek={handleNextWeek}
          onClose={() => setShowWeeklySummary(false)}
        />
      )}

      {showEndingModal && reachedEnding && (
        <EndingModal
          ending={reachedEnding}
          stats={{
            stamina,
            satiety,
            hydration,
            health,
            combat,
            social,
            sanity,
            money,
          }}
          onRestart={() => {
            handleNewGame()
            setShowEndingModal(false)
          }}
          onBackToStart={() => {
            setViewMode('start')
            setShowEndingModal(false)
          }}
        />
      )}

      {showAchievements && (
        <Modal title="成就" onClose={() => setShowAchievements(false)}>
          <div className="space-y-2 text-xs">
            {allAchievements.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-slate-800 py-2">
                <div>
                  <div className="font-medium text-slate-100">{a.name}</div>
                  <div className="text-[0.7rem] text-slate-400">{a.howToGet}</div>
                </div>
                <div className="text-[0.7rem] text-amber-200">
                  {unlockedAchievements.includes(a.id) ? '已解锁' : '未解锁'}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showBag && (
        <Modal title="背包" onClose={() => setShowBag(false)}>
          <div className="text-sm text-slate-100">（背包界面在 GameContext 中模拟）</div>
        </Modal>
      )}

      {showLog && (
        <Modal title="日志" onClose={() => setShowLog(false)}>
          <div className="text-xs text-slate-300 space-y-2 max-h-64 overflow-y-auto">
            {logEntries.length === 0 ? <div className="text-slate-500">暂无事件</div> : logEntries.map((l, i) => (
              <div key={i} className="text-[0.8rem] border-b border-slate-800 py-1">{l}</div>
            ))}
          </div>
        </Modal>
      )}

      {justUnlocked && showAchievementToast && (
        <div className="fixed bottom-20 right-6 z-50 rounded-lg bg-amber-500/10 border border-amber-400 p-3 text-amber-200 text-sm">
          成就解锁：{justUnlocked.name}
        </div>
      )}
    </div>
  )
}

/**
 * MapRow 及其他小组件为本文件内轻量复用组件
 */

/**
 * MapRowProps
 * 地图列表行。
 */
interface MapRowProps {
  label: string
  danger: string
  unlocked: boolean
  onClick: () => void
  requirementText?: string
}

/**
 * MapRow
 * 地图行组件，展示简短信息与进入按钮。
 */
function MapRow({ label, danger, unlocked, onClick, requirementText }: MapRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800 px-3 py-2">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-[0.7rem] text-slate-400">{danger} · {requirementText}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClick}
          disabled={!unlocked}
          className={`rounded-full px-3 py-1 text-xs ${unlocked ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
        >
          进入
        </button>
      </div>
    </div>
  )
}

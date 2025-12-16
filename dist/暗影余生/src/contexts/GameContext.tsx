/**
 * src/contexts/GameContext.tsx
 * 全局游戏上下文：管理体力、玩家背包、NPC 商店与地图交互开关等全局状态。
 *
 * 用途：
 * - 提供体力（stamina）全局状态与消耗接口
 * - 管理玩家背包（简单的 mock 数据）
 * - 提供买/卖/搜刮/探索等基础函数（本地模拟）
 * - 控制是否展示地图详情面板
 */

import React, { createContext, useContext, useMemo, useState } from 'react'
import type { GamePhase, WeeklyStory, WeeklyOption, Alignment, GameEnding } from '../game/types'

/**
 * PlayerItem
 * 玩家物品条目定义。
 */
export interface PlayerItem {
  id: string
  name: string
  qty: number
  price?: number
}

/**
 * NpcItem
 * NPC 商店中的商品定义。
 */
export interface NpcItem {
  id: string
  name: string
  price: number
  stock: number
}

/**
 * NpcDefinition
 * 每个地图 NPC 的基本信息与库存。
 */
export interface NpcDefinition {
  id: string
  name: string
  location: 'suburb' | 'city' | 'mall'
  inventory: NpcItem[]
}

/**
 * ScavengeDefinition
 * 搜刮地点基础信息。
 */
export interface ScavengeDefinition {
  id: string
  name: string
  description: string
  location: 'suburb' | 'city' | 'mall'
  // possible loot pool
  pool: Array<{ id: string; name: string; qtyMin?: number; qtyMax?: number }>
  staminaCost: number
}

/**
 * ExploreDefinition
 * 探索点信息（触发事件）。
 */
export interface ExploreDefinition {
  id: string
  name: string
  description: string
  location: 'suburb' | 'city' | 'mall'
  staminaCost: number
}

/**
 * GameContextValue
 * 上下文暴露的方法与状态。
 */
export interface GameContextValue {
  // 核心数值系统
  stamina: number
  maxStamina: number
  consumeStamina: (amount: number) => boolean
  recoverStamina: (amount: number) => void
  
  satiety: number
  hydration: number
  health: number
  combat: number
  social: number
  sanity: number
  money: number
  
  updateSatiety: (amount: number) => void
  updateHydration: (amount: number) => void
  updateHealth: (amount: number) => void
  updateCombat: (amount: number) => void
  updateSocial: (amount: number) => void
  updateSanity: (amount: number) => void
  updateMoney: (amount: number) => void

  inventory: PlayerItem[]
  addItem: (it: PlayerItem) => void
  removeItem: (id: string, qty?: number) => boolean
  getItem: (id: string) => PlayerItem | undefined
  useItem: (id: string) => { success: boolean; message?: string }

  npcs: NpcDefinition[]
  buyFromNpc: (npcId: string, itemId: string, qty?: number) => { success: boolean; message?: string }
  sellToNpc: (npcId: string | null, itemId: string, qty?: number) => { success: boolean; message?: string }

  scavenges: ScavengeDefinition[]
  scavenge: (scavengeId: string) => { success: boolean; loot?: PlayerItem[]; message?: string }

  explores: ExploreDefinition[]
  explore: (exploreId: string) => { success: boolean; message?: string }

  // 游戏进度
  week: number
  nextWeek: () => void
  phase: GamePhase
  setPhase: (phase: GamePhase) => void
  currentStory?: WeeklyStory
  setCurrentStory: (story?: WeeklyStory) => void
  selectedOption?: WeeklyOption
  setSelectedOption: (option?: WeeklyOption) => void
  alignCounts: Record<Alignment, number>
  updateAlignCount: (alignment: Alignment, amount: number) => void
  
  // 游戏事件统计
  unlockedAchievements: string[]
  unlockAchievement: (id: string) => void
  unlockedItems: string[]
  unlockItem: (id: string) => void
  neverGiveUpClicks: number
  updateNeverGiveUpClicks: (amount: number) => void
  reachedEnding?: GameEnding
  setReachedEnding: (ending?: GameEnding) => void
  
  // 选择统计
  positiveChoiceCount: number
  rationalChoiceCount: number
  slackChoiceCount: number
  incrementChoiceCount: (alignment: Alignment) => void
  
  // 事件统计
  totalDailyEvents: number
  totalExploreEvents: number
  totalNpcEvents: number
  totalItemsBought: number
  totalItemsSold: number
  incrementDailyEvent: () => void
  incrementExploreEvent: () => void
  incrementNpcEvent: () => void
  incrementItemsBought: () => void
  incrementItemsSold: () => void
  
  // 长期统计
  weeksHighSanity: number
  weeksHealthy: number
  weeksHungerOrThirst: number
  staminaZeroWeeks: number
  updateLongTermStats: () => void
  
  // 特殊状态
  neverRest: boolean
  setNeverRest: (value: boolean) => void
  visitedSuburb: boolean
  visitedCity: boolean
  visitedMall: boolean
  setVisitedMap: (map: 'suburb' | 'city' | 'mall', visited: boolean) => void
  debtWorkCount: number
  incrementDebtWorkCount: () => void
  catPlayCount: number
  incrementCatPlayCount: () => void
  
  // 地图解锁状态
  unlockedMaps: { suburb: boolean; city: boolean; mall: boolean }
  checkMapUnlock: () => void
  
  // UI control
  mapOpen: boolean
  openMap: () => void
  closeMap: () => void
}

/**
 * 初始 Mock 数据：NPC、搜刮点、探索点、玩家初始背包
 */
const initialNpcs: NpcDefinition[] = [
  {
    id: 'npc-suburb-1',
    name: '收废品小贩·阿强',
    location: 'suburb',
    inventory: [
      { id: 'compressed-biscuit', name: '压缩饼干', price: 150, stock: 8 },
      { id: 'bottled-water', name: '瓶装水', price: 160, stock: 6 },
      { id: 'match-box', name: '火柴', price: 150, stock: 12 },
    ],
  },
  {
    id: 'npc-city-1',
    name: '流动商队·小孙',
    location: 'city',
    inventory: [
      { id: 'military-ration', name: '军用口粮', price: 350, stock: 4 },
      { id: 'medkit', name: '医疗包', price: 450, stock: 2 },
      { id: 'walkie-talkie', name: '对讲机', price: 480, stock: 1 },
    ],
  },
  {
    id: 'npc-mall-1',
    name: '暗巷商人·黑手',
    location: 'mall',
    inventory: [
      { id: 'ultimate-survival-kit', name: '顶级生存包', price: 800, stock: 1 },
      { id: 'adrenaline', name: '肾上腺素', price: 800, stock: 2 },
    ],
  },
]

const initialScavenges: ScavengeDefinition[] = [
  {
    id: 'scav-suburb-1',
    name: '废弃农舍',
    description: '旧农舍的厨房和棚子，可能有罐头或工具。',
    location: 'suburb',
    pool: [
      { id: 'sealed-can', name: '未开封罐头', qtyMin: 1, qtyMax: 3 },
      { id: 'old-clothes', name: '破旧的衣服', qtyMin: 1, qtyMax: 1 },
      { id: 'empty-bottle', name: '空瓶子', qtyMin: 1, qtyMax: 2 },
    ],
    staminaCost: 8,
  },
  {
    id: 'scav-city-1',
    name: '破旧超市后仓',
    description: '曾经繁忙的后仓，也许还有些没被抢的物资。',
    location: 'city',
    pool: [
      { id: 'sealed-can', name: '未开封罐头', qtyMin: 1, qtyMax: 4 },
      { id: 'battery-pack-small', name: '电池', qtyMin: 1, qtyMax: 2 },
      { id: 'first-aid-supply', name: '急救用品', qtyMin: 0, qtyMax: 1 },
    ],
    staminaCost: 15,
  },
  {
    id: 'scav-mall-1',
    name: '商场储物室',
    description: '深处的储物室，动静大可能有人驻守，风险与收益并存。',
    location: 'mall',
    pool: [
      { id: 'gold-bar', name: '金条', qtyMin: 0, qtyMax: 1 },
      { id: 'sealed-can', name: '未开封罐头', qtyMin: 2, qtyMax: 6 },
      { id: 'art-collection', name: '艺术品收藏', qtyMin: 0, qtyMax: 1 },
    ],
    staminaCost: 22,
  },
]

const initialExplores: ExploreDefinition[] = [
  {
    id: 'explore-suburb-1',
    name: '近郊小路',
    description: '沿着小路走走，观察周遭与搜集线索。',
    location: 'suburb',
    staminaCost: 6,
  },
  {
    id: 'explore-city-1',
    name: '城区巷道',
    description: '深入街巷，了解其他幸存者活动轨迹。',
    location: 'city',
    staminaCost: 12,
  },
  {
    id: 'explore-mall-1',
    name: '购物中心主厅',
    description: '堂皇的购物中心，可能存在守卫与珍贵物资。',
    location: 'mall',
    staminaCost: 20,
  },
]

/**
 * createContext 与 Provider
 */
const GameContext = createContext<GameContextValue | undefined>(undefined)

/**
 * GameProvider
 * 提供游戏状态与行为实现。
 */
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const maxStamina = 120
  const [stamina, setStamina] = useState<number>(100)

  // 核心数值系统初始化
  const [satiety, setSatiety] = useState<number>(100)
  const [hydration, setHydration] = useState<number>(100)
  const [health, setHealth] = useState<number>(100)
  const [combat, setCombat] = useState<number>(15)
  const [social, setSocial] = useState<number>(30)
  const [sanity, setSanity] = useState<number>(100)
  const [money, setMoney] = useState<number>(500)

  const [inventory, setInventory] = useState<PlayerItem[]>([
    { id: 'compressed-biscuit', name: '压缩饼干', qty: 2, price: 150 },
    { id: 'bottled-water', name: '瓶装水', qty: 1, price: 160 },
  ])

  const [npcs, setNpcs] = useState<NpcDefinition[]>(initialNpcs)
  const [scavenges] = useState<ScavengeDefinition[]>(initialScavenges)
  const [explores] = useState<ExploreDefinition[]>(initialExplores)

  // 游戏进度
  const [week, setWeek] = useState<number>(1)
  const [phase, setPhase] = useState<GamePhase>('story')
  const [currentStory, setCurrentStory] = useState<WeeklyStory | undefined>()
  const [selectedOption, setSelectedOption] = useState<WeeklyOption | undefined>()
  const [alignCounts, setAlignCounts] = useState<Record<Alignment, number>>({
    positive: 0,
    rational: 0,
    slack: 0
  })
  
  // 游戏事件统计
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [unlockedItems, setUnlockedItems] = useState<string[]>([])
  const [neverGiveUpClicks, setNeverGiveUpClicks] = useState<number>(0)
  const [reachedEnding, setReachedEnding] = useState<GameEnding | undefined>()
  
  // 选择统计
  const [positiveChoiceCount, setPositiveChoiceCount] = useState<number>(0)
  const [rationalChoiceCount, setRationalChoiceCount] = useState<number>(0)
  const [slackChoiceCount, setSlackChoiceCount] = useState<number>(0)
  
  // 事件统计
  const [totalDailyEvents, setTotalDailyEvents] = useState<number>(0)
  const [totalExploreEvents, setTotalExploreEvents] = useState<number>(0)
  const [totalNpcEvents, setTotalNpcEvents] = useState<number>(0)
  const [totalItemsBought, setTotalItemsBought] = useState<number>(0)
  const [totalItemsSold, setTotalItemsSold] = useState<number>(0)
  
  // 长期统计
  const [weeksHighSanity, setWeeksHighSanity] = useState<number>(0)
  const [weeksHealthy, setWeeksHealthy] = useState<number>(0)
  const [weeksHungerOrThirst, setWeeksHungerOrThirst] = useState<number>(0)
  const [staminaZeroWeeks, setStaminaZeroWeeks] = useState<number>(0)
  
  // 特殊状态
  const [neverRest, setNeverRest] = useState<boolean>(true)
  const [visitedSuburb, setVisitedSuburb] = useState<boolean>(false)
  const [visitedCity, setVisitedCity] = useState<boolean>(false)
  const [visitedMall, setVisitedMall] = useState<boolean>(false)
  const [debtWorkCount, setDebtWorkCount] = useState<number>(0)
  const [catPlayCount, setCatPlayCount] = useState<number>(0)
  
  // 地图解锁状态
  const [unlockedMaps, setUnlockedMaps] = useState<{ suburb: boolean; city: boolean; mall: boolean }>({
    suburb: false,
    city: false,
    mall: false
  })

  const [mapOpen, setMapOpen] = useState(false)

  /**
   * consumeStamina
   * 扣除体力，若体力不足则返回 false 并不改变状态。
   */
  const consumeStamina = (amount: number): boolean => {
    if (amount <= 0) return true
    if (stamina < amount) return false
    setStamina((s) => Math.max(0, s - amount))
    return true
  }

  /**
   * recoverStamina
   * 恢复体力（上限 maxStamina）。
   */
  const recoverStamina = (amount: number) => {
    setStamina((s) => Math.min(maxStamina, s + amount))
  }

  /**
   * 背包操作：addItem / removeItem
   */
  const addItem = (it: PlayerItem) => {
    setInventory((prev) => {
      const found = prev.find((p) => p.id === it.id)
      if (found) {
        return prev.map((p) => (p.id === it.id ? { ...p, qty: p.qty + it.qty } : p))
      }
      return [...prev, { ...it }]
    })
  }

  const removeItem = (id: string, qty = 1): boolean => {
    let ok = false
    setInventory((prev) => {
      const found = prev.find((p) => p.id === id)
      if (!found || found.qty < qty) {
        ok = false
        return prev
      }
      ok = true
      if (found.qty === qty) {
        return prev.filter((p) => p.id !== id)
      }
      return prev.map((p) => (p.id === id ? { ...p, qty: p.qty - qty } : p))
    })
    return ok
  }

  const getItem = (id: string) => {
    return inventory.find((p) => p.id === id)
  }

  /**
   * 核心数值系统更新方法
   */
  const updateSatiety = (amount: number) => {
    setSatiety((s) => Math.max(0, Math.min(100, s + amount)))
  }

  const updateHydration = (amount: number) => {
    setHydration((h) => Math.max(0, Math.min(100, h + amount)))
  }

  const updateHealth = (amount: number) => {
    setHealth((h) => Math.max(0, Math.min(100, h + amount)))
  }

  const updateCombat = (amount: number) => {
    setCombat((c) => Math.max(0, c + amount))
  }

  const updateSocial = (amount: number) => {
    setSocial((s) => Math.max(0, Math.min(100, s + amount)))
  }

  const updateSanity = (amount: number) => {
    setSanity((s) => Math.max(0, Math.min(100, s + amount)))
  }

  const updateMoney = (amount: number) => {
    setMoney((m) => Math.max(0, m + amount))
  }

  /**
   * 使用物品：根据物品ID修改对应的数值
   */
  const useItem = (id: string): { success: boolean; message?: string } => {
    const item = getItem(id)
    if (!item || item.qty <= 0) {
      return { success: false, message: '物品不足' }
    }

    // 物品效果映射
    const itemEffects: Record<string, { name: string; satiety?: number; hydration?: number; health?: number; sanity?: number }> = {
      'compressed-biscuit': { name: '压缩饼干', satiety: 15 },
      'bottled-water': { name: '瓶装水', hydration: 20 },
      'military-ration': { name: '军用口粮', satiety: 30, hydration: 10 },
      'medkit': { name: '医疗包', health: 25 },
      'sealed-can': { name: '未开封罐头', satiety: 10 },
    }

    const effect = itemEffects[id]
    if (!effect) {
      return { success: false, message: '该物品无法使用' }
    }

    // 应用效果
    if (effect.satiety) updateSatiety(effect.satiety)
    if (effect.hydration) updateHydration(effect.hydration)
    if (effect.health) updateHealth(effect.health)
    if (effect.sanity) updateSanity(effect.sanity)

    // 扣除物品
    removeItem(id, 1)

    return { success: true, message: `使用了${effect.name}` }
  }

  /**
   * 进入下一周：重置体力，更新游戏进度
   */
  const nextWeek = () => {
    // 更新长期统计数据
    updateLongTermStats()
    
    // 每周结束时的状态衰减
    updateSatiety(-10) // 饱腹减少10
    updateHydration(-10) // 水分减少10
    
    // 重置体力
    setStamina(100)
    
    // 进入下一周
    setWeek((w) => w + 1)
    
    // 检查地图解锁
    checkMapUnlock()
  }

  /**
   * 检查地图解锁条件
   */
  const checkMapUnlock = () => {
    setUnlockedMaps((prev) => {
      const newState = { ...prev }
      
      // 郊区：第2周解锁
      if (week >= 2) {
        newState.suburb = true
      }
      
      // 城区：战力≥30或第12周解锁
      if (combat >= 30 || week >= 12) {
        newState.city = true
      }
      
      // 购物中心：战力≥60或第25周解锁
      if (combat >= 60 || week >= 25) {
        newState.mall = true
      }
      
      return newState
    })
  }

  /**
   * 购买：从 npc 买入物品，扣钱、扣库存、加到背包
   */
  const buyFromNpc = (npcId: string, itemId: string, qty = 1) => {
    const npc = npcs.find((n) => n.id === npcId)
    if (!npc) return { success: false, message: '商人不存在' }
    const product = npc.inventory.find((it) => it.id === itemId)
    if (!product) return { success: false, message: '商品不存在' }
    if (product.stock < qty) return { success: false, message: '库存不足' }

    // 扣库存
    setNpcs((prev) =>
      prev.map((n) =>
        n.id === npcId
          ? {
              ...n,
              inventory: n.inventory.map((it) =>
                it.id === itemId ? { ...it, stock: it.stock - qty } : it,
              ),
            }
          : n,
      ),
    )

    // 增加背包（合并）
    addItem({ id: product.id, name: product.name, qty, price: product.price })
    return { success: true, message: `购买 ${product.name} x${qty}` }
  }

  /**
   * 出售：玩家卖给 npc 或市场（npcId 可为 null 表示卖给通用市场）
   */
  const sellToNpc = (npcId: string | null, itemId: string, qty = 1) => {
    const playerHas = inventory.find((i) => i.id === itemId)
    if (!playerHas || playerHas.qty < qty) return { success: false, message: '物品不足' }

    // 简化：按 player 项的 price 为出售价的一半回收（若无 price，则失败）
    if (!playerHas.price) return { success: false, message: '该物品无法出售' }

    removeItem(itemId, qty)
    // NPC 收购：如果有 npcId 并且该 npc 有相同商品则增加库存
    if (npcId) {
      setNpcs((prev) =>
        prev.map((n) =>
          n.id === npcId
            ? {
                ...n,
                inventory: [
                  ...n.inventory.map((it) =>
                    it.id === itemId ? { ...it, stock: it.stock + qty } : it,
                  ),
                ],
              }
            : n,
        ),
      )
    }
    return { success: true, message: `出售 ${playerHas.name} x${qty} 获得 ${Math.floor((playerHas.price * qty) / 2)} 金钱（模拟）` }
  }

  /**
   * 搜刮：消耗体力并从 pool 中随机获得物品
   */
  const scavenge = (scavengeId: string) => {
    const loc = scavenges.find((s) => s.id === scavengeId)
    if (!loc) return { success: false, message: '搜刮地点不存在' }
    if (!consumeStamina(loc.staminaCost)) {
      return { success: false, message: '体力不足' }
    }

    // 随机抽取 1-2 种战利品
    const picks: PlayerItem[] = []
    const rollCount = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < rollCount; i++) {
      const picked = loc.pool[Math.floor(Math.random() * loc.pool.length)]
      if (!picked) continue
      const qty = picked.qtyMin && picked.qtyMax ? (picked.qtyMin + Math.floor(Math.random() * (picked.qtyMax - picked.qtyMin + 1))) : 1
      picks.push({ id: picked.id, name: picked.name, qty })
      addItem({ id: picked.id, name: picked.name, qty, price: 0 })
    }

    return { success: true, loot: picks }
  }

  /**
   * 探索：消耗体力，返回简单文本结果（mock）
   */
  const explore = (exploreId: string) => {
    const e = explores.find((x) => x.id === exploreId)
    if (!e) return { success: false, message: '探索点不存在' }
    if (!consumeStamina(e.staminaCost)) {
      return { success: false, message: '体力不足' }
    }

    // 随机结果文本
    const outcomes = [
      '你发现了一处被遗弃的小仓库，里面有些罐头。',
      '你遭遇一队流浪者，侥幸躲过了擦枪走火。',
      '路上没有发现有价值的物资，但获取了重要情报。',
    ]
    const msg = outcomes[Math.floor(Math.random() * outcomes.length)]
    // 有概率获得一件小物品
    if (Math.random() < 0.3) {
      const loot: PlayerItem = { id: 'sealed-can', name: '未开封罐头', qty: 1, price: 0 }
      addItem(loot)
      return { success: true, message: `${msg} 并获得 ${loot.name}` }
    }
    return { success: true, message: msg }
  }

  // 游戏进度方法
  const updateAlignCount = (alignment: Alignment, amount: number) => {
    setAlignCounts(prev => ({
      ...prev,
      [alignment]: prev[alignment] + amount
    }))
  }

  // 游戏事件统计方法
  const unlockAchievement = (id: string) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  const unlockItem = (id: string) => {
    setUnlockedItems(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  const updateNeverGiveUpClicks = (amount: number) => {
    setNeverGiveUpClicks(prev => Math.max(0, prev + amount))
  }

  // 选择统计方法
  const incrementChoiceCount = (alignment: Alignment) => {
    setAlignCounts(prev => ({
      ...prev,
      [alignment]: prev[alignment] + 1
    }))

    if (alignment === 'positive') setPositiveChoiceCount(prev => prev + 1)
    else if (alignment === 'rational') setRationalChoiceCount(prev => prev + 1)
    else if (alignment === 'slack') setSlackChoiceCount(prev => prev + 1)
  }

  // 事件统计方法
  const incrementDailyEvent = () => {
    setTotalDailyEvents(prev => prev + 1)
  }

  const incrementExploreEvent = () => {
    setTotalExploreEvents(prev => prev + 1)
  }

  const incrementNpcEvent = () => {
    setTotalNpcEvents(prev => prev + 1)
  }

  const incrementItemsBought = () => {
    setTotalItemsBought(prev => prev + 1)
  }

  const incrementItemsSold = () => {
    setTotalItemsSold(prev => prev + 1)
  }

  // 长期统计方法
  const updateLongTermStats = () => {
    // 根据当前状态更新长期统计
    if (sanity >= 80) setWeeksHighSanity(prev => prev + 1)
    if (satiety >= 60 && hydration >= 60) setWeeksHealthy(prev => prev + 1)
    if (satiety < 30 || hydration < 30) setWeeksHungerOrThirst(prev => prev + 1)
    if (stamina <= 0) setStaminaZeroWeeks(prev => prev + 1)
  }

  // 特殊状态方法
  const setVisitedMap = (map: 'suburb' | 'city' | 'mall', visited: boolean) => {
    if (map === 'suburb') setVisitedSuburb(visited)
    else if (map === 'city') setVisitedCity(visited)
    else if (map === 'mall') setVisitedMall(visited)
  }

  const incrementDebtWorkCount = () => {
    setDebtWorkCount(prev => prev + 1)
  }

  const incrementCatPlayCount = () => {
    setCatPlayCount(prev => prev + 1)
  }

  const value = useMemo<GameContextValue>(() => ({
    // 核心数值系统
    stamina,
    maxStamina,
    consumeStamina,
    recoverStamina,
    
    satiety,
    hydration,
    health,
    combat,
    social,
    sanity,
    money,
    
    updateSatiety,
    updateHydration,
    updateHealth,
    updateCombat,
    updateSocial,
    updateSanity,
    updateMoney,
    
    // 背包系统
    inventory,
    addItem,
    removeItem,
    getItem,
    useItem,
    
    // NPC和交易系统
    npcs,
    buyFromNpc,
    sellToNpc,
    
    // 搜刮和探索系统
    scavenges,
    scavenge,
    explores,
    explore,
    
    // 游戏进度
    week,
    nextWeek,
    phase,
    setPhase,
    currentStory,
    setCurrentStory,
    selectedOption,
    setSelectedOption,
    alignCounts,
    updateAlignCount,
    
    // 游戏事件统计
    unlockedAchievements,
    unlockAchievement,
    unlockedItems,
    unlockItem,
    neverGiveUpClicks,
    updateNeverGiveUpClicks,
    reachedEnding,
    setReachedEnding,
    
    // 选择统计
    positiveChoiceCount,
    rationalChoiceCount,
    slackChoiceCount,
    incrementChoiceCount,
    
    // 事件统计
    totalDailyEvents,
    totalExploreEvents,
    totalNpcEvents,
    totalItemsBought,
    totalItemsSold,
    incrementDailyEvent,
    incrementExploreEvent,
    incrementNpcEvent,
    incrementItemsBought,
    incrementItemsSold,
    
    // 长期统计
    weeksHighSanity,
    weeksHealthy,
    weeksHungerOrThirst,
    staminaZeroWeeks,
    updateLongTermStats,
    
    // 特殊状态
    neverRest,
    setNeverRest,
    visitedSuburb,
    visitedCity,
    visitedMall,
    setVisitedMap,
    debtWorkCount,
    incrementDebtWorkCount,
    catPlayCount,
    incrementCatPlayCount,
    
    // 地图解锁
    unlockedMaps,
    checkMapUnlock,
    
    // UI控制
    mapOpen,
    openMap: () => setMapOpen(true),
    closeMap: () => setMapOpen(false),
  }), [stamina, maxStamina, satiety, hydration, health, combat, social, sanity, money, inventory, npcs, scavenges, explores, week, phase, currentStory, selectedOption, alignCounts, unlockedAchievements, unlockedItems, neverGiveUpClicks, reachedEnding, positiveChoiceCount, rationalChoiceCount, slackChoiceCount, totalDailyEvents, totalExploreEvents, totalNpcEvents, totalItemsBought, totalItemsSold, weeksHighSanity, weeksHealthy, weeksHungerOrThirst, staminaZeroWeeks, neverRest, visitedSuburb, visitedCity, visitedMall, debtWorkCount, catPlayCount, unlockedMaps, mapOpen])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

/**
 * useGame
 * 便捷 Hook，获取 GameContext。
 */
export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
} 

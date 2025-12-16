/**
 * src/components/MapDetail.tsx
 * 地图详单面板：展示近郊 / 城区 / 购物中心三张地图，
 * 每张地图包含：交易 NPC、探索点、搜刮点的交互（交易/探索/搜刮）。
 *
 * 设计：
 * - 使用 GameContext 提供的全局体力与背包 / NPC 接口
 * - 独立组件：MapDetail、MapCard、NpcTradePanel、ScavengePanel、ExploreResult
 * - 交互提示与反馈（体力不足提示、购买/出售反馈、获得物品展示）
 */

import React, { useMemo, useState } from 'react'
import { useGame, type NpcDefinition, type ScavengeDefinition, type ExploreDefinition } from '../contexts/GameContext'

/**
 * 地图卡片 Props
 */
interface MapCardProps {
  title: string
  locationKey: 'suburb' | 'city' | 'mall'
  npc?: NpcDefinition | null
  scavenge?: ScavengeDefinition | null
  explore?: ExploreDefinition | null
}

/**
 * MapDetail
 * 地图详单主面板（模态居中）。
 */
export const MapDetail: React.FC = () => {
  const game = useGame()

  const npcsFor = (loc: 'suburb' | 'city' | 'mall') => game.npcs.filter((n) => n.location === loc)
  const scavengesFor = game.scavenges.filter((s) => s.location === 'suburb' || s.location === 'city' || s.location === 'mall')
  const exploresFor = game.explores

  // 聚合每区的首个 npc / scavenge / explore
  const suburbNpc = npcsFor('suburb')[0] ?? null
  const cityNpc = npcsFor('city')[0] ?? null
  const mallNpc = npcsFor('mall')[0] ?? null

  const suburbScav = game.scavenges.find((s) => s.location === 'suburb') ?? null
  const cityScav = game.scavenges.find((s) => s.location === 'city') ?? null
  const mallScav = game.scavenges.find((s) => s.location === 'mall') ?? null

  const suburbExplore = game.explores.find((e) => e.location === 'suburb') ?? null
  const cityExplore = game.explores.find((e) => e.location === 'city') ?? null
  const mallExplore = game.explores.find((e) => e.location === 'mall') ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-slate-950 p-4 text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">地图详单</h3>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400">体力：{game.stamina}/{game.maxStamina}</div>
            <button
              type="button"
              onClick={game.closeMap}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700 active:scale-95"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MapCard title="近郊 / 恍如隔世" locationKey="suburb" npc={suburbNpc} scavenge={suburbScav} explore={suburbExplore} />
          <MapCard title="城区 / 物是人非" locationKey="city" npc={cityNpc} scavenge={cityScav} explore={cityExplore} />
          <MapCard title="购物中心 / 几近摧毁" locationKey="mall" npc={mallNpc} scavenge={mallScav} explore={mallExplore} />
        </div>
      </div>
    </div>
  )
}

/**
 * MapCard
 * 单张地图卡片，显示 NPC / 探索 / 搜刮 三类地点的入口。
 */
const MapCard: React.FC<MapCardProps> = ({ title, locationKey, npc, scavenge, explore }) => {
  const game = useGame()
  const [showNpcTrade, setShowNpcTrade] = useState(false)
  const [showScavengePanel, setShowScavengePanel] = useState(false)
  const [showExploreResult, setShowExploreResult] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleTradeOpen = () => {
    if (!npc) return
    setShowNpcTrade(true)
  }

  const handleScavenge = async () => {
    if (!scavenge) return
    if (busy) return
    setBusy(true)
    if (!game.consumeStamina(scavenge.staminaCost)) {
      alert('体力不足，无法搜刮。')
      setBusy(false)
      return
    }
    const res = game.scavenge(scavenge.id)
    setBusy(false)
    if (!res.success) {
      setShowExploreResult(res.message ?? '搜刮失败')
      return
    }
    setShowScavengePanel(true)
    // scavenge 返回 loot 显示在 panel 内
  }

  const handleExplore = () => {
    if (!explore) return
    if (busy) return
    setBusy(true)
    if (!game.consumeStamina(explore.staminaCost)) {
      alert('体力不足，无法探索。')
      setBusy(false)
      return
    }
    const res = game.explore(explore.id)
    setBusy(false)
    setShowExploreResult(res.message ?? '无事件')
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-gray-900/60 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span className="text-xs text-slate-400">{locationKey.toUpperCase()}</span>
      </div>

      <div className="mt-3 space-y-3 text-xs">
        <div className="flex items-start gap-2">
          <div className="w-10 shrink-0 text-center text-2xl">🧑‍⚖️</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{npc ? npc.name : '无交易NPC'}</div>
              <div className="text-[0.7rem] text-slate-400">交易</div>
            </div>
            <p className="mt-1 text-[0.8rem] text-slate-300">{npc ? '与商人交易物资以补给与出售多余物品。' : '该区域暂无商人。'}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleTradeOpen}
                disabled={!npc}
                className={`rounded-full px-3 py-1 text-xs ${npc ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                交易
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-10 shrink-0 text-center text-2xl">🔍</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{explore ? explore.name : '无探索点'}</div>
              <div className="text-[0.7rem] text-slate-400">探索（消耗：{explore?.staminaCost ?? '-'}）</div>
            </div>
            <p className="mt-1 text-[0.8rem] text-slate-300">{explore ? explore.description : '暂无可探索地点。'}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleExplore}
                disabled={!explore}
                className={`rounded-full px-3 py-1 text-xs ${explore ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                探索
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-10 shrink-0 text-center text-2xl">🧰</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{scavenge ? scavenge.name : '无搜刮点'}</div>
              <div className="text-[0.7rem] text-slate-400">搜刮（消耗：{scavenge?.staminaCost ?? '-'}）</div>
            </div>
            <p className="mt-1 text-[0.8rem] text-slate-300">{scavenge ? scavenge.description : '暂无可搜刮地点。'}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleScavenge}
                disabled={!scavenge}
                className={`rounded-full px-3 py-1 text-xs ${scavenge ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                搜刮
              </button>
            </div>
          </div>
        </div>

        {/* 反馈区域 */}
        {showExploreResult && (
          <div className="rounded-md border border-slate-700 bg-slate-900 p-2 text-[0.8rem] text-slate-200">
            <strong>事件：</strong>
            <div className="mt-1">{showExploreResult}</div>
            <div className="mt-2 text-right">
              <button onClick={() => setShowExploreResult(null)} className="text-xs text-sky-300">知道了</button>
            </div>
          </div>
        )}
      </div>

      {/* NPC 交易弹窗 */}
      {showNpcTrade && npc && (
        <NpcTradePanel npc={npc} onClose={() => setShowNpcTrade(false)} />
      )}

      {/* Scavenge 结果弹窗 */}
      {showScavengePanel && scavenge && (
        <ScavengePanel scavenge={scavenge} onClose={() => setShowScavengePanel(false)} />
      )}
    </div>
  )
}

/**
 * NpcTradePanelProps
 * 商人交易面板：购买 / 出售（玩家背包）
 */
const NpcTradePanel: React.FC<{ npc: NpcDefinition; onClose: () => void }> = ({ npc, onClose }) => {
  const game = useGame()
  const [message, setMessage] = useState<string | null>(null)

  const handleBuy = (itemId: string, qty = 1) => {
    const res = game.buyFromNpc(npc.id, itemId, qty)
    setMessage(res.message ?? (res.success ? '购买成功' : '购买失败'))
  }

  const handleSell = (itemId: string, qty = 1) => {
    // 售卖给 npc（如果 npc 不存在该商品也允许卖给市场）
    const res = game.sellToNpc(npc.id, itemId, qty)
    setMessage(res.message ?? (res.success ? '出售成功' : '出售失败'))
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{npc.name} 的摊位</h4>
          <button onClick={onClose} className="rounded-full bg-slate-800 px-2 py-1 text-xs">✖ 关闭</button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <div className="rounded-md border border-slate-800 bg-slate-900 p-2">
            <div className="text-[0.8rem] font-semibold">出售物品</div>
            <div className="mt-2 space-y-2">
              {npc.inventory.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-[0.7rem] text-slate-400">价格：{it.price} 元 · 库存：{it.stock}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBuy(it.id, 1)}
                      disabled={it.stock <= 0}
                      className={`rounded-full px-2 py-1 text-xs ${it.stock > 0 ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                    >
                      购买
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-900 p-2">
            <div className="text-[0.8rem] font-semibold">我的背包（出售）</div>
            <div className="mt-2 space-y-2">
              {game.inventory.length === 0 ? (
                <div className="text-slate-400">背包为空</div>
              ) : (
                game.inventory.map((it) => (
                  <div key={it.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name} x{it.qty}</div>
                      <div className="text-[0.7rem] text-slate-400">参考回收价：{it.price ? Math.floor(it.price / 2) : '不可售'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSell(it.id, 1)}
                        disabled={!it.price}
                        className={`rounded-full px-2 py-1 text-xs ${it.price ? 'bg-rose-400 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                      >
                        出售1个
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {message && (
            <div className="rounded-md bg-slate-800/60 p-2 text-slate-200">{message}</div>
          )}

          <div className="mt-2 text-right">
            <button onClick={onClose} className="rounded-full bg-sky-500 px-3 py-1.5 text-xs text-slate-900">完成</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ScavengePanel
 * 展示刚刚搜刮获得的物品（或打开后再次可查看背包中新增物）
 */
const ScavengePanel: React.FC<{ scavenge: ScavengeDefinition; onClose: () => void }> = ({ scavenge, onClose }) => {
  const game = useGame()

  // 取最近一段背包变化：为了简单，这里列出背包中与 scavenge.pool 相关的物品
  const loot = game.inventory.filter((it) => scavenge.pool.some((p) => p.id === it.id))

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">搜刮成果 — {scavenge.name}</h4>
          <button onClick={onClose} className="rounded-full bg-slate-800 px-2 py-1 text-xs">✖</button>
        </div>
        <div className="mt-3">
          <p className="text-[0.8rem] text-slate-300">你进行了搜刮，以下为你目前与该地点相关的物资（已加入背包）：</p>

          <div className="mt-2 space-y-2">
            {loot.length === 0 ? (
              <div className="text-slate-400">没有获得可识别物品（可能已被其他幸存者抢先）。</div>
            ) : (
              loot.map((l) => (
                <div key={l.id} className="flex items-center justify-between border border-slate-800 rounded p-2">
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-[0.7rem] text-slate-400">数量：{l.qty}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-right">
            <button onClick={onClose} className="rounded-full bg-sky-500 px-3 py-1.5 text-xs text-slate-900">知道了</button>
          </div>
        </div>
      </div>
    </div>
  )
} 

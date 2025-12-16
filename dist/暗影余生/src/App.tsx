/**
 * App.tsx
 * Root application component with router and global dark layout container.
 */

/**
 * App.tsx
 * 根应用：包含路由与全局 GameProvider，提供地图入口按钮用于打开地图详单。
 */

import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import { GameProvider, useGame } from './contexts/GameContext'
import React from 'react'
import { MapDetail } from './components/MapDetail'

/**
 * 内部组件：AppShell
 * 用于在页面任意位置提供“地图”快捷入口（避免修改 Home.tsx 以太多耦合）。
 */
function AppShell() {
  const game = useGame()

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-50 flex items-stretch justify-center">
      <div className="h-full w-full max-w-md mx-auto flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-xl rounded-none relative">
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </HashRouter>

        {/* 右下角固定地图按钮（响应式、始终可见） */}
        <div className="pointer-events-auto fixed bottom-6 right-6 z-50">
          <button
            onClick={() => game.openMap()}
            className="rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-slate-100 backdrop-blur-md hover:bg-sky-600/80 active:scale-95 shadow-lg"
          >
            🗺️ 地图详单
          </button>
        </div>

        {/* 地图详情模态 */}
        {game.mapOpen && <MapDetail />}
      </div>
    </div>
  )
}

/**
 * App
 * 包装 GameProvider，导出应用入口。
 */
export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}


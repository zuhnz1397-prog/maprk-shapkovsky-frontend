import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Map, List, Plus, FileText, FileSpreadsheet, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { getRKStats } from '../api/rk'
import clsx from 'clsx'

const NAV = [
  { to: '/', icon: Map, label: 'Публичная карта', external: true },
  { to: '/admin/registry', icon: List, label: 'Реестр РК', badge: true },
  { to: '/admin/registry/add', icon: Plus, label: 'Добавить РК' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { username, logout } = useAuthStore()
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getRKStats })

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            РК
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-800 leading-tight">Шпаковский МО</div>
            <div className="text-xs text-gray-400">Администратор</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Навигация
          </p>
          {NAV.map(({ to, icon: Icon, label, badge, external }) => (
            external ? (
              <a key={to} href={to} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </a>
            ) : (
              <NavLink key={to} to={to} end={to === '/admin/registry'}
                className={({ isActive }) => clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                )}>
                {({ isActive }) => (<>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && stats && (
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium',
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    )}>
                      {stats.total}
                    </span>
                  )}
                </>)}
              </NavLink>
            )
          ))}

          <div className="pt-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Экспорт
            </p>
            <a href="/api/rk/export/pdf" target="_blank"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FileText className="w-4 h-4 flex-shrink-0" />
              Реестр PDF
            </a>
            <a href="/api/rk/export/docx" target="_blank"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
              Реестр Word
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
              {username?.[0]?.toUpperCase() ?? 'А'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">{username ?? 'admin'}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}

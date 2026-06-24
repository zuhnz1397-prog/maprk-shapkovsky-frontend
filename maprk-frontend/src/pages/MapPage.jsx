import { useRef, useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import maplibregl from 'maplibre-gl'
import { Search, Filter, X, FileText, ChevronDown, Download, Settings } from 'lucide-react'
import { getMapData } from '../api/rk'
import { getColor, makeMarkerSVG, RK_TYPES, TYPE_OPTIONS } from '../utils/rkTypes'
import clsx from 'clsx'

// ── Coat of arms (embedded) ─────────────────────────────────────
const COAT_URL = '/static/coat.png' // Положите герб в static папку бэкенда

export default function MapPage() {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [zoom, setZoom] = useState(11)
  const [passportOpen, setPassportOpen] = useState(false)

  const { data: allRK = [] } = useQuery({
    queryKey: ['map-data'],
    queryFn: getMapData,
    staleTime: 60_000,
  })

  // Filtered data
  const filtered = allRK.filter(rk => {
    if (typeFilter && rk.type_rk !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!rk.rk_id.toLowerCase().includes(q) && !rk.address.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Init map
  useEffect(() => {
    if (mapRef.current) return
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [42.0, 45.09],
      zoom: 11,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('zoom', () => setZoom(Math.round(map.getZoom())))
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Rebuild markers when data or filter changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    if (!map._loaded) { map.once('load', () => rebuildMarkers()); return }
    rebuildMarkers()
  }, [filtered, zoom])

  const rebuildMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    // Remove old
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const showLabel = zoom >= 15
    filtered.forEach(rk => {
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer'
      el.innerHTML = makeMarkerSVG(rk.type_rk, false, zoom) +
        (showLabel ? `<div style="font-size:${zoom<=15?11:zoom<=16?13:15}px;font-weight:700;color:#1a3a5c;background:rgba(255,255,255,.93);padding:1px ${zoom<=15?'4px':'6px'};border-radius:3px;border:1px solid rgba(0,0,0,.12);white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,.15);line-height:1.3">${rk.rk_id}</div>` : '')

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelected(rk)
        map.flyTo({ center: [rk.lon, rk.lat], zoom: Math.max(map.getZoom(), 16), duration: 500 })
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([rk.lon, rk.lat])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [filtered, zoom])

  // Fit bounds when filter changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || filtered.length === 0) return
    if (filtered.length === allRK.length) return // Don't refit when showing all
    const bounds = new maplibregl.LngLatBounds()
    filtered.forEach(rk => bounds.extend([rk.lon, rk.lat]))
    map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 })
  }, [typeFilter, search])

  const resetFilters = () => { setSearch(''); setTypeFilter('') }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 bg-brand-700 text-white px-4 py-2.5 flex items-center gap-3 shadow-lg z-10">
        <img src={COAT_URL} height="36" alt="Герб" className="h-9 drop-shadow"
          onError={e => e.target.style.display='none'} />
        <div>
          <h1 className="text-sm font-semibold leading-tight">
            Карта рекламных конструкций
          </h1>
          <p className="text-brand-200 text-xs">Шпаковский муниципальный округ</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-white/10 border border-white/20 px-3 py-1 rounded-full text-brand-100">
            г. Михайловск
          </span>
          <a href="/admin" className="text-xs bg-white/10 border border-white/20 px-3 py-1 rounded-full text-brand-100 hover:bg-white/20 transition-colors flex items-center gap-1">
            <Settings className="w-3 h-3" /> Админ
          </a>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm z-10">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Фильтр</span>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="input py-1.5 text-sm max-w-[180px]">
          <option value="">Все виды РК</option>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по № или адресу..." className="input pl-8 py-1.5 text-sm w-52" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {(search || typeFilter) && (
          <button onClick={resetFilters} className="btn btn-sm text-gray-500">
            <X className="w-3.5 h-3.5" /> Сбросить
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            {filtered.length} объектов
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />

          {/* Legend */}
          <div className="absolute bottom-8 left-3 bg-white/95 backdrop-blur rounded-xl border border-gray-200 p-3 shadow-lg z-10">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Типы конструкций</p>
            {Object.entries(RK_TYPES).filter(([k]) => k !== 'Прочее').map(([key, { color, label }]) => (
              <button key={key}
                onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
                className={clsx(
                  'flex items-center gap-2 text-xs py-0.5 w-full text-left transition-opacity rounded px-1',
                  typeFilter && typeFilter !== key ? 'opacity-30' : 'opacity-100 hover:bg-gray-50'
                )}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        {selected && (
          <div className="w-72 flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Описание объекта</span>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full mb-2">
                РК № {selected.rk_id}
              </div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 leading-snug">{selected.address}</h2>

              <div className="space-y-1.5 mb-3">
                {[
                  ['Тип', selected.type_adv],
                  ['Вид РК', selected.type_rk],
                  ['Размер', selected.size ? `${selected.size} м` : '—'],
                  ['Площадь', selected.area ? `${selected.area} м²` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-400 w-24 flex-shrink-0">{k}</span>
                    <span className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                      {k === 'Вид РК' && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getColor(v) }} />
                      )}
                      {v || '—'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg px-3 py-2 font-mono text-xs text-gray-500 mb-3 flex items-center gap-2">
                <span>📍</span>
                <span>{selected.lat?.toFixed(7)}, {selected.lon?.toFixed(7)}</span>
              </div>

              {selected.note && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mb-3">
                  {selected.note}
                </div>
              )}

              {selected.has_passport ? (
                <a href={`/api/rk/${selected.id}/passport/pdf`} target="_blank" rel="noreferrer"
                  className="btn btn-primary w-full justify-center py-2.5 text-sm">
                  <FileText className="w-4 h-4" />
                  Открыть паспорт РК
                </a>
              ) : (
                <div className="w-full py-2.5 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  Паспорт не предусмотрен
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

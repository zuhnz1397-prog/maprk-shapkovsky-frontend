import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Trash2, Edit, FileText, Download, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRKList, getRKStats, deleteRK, downloadPassport, downloadBlob } from '../api/rk'
import { getColor, TYPE_OPTIONS } from '../utils/rkTypes'
import clsx from 'clsx'

export default function AdminRegistry() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(0)
  const LIMIT = 50

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rk-list', search, typeFilter, page],
    queryFn: () => getRKList({ search, type_rk: typeFilter, skip: page * LIMIT, limit: LIMIT }),
  })

  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getRKStats })

  const deleteMut = useMutation({
    mutationFn: deleteRK,
    onSuccess: () => { toast.success('РК удалена'); qc.invalidateQueries(['rk-list']); qc.invalidateQueries(['stats']) },
    onError: () => toast.error('Ошибка удаления'),
  })

  const handleDelete = (pk, rkId) => {
    if (!confirm(`Удалить РК ${rkId}? Это действие нельзя отменить.`)) return
    deleteMut.mutate(pk)
  }

  const handlePassport = async (pk, rkId) => {
    try {
      const blob = await downloadPassport(pk)
      downloadBlob(blob, `паспорт_${rkId}.pdf`)
    } catch {
      toast.error('Ошибка загрузки паспорта')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Реестр рекламных конструкций</h1>
          <p className="text-sm text-gray-500 mt-0.5">Шпаковский муниципальный округ</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="btn btn-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => navigate('/admin/registry/add')} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Добавить РК
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 flex-shrink-0">
          {[
            { label: 'Всего РК', value: stats.total, color: 'text-brand-600' },
            { label: 'С паспортом', value: stats.with_passport, color: 'text-green-600' },
            { label: 'Без паспорта', value: stats.without_passport, color: 'text-red-500' },
            ...Object.entries(stats.by_type).slice(0,3).map(([k,v]) => ({ label: k, value: v, color: 'text-gray-700' }))
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={clsx('text-xl font-semibold', color)}>{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Поиск по № или адресу..."
            className="input pl-8 py-1.5 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <select
            value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0) }}
            className="input pl-8 py-1.5 text-sm pr-8 appearance-none"
          >
            <option value="">Все виды</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button onClick={() => { setSearch(''); setTypeFilter(''); setPage(0) }}
          className="btn btn-sm text-gray-500">Сбросить</button>
        <span className="ml-auto text-xs text-gray-400">{data?.total ?? 0} объектов</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Загрузка...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {['№ РК','Адрес','Вид','Размер','Площадь','Координаты','Паспорт',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items?.map(rk => (
                <tr key={rk.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-3 py-2.5 font-semibold text-brand-700 whitespace-nowrap">{rk.rk_id}</td>
                  <td className="px-3 py-2.5 max-w-[200px]">
                    <span className="truncate block text-gray-700" title={rk.address}>{rk.address}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="badge text-xs" style={{
                      background: getColor(rk.type_rk) + '18',
                      color: getColor(rk.type_rk)
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: getColor(rk.type_rk) }} />
                      {rk.type_rk}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{rk.size || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{rk.area || '—'} м²</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {rk.lat?.toFixed(5)}, {rk.lon?.toFixed(5)}
                  </td>
                  <td className="px-3 py-2.5">
                    {rk.passport_path ? (
                      <button onClick={() => handlePassport(rk.id, rk.rk_id)}
                        className="text-brand-600 hover:text-brand-800 transition-colors"
                        title="Скачать паспорт">
                        <Download className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/admin/registry/${rk.id}/edit`)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(rk.id, rk.rk_id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.total > LIMIT && (
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-gray-500">
            Показано {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, data.total)} из {data.total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn btn-sm">Назад</button>
            <button onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * LIMIT >= data.total} className="btn btn-sm">Вперёд</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createRK, uploadPhoto, uploadScheme } from '../api/rk'
import RKForm from '../components/admin/RKForm'

export default function AdminAddRK() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const mut = useMutation({
    mutationFn: async (formData) => {
      const { _photoFile, _schemeFile, ...data } = formData
      // 1. Создаём РК
      const rk = await createRK(data)
      // 2. Загружаем файлы если есть
      if (_photoFile)  await uploadPhoto(rk.id, _photoFile)
      if (_schemeFile) await uploadScheme(rk.id, _schemeFile)
      return rk
    },
    onSuccess: (rk) => {
      toast.success(`РК ${rk.rk_id} создана! Паспорт сгенерирован автоматически.`)
      qc.invalidateQueries(['rk-list'])
      qc.invalidateQueries(['stats'])
      navigate('/admin/registry')
    },
    onError: (err) => {
      const msg = err.response?.data?.detail ?? 'Ошибка создания РК'
      toast.error(msg)
    }
  })

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/admin/registry')}
          className="btn btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Реестр
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-base font-semibold text-gray-900">Добавить новую РК</h1>
        <div className="ml-auto text-xs text-gray-400">
          После сохранения паспорт PDF сгенерируется автоматически
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-hidden">
        <RKForm onSubmit={mut.mutate} loading={mut.isPending} />
      </div>
    </div>
  )
}

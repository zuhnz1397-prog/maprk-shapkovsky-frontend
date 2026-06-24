import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRK, updateRK, uploadPhoto, uploadScheme } from '../api/rk'
import RKForm from '../components/admin/RKForm'

export default function AdminEditRK() {
  const { pk } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: rk, isLoading } = useQuery({
    queryKey: ['rk-detail', pk],
    queryFn: () => getRK(pk),
  })

  const mut = useMutation({
    mutationFn: async (formData) => {
      const { _photoFile, _schemeFile, rk_id, num, ...updateData } = formData
      // 1. Обновляем данные
      let updated = await updateRK(pk, updateData)
      // 2. Загружаем новые файлы если выбраны
      if (_photoFile)  updated = await uploadPhoto(pk, _photoFile)
      if (_schemeFile) updated = await uploadScheme(pk, _schemeFile)
      return updated
    },
    onSuccess: (data) => {
      toast.success(`РК ${data.rk_id} обновлена! Паспорт перегенерирован.`)
      qc.invalidateQueries(['rk-list'])
      qc.invalidateQueries(['rk-detail', pk])
      navigate('/admin/registry')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail ?? 'Ошибка обновления')
    }
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-40 text-gray-400">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Загрузка...
    </div>
  )

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/admin/registry')} className="btn btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Реестр
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-base font-semibold text-gray-900">
          Редактировать РК № {rk?.rk_id}
        </h1>
        <div className="ml-auto text-xs text-gray-400">
          Паспорт будет перегенерирован автоматически
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {rk && <RKForm defaultValues={rk} onSubmit={mut.mutate} loading={mut.isPending} />}
      </div>
    </div>
  )
}

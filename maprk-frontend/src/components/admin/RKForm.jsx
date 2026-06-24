import { useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Upload, X, MapPin, Image, Map } from 'lucide-react'
import clsx from 'clsx'
import { TYPE_OPTIONS } from '../../utils/rkTypes'
import MapPicker from './MapPicker'

const COMPLIANCE_OPTIONS = [
  'ИТ',
  'Не соответствует ОДМ 218.4.040-2019',
  '—',
]

function DropZone({ label, icon: Icon, accept, onFile, preview, hint }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept, maxFiles: 1, onDrop: files => files[0] && onFile(files[0])
  })
  return (
    <div>
      <p className="label">{label}</p>
      <div {...getRootProps()} className={clsx(
        'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
      )}>
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="" className="max-h-32 mx-auto rounded object-cover" />
            <span className="text-xs text-green-600 mt-1 block">✓ Файл выбран</span>
          </div>
        ) : (
          <>
            <Icon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function RKForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: defaultValues ?? {
      type_adv: 'Наружная реклама',
      compliance: 'ИТ',
    }
  })

  const [photoFile, setPhotoFile] = useState(null)
  const [schemeFile, setSchemeFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [schemePreview, setSchemePreview] = useState(null)

  const lat = watch('lat')
  const lon = watch('lon')

  const handlePhotoFile = (file) => {
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }
  const handleSchemeFile = (file) => {
    setSchemeFile(file)
    setSchemePreview(URL.createObjectURL(file))
  }

  const handleMapClick = useCallback(({ lat, lng }) => {
    setValue('lat', lat.toFixed(8))
    setValue('lon', lng.toFixed(8))
  }, [setValue])

  const submit = (data) => {
    onSubmit({
      ...data,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      num: parseInt(data.num),
      _photoFile: photoFile,
      _schemeFile: schemeFile,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex gap-0 h-full">
      {/* Left — form fields */}
      <div className="w-[400px] flex-shrink-0 overflow-y-auto border-r border-gray-200 p-5 space-y-5 bg-white">

        {/* Основные данные */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b">
            Основные данные
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">№ РК <span className="text-red-500">*</span></label>
              <input {...register('rk_id', { required: 'Укажите № РК' })}
                className="input" placeholder="Б735" />
              {errors.rk_id && <p className="text-red-500 text-xs mt-0.5">{errors.rk_id.message}</p>}
            </div>
            <div>
              <label className="label">№ п/п <span className="text-red-500">*</span></label>
              <input {...register('num', { required: true, valueAsNumber: true })}
                type="number" className="input" placeholder="735" />
            </div>
          </div>

          <div className="mt-3">
            <label className="label">Тип конструкции</label>
            <select {...register('type_adv')} className="input">
              <option>Наружная реклама</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="label">Вид РК <span className="text-red-500">*</span></label>
            <select {...register('type_rk', { required: 'Выберите вид' })} className="input">
              <option value="">— Выберите —</option>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.type_rk && <p className="text-red-500 text-xs mt-0.5">{errors.type_rk.message}</p>}
          </div>

          <div className="mt-3">
            <label className="label">Адрес <span className="text-red-500">*</span></label>
            <input {...register('address', { required: 'Укажите адрес' })}
              className="input" placeholder="г. Михайловск, ул. Ленина, 1" />
            {errors.address && <p className="text-red-500 text-xs mt-0.5">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <label className="label">Высота, м</label>
              <input {...register('size')} className="input" placeholder="3*6*2" />
            </div>
            <div>
              <label className="label">Площадь, м²</label>
              <input {...register('area')} className="input" placeholder="36" />
            </div>
            <div>
              <label className="label">Соответствие</label>
              <select {...register('compliance')} className="input text-xs">
                {COMPLIANCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="label">Правоустанавливающий документ</label>
            <input {...register('legal_doc')} className="input" placeholder="—" />
          </div>

          <div className="mt-3">
            <label className="label">Примечание</label>
            <textarea {...register('note')} rows={3} className="input resize-none"
              placeholder="Дополнительная информация..." />
          </div>
        </section>

        {/* Координаты МСК */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b">
            Координаты МСК
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">X (север)</label>
              <input {...register('msk_x')} className="input font-mono text-xs" placeholder="486988" />
            </div>
            <div>
              <label className="label">Y (восток)</label>
              <input {...register('msk_y')} className="input font-mono text-xs" placeholder="1316796" />
            </div>
          </div>
        </section>

        {/* Файлы */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b">
            Фото и схема
          </h3>
          <div className="space-y-3">
            <DropZone
              label="Фото объекта" icon={Image}
              accept={{ 'image/*': ['.jpg','.jpeg','.png'] }}
              onFile={handlePhotoFile} preview={photoPreview}
              hint="JPG, PNG до 10 МБ"
            />
            <DropZone
              label="Схема расположения" icon={Map}
              accept={{ 'image/*': ['.jpg','.jpeg','.png'], 'application/pdf': ['.pdf'] }}
              onFile={handleSchemeFile} preview={schemePreview}
              hint="JPG, PNG, PDF"
            />
          </div>
        </section>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="btn btn-primary w-full justify-center py-2.5">
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Сохранение...' : 'Сохранить РК'}
        </button>
      </div>

      {/* Right — map picker */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-medium text-gray-700">Укажите расположение на карте</span>
          <span className="ml-auto font-mono text-xs text-gray-500">
            {lat && lon ? `${parseFloat(lat).toFixed(6)}, ${parseFloat(lon).toFixed(6)}` : 'Кликните по карте'}
          </span>
        </div>

        {/* Coordinate inputs */}
        <div className="px-4 py-2 bg-white border-b border-gray-100 flex gap-3">
          <div className="flex-1">
            <label className="label">Широта (lat) <span className="text-red-500">*</span></label>
            <input {...register('lat', { required: 'Укажите координаты на карте' })}
              className="input font-mono text-xs" placeholder="45.1186..." />
          </div>
          <div className="flex-1">
            <label className="label">Долгота (lon) <span className="text-red-500">*</span></label>
            <input {...register('lon', { required: true })}
              className="input font-mono text-xs" placeholder="41.9608..." />
          </div>
        </div>
        {errors.lat && (
          <div className="px-4 py-1 bg-red-50 text-red-600 text-xs border-b border-red-100">
            {errors.lat.message}
          </div>
        )}

        <div className="flex-1">
          <MapPicker
            lat={lat ? parseFloat(lat) : null}
            lon={lon ? parseFloat(lon) : null}
            onMapClick={handleMapClick}
          />
        </div>
      </div>
    </form>
  )
}

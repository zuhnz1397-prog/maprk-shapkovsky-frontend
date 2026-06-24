import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock, User, LogIn } from 'lucide-react'
import { login } from '../api/rk'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setToken = useAuthStore(s => s.setToken)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ username, password }) => {
    setLoading(true)
    try {
      const data = await login(username, password)
      setToken(data.access_token, username)
      toast.success('Добро пожаловать!')
      navigate('/admin/registry')
    } catch {
      toast.error('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-800 to-brand-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Вход в систему</h1>
          <p className="text-brand-200 text-sm mt-1">Карта РК Шпаковского МО</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Логин</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('username', { required: true })}
                  className="input pl-9"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">Введите логин</p>}
            </div>

            <div>
              <label className="label">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password', { required: true })}
                  type="password"
                  className="input pl-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">Введите пароль</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            <a href="/" className="hover:text-brand-600">← Вернуться на карту</a>
          </p>
        </div>
      </div>
    </div>
  )
}

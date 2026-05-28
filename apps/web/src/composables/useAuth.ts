import { ref } from 'vue'
import { clearAccessToken, getAccessToken, loginUser, registerUser, fetchProfile } from '../services/api'
import { identifyUser, resetAnalyticsUser, trackEvent } from '../analytics/useAnalytics'
import type { AuthUser } from '../types'

export function useAuth() {
  const currentUser = ref<AuthUser | null>(null)
  const authMode = ref<'login' | 'register'>('login')
  const authLoading = ref(false)
  const authForm = ref({ name: '', email: '', password: '' })
  const authError = ref('')

  function toggleAuthMode() {
    authMode.value = authMode.value === 'login' ? 'register' : 'login'
    authError.value = ''
  }

  async function submitAuth(): Promise<boolean> {
    if (!authForm.value.email.trim() || !authForm.value.password.trim()) return false

    authLoading.value = true
    authError.value = ''

    try {
      const session = authMode.value === 'login'
        ? await loginUser({ email: authForm.value.email, password: authForm.value.password })
        : await registerUser({ email: authForm.value.email, password: authForm.value.password, name: authForm.value.name })

      currentUser.value = session.user
      identifyUser(session.user)
      trackEvent(authMode.value === 'login' ? 'login_completed' : 'registration_completed', {
        premiumTier: session.user.premiumTier
      })
      authForm.value = { name: '', email: '', password: '' }
      return true
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Не вдалося авторизуватись'
      return false
    } finally {
      authLoading.value = false
    }
  }

  function logout() {
    trackEvent('logout_clicked')
    clearAccessToken()
    resetAnalyticsUser()
    currentUser.value = null
  }

  async function restoreSession() {
    if (getAccessToken()) {
      try {
        currentUser.value = await fetchProfile()
        identifyUser(currentUser.value)
        return true
      } catch {
        clearAccessToken()
      }
    }
    return false
  }

  return {
    currentUser,
    authMode,
    authLoading,
    authForm,
    authError,
    submitAuth,
    logout,
    toggleAuthMode,
    restoreSession
  }
}

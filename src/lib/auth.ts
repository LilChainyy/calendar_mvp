export function generateUserId(): string {
  return `user_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
}

export function getUserIdFromCookie(): string | null {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  const userCookie = cookies.find(c => c.trim().startsWith('userId='))

  if (userCookie) {
    return userCookie.split('=')[1]
  }

  return null
}

export function setUserIdCookie(userId: string) {
  if (typeof window === 'undefined') return

  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)

  document.cookie = `userId=${userId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export function ensureUserId(): string {
  let userId = getUserIdFromCookie()

  if (!userId) {
    userId = generateUserId()
    setUserIdCookie(userId)
  }

  return userId
}

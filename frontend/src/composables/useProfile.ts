import { ref } from 'vue'

export const useProfile = () => {
  const currentUser = ref<any>(null)
  const photoRefreshKey = ref(0)

  const initializeProfile = () => {
    const user = localStorage.getItem('user')
    if (user) {
      currentUser.value = JSON.parse(user)
    }
  }

  const updateUserPhoto = (updatedUser: any) => {
    // Update currentUser
    currentUser.value = updatedUser
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // Increment refresh key to force image reload
    photoRefreshKey.value++
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('userPhotoUpdated'))
  }

  const getPhotoUrl = () => {
    if (!currentUser.value?.photo) return null
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002'
    // Add timestamp to prevent caching
    return `${apiUrl}${currentUser.value.photo}?t=${photoRefreshKey.value}`
  }

  return {
    currentUser,
    photoRefreshKey,
    initializeProfile,
    updateUserPhoto,
    getPhotoUrl
  }
}

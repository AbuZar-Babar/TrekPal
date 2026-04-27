import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Room {
  id: string
  type: string
  price: number
  capacity: number
  quantity: number
  amenities: string[]
  images: string[]
}

export interface HotelService {
  id: string
  name: string
  price: number
}

export interface HotelProfile {
  id: string
  name: string
  description: string | null
  address: string
  city: string
  country: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  images: string[]
  amenities: string[]
  rooms: Room[]
  services: HotelService[]
}

export const hotelApi = {
  getProfile: async () => {
    // For hotels, GET /hotels returns only their hotel if role is HOTEL
    const response = await api.get('/hotels')
    return response.data.data.hotels[0] as HotelProfile
  },

  updateProfile: async (data: Partial<HotelProfile>) => {
    const profile = await hotelApi.getProfile()
    const response = await api.put(`/hotels/${profile.id}`, data)
    return response.data.data
  },

  // Rooms
  addRoom: async (data: Partial<Room>) => {
    const profile = await hotelApi.getProfile()
    const response = await api.post(`/hotels/${profile.id}/rooms`, data)
    return response.data.data
  },

  updateRoom: async (roomId: string, data: Partial<Room>) => {
    const response = await api.put(`/hotels/rooms/${roomId}`, data)
    return response.data.data
  },

  deleteRoom: async (roomId: string) => {
    await api.delete(`/hotels/rooms/${roomId}`)
  },

  // Services
  addService: async (data: { name: string; price: number }) => {
    const profile = await hotelApi.getProfile()
    const response = await api.post(`/hotels/${profile.id}/services`, data)
    return response.data.data
  },

  updateService: async (serviceId: string, data: { name?: string; price?: number }) => {
    const response = await api.put(`/hotels/services/${serviceId}`, data)
    return response.data.data
  },

  deleteService: async (serviceId: string) => {
    await api.delete(`/hotels/services/${serviceId}`)
  },

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/hotels/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data.url
  },
}

export default api

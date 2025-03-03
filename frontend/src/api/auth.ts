import client from './client'
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth'

async function getCsrfCookie(): Promise<void> {
  await client.get('/sanctum/csrf-cookie')
}

export async function login(credentials: LoginCredentials): Promise<User> {
  await getCsrfCookie()
  const { data } = await client.post<User>('/api/login', credentials)
  return data
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  await getCsrfCookie()
  const { data } = await client.post<User>('/api/register', credentials)
  return data
}

export async function logout(): Promise<void> {
  await client.post('/api/logout')
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<User>('/api/me')
  return data
}

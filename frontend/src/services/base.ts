import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

// 开发模式下 Vite proxy 处理 /api 转发，baseURL 留空即可
// 生产模式（Electron file:// 协议）下需要指定后端完整地址
const isElectronProd = typeof window !== 'undefined'
  && (window as any).electronAPI?.isElectron
  && window.location.protocol === 'file:'

const instance: AxiosInstance = axios.create({
  baseURL: isElectronProd ? 'http://localhost:8080' : '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/** 错误预处理 */
const errorPreHandler = (error: any): void => {
  if (error?.response) {
    const { status } = error.response
    if (status === 401) {
      console.error('GitLab 认证失败，请检查访问令牌')
      return
    }
    if (status === 403) {
      console.error('没有权限访问该资源')
      return
    }
  }
  console.error('请求失败:', error?.message ?? '未知错误')
}

/** GET 请求 */
export const get = async <T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T> => {
  try {
    const res: AxiosResponse<T> = await instance.get(url, { params })
    return res.data
  } catch (error) {
    errorPreHandler(error)
    throw error
  }
}

/** POST 请求 */
export const post = async <T = any>(
  url: string,
  data?: Record<string, any>
): Promise<T> => {
  try {
    const res: AxiosResponse<T> = await instance.post(url, data)
    return res.data
  } catch (error) {
    errorPreHandler(error)
    throw error
  }
}

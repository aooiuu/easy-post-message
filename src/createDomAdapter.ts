import type { IAdapter, IMessage } from './types'

const createAdapter: IAdapter = () => {
  return {

    /**
     * 发送消息
     * @param target
     * @param data
     * @returns
     */
    postMessage: (target, data) => target.postMessage(data, {
      targetOrigin: '*',
    }),

    /**
     * 添加事件监听器
     * @param {Function} callback 回调函数
     * @returns {Function} 销毁监听器
     */
    addMessageListener: (callback: (arg: { data: IMessage; source: Window }) => void): () => void => {
      const cb = (arg: any) => {
        callback({
          data: arg.data,
          source: arg.source as Window, // source.postMessage
        })
      }
      window.addEventListener('message', cb)

      return () => {
        window.removeEventListener('message', cb)
      }
    },
  }
}

export default createAdapter

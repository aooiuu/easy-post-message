import type { IAdapter, IMessage } from '../types'

const MChannel = 'EasyPostMessage'

const Adapter: IAdapter = () => {
  let ipc: any
  // @ts-ignore
  const isRenderer = process.type === 'renderer'

  if (isRenderer)
    ipc = window.require('electron').ipcRenderer

  else
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    ipc = require('electron').ipcMain

  return {
    /**
     * 发送消息
     * @param target
     * @param data
     * @returns
     */
    postMessage: (win, data) => {
      if (isRenderer) {
        ipc.send(MChannel, data)
      }
      else {
        if (win.postMessage)
          win.postMessage(data)

        else
          win.webContents.send(MChannel, data)
      }
    },

    /**
     * 添加事件监听器
     * @param {Function} callback 回调函数
     * @returns {Function} 销毁监听器
     */
    addMessageListener: (callback: (arg: { data: IMessage; source: any }) => void): (() => void) => {
      const handle = (event: any, data: any) => {
        callback({
          data,
          source: {
            postMessage: (arg: any) => event.sender.send(MChannel, arg),
          }, // source.postMessage
        })
      }

      ipc.on(MChannel, handle)
      return () => {
        ipc.off(MChannel, handle)
      }
    },
  }
}

export default Adapter

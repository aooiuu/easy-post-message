import mitt from 'mitt'
import type {
  Emitter,
  Event,
  EventData,
  EventType,
  IAdapterValue,
  IMessage,
} from './types'
import Adapter from './adapter/dom-adapter'

export * from './types'

export default class EasyPostMessage {
  private _seq: number
  private _mitt: Emitter<Record<EventType, EventData>>
  private _answer: any
  private _adapter: IAdapterValue
  private _destroy: (() => void) | null

  constructor(adapter = Adapter) {
    this._seq = 0
    this._answer = {}
    this._mitt = mitt()
    this._adapter = adapter()

    this._destroy = this._adapter.addMessageListener(
      ({ data: playload, source }) => {
        if (!playload.__IframeMessage)
          return

        if (playload.seq) {
          if (this._answer[playload.seq]) {
            this._answer[playload.seq].resolve(playload.data)
            delete this._answer[playload.seq]
          }
          else {
            this._mitt.emit(playload.event, {
              data: playload.data,
              seq: playload.seq,
              source,
            })
          }
        }
        else {
          this._mitt.emit(playload.event, { data: playload.data, source })
        }
      },
    )
  }

  /**
   * 销毁 清除监听器
   */
  destroy() {
    if (typeof this._destroy === 'function') {
      this._destroy()
      this._destroy = null
      this._answer = {}
      this._mitt.off('*')
    }
  }

  /**
   * 监听事件
   * @param {string | symbol} event 事件类型
   * @param {Function} callback 回调函数
   */
  on(event: Event, callback: (arg: EventData) => void) {
    this._mitt.on(event, callback)
  }

  /**
   * 移除自定义事件监听器
   * @param {string | symbol} event 事件类型
   * @param {Function} callback 回调函数
   */
  off(event: Event, callback: (arg: EventData) => void) {
    this._mitt.off(event, callback)
  }

  /**
   * 发送事件
   * @param {string | symbol} event 事件类型
   * @param {Object} data
   * @param {Window} target 发送对象
   */
  emit(event: Event, data: any, target?: Window | unknown) {
    this._adapter.postMessage(target, {
      __IframeMessage: true,
      event,
      data,
    } as IMessage)
  }

  /**
   * 发送事件, 可以接收参数
   * @param {string | symbol} event 事件类型
   * @param {Object} data
   * @param {Window} target 发送对象
   * @returns {Promise}
   */
  send(event: Event, data: any, target?: Window | unknown): Promise<any> {
    this._seq++

    return new Promise((resolve, reject) => {
      this._answer[this._seq] = {
        resolve,
        reject,
      }

      this._adapter.postMessage(target, {
        __IframeMessage: true,
        seq: this._seq,
        event,
        data,
      } as IMessage)
    })
  }

  /**
   * 监听事件, 可以返回参数
   * @param {string | symbol} event 事件类型
   * @param {Function} callback 回调函数
   */
  answer(event: Event, callback: (data: any) => void) {
    const errorType = Symbol('error')
    this._mitt.on(event, async ({ data, source, seq }) => {
      let ret: any = callback(data)
      if (ret instanceof Promise)
        ret = await ret.then(e => e).catch(() => errorType)
      if (ret !== errorType) {
        this._adapter.postMessage(
          source as Window,
          {
            __IframeMessage: true,
            seq,
            event,
            data: ret,
          } as IMessage,
        )
      }
    })
  }
}

# EasyPostMessage

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]

`postMessage` + `mitt` 支持返回值, 支持自定义 adapter

- 一组和 `mitt` 类似的方法: `emit`、`on`、`off`
- 一组 `Promise` 风格传递数据的方法: `send`、`answer`
- 多端支持: 浏览器、electron、自定义

## Usage

完整例子: `docs\index.html`

```sh
npm i easy-post-message
```

```javascript
import EasyPostMessage from 'easy-post-message';

const pm = new EasyPostMessage();

// 监听 event1 事件
pm.on('event1', ({ data, source }) => consle.log({ data, source }));

// 监听 event2 事件
pm.on('event2', ({ data, source }) => consle.log({ data, source }));

// 向 window.top 发送事件
pm.emit('event1', data, window.top);

// 监听 event10 事件 并返回数据
pm.answer('event10', (data) => {
  return 'answer val';
});

pm.answer('event11', async (data) => {
  return Promise.resolve('answer xxx');
});

// 向 window.top 发送事件, 并接收返回值
consle.log(await pm.send('event10', data, window.top));
```

## Methods

```typescript
/**
 * 监听事件
 * @param {string | symbol} event 事件类型
 * @param {Function} callback 回调函数
 */
on(event: Event, callback: (arg: EventData) => void): void;

/**
 * 移除自定义事件监听器
 * @param {string | symbol} event 事件类型
 * @param {Function} callback 回调函数
 */
off(event: Event, callback: (arg: EventData) => void): void;

/**
 * 发送事件
 * @param {string | symbol} event 事件类型
 * @param {Object} data
 * @param {Window} target 发送对象
 */
emit(event: Event, data: any, target?: Window | unknown): void;

/**
 * 发送事件, 可以接收参数
 * @param {string | symbol} event 事件类型
 * @param {Object} data
 * @param {Window} target 发送对象
 * @returns {Promise}
 */
send(event: Event, data: any, target?: Window | unknown): Promise<any>;

/**
 * 监听事件, 可以返回参数
 * @param {string | symbol} event 事件类型
 * @param {Function} callback 回调函数
 */
answer(event: Event, callback: (data: any) => void): void;
```

## Adapter

默认 adapter 是基于浏览器的 `window.postMessage`, 你也可以自定义 adapter 用以支持其他平台

```javascript
new EasyPostMessage(Adapter);
```

### Electron

基于 `ipcMain` 和 `ipcRenderer`, main 进程发送消息时需要指定窗口

```javascript
import EasyPostMessage from 'easy-post-message';
import Adapter from 'easy-post-message/electron-adapter';

const pm = new EasyPostMessage(Adapter);

// main
const win = new BrowserWindow(/** */);
pm.emit('a', data, win);
pm.on('b', () => {});

pm.send('c', data, win);
pm.answer('d', () => {
  return 'xx';
});

// renderer
pm.emit('b', data);
pm.on('a', () => {});

pm.send('d', data);
pm.answer('c', () => {
  return 'xx';
});
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/easy-post-message?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/easy-post-message
[bundle-src]: https://img.shields.io/bundlephobia/minzip/easy-post-message?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=easy-post-message
[jsdocs-src]: https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&colorA=18181B&colorB=F0DB4F
[jsdocs-href]: https://www.jsdocs.io/package/easy-post-message

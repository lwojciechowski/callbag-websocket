# callbag-websocket

Callbag sink and listenable source that connects using [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) interface.

Read more about Callbag standard [here](https://github.com/callbag/callbag).

## Example

```js
import websocket from 'callbag-websocket';
import observe from 'callbag-observe';

let ws = websocket('ws://demos.kaazing.com/echo');
let i = 0;
setInterval(() => {
  ws(1, 'msg' + i++);
}, 1000);

observe(msg => console.log('obs1', msg.data))(ws);

setTimeout(() => {
  observe(msg => console.log('obs2', msg.data))(ws);
}, 2500);

// OUTPUT:
// obs1 msg0
// obs1 msg1
// obs1 msg2
// obs2 msg2
// obs1 msg3
// obs2 msg3
// ...
```

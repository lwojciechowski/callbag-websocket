export default function websocket(url, protocol) {
  let sinks = [];
  let isConnected = false;
  let ws = null;

  function sendToSinks(type, data) {
    const zinkz = sinks.slice(0);

    zinkz.forEach(sink => {
      if (sinks.indexOf(sink) > -1) {
        sink(type, data);
      }
    });
  }

  return (type, data) => {
    if (type === 0) {
      const sink = data;
      sinks.push(sink);

      if (!isConnected) {
        ws = new WebSocket(url, protocol);

        ws.onopen = () => {
          isConnected = true;
        };

        ws.onmessage = msg => {
          sendToSinks(1, msg);
        };

        ws.onclose = err => {
          sendToSinks(2, err.wasClean ? null : err);
        };
      }

      sink(0, t => {
        if (t === 2) {
          const i = sinks.indexOf(sink);
          if (i > -1) {
            sinks.splice(i, 1);
          }

          if (sinks.length === 0 && ws.readyState === 1) {
            ws.close();
          }
        }
      });
    } else {
      if (ws.readyState === 1) {
        ws.send(data);
      }
    }
  };
}

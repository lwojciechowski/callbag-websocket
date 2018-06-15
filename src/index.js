export const websocketFactory = WebSocket => (url, protocol) => {
  const sinks = [];
  const buffer = [];
  let ws = null;

  function sendToSinks(type, data) {
    const zinkz = sinks.slice(0);

    zinkz.forEach(sink => {
      if (sinks.indexOf(sink) > -1) {
        sink(type, data);
      }
    });
  }

  function sendToWs(data) {
    if (ws && ws.readyState === 1) {
      ws.send(data);
    } else {
      buffer.push(data);
    }
  }

  function connectWs() {
    if (!ws) {
      ws = new WebSocket(url, protocol);

      ws.onopen = () => {
        let data;
        while ((data = buffer.pop())) {
          ws.send(data);
        }
      };

      ws.onmessage = msg => {
        sendToSinks(1, msg);
      };

      ws.onclose = err => {
        sendToSinks(2, err.wasClean ? null : err);
      };
    }
  }

  function disconnectWs() {
    if (ws && ws.readyState === 1) {
      ws.close();
      ws = null;
    }
  }

  return (type, data) => {
    if (type === 0) {
      // Source
      const sink = data;
      sinks.push(sink);
      connectWs();

      // Source handshake
      sink(0, t => {
        if (t === 2) {
          const i = sinks.indexOf(sink);
          if (i > -1) {
            sinks.splice(i, 1);
          }

          if (sinks.length === 0 && ws.readyState === 1) {
            disconnectWs();
          }
        }
      });
    } else if (typeof type === 'function') {
      // Sink
      const source = type;

      // Automatically pull from source
      source(0, (type, data) => {
        if (type === 1) {
          sendToWs(data);
        }
      });
    } else if (type === 1) {
      // Manually send data
      sendToWs(data);
    } else if (type === 2) {
      // Manually disconnect
      disconnectWs();
    }
  };
};

export default /*#__PURE__*/ websocketFactory(WebSocket);

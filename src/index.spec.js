import { websocketFactory } from '.';

let WebSocketMock, webSocketInstanceMock, websocket;
beforeEach(() => {
  WebSocketMock = jest.fn(function() {
    webSocketInstanceMock = this;
  });
  websocket = websocketFactory(WebSocketMock);
});

describe('fromWebsocket', () => {
  describe('as source', () => {
    it('creates new connection with first sink', () => {
      const ws = websocket('url', 'protocol');
      expect(WebSocketMock).not.toHaveBeenCalled();

      ws(0, () => {});
      expect(WebSocketMock).toHaveBeenCalledTimes(1);
      expect(WebSocketMock).toHaveBeenCalledWith('url', 'protocol');
    });

    it('attaches websocket handles on connect', done => {
      WebSocketMock = jest.fn(function() {
        // let handlers attach
        setTimeout(() => {
          expect(this.onopen).toBeTruthy();
          expect(this.onmessage).toBeTruthy();
          expect(this.onclose).toBeTruthy();
          done();
        });
      });

      websocket = websocketFactory(WebSocketMock);
      const ws = websocket('url', 'protocol');
      ws(0, () => {});
    });

    it('sends message to sinks when arrives from websocket', () => {
      const ws = websocket('url', 'protocol');
      const sinkMock = jest.fn();
      ws(0, sinkMock);
      sinkMock.mockReset();
      webSocketInstanceMock.onmessage('msg');
      expect(sinkMock).toHaveBeenCalledTimes(1);
      expect(sinkMock).toHaveBeenCalledWith(1, 'msg');
    });

    it('removes sink when it sends exit code', () => {
      const ws = websocket('url', 'protocol');
      const sinkMock = jest.fn();
      ws(0, sinkMock);

      const sinkChannel = sinkMock.mock.calls[0][1];
      sinkMock.mockReset();
      sinkChannel(2);

      webSocketInstanceMock.onmessage('msg');
      expect(sinkMock).not.toHaveBeenCalled();
    });

    it('disconnects when last sink removed', () => {
      const close = jest.fn();
      WebSocketMock = jest.fn(function() {
        this.readyState = 1;
        this.close = close;
      });
      websocket = websocketFactory(WebSocketMock);

      const ws = websocket('url', 'protocol');
      const sinkMock = jest.fn();
      ws(0, sinkMock);
      const sinkChannel = sinkMock.mock.calls[0][1];
      expect(WebSocketMock).toHaveBeenCalledTimes(1);
      expect(WebSocketMock).toHaveBeenCalledWith('url', 'protocol');
      sinkChannel(2);

      expect(close).toHaveBeenCalledTimes(1);
    });
    it('reconnects to websocket after disconnecting', () => {
      WebSocketMock = jest.fn(function() {
        this.readyState = 1;
        this.close = () => {};
      });
      websocket = websocketFactory(WebSocketMock);

      const ws = websocket('url', 'protocol');
      const sinkMock = jest.fn();
      ws(0, sinkMock);
      const sinkChannel = sinkMock.mock.calls[0][1];
      sinkChannel(2);
      ws(0, sinkMock);
      expect(WebSocketMock).toHaveBeenCalledTimes(2);
      expect(WebSocketMock).toHaveBeenCalledWith('url', 'protocol');
    });
  });

  describe('as sink', () => {});
});

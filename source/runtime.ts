const domImpl = require('domino/lib/impl');

const MutationConstants = require('domino/lib/MutationConstants');

Object.assign(global, domImpl);

Object.assign(global, {XMLHttpRequest: require('xhr2')});

Object.assign(global, {
  requestAnimationFrame(callback: (ms: number) => void) {
    return setImmediate(() => callback(Date.now()));
  },
  cancelAnimationFrame(id) {
    clearImmediate(id);
  }
});

class MutationObserverImpl implements MutationObserver {
  constructor(callback: MutationCallback) {}

  observe(target: Node, init: MutationObserverInit): void {}

  disconnect() {}

  takeRecords(): Array<MutationRecord> {
    return [];
  }
}

Object.assign(global, {MutationObserver: MutationObserverImpl});

Object.assign(global, {CSS: null});

const navigatorImpl = {
  get userAgent() {
    return 'Chrome';
  },
  get language() {
    return 'en-US';
  },
  get cookieEnabled() {
    return false;
  }
};

Object.assign(global, {navigator: navigatorImpl});

require('mock-local-storage');

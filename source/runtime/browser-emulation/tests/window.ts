import {ApplicationTestContext, createApplicationTestContext} from '../../../test/fixtures';

describe('window', () => {
  let context: ApplicationTestContext;

  beforeAll(async () => {
    context = await createApplicationTestContext();
  });

  afterAll(async () => context.dispose());

  it('is defined in the context of ng application execution', async () => {
    return await context.run(async () => {
      expect(window).not.toBeNull();
    });
  });

  it('provides polyfills for browser functions', async () => {
    return await context.run(async () => {
      expect(typeof window.addEventListener).toBe('function');
      expect(typeof window.alert).toBe('function');
      expect(typeof window.clearImmediate).not.toBe('function');
      expect(typeof window.close).toBe('function');
      expect(typeof window.confirm).toBe('function');
      expect(typeof window.dispatchEvent).toBe('function');
      expect(typeof window.fetch).toBe('function');
      expect(typeof window.focus).toBe('function');
      expect(typeof window.getSelection).toBe('function');
      expect(typeof window.open).toBe('function');
      expect(typeof window.prompt).toBe('function');
      expect(typeof window.stop).toBe('function');
      expect(typeof window.setImmediate).toBe('function');
      expect(typeof window.requestAnimationFrame).toBe('function');
      expect(typeof window.cancelAnimationFrame).toBe('function');
    });
  });

  it('blur', async () => {
    return await context.run(async () => {
      expect(() => window.blur()).not.toThrow();
    });
  });

  it('focus', async () => {
    return await context.run(async () => {
      expect(() => window.focus()).not.toThrow();
    });
  });

  it('getSelection', async () => {
    return await context.run(async () => {
      let selection: Selection;
      expect(() => selection = window.getSelection()).not.toThrow();
      expect(selection).not.toBeNull();
      expect(selection.anchorNode).toBeNull();
      expect(selection.baseNode).toBeNull();
      expect(() => selection.removeAllRanges()).not.toThrow();
    });
  });

  it('alert', async () => {
    return await context.run(async () => {
      expect(typeof alert).toBe('function');
      expect(() => window.alert('Alert')).not.toThrow();
    });
  });

  it('confirm', async () => {
    return await context.run(async () => {
      expect(typeof confirm).toBe('function');
      expect(window.confirm('Yes?')).toBe(true);
    });
  });

  it('prompt', async () => {
    return await context.run(async () => {
      expect(typeof prompt).toBe('function');
      expect(window.prompt('Hello')).toBe('');
    });
  });

  it('print', async () => {
    return await context.run(async () => {
      expect(typeof print).toBe('function');
      expect(() => window.print()).not.toThrow();
    });
  });
});
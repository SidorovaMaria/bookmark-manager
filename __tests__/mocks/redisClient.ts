export class RedisMock {
  store = new Map<string, { value: string; exp?: number }>();

  async set(key: string, value: string, opts?: { EX?: number }) {
    const exp = opts?.EX ? Date.now() + opts.EX * 1000 : undefined;
    this.store.set(key, { value, exp });
  }

  async get(key: string) {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.exp && Date.now() > e.exp) {
      this.store.delete(key);
      return null;
    }
    return e.value;
  }

  async del(key: string) {
    this.store.delete(key);
  }

  reset() {
    this.store.clear();
  }
}

export const redisMock = new RedisMock();
export const redisClient = redisMock;

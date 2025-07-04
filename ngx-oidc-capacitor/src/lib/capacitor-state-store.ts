import { StateStore } from 'oidc-client-ts';
import { Preferences } from '@capacitor/preferences';

export class CapacitorStateStore implements StateStore {
  private readonly _prefix: string;

  constructor(prefix: string = 'oidc.') {
    this._prefix = prefix;
  }

  async get(key: string): Promise<string | null> {
    try {
      const fullKey = this._prefix + key;
      const result = await Preferences.get({ key: fullKey });
      return result.value;
    } catch (error) {
      console.error('CapacitorStateStore.get error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      const fullKey = this._prefix + key;
      await Preferences.set({
        key: fullKey,
        value: value
      });
    } catch (error) {
      console.error('CapacitorStateStore.set error:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<string | null> {
    try {
      const fullKey = this._prefix + key;
      // Get the value first before removing
      const result = await Preferences.get({ key: fullKey });
      await Preferences.remove({ key: fullKey });
      return result.value;
    } catch (error) {
      console.error('CapacitorStateStore.remove error:', error);
      return null;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const result = await Preferences.keys();
      // Filter keys that start with our prefix and remove the prefix
      return result.keys
        .filter(key => key.startsWith(this._prefix))
        .map(key => key.substring(this._prefix.length));
    } catch (error) {
      console.error('CapacitorStateStore.getAllKeys error:', error);
      return [];
    }
  }
}

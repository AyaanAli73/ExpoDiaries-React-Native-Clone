import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IStorageService {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

class AsyncStorageService implements IStorageService {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Fail-safe
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Fail-safe
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      // Fail-safe
    }
  }
}

export const storageService = new AsyncStorageService();

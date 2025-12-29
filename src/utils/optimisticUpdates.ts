/**
 * Optimistic Update Utilities
 * For immediate UI updates while waiting for server confirmation
 */

export type OptimisticUpdate<T> = {
  id: string;
  data: T;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
};

export class OptimisticUpdateManager<T extends { id: string }> {
  private updates: Map<string, OptimisticUpdate<T>> = new Map();
  private timeout: number = 5000; // 5 seconds

  /**
   * Add an optimistic update
   */
  add(item: T): void {
    const update: OptimisticUpdate<T> = {
      id: item.id,
      data: item,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.updates.set(item.id, update);

    // Auto-cleanup after timeout
    setTimeout(() => {
      const current = this.updates.get(item.id);
      if (current?.status === 'pending') {
        this.updates.delete(item.id);
      }
    }, this.timeout);
  }

  /**
   * Confirm an optimistic update (server confirmed)
   */
  confirm(id: string): void {
    const update = this.updates.get(id);
    if (update) {
      update.status = 'success';
      // Remove after a short delay
      setTimeout(() => this.updates.delete(id), 1000);
    }
  }

  /**
   * Fail an optimistic update (server rejected)
   */
  fail(id: string): void {
    const update = this.updates.get(id);
    if (update) {
      update.status = 'error';
    }
  }

  /**
   * Get an optimistic update
   */
  get(id: string): OptimisticUpdate<T> | undefined {
    return this.updates.get(id);
  }

  /**
   * Check if an update is pending
   */
  isPending(id: string): boolean {
    return this.updates.get(id)?.status === 'pending';
  }

  /**
   * Apply optimistic updates to a list
   */
  apply(items: T[]): T[] {
    const pendingUpdates = Array.from(this.updates.values())
      .filter(u => u.status === 'pending')
      .map(u => u.data);

    // Merge pending updates with existing items
    const merged = [...items];
    
    pendingUpdates.forEach(update => {
      const index = merged.findIndex(item => item.id === update.id);
      if (index >= 0) {
        // Update existing
        merged[index] = update;
      } else {
        // Add new (for INSERT operations)
        merged.unshift(update);
      }
    });

    return merged;
  }

  /**
   * Clear all updates
   */
  clear(): void {
    this.updates.clear();
  }

  /**
   * Get all pending updates
   */
  getPending(): T[] {
    return Array.from(this.updates.values())
      .filter(u => u.status === 'pending')
      .map(u => u.data);
  }

  /**
   * Get all failed updates
   */
  getFailed(): T[] {
    return Array.from(this.updates.values())
      .filter(u => u.status === 'error')
      .map(u => u.data);
  }
}

/**
 * Helper for common optimistic update patterns
 */
export function createOptimisticHelpers<T extends { id: string }>() {
  const manager = new OptimisticUpdateManager<T>();

  return {
    /**
     * Optimistic create
     */
    create: async (
      item: T,
      serverFn: (item: T) => Promise<T>
    ): Promise<T | null> => {
      // Add optimistically
      manager.add(item);

      try {
        // Execute server operation
        const result = await serverFn(item);
        
        // Confirm success
        manager.confirm(item.id);
        
        return result;
      } catch (error) {
        // Mark as failed
        manager.fail(item.id);
        throw error;
      }
    },

    /**
     * Optimistic update
     */
    update: async (
      item: T,
      serverFn: (item: T) => Promise<T>
    ): Promise<T | null> => {
      // Same as create
      return createOptimisticHelpers<T>().create(item, serverFn);
    },

    /**
     * Optimistic delete
     */
    delete: async (
      id: string,
      serverFn: (id: string) => Promise<void>
    ): Promise<void> => {
      try {
        await serverFn(id);
      } catch (error) {
        throw error;
      }
    },

    /**
     * Apply pending updates to a list
     */
    applyTo: (items: T[]): T[] => {
      return manager.apply(items);
    },

    /**
     * Check if item is pending
     */
    isPending: (id: string): boolean => {
      return manager.isPending(id);
    },

    /**
     * Clear all updates
     */
    clear: (): void => {
      manager.clear();
    },

    /**
     * Get manager instance
     */
    manager
  };
}

/**
 * React hook for optimistic updates
 */
import { useState, useCallback } from 'react';

export function useOptimistic<T extends { id: string }>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticManager] = useState(() => new OptimisticUpdateManager<T>());

  const addOptimistic = useCallback((item: T) => {
    optimisticManager.add(item);
    setData(current => optimisticManager.apply(current));
  }, [optimisticManager]);

  const confirmOptimistic = useCallback((id: string) => {
    optimisticManager.confirm(id);
  }, [optimisticManager]);

  const failOptimistic = useCallback((id: string) => {
    optimisticManager.fail(id);
    // Revert optimistic update
    setData(current => current.filter(item => item.id !== id));
  }, [optimisticManager]);

  const updateData = useCallback((newData: T[]) => {
    setData(optimisticManager.apply(newData));
  }, [optimisticManager]);

  return {
    data,
    addOptimistic,
    confirmOptimistic,
    failOptimistic,
    updateData,
    isPending: (id: string) => optimisticManager.isPending(id)
  };
}

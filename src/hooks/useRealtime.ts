import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel, REALTIME_LISTEN_TYPES, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface RealtimeConfig {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
  schema?: string;
}

interface UseRealtimeReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  error: Error | null;
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * Hook for Supabase Realtime subscriptions
 * Automatically manages connection lifecycle
 */
export function useRealtime(config: RealtimeConfig): UseRealtimeReturn {
  const {
    table,
    event = '*',
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    schema = 'public'
  } = config;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  const handlePayload = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Call specific handlers
    switch (eventType) {
      case 'INSERT':
        onInsert?.(newRecord);
        onChange?.(payload);
        break;
      case 'UPDATE':
        onUpdate?.(newRecord);
        onChange?.(payload);
        break;
      case 'DELETE':
        onDelete?.(oldRecord);
        onChange?.(payload);
        break;
    }
  }, [onInsert, onUpdate, onDelete, onChange]);

  const subscribe = useCallback(() => {
    if (isSubscribedRef.current) {
      console.warn('[useRealtime] Already subscribed to', table);
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      // Create channel with unique name
      const channelName = `${schema}:${table}${filter ? `:${filter}` : ''}`;
      const channel = supabase.channel(channelName);

      // Setup postgres changes listener
      const postgresChanges = channel.on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event,
          schema,
          table,
          filter
        } as any,
        handlePayload
      );

      // Subscribe with status tracking
      postgresChanges.subscribe((status, err) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          setStatus('connected');
          isSubscribedRef.current = true;
          console.log(`[useRealtime] ✅ Connected to ${table}`);
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          setStatus('error');
          setError(err || new Error('Channel error'));
          console.error(`[useRealtime] ❌ Error connecting to ${table}:`, err);
        } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          setStatus('error');
          setError(new Error('Connection timed out'));
          console.error(`[useRealtime] ⏱️ Timeout connecting to ${table}`);
        } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
          setStatus('disconnected');
          isSubscribedRef.current = false;
          console.log(`[useRealtime] 🔌 Disconnected from ${table}`);
        }
      });

      channelRef.current = channel;
    } catch (err) {
      setStatus('error');
      setError(err as Error);
      console.error('[useRealtime] Failed to subscribe:', err);
    }
  }, [table, event, filter, schema, handlePayload]);

  const unsubscribe = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
      setStatus('disconnected');
      console.log(`[useRealtime] Unsubscribed from ${table}`);
    }
  }, [table]);

  // Auto-subscribe on mount
  useEffect(() => {
    subscribe();

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    status,
    isConnected: status === 'connected',
    error,
    subscribe,
    unsubscribe
  };
}

/**
 * Hook for multiple realtime subscriptions
 */
export function useRealtimeMulti(configs: RealtimeConfig[]): {
  statuses: Record<string, ConnectionStatus>;
  allConnected: boolean;
  anyError: boolean;
} {
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});

  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    configs.forEach((config) => {
      const { table, schema = 'public', event = '*', filter, onChange } = config;
      const channelName = `${schema}:${table}${filter ? `:${filter}` : ''}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          { event, schema, table, filter } as any,
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            if (eventType === 'INSERT') config.onInsert?.(newRecord);
            if (eventType === 'UPDATE') config.onUpdate?.(newRecord);
            if (eventType === 'DELETE') config.onDelete?.(oldRecord);
            onChange?.(payload);
          }
        )
        .subscribe((status) => {
          setStatuses((prev) => ({
            ...prev,
            [table]: status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED
              ? 'connected'
              : status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR
              ? 'error'
              : 'connecting'
          }));
        });

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [configs]);

  return {
    statuses,
    allConnected: Object.values(statuses).every((s) => s === 'connected'),
    anyError: Object.values(statuses).some((s) => s === 'error')
  };
}

/**
 * Hook for presence (who's online)
 */
export function usePresence(channelName: string) {
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceState(state);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  const track = useCallback((data: any) => {
    if (channelRef.current) {
      channelRef.current.track(data);
    }
  }, []);

  const untrack = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack();
    }
  }, []);

  return {
    presenceState,
    onlineUsers: Object.keys(presenceState).length,
    track,
    untrack
  };
}

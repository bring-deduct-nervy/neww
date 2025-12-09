import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type TableName = 
  | 'cases' 
  | 'beneficiaries' 
  | 'volunteers' 
  | 'shelters' 
  | 'alerts' 
  | 'donations'
  | 'emergency_reports'
  | 'missing_persons'
  | 'river_levels'
  | 'weather_data'
  | 'flood_predictions'
  | 'broadcasts';

export type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  table: TableName;
  event?: ChangeEvent;
  filter?: string;
  callback: (payload: any) => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, SubscriptionConfig[]> = new Map();

  // Subscribe to table changes
  subscribe(config: SubscriptionConfig): () => void {
    const channelKey = `${config.table}_${config.filter || 'all'}`;
    
    // Add to subscriptions list
    const existing = this.subscriptions.get(channelKey) || [];
    existing.push(config);
    this.subscriptions.set(channelKey, existing);

    // Create channel if not exists
    if (!this.channels.has(channelKey)) {
      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes' as const,
          {
            event: config.event || '*',
            schema: 'public',
            table: config.table,
            filter: config.filter
          } as any,
          (payload: any) => {
            const subs = this.subscriptions.get(channelKey) || [];
            subs.forEach(sub => sub.callback(payload));
          }
        )
        .subscribe();

      this.channels.set(channelKey, channel);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(channelKey) || [];
      const index = subs.indexOf(config);
      if (index > -1) {
        subs.splice(index, 1);
        this.subscriptions.set(channelKey, subs);
      }

      // Remove channel if no more subscriptions
      if (subs.length === 0) {
        const channel = this.channels.get(channelKey);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelKey);
        }
      }
    };
  }

  // Subscribe to multiple tables
  subscribeToMultiple(configs: SubscriptionConfig[]): () => void {
    const unsubscribes = configs.map(config => this.subscribe(config));
    return () => unsubscribes.forEach(unsub => unsub());
  }

  // Subscribe to all critical updates
  subscribeToCriticalUpdates(callback: (type: string, data: any) => void): () => void {
    return this.subscribeToMultiple([
      {
        table: 'alerts',
        event: 'INSERT',
        callback: (payload) => callback('alert', payload.new)
      },
      {
        table: 'cases',
        event: 'INSERT',
        filter: 'priority=eq.CRITICAL',
        callback: (payload) => callback('critical_case', payload.new)
      },
      {
        table: 'emergency_reports',
        event: 'INSERT',
        callback: (payload) => callback('emergency', payload.new)
      },
      {
        table: 'flood_predictions',
        event: '*',
        filter: 'risk_level=in.(HIGH,CRITICAL)',
        callback: (payload) => callback('flood_risk', payload.new)
      }
    ]);
  }

  // Subscribe to dashboard updates
  subscribeToDashboard(callback: (type: string, data: any) => void): () => void {
    return this.subscribeToMultiple([
      {
        table: 'cases',
        callback: (payload) => callback('cases', payload)
      },
      {
        table: 'volunteers',
        callback: (payload) => callback('volunteers', payload)
      },
      {
        table: 'shelters',
        callback: (payload) => callback('shelters', payload)
      },
      {
        table: 'beneficiaries',
        callback: (payload) => callback('beneficiaries', payload)
      },
      {
        table: 'donations',
        callback: (payload) => callback('donations', payload)
      }
    ]);
  }

  // Unsubscribe from all
  unsubscribeAll(): void {
    this.channels.forEach((channel, key) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscriptions.clear();
  }
}

export const realtimeService = new RealtimeService();

// Presence tracking for active users
export function trackPresence(userId: string, userData: any) {
  const channel = supabase.channel('online_users');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Online users:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          ...userData,
          online_at: new Date().toISOString()
        });
      }
    });

  return () => {
    channel.untrack();
    supabase.removeChannel(channel);
  };
}

// Broadcast messages to all connected clients
export function broadcastMessage(event: string, payload: any) {
  const channel = supabase.channel('broadcasts');
  channel.send({
    type: 'broadcast',
    event,
    payload
  });
}

// Listen for broadcast messages
export function listenForBroadcasts(callback: (event: string, payload: any) => void) {
  const channel = supabase
    .channel('broadcasts')
    .on('broadcast', { event: '*' }, (payload) => {
      callback(payload.event, payload.payload);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

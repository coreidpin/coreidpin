import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Users, UserPlus, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { InviteCard } from './InviteCard';

export function ReferralDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    pending: 0
  });
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Type cast to any to avoid 'never' issues with new table
      const { data, error } = await (supabase
        .from('referrals') as any)
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReferrals(data);
        setStats({
          total: data.length,
          converted: data.filter((r: any) => r.status === 'converted').length,
          pending: data.filter((r: any) => r.status === 'pending').length
        });
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <InviteCard />
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Invites</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.converted}</div>
              <div className="text-xs text-muted-foreground">Joined & Verified</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Track the status of people you invited.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />)}
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="text-xs">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {ref.status === 'converted' ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                          Joined
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {ref.status === 'converted' ? '+50 pts' : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

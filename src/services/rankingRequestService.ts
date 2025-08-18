import { supabase } from '@/integrations/supabase/client';

export interface RankingRequest {
  id: string;
  user_id: string;
  website_id: string;
  keyword: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  processed_at: string | null;
  error_message: string | null;
}

export const rankingRequestService = {
  async createRankingRequest(
    userId: string,
    websiteId: string,
    keyword: string,
    priority: number = 1
  ): Promise<RankingRequest> {
    try {
      // Check if there's already a pending request for this keyword
      const { data: existingRequest } = await supabase
        .from('ranking_requests')
        .select('id, status')
        .eq('user_id', userId)
        .eq('website_id', websiteId)
        .eq('keyword', keyword)
        .in('status', ['pending', 'processing'])
        .single();

      if (existingRequest) {
        throw new Error(`A ranking request for "${keyword}" is already ${existingRequest.status}`);
      }

      const { data, error } = await supabase
        .from('ranking_requests')
        .insert({
          user_id: userId,
          website_id: websiteId,
          keyword,
          priority
        })
        .select()
        .single();

      if (error) throw error;
      return data as RankingRequest;
    } catch (error) {
      console.error('Error creating ranking request:', error);
      throw error;
    }
  },

  async getUserPendingRequests(userId: string): Promise<RankingRequest[]> {
    try {
      const { data, error } = await supabase
        .from('ranking_requests')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'processing'])
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RankingRequest[];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  async getRequestStatus(requestId: string): Promise<RankingRequest | null> {
    try {
      const { data, error } = await supabase
        .from('ranking_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data as RankingRequest;
    } catch (error) {
      console.error('Error fetching request status:', error);
      return null;
    }
  },

  async createBulkRankingRequests(
    userId: string,
    websiteId: string,
    keywords: string[],
    priority: number = 1
  ): Promise<RankingRequest[]> {
    try {
      // Filter out keywords that already have pending requests
      const { data: existingRequests } = await supabase
        .from('ranking_requests')
        .select('keyword')
        .eq('user_id', userId)
        .eq('website_id', websiteId)
        .in('keyword', keywords)
        .in('status', ['pending', 'processing']);

      const existingKeywords = new Set(existingRequests?.map(r => r.keyword) || []);
      const newKeywords = keywords.filter(k => !existingKeywords.has(k));

      if (newKeywords.length === 0) {
        throw new Error('All keywords already have pending ranking requests');
      }

      const requestsToInsert = newKeywords.map(keyword => ({
        user_id: userId,
        website_id: websiteId,
        keyword,
        priority
      }));

      const { data, error } = await supabase
        .from('ranking_requests')
        .insert(requestsToInsert)
        .select();

      if (error) throw error;
      return (data || []) as RankingRequest[];
    } catch (error) {
      console.error('Error creating bulk ranking requests:', error);
      throw error;
    }
  },

  async getQueuePosition(requestId: string): Promise<number> {
    try {
      const { data: request } = await supabase
        .from('ranking_requests')
        .select('priority, requested_at')
        .eq('id', requestId)
        .single();

      if (!request) return 0;

      const { count } = await supabase
        .from('ranking_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .or(`priority.gt.${request.priority},and(priority.eq.${request.priority},requested_at.lt.${request.requested_at})`);

      return (count || 0) + 1;
    } catch (error) {
      console.error('Error getting queue position:', error);
      return 0;
    }
  }
};
import { UserKeyword } from './keywordService';
import { supabase } from '@/integrations/supabase/client';

export interface ExportOptions {
  includeRankings: boolean;
  includeHistoricalData: boolean;
  includePreferences: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  selectedKeywords?: string[];
}

export interface RankingHistoryData {
  keyword: string;
  website_domain: string;
  position: number | null;
  snapshot_date: string;
  search_engine: string;
  url: string | null;
}

export const csvExportService = {
  async exportKeywordsToCSV(keywords: UserKeyword[], options: ExportOptions): Promise<void> {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Filter keywords if specific ones are selected
      const filteredKeywords = options.selectedKeywords 
        ? keywords.filter(k => options.selectedKeywords!.includes(k.keyword))
        : keywords;

      if (filteredKeywords.length === 0) {
        throw new Error('No keywords to export');
      }

      // Basic keyword data
      const headers = [
        'Keyword',
        'Website Domain',
        'Latest Position',
        'Latest Ranking Date',
        'Position Change',
        'Difficulty Estimate',
        'Volume Estimate',
        'Is Priority',
        'Ranking URL'
      ];

      if (options.includePreferences) {
        headers.push('Notes');
      }

      csvContent += headers.join(',') + '\n';

      // Add keyword data
      for (const keyword of filteredKeywords) {
        const row = [
          `"${keyword.keyword}"`,
          `"${keyword.website_domain}"`,
          keyword.latest_position || '',
          keyword.latest_ranking_date || '',
          keyword.position_change || '',
          `"${keyword.difficulty_estimate || ''}"`,
          `"${keyword.volume_estimate || ''}"`,
          keyword.is_priority ? 'Yes' : 'No',
          `"${keyword.ranking_url || ''}"`
        ];

        if (options.includePreferences) {
          // Get notes from preferences if available
          const notes = await this.getKeywordNotes(keyword.website_id, keyword.keyword);
          row.push(`"${notes || ''}"`);
        }

        csvContent += row.join(',') + '\n';
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `keywords-export-${timestamp}.csv`;

      // Download file
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting keywords to CSV:', error);
      throw error;
    }
  },

  async exportRankingHistoryToCSV(websiteId: string, keywords: string[], options: ExportOptions): Promise<void> {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Headers for historical data
      const headers = [
        'Keyword',
        'Website Domain',
        'Position',
        'Date',
        'Search Engine',
        'Ranking URL'
      ];

      csvContent += headers.join(',') + '\n';

      // Get website domain
      const { data: website } = await supabase
        .from('websites')
        .select('domain')
        .eq('id', websiteId)
        .single();

      const websiteDomain = website?.domain || 'Unknown';

      // Fetch historical data for each keyword
      for (const keyword of keywords) {
        const historicalData = await this.getRankingHistory(websiteId, keyword, options.dateRange);
        
        for (const record of historicalData) {
          const row = [
            `"${record.keyword}"`,
            `"${record.website_domain}"`,
            record.position || '',
            record.snapshot_date,
            `"${record.search_engine}"`,
            `"${record.url || ''}"`
          ];
          
          csvContent += row.join(',') + '\n';
        }
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ranking-history-${timestamp}.csv`;

      // Download file
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting ranking history to CSV:', error);
      throw error;
    }
  },

  async exportFilteredData(keywords: UserKeyword[], filters: any, options: ExportOptions): Promise<void> {
    try {
      // Apply filters to keywords
      let filteredKeywords = [...keywords];

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredKeywords = filteredKeywords.filter(keyword =>
          keyword.keyword.toLowerCase().includes(searchLower) ||
          keyword.website_domain.toLowerCase().includes(searchLower)
        );
      }

      if (filters.priorityOnly) {
        filteredKeywords = filteredKeywords.filter(keyword => keyword.is_priority);
      }

      if (filters.positionRange) {
        filteredKeywords = filteredKeywords.filter(keyword => {
          if (!keyword.latest_position) return false;
          return keyword.latest_position >= filters.positionRange.min && 
                 keyword.latest_position <= filters.positionRange.max;
        });
      }

      // Export filtered data
      await this.exportKeywordsToCSV(filteredKeywords, options);
    } catch (error) {
      console.error('Error exporting filtered data:', error);
      throw error;
    }
  },

  async getKeywordNotes(websiteId: string, keyword: string): Promise<string | null> {
    try {
      const { data } = await supabase
        .from('user_keyword_preferences')
        .select('notes')
        .eq('website_id', websiteId)
        .eq('keyword', keyword)
        .single();

      return data?.notes || null;
    } catch (error) {
      return null;
    }
  },

  async getRankingHistory(
    websiteId: string, 
    keyword: string, 
    dateRange?: { start: Date; end: Date }
  ): Promise<RankingHistoryData[]> {
    try {
      let query = supabase
        .from('ranking_snapshots')
        .select('*')
        .eq('website_id', websiteId)
        .eq('keyword', keyword)
        .order('snapshot_date', { ascending: true });

      if (dateRange) {
        query = query
          .gte('snapshot_date', dateRange.start.toISOString().split('T')[0])
          .lte('snapshot_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get website domain
      const { data: website } = await supabase
        .from('websites')
        .select('domain')
        .eq('id', websiteId)
        .single();

      const websiteDomain = website?.domain || 'Unknown';

      return (data || []).map(record => ({
        keyword: record.keyword,
        website_domain: websiteDomain,
        position: record.position,
        snapshot_date: record.snapshot_date,
        search_engine: record.search_engine,
        url: record.url
      }));
    } catch (error) {
      console.error('Error getting ranking history:', error);
      return [];
    }
  },

  downloadCSV(csvContent: string, filename: string): void {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
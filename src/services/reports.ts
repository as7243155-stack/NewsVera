import { supabase } from '@/lib/supabase';

export async function getUserReports(userId: string) {
  return supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function getReportById(reportId: string) {
  return supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();
}

export async function deleteReport(reportId: string) {
  return supabase
    .from('reports')
    .delete()
    .eq('id', reportId);
}

export async function saveReport(
  userId: string,
  result: {
    input: string;
    score: number;
    verdict: string;
    analysis: string[];
    sources: {
      name: string;
      title: string;
      type: string;
      description: string;
      url?: string;
    }[];
  }
) {
  return supabase
    .from('reports')
    .insert({
      user_id: userId,
      claim_text: result.input,
      truth_score: result.score,
      verdict_label: result.verdict,
      ai_comments: result.analysis,
      source_links: result.sources,
    })
    .select()
    .single();
}
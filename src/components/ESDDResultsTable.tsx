import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIOutputResult {
  id: string;
  sr_no: string | null;
  risk_category: string | null;
  screening_criterion: string | null;
  threshold: string | null;
  performance: string | null;
  within_threshold: string | null;
  context: string | null;
  session_id: string | null;
}

interface ESDDResultsTableProps {
  sessionId: string;
  assessmentId: string;
}

const ESDDResultsTable = ({ sessionId, assessmentId }: ESDDResultsTableProps) => {
  const [results, setResults] = useState<AIOutputResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log("Fetching results for session ID:", sessionId);
      
      // Query AI_output table directly
      const { data, error } = await supabase
        .from('ai_output')
        .select('*')
        .eq('session_id', sessionId)
        .order('session_id', { ascending: false });

      console.log("AI_output query result:", { data, error });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: AIOutputResult[] = (data || []).map((row: any) => ({
        id: row.id || '',
        sr_no: row.sr_no,
        risk_category: row.risk_category,
        screening_criterion: row.screening_criterion,
        threshold: row.threshold,
        performance: row.performance,
        within_threshold: row.within_threshold,
        context: row.context,
        session_id: row.session_id,
      }));

      // Sort by sr_no as numbers
      transformedData.sort((a, b) => {
        const aNum = parseInt(a.sr_no || '0');
        const bNum = parseInt(b.sr_no || '0');
        return aNum - bNum;
      });

      console.log("Transformed data:", transformedData);
      setResults(transformedData);
    } catch (error: any) {
      console.error("Error fetching AI output results:", error);
      toast({
        title: "Error",
        description: "Failed to load screening results from database",
        variant: "destructive",
      });
      // Set empty results on error
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading screening results...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No screening results found for this session.</p>
        <p className="text-sm text-muted-foreground mt-2">Session ID: {sessionId}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-muted">
            <th className="border border-border p-3 text-left font-semibold">Sr. No.</th>
            <th className="border border-border p-3 text-left font-semibold">Risk Category</th>
            <th className="border border-border p-3 text-left font-semibold">Screening Criteria</th>
            <th className="border border-border p-3 text-left font-semibold">Threshold</th>
            <th className="border border-border p-3 text-left font-semibold">Performance</th>
            <th className="border border-border p-3 text-left font-semibold">Within Threshold</th>
            <th className="border border-border p-3 text-left font-semibold">Context</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-muted/50">
              <td className="border border-border p-3">{result.sr_no || '-'}</td>
              <td className="border border-border p-3">{result.risk_category || '-'}</td>
              <td className="border border-border p-3">
                {result.screening_criterion ? (
                  <Link 
                    to={`/screening-criteria/${encodeURIComponent(result.screening_criterion)}?assessmentId=${assessmentId}`}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    {result.screening_criterion}
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              <td className="border border-border p-3">{result.threshold || '-'}</td>
              <td className="border border-border p-3">{result.performance || '-'}</td>
              <td className="border border-border p-3">
                {result.within_threshold ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.within_threshold.toLowerCase().includes('yes') || result.within_threshold.toLowerCase().includes('pass')
                      ? 'bg-green-100 text-green-800' 
                      : result.within_threshold.toLowerCase().includes('manual esdd')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.within_threshold}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="border border-border p-3 max-w-xs">
                <div className="truncate" title={result.context || ''}>
                  {result.context || '-'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ESDDResultsTable;
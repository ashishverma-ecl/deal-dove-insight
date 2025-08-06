import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinalResult {
  id: number;
  sr_no: string | null;
  risk_category: string | null;
  screening_criteria: string | null;
  threshold: string | null;
  performance: string | null;
  assessment_outcome: string | null;
  session_id: string | null;
}

interface ESDDResultsTableProps {
  sessionId: string;
  assessmentId: string;
}

const ESDDResultsTable = ({ sessionId, assessmentId }: ESDDResultsTableProps) => {
  const [results, setResults] = useState<FinalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Use raw SQL query to fetch from final_results table
      const { data, error } = await supabase
        .from("final_results" as any)
        .select("*")
        .eq("session_id", sessionId)
        .order("sr_no");

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: FinalResult[] = (data || []).map((row: any) => ({
        id: row.id || 0,
        sr_no: row.sr_no,
        risk_category: row.risk_category,
        screening_criteria: row.screening_criteria,
        threshold: row.threshold,
        performance: row.performance,
        assessment_outcome: row.assessment_outcome,
        session_id: row.session_id,
      }));

      setResults(transformedData);
    } catch (error: any) {
      console.error("Error fetching final results:", error);
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
            <th className="border border-border p-3 text-left font-semibold">Sl. No.</th>
            <th className="border border-border p-3 text-left font-semibold">Risk Category</th>
            <th className="border border-border p-3 text-left font-semibold">Screening Criteria</th>
            <th className="border border-border p-3 text-left font-semibold">Threshold</th>
            <th className="border border-border p-3 text-left font-semibold">Performance</th>
            <th className="border border-border p-3 text-left font-semibold">Assessment Outcome</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-muted/50">
              <td className="border border-border p-3">{result.sr_no || '-'}</td>
              <td className="border border-border p-3">{result.risk_category || '-'}</td>
              <td className="border border-border p-3">
                {result.screening_criteria ? (
                  <Link 
                    to={`/screening-criteria/${encodeURIComponent(result.screening_criteria)}?assessmentId=${assessmentId}`}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    {result.screening_criteria}
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              <td className="border border-border p-3">{result.threshold || '-'}</td>
              <td className="border border-border p-3">{result.performance || '-'}</td>
              <td className="border border-border p-3">
                {result.assessment_outcome ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.assessment_outcome.toLowerCase().includes('pass')
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.assessment_outcome}
                  </span>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ESDDResultsTable;
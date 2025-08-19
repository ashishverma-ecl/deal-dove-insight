
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

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
  comments?: string | null;
  status?: string | null;
}

interface EditedRow {
  id: string;
  performance?: string;
  within_threshold?: string;
  comments?: string;
}

interface ESDDResultsTableProps {
  sessionId: string;
  assessmentId: string;
}

const ESDDResultsTable = ({ sessionId, assessmentId }: ESDDResultsTableProps) => {
  const [results, setResults] = useState<AIOutputResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editedRows, setEditedRows] = useState<Record<string, EditedRow>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const handleFieldEdit = (resultId: string, field: string, value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [resultId]: {
        ...prev[resultId],
        id: resultId,
        [field]: value
      }
    }));
  };

  const getDisplayValue = (result: AIOutputResult, field: string, originalValue: string) => {
    const editedRow = editedRows[result.id];
    if (editedRow && editedRow[field as keyof EditedRow] !== undefined) {
      return editedRow[field as keyof EditedRow] || '';
    }
    return originalValue || '';
  };

  const isFieldEdited = (resultId: string, field: string) => {
    const editedRow = editedRows[resultId];
    return editedRow && editedRow[field as keyof EditedRow] !== undefined;
  };

  const handleFieldEditStart = (resultId: string, field: string) => {
    setEditingField(`${resultId}-${field}`);
  };

  const handleFieldEditSave = (resultId: string, field: string) => {
    setEditingField(null);
  };

  const handleFieldEditCancel = (resultId: string, field: string) => {
    // Remove any changes for this field
    setEditedRows(prev => {
      const updated = { ...prev };
      if (updated[resultId]) {
        delete updated[resultId][field as keyof EditedRow];
        if (Object.keys(updated[resultId]).length === 1) { // Only 'id' left
          delete updated[resultId];
        }
      }
      return updated;
    });
    setEditingField(null);
  };

  const isFieldInEditMode = (resultId: string, field: string) => {
    return editingField === `${resultId}-${field}`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      console.log("Starting submit process for session:", sessionId);
      console.log("Edited rows to update:", editedRows);

      // Update each edited row if there are any changes
      if (Object.keys(editedRows).length > 0) {
        for (const [rowId, editedData] of Object.entries(editedRows)) {
          const { id, ...updateData } = editedData;
          
          console.log("Updating row ID:", rowId);
          console.log("Update data:", updateData);
          
          // Ensure comments field is included if it was edited
          if (updateData.comments !== undefined) {
            console.log("Comments being updated:", updateData.comments);
          }
          
          const { data, error } = await supabase
            .from('ai_output')
            .update(updateData)
            .eq('id', rowId)
            .select();

          if (error) {
            console.error("Error updating row:", rowId, error);
            throw error;
          }
          
          console.log("Successfully updated row:", rowId, "Result:", data);
        }
      }

      // Update status to 'reviewed' for ALL records in this session (even non-edited ones)
      console.log("Updating status to 'reviewed' for ALL records in session:", sessionId);
      
      const { data: statusUpdateData, error: statusError } = await supabase
        .from('ai_output')
        .update({ status: 'reviewed' })
        .eq('session_id', sessionId)
        .select();

      if (statusError) {
        console.error("Error updating status to reviewed:", statusError);
        throw statusError;
      }
      
      console.log("Successfully updated status for all records in session. Updated records:", statusUpdateData?.length)

      toast({
        title: "Success",
        description: "All changes have been saved and session marked as reviewed.",
      });

      // Clear edit mode but keep edited rows highlighted
      setEditingField(null);
      await fetchResults();
      
      console.log("Submit completed successfully");
    } catch (error: any) {
      console.error("Error submitting changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

      // Transform and filter out empty rows
      const transformedData: AIOutputResult[] = (data || [])
        .map((row: any) => ({
          id: row.id || '',
          sr_no: row.sr_no,
          risk_category: row.risk_category,
          screening_criterion: row.screening_criterion,
          threshold: row.threshold,
          performance: row.performance,
          within_threshold: row.within_threshold,
          context: row.context,
          session_id: row.session_id,
          comments: row.comments,
          status: row.status,
        }))
        .filter((row) => 
          // Keep rows that have at least screening criterion or risk category
          row.screening_criterion || row.risk_category
        );

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
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-3 text-left font-semibold">Sr. No.</th>
              <th className="border border-border p-3 text-left font-semibold">Risk Category</th>
              <th className="border border-border p-3 text-left font-semibold">Screening Criteria</th>
              <th className="border border-border p-3 text-left font-semibold">Threshold</th>
              <th className="border border-border p-3 text-left font-semibold">Performance</th>
              <th className="border border-border p-3 text-left font-semibold">Outcome</th>
              <th className="border border-border p-3 text-left font-semibold">Comments</th>
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
                <td className={`border border-border p-3 ${isFieldEdited(result.id, 'performance') ? 'bg-gray-300' : ''}`}>
                  {isFieldInEditMode(result.id, 'performance') ? (
                    <div className="space-y-2">
                      <Input
                        value={getDisplayValue(result, 'performance', result.performance || '')}
                        onChange={(e) => handleFieldEdit(result.id, 'performance', e.target.value)}
                        className="min-w-[120px] text-sm"
                        placeholder="Enter performance"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldEditSave(result.id, 'performance')}
                          className="text-xs px-2 py-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFieldEditCancel(result.id, 'performance')}
                          className="text-xs px-2 py-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="group relative cursor-pointer min-h-[40px] flex items-center"
                      onMouseEnter={() => {}}
                    >
                      <div className="truncate pr-8" title={getDisplayValue(result, 'performance', result.performance || '')}>
                        {getDisplayValue(result, 'performance', result.performance || '') || '-'}
                      </div>
                      <Edit 
                        size={16} 
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => handleFieldEditStart(result.id, 'performance')}
                      />
                    </div>
                  )}
                </td>
                <td className={`border border-border p-3 ${isFieldEdited(result.id, 'within_threshold') ? 'bg-gray-300' : ''}`}>
                  {isFieldInEditMode(result.id, 'within_threshold') ? (
                    <div className="space-y-2">
                      <Input
                        value={getDisplayValue(result, 'within_threshold', result.within_threshold || '')}
                        onChange={(e) => handleFieldEdit(result.id, 'within_threshold', e.target.value)}
                        className="min-w-[120px] text-sm"
                        placeholder="Enter outcome"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldEditSave(result.id, 'within_threshold')}
                          className="text-xs px-2 py-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFieldEditCancel(result.id, 'within_threshold')}
                          className="text-xs px-2 py-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="group relative cursor-pointer min-h-[40px] flex items-center"
                      onMouseEnter={() => {}}
                    >
                      <div className="truncate pr-8" title={getDisplayValue(result, 'within_threshold', result.within_threshold || '')}>
                        {getDisplayValue(result, 'within_threshold', result.within_threshold || '') ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getDisplayValue(result, 'within_threshold', result.within_threshold || '').toLowerCase().includes('manual esdd')
                              ? 'bg-red-100 text-red-800'
                              : getDisplayValue(result, 'within_threshold', result.within_threshold || '').toLowerCase().includes('pass')
                              ? 'bg-green-100 text-green-800' 
                              : getDisplayValue(result, 'within_threshold', result.within_threshold || '').toLowerCase().includes('not applicable')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getDisplayValue(result, 'within_threshold', result.within_threshold || '')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>
                      <Edit 
                        size={16} 
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => handleFieldEditStart(result.id, 'within_threshold')}
                      />
                    </div>
                  )}
                </td>
                <td className={`border border-border p-3 ${isFieldEdited(result.id, 'comments') ? 'bg-gray-300' : ''}`}>
                  {isFieldInEditMode(result.id, 'comments') ? (
                    <div className="space-y-2">
                      <Textarea
                        value={getDisplayValue(result, 'comments', result.comments || '')}
                        onChange={(e) => handleFieldEdit(result.id, 'comments', e.target.value)}
                        className="min-w-[200px] text-sm resize-none"
                        rows={3}
                        placeholder="Enter comments"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldEditSave(result.id, 'comments')}
                          className="text-xs px-2 py-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFieldEditCancel(result.id, 'comments')}
                          className="text-xs px-2 py-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="group relative cursor-pointer min-h-[60px] flex items-center"
                      onMouseEnter={() => {}}
                    >
                      <div className="truncate pr-8" title={getDisplayValue(result, 'comments', result.comments || '')}>
                        {getDisplayValue(result, 'comments', result.comments || '') || '-'}
                      </div>
                      <Edit 
                        size={16} 
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => handleFieldEditStart(result.id, 'comments')}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
          <span>Value has been edited</span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="px-8 py-2"
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default ESDDResultsTable;

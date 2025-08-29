import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, FileText, Download, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatBotWidget from "@/components/ChatBotWidget";
import ESDDResultsTable from "@/components/ESDDResultsTable";

interface Assessment {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AssessmentDocument {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  file_path: string;
  uploaded_at: string;
  session_id: string | null;
}

interface ManualEsddEntry {
  risk_category: string;
  screening_criterion: string;
  context: string;
}

const AssessmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [documents, setDocuments] = useState<AssessmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasManualEsdd, setHasManualEsdd] = useState(false);
  const [manualEsddEntries, setManualEsddEntries] = useState<ManualEsddEntry[]>([]);
  const [summaryNotesOpen, setSummaryNotesOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssessmentDetails();
    }
  }, [id]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch assessment details
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", id)
        .single();

      if (assessmentError) {
        throw assessmentError;
      }

      setAssessment(assessmentData);

      // Fetch assessment documents
      const { data: documentsData, error: documentsError } = await supabase
        .from("assessment_documents")
        .select("*")
        .eq("assessment_id", id)
        .order("uploaded_at", { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      setDocuments(documentsData || []);
      
      // Get session_id from the first document if available
      if (documentsData && documentsData.length > 0 && documentsData[0].session_id) {
        const currentSessionId = documentsData[0].session_id;
        setSessionId(currentSessionId);
        
        // Check for "Manual ESDD" in ai_output table
        const { data: aiOutputData, error: aiOutputError } = await supabase
          .from('ai_output')
          .select('*')
          .eq('session_id', currentSessionId);
        
        if (!aiOutputError && aiOutputData) {
          const hasManualEsddValue = aiOutputData.some(row => 
            row.within_threshold === "Manual ESDD"
          );
          setHasManualEsdd(hasManualEsddValue);
          
          // Get all Manual ESDD entries with context
          const manualEsddRows = aiOutputData.filter(row => 
            row.within_threshold === "Manual ESDD"
          );
          setManualEsddEntries(manualEsddRows);
        }
      }
    } catch (error: any) {
      console.error("Error fetching assessment details:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadDocument = async (document: AssessmentDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from("assessment-documents")
        .download(document.file_path);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Downloaded ${document.file_name}`,
      });
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Assessment Not Found</h1>
          <Button onClick={() => navigate("/reports")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo banner and back button */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/61690229-7cfd-4603-b3d7-cf1f5b7ccd95.png" 
                  alt="Logo" 
                  className="h-10 w-auto"
                />
                <div>
                  <p className="text-lg font-bold text-foreground">Reputational Risk Assessment Solution</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/reports")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">ESDD Screening Outcome of {assessment.title}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Status: <span className="font-medium capitalize">{assessment.status}</span></span>
              <span>Created: {formatDate(assessment.created_at)}</span>
              <span>Updated: {formatDate(assessment.updated_at)}</span>
            </div>
          </div>
        </div>


        <div className="grid gap-6">
          {/* Assessment Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-foreground">
                  {hasManualEsdd ? (
                    <span className="text-red-600 font-medium">
                      This deal requires further manual ESDD due to screening criteria {
                        manualEsddEntries
                          .map(entry => `${entry.risk_category} - ${entry.screening_criterion}`)
                          .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
                          .join(', ')
                      }.
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">As per the ESDD screening outcome, firm has been classified as Passed.</span>
                  )}
                </p>
                
                {hasManualEsdd && (
                  <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p>
                      For questions and clarifications, please use the <strong>AI Agent</strong> available on this page. 
                      Additionally, use the <strong>remark field</strong> in the screening results below for further note-taking. 
                      These remarks will be passed on to the further ESDD conductor.
                    </p>
                  </div>
                )}
              </div>
              
              <Collapsible open={summaryNotesOpen} onOpenChange={setSummaryNotesOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-0 mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Summary Notes</h3>
                    {summaryNotesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {manualEsddEntries.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        // Group entries by risk category
                        const groupedEntries = manualEsddEntries.reduce((acc, entry) => {
                          const category = entry.risk_category || 'Other';
                          if (!acc[category]) {
                            acc[category] = [];
                          }
                          acc[category].push(entry);
                          return acc;
                        }, {} as Record<string, any[]>);

                        // Define colors for different risk categories
                        const getCategoryColor = (category: string) => {
                          const lowerCategory = category.toLowerCase();
                          if (lowerCategory.includes('environmental')) {
                            return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', content: 'text-red-700' };
                          }
                          if (lowerCategory.includes('social')) {
                            return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', content: 'text-orange-700' };
                          }
                          if (lowerCategory.includes('governance')) {
                            return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', content: 'text-yellow-700' };
                          }
                          return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', content: 'text-gray-700' };
                        };

                        return Object.entries(groupedEntries).map(([category, entries]) => {
                          const colors = getCategoryColor(category);
                          return (
                            <div key={category} className={`p-4 ${colors.bg} border ${colors.border} rounded-lg`}>
                              <h4 className={`font-medium ${colors.text} mb-2`}>{category}</h4>
                              <ul className={`text-sm ${colors.content} space-y-1`}>
                                {entries.map((entry, index) => (
                                  <li key={index}>
                                    • <strong>{entry.screening_criterion}:</strong> {entry.context}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No manual ESDD entries found.</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ESDD Screening Results</CardTitle>
              <CardDescription>
                Detailed screening results for environmental and social due diligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionId ? (
                <ESDDResultsTable sessionId={sessionId} assessmentId={id!} />
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No session ID found for this assessment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Chatbot Widget */}
      <ChatBotWidget sessionId={sessionId} />
    </div>
  );
};

export default AssessmentDetails;

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
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-foreground">Assessment Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className={`p-4 rounded-lg border-l-4 ${hasManualEsdd ? 'bg-red-50 border-l-red-500 border border-red-200' : 'bg-green-50 border-l-green-500 border border-green-200'}`}>
                  <div className="text-base font-medium text-foreground">
                    {hasManualEsdd ? (
                      <div className="space-y-3">
                        <p className="text-red-800">
                          The deal requires further manual ESDD due to the following screening criteria:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {manualEsddEntries
                            .map(entry => ({
                              text: `${entry.risk_category} - ${entry.screening_criterion}`,
                              category: entry.risk_category
                            }))
                            .filter((value, index, self) => 
                              self.findIndex(v => v.text === value.text) === index
                            ) // Remove duplicates
                            .map((criteria, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-300"
                              >
                                {criteria.text}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    ) : (
                      <p className="text-green-800">As per the ESDD screening outcome, firm has been classified as Passed.</p>
                    )}
                  </div>
                </div>
                
                {hasManualEsdd && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Next Steps:</p>
                        <p>
                          For questions and clarifications, please use the <strong>AI Agent</strong> available on this page. 
                          Additionally, use the <strong>remark field</strong> in the screening results below for further note-taking. 
                          These remarks will be passed on to the further ESDD conductor.
                        </p>
                      </div>
                    </div>
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

                        return Object.entries(groupedEntries).map(([category, entries]) => (
                          <div key={category} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">{category}</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {entries.map((entry, index) => (
                                <li key={index}>
                                  • <strong>{entry.screening_criterion}:</strong> {entry.context}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ));
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

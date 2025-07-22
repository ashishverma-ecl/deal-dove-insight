import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

const AssessmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [documents, setDocuments] = useState<AssessmentDocument[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
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
              onClick={() => navigate("/dashboard")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">ESDD Screening Summary</h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Status: <span className="font-medium capitalize">{assessment.status}</span></span>
              <span>Created: {formatDate(assessment.created_at)}</span>
              <span>Updated: {formatDate(assessment.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ESDD Screening Results</CardTitle>
              <CardDescription>
                Detailed screening results for environmental and social due diligence
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    {[
                      { category: "Environmental", criteria: "Thermal Coal Mining", threshold: "1-5%", performance: "2%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Thermal Coal Power Generation", threshold: "5-25%", performance: "30%", outcome: "Manual ESDD Required" },
                      { category: "Environmental", criteria: "Oil & Gas Extraction - Unconventional", threshold: "0-5%", performance: "1%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Oil & Gas Extraction - Arctic/Deep Sea", threshold: "0-5%", performance: "0%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Oil & Gas Extraction - Fracking", threshold: "0-5%", performance: "3%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Oil & Gas Extraction - Tar Sands", threshold: "0-5%", performance: "0%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Nuclear Power Generation", threshold: "0%", performance: "0%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Uranium Mining", threshold: "0%", performance: "0%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Asbestos Production", threshold: "0%", performance: "0%", outcome: "Pass" },
                      { category: "Environmental", criteria: "Environmental Violations", threshold: "Risk score above 4", performance: "Risk score: 6", outcome: "Manual ESDD Required" },
                      { category: "Environmental", criteria: "Deforestation & Illegal Logging", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Environmental", criteria: "Biodiversity Destruction", threshold: "Risk score above 4", performance: "Risk score: 3", outcome: "Pass" },
                      { category: "Environmental", criteria: "Pollution & Contamination", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Environmental", criteria: "Climate Change Non-Alignment", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Environmental", criteria: "Hazardous Waste", threshold: "Risk score above 4", performance: "Risk score: 3", outcome: "Pass" },
                      { category: "Social", criteria: "Controversial Weapons", threshold: "0%", performance: "0%", outcome: "Pass" },
                      { category: "Social", criteria: "Conventional Weapons", threshold: "5-10%", performance: "12%", outcome: "Manual ESDD Required" },
                      { category: "Social", criteria: "Tobacco Production", threshold: "0-5%", performance: "0%", outcome: "Pass" },
                      { category: "Social", criteria: "Tobacco Distribution", threshold: "5-10%", performance: "7%", outcome: "Pass" },
                      { category: "Social", criteria: "Alcohol Production", threshold: "10%", performance: "8%", outcome: "Pass" },
                      { category: "Social", criteria: "Gambling Operations", threshold: "10%", performance: "0%", outcome: "Pass" },
                      { category: "Social", criteria: "Adult Entertainment", threshold: "10%", performance: "0%", outcome: "Pass" },
                      { category: "Social", criteria: "Human Rights Violations", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Social", criteria: "Labor Rights Violations", threshold: "Risk score above 4", performance: "Risk score: 3", outcome: "Pass" },
                      { category: "Social", criteria: "Child Labor", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Social", criteria: "Forced Labor", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Social", criteria: "Workplace Safety Violations", threshold: "Risk score above 4", performance: "Risk score: 5", outcome: "Manual ESDD Required" },
                      { category: "Social", criteria: "Conflict Minerals", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Social", criteria: "Supply Chain Violations", threshold: "Risk score above 4", performance: "Risk score: 3", outcome: "Pass" },
                      { category: "Social", criteria: "Community Impact Violations", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Governance", criteria: "UN Global Compact Violations", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Governance", criteria: "OECD Guidelines Violations", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Governance", criteria: "Corruption & Bribery", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Governance", criteria: "Tax Evasion & Avoidance", threshold: "Risk score above 4", performance: "Risk score: 3", outcome: "Pass" },
                      { category: "Governance", criteria: "Money Laundering", threshold: "Risk score above 4", performance: "Risk score: 6", outcome: "Manual ESDD Required" },
                      { category: "Governance", criteria: "Cybersecurity Failures", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" },
                      { category: "Governance", criteria: "Data Privacy Violations", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Governance", criteria: "Board Governance Failures", threshold: "Risk score above 4", performance: "Risk score: 3", outcome: "Pass" },
                      { category: "Governance", criteria: "Sanctioned Countries/Entities", threshold: "Risk score above 4", performance: "Risk score: 1", outcome: "Pass" },
                      { category: "Governance", criteria: "Regulatory Non-Compliance", threshold: "Risk score above 4", performance: "Risk score: 2", outcome: "Pass" }
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border border-border p-3">{index + 1}</td>
                        <td className="border border-border p-3">{row.category}</td>
                        <td className="border border-border p-3">
                          <Link 
                            to={`/screening-criteria/${encodeURIComponent(row.criteria)}`}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            {row.criteria}
                          </Link>
                        </td>
                        <td className="border border-border p-3">{row.threshold}</td>
                        <td className="border border-border p-3">{row.performance}</td>
                        <td className="border border-border p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.outcome === 'Pass' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetails;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
                      <th className="border border-border p-3 text-left font-semibold">Assessment Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { category: "Environmental", criteria: "Carbon Emissions", threshold: "< 50,000 tons CO2/year", outcome: "Pass" },
                      { category: "Environmental", criteria: "Water Consumption", threshold: "< 1M gallons/year", outcome: "Pass" },
                      { category: "Environmental", criteria: "Waste Management", threshold: "95% recycling rate", outcome: "Pass" },
                      { category: "Environmental", criteria: "Hazardous Materials", threshold: "Zero violations", outcome: "Pass" },
                      { category: "Environmental", criteria: "Air Quality Impact", threshold: "Within regulatory limits", outcome: "Pass" },
                      { category: "Social", criteria: "Labor Standards", threshold: "ILO compliance", outcome: "Pass" },
                      { category: "Social", criteria: "Community Impact", threshold: "Positive stakeholder feedback", outcome: "Pass" },
                      { category: "Social", criteria: "Health & Safety", threshold: "Zero incidents/year", outcome: "Fail" },
                      { category: "Social", criteria: "Human Rights", threshold: "Full compliance", outcome: "Pass" },
                      { category: "Social", criteria: "Supply Chain Ethics", threshold: "Certified suppliers", outcome: "Pass" },
                      { category: "Governance", criteria: "Board Independence", threshold: "> 50% independent", outcome: "Pass" },
                      { category: "Governance", criteria: "Anti-Corruption", threshold: "Zero tolerance policy", outcome: "Pass" },
                      { category: "Governance", criteria: "Transparency", threshold: "Annual ESG reporting", outcome: "Pass" },
                      { category: "Governance", criteria: "Risk Management", threshold: "Comprehensive framework", outcome: "Pass" },
                      { category: "Governance", criteria: "Regulatory Compliance", threshold: "No material violations", outcome: "Warning" },
                      { category: "Financial", criteria: "Credit Rating", threshold: "Investment grade", outcome: "Pass" },
                      { category: "Financial", criteria: "Debt-to-Equity", threshold: "< 60%", outcome: "Pass" },
                      { category: "Financial", criteria: "Cash Flow", threshold: "Positive for 3 years", outcome: "Pass" },
                      { category: "Financial", criteria: "Revenue Growth", threshold: "> 5% annually", outcome: "Pass" },
                      { category: "Financial", criteria: "Profitability", threshold: "> 10% EBITDA margin", outcome: "Pass" },
                      { category: "Operational", criteria: "Business Continuity", threshold: "Robust BCP in place", outcome: "Pass" },
                      { category: "Operational", criteria: "Cybersecurity", threshold: "ISO 27001 certified", outcome: "Pass" },
                      { category: "Operational", criteria: "Quality Management", threshold: "ISO 9001 certified", outcome: "Pass" },
                      { category: "Operational", criteria: "Innovation Investment", threshold: "> 3% of revenue", outcome: "Pass" },
                      { category: "Operational", criteria: "Market Position", threshold: "Top 3 in sector", outcome: "Pass" },
                      { category: "Reputational", criteria: "Media Coverage", threshold: "Neutral to positive", outcome: "Warning" },
                      { category: "Reputational", criteria: "Stakeholder Relations", threshold: "No major disputes", outcome: "Pass" },
                      { category: "Reputational", criteria: "Regulatory Actions", threshold: "No pending cases", outcome: "Pass" },
                      { category: "Reputational", criteria: "Industry Standing", threshold: "Good peer recognition", outcome: "Pass" },
                      { category: "Reputational", criteria: "Customer Satisfaction", threshold: "> 85% rating", outcome: "Pass" },
                      { category: "Legal", criteria: "Litigation Risk", threshold: "Low exposure", outcome: "Pass" },
                      { category: "Legal", criteria: "Contract Compliance", threshold: "100% adherence", outcome: "Pass" },
                      { category: "Legal", criteria: "Intellectual Property", threshold: "Protected portfolio", outcome: "Pass" },
                      { category: "Legal", criteria: "Regulatory Filings", threshold: "Timely submissions", outcome: "Pass" },
                      { category: "Legal", criteria: "Tax Compliance", threshold: "Clean tax record", outcome: "Pass" },
                      { category: "Strategic", criteria: "Market Diversification", threshold: "> 3 geographic markets", outcome: "Pass" },
                      { category: "Strategic", criteria: "Product Portfolio", threshold: "Diversified offering", outcome: "Pass" },
                      { category: "Strategic", criteria: "Competitive Position", threshold: "Sustainable advantage", outcome: "Pass" },
                      { category: "Strategic", criteria: "Digital Transformation", threshold: "Advanced digitization", outcome: "Pass" },
                      { category: "Strategic", criteria: "Sustainability Goals", threshold: "Net zero by 2050", outcome: "Pass" }
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border border-border p-3">{index + 1}</td>
                        <td className="border border-border p-3">{row.category}</td>
                        <td className="border border-border p-3">{row.criteria}</td>
                        <td className="border border-border p-3">{row.threshold}</td>
                        <td className="border border-border p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.outcome === 'Pass' 
                              ? 'bg-green-100 text-green-800' 
                              : row.outcome === 'Warning'
                              ? 'bg-yellow-100 text-yellow-800'
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
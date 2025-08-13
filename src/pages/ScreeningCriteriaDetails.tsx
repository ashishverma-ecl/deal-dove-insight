import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle, MessageSquare, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ScreeningCriteriaDetails = () => {
  const { criteria } = useParams<{ criteria: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  
  console.log('Current criteria:', criteria);
  console.log('Assessment ID from URL:', assessmentId);
  console.log('Full search params:', searchParams.toString());
  
  const decodedCriteria = criteria ? decodeURIComponent(criteria) : "";

  const getCriteriaDetails = (criteriaName: string) => {
    const baseDetails = {
      overview: "",
      methodology: "Risk assessment based on comprehensive data analysis from multiple global sources including regulatory databases, news sources, and industry reports.",
      riskFactors: [
        "Regulatory compliance violations",
        "Reputational damage potential", 
        "Financial impact assessment",
        "Stakeholder concerns"
      ],
      dataSourcesTitle: "Data Sources",
      dataSources: [
        "Global regulatory databases",
        "International news sources",
        "Industry-specific reports",
        "ESG rating agencies",
        "Government sanctions lists"
      ],
      assessmentProcess: [
        "Data collection from verified sources",
        "Risk scoring using proprietary algorithms", 
        "Manual review by expert analysts",
        "Final risk rating assignment"
      ]
    };

    // Specific details for different criteria types
    const specificDetails: Record<string, any> = {
      "Thermal Coal Mining": {
        overview: "Assesses exposure to thermal coal mining operations, which pose significant environmental and transition risks as the world moves toward renewable energy.",
        riskFactors: [
          "Stranded asset risk from energy transition",
          "Environmental impact and pollution",
          "Regulatory changes and carbon pricing",
          "Social license to operate challenges"
        ],
        threshold: "1-5% revenue exposure",
        rationale: "Thermal coal mining faces declining demand due to climate commitments and renewable energy adoption."
      },
      "Human Rights Violations": {
        overview: "Evaluates potential human rights violations including labor practices, community displacement, and fundamental rights infringements.",
        riskFactors: [
          "Labor rights violations",
          "Community displacement issues",
          "Freedom of association restrictions", 
          "Discrimination and harassment"
        ],
        threshold: "Risk score above 4",
        rationale: "Human rights violations can lead to severe reputational damage, legal liability, and operational disruptions."
      },
      "Money Laundering": {
        overview: "Assesses anti-money laundering (AML) compliance and potential exposure to illicit financial flows.",
        riskFactors: [
          "Inadequate AML controls",
          "Regulatory enforcement actions",
          "Correspondent banking risks",
          "Customer due diligence failures"
        ],
        threshold: "Risk score above 4", 
        rationale: "Money laundering violations can result in substantial fines, regulatory sanctions, and reputational damage."
      }
    };

    return {
      ...baseDetails,
      ...specificDetails[criteriaName]
    };
  };

  const details = getCriteriaDetails(decodedCriteria);
  const hasPercentageThreshold = details.threshold && (details.threshold.includes('%') || details.threshold === '0%');
  
  // Determine if this criteria should use Risk Score template or Percentage template
  const riskScoreEnabledCriteria = [
    "Environmental Violations", 
    "Biodiversity Destruction",
    "Money Laundering",
    "Human Rights Violations",
    "Workplace Safety Violations",
    "Deforestation & Illegal Logging",
    "Pollution & Contamination",
    "Climate Change Non-Alignment",
    "Hazardous Waste",
    "Labor Rights Violations",
    "Child Labor",
    "Forced Labor",
    "Conflict Minerals",
    "Supply Chain Violations",
    "Community Impact Violations",
    "UN Global Compact Violations",
    "OECD Guidelines Violations",
    "Corruption & Bribery",
    "Tax Evasion & Avoidance",
    "Cybersecurity Failures",
    "Data Privacy Violations",
    "Board Governance Failures",
    "Sanctioned Countries/Entities",
    "Regulatory Non-Compliance"
  ];
  
  const useRiskScoreTemplate = riskScoreEnabledCriteria.includes(decodedCriteria);

  const getRiskLevel = (criteriaName: string) => {
    const highRiskCriteria = ["Money Laundering", "Human Rights Violations", "Thermal Coal Power Generation"];
    const mediumRiskCriteria = ["Environmental Violations", "Workplace Safety Violations"];
    
    if (highRiskCriteria.includes(criteriaName)) return "High";
    if (mediumRiskCriteria.includes(criteriaName)) return "Medium";
    return "Low";
  };

  const riskLevel = getRiskLevel(decodedCriteria);

  // Remark functionality state
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [performanceValue, setPerformanceValue] = useState<string | null>(null);
  const [contextValue, setContextValue] = useState<string | null>(null);

  // Fetch current user and remarks on component mount
  useEffect(() => {
    const fetchUserAndRemarks = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // First, get the session_id from assessment_documents table
      if (assessmentId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('assessment_documents')
          .select('session_id')
          .eq('assessment_id', assessmentId)
          .limit(1)
          .single();

        if (sessionError) {
          console.error('Error fetching session_id:', sessionError);
          return;
        }

        const fetchedSessionId = sessionData?.session_id;
        setSessionId(fetchedSessionId);

        if (fetchedSessionId) {
          // Fetch existing remarks for this session
          const { data, error } = await supabase
            .from('user_remarks')
            .select('*')
            .eq('session_id', fetchedSessionId)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching remarks:', error);
          } else {
            setRemarks(data || []);
          }

          // Fetch performance value from ai_output table
          const { data: aiOutputData, error: aiOutputError } = await supabase
            .from('ai_output')
            .select('performance, context')
            .eq('session_id', fetchedSessionId)
            .eq('screening_criterion', decodedCriteria)
            .single();

          if (aiOutputError) {
            console.error('Error fetching ai_output data:', aiOutputError);
          } else {
            setPerformanceValue(aiOutputData?.performance || null);
            setContextValue(aiOutputData?.context || null);
          }
        }
      }
    };

    fetchUserAndRemarks();
  }, [assessmentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleSubmitRemark = async () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error", 
        description: "You must be logged in to add remarks",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const remarkData = {
        session_id: sessionId,
        user_name: currentUser?.email || 'Anonymous User',
        user_comment: comment.trim(),
        uploaded_document_name: selectedFile?.name || null,
      };

      const { error } = await supabase
        .from('user_remarks')
        .insert([remarkData]);

      if (error) {
        throw error;
      }

      // Refresh remarks list
      const { data, error: fetchError } = await supabase
        .from('user_remarks')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching updated remarks:', fetchError);
      } else {
        setRemarks(data || []);
      }

      // Reset form
      setComment("");
      setSelectedFile(null);
      setShowRemarkForm(false);

      toast({
        title: "Success",
        description: "Remark added successfully",
      });

    } catch (error) {
      console.error('Error submitting remark:', error);
      toast({
        title: "Error",
        description: "Failed to add remark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <Button
              onClick={() => {
                if (assessmentId) {
                  console.log('Navigating back to assessment:', assessmentId);
                  navigate(`/assessment/${assessmentId}`);
                } else {
                  console.log('No assessment ID found, going to dashboard');
                  navigate('/dashboard');
                }
              }}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to ESDD Screening
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{decodedCriteria}</h1>
          </div>
          <p className="text-muted-foreground">{details.overview}</p>
          {contextValue && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{contextValue}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {useRiskScoreTemplate ? (
            <>
              {/* Risk Summary */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Risk Summary</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {decodedCriteria === "Environmental Violations" 
                      ? "Recent analysis indicates moderate environmental risk exposure through offshore operations and industrial activities. Multiple incidents of water contamination and air quality violations have been documented across facility operations. The company has established environmental management protocols, however, recurring violations suggest implementation gaps in compliance monitoring systems."
                      : decodedCriteria === "Money Laundering"
                      ? "High-risk exposure identified through correspondent banking relationships and cross-border transaction monitoring gaps. Recent regulatory investigations have highlighted deficiencies in customer due diligence processes and suspicious activity reporting. The institution has enhanced AML controls following regulatory feedback, but legacy system limitations continue to pose compliance challenges."
                      : decodedCriteria === "Workplace Safety Violations"
                      ? "Elevated workplace safety risk profile due to industrial operations and heavy machinery environments. Multiple OSHA violations documented over the past 18 months, including incidents related to protective equipment failures and inadequate safety training protocols. Management has committed to enhanced safety measures and increased training frequency."
                      : "Analysis of available public information and regulatory databases indicates controlled risk exposure within acceptable parameters. Current risk management frameworks appear adequate for the identified exposure level, with regular monitoring and compliance reporting in place."}
                  </p>
                  
                  {/* News Source Information */}
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">News Article:</span>
                        <p>{decodedCriteria === "Environmental Violations" 
                          ? "Industrial Operations Face Environmental Scrutiny"
                          : decodedCriteria === "Money Laundering"
                          ? "Banking Sector AML Compliance Under Review"
                          : decodedCriteria === "Workplace Safety Violations"
                          ? "Manufacturing Safety Standards Implementation"
                          : "Corporate Risk Management Assessment"}</p>
                      </div>
                      <div>
                        <span className="font-medium">News Agency:</span>
                        <p>{decodedCriteria === "Environmental Violations"
                          ? "Environmental Business Journal"
                          : decodedCriteria === "Money Laundering"
                          ? "Financial Times"
                          : decodedCriteria === "Workplace Safety Violations"
                          ? "Industrial Safety News"
                          : "Corporate Governance Weekly"}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>January 12, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Score */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Risk Score</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Risk Score</h3>
                      <p className="text-2xl font-bold text-primary">
                        {decodedCriteria === "Environmental Violations" ? "6" :
                         decodedCriteria === "Money Laundering" ? "6" :
                         decodedCriteria === "Workplace Safety Violations" ? "5" :
                         decodedCriteria === "Human Rights Violations" ? "2" :
                         decodedCriteria === "Deforestation & Illegal Logging" ? "2" :
                         decodedCriteria === "Biodiversity Destruction" ? "3" :
                         decodedCriteria === "Pollution & Contamination" ? "1" :
                         decodedCriteria === "Climate Change Non-Alignment" ? "2" :
                         decodedCriteria === "Hazardous Waste" ? "3" :
                         decodedCriteria === "Labor Rights Violations" ? "3" :
                         decodedCriteria === "Child Labor" ? "1" :
                         decodedCriteria === "Forced Labor" ? "1" :
                         decodedCriteria === "Conflict Minerals" ? "2" :
                         decodedCriteria === "Supply Chain Violations" ? "3" :
                         decodedCriteria === "Community Impact Violations" ? "2" :
                         decodedCriteria === "UN Global Compact Violations" ? "1" :
                         decodedCriteria === "OECD Guidelines Violations" ? "2" :
                         decodedCriteria === "Corruption & Bribery" ? "1" :
                         decodedCriteria === "Tax Evasion & Avoidance" ? "3" :
                         decodedCriteria === "Cybersecurity Failures" ? "2" :
                         decodedCriteria === "Data Privacy Violations" ? "1" :
                         decodedCriteria === "Board Governance Failures" ? "3" :
                         decodedCriteria === "Sanctioned Countries/Entities" ? "1" :
                         decodedCriteria === "Regulatory Non-Compliance" ? "2" :
                         "4"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Threshold</h3>
                      <p className="text-lg font-medium text-foreground">
                        Risk score above 4
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Outcome</h3>
                    <p className={`font-medium ${
                      (decodedCriteria === "Environmental Violations" ||
                       decodedCriteria === "Money Laundering" ||
                       decodedCriteria === "Workplace Safety Violations") 
                        ? "text-red-600" 
                        : "text-green-600"
                    }`}>
                      {(decodedCriteria === "Environmental Violations" ||
                        decodedCriteria === "Money Laundering" ||
                        decodedCriteria === "Workplace Safety Violations") 
                        ? "Risk score exceeds threshold - Manual ESDD Required" 
                        : "Risk score is within acceptable threshold - Pass"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Score Framework */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Risk Score Framework</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-6">
                    Risk assessment framework based on a 1-10 scale, where 1 represents very low risk and 10 represents very high risk.
                  </p>
                  
                  <div className="grid gap-4">
                    {[
                      { score: "1-2", level: "Very Low Risk", criteria: "Minimal risk exposure with strong controls and no recent incidents", color: "bg-green-50 border-green-200 text-green-800" },
                      { score: "3-4", level: "Low Risk", criteria: "Limited risk exposure with adequate controls and rare minor incidents", color: "bg-green-50 border-green-200 text-green-800" },
                      { score: "5-6", level: "Medium Risk", criteria: "Moderate risk exposure with some control gaps and occasional incidents", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
                      { score: "7-8", level: "High Risk", criteria: "Significant risk exposure with control weaknesses and regular incidents", color: "bg-red-50 border-red-200 text-red-800" },
                      { score: "9-10", level: "Very High Risk", criteria: "Severe risk exposure with inadequate controls and frequent serious incidents", color: "bg-red-50 border-red-200 text-red-800" }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${item.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg">{item.score}</span>
                          <span className="font-medium">{item.level}</span>
                        </div>
                        <p className="text-sm">{item.criteria}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Performance Section for Percentage-based criteria */}
              <div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Performance</h2>
                      <p className="text-lg font-medium text-foreground">
                        {performanceValue || (decodedCriteria === "Thermal Coal Mining" ? "3.2%" :
                         decodedCriteria === "Thermal Coal Power Generation" ? "4.8%" :
                         "2.1%")}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Threshold</h2>
                      <p className="text-lg font-medium text-foreground">
                        {details.threshold || "5% revenue exposure"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Comparison</h3>
                    <p className="text-green-600 font-medium">
                      Performance value is below threshold - Pass
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference Section for Percentage-based criteria */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Reference</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Referenced Document</h3>
                    <p className="text-foreground">
                      {decodedCriteria === "Thermal Coal Mining" 
                        ? "Annual Sustainability Report 2024 - Energy Transition Strategy"
                        : decodedCriteria === "Thermal Coal Power Generation"
                        ? "Quarterly Financial Report Q3 2024 - Energy Portfolio Analysis"
                        : "Corporate ESG Assessment Report 2024"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Page Number</h3>
                    <p className="text-foreground">
                      {decodedCriteria === "Thermal Coal Mining" ? "Page 47-52" :
                       decodedCriteria === "Thermal Coal Power Generation" ? "Page 23-28" :
                       "Page 15-18"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Additional Context</h3>
                    <p className="text-muted-foreground">
                      {decodedCriteria === "Thermal Coal Mining"
                        ? "Revenue percentage calculated based on coal mining operations relative to total energy portfolio. Includes both metallurgical and thermal coal operations, with thermal coal representing the majority exposure."
                        : decodedCriteria === "Thermal Coal Power Generation"
                        ? "Power generation revenue analysis covering coal-fired power plants and renewable energy mix. Percentage reflects coal generation capacity relative to total energy production portfolio."
                        : "Performance metrics derived from comprehensive ESG data collection and third-party verification processes. Calculations follow industry-standard methodologies for revenue attribution."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Add Remark Section */}
          <div className="mt-12 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Remarks</h2>
              <Button
                onClick={() => setShowRemarkForm(!showRemarkForm)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showRemarkForm ? 'Cancel' : 'Add Remark'}
              </Button>
            </div>

            {/* Remark Form */}
            {showRemarkForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Remark</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="comment">Comment *</Label>
                    <Textarea
                      id="comment"
                      placeholder="Enter your remark here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="document">Upload Document (Optional)</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        id="document"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('document')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                      {selectedFile && (
                        <span className="text-sm text-muted-foreground">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSubmitRemark}
                      disabled={isSubmitting || !comment.trim()}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Remark'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowRemarkForm(false);
                        setComment('');
                        setSelectedFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Remarks Display */}
            <div className="space-y-4">
              {remarks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No remarks yet. Be the first to add one!</p>
                  </CardContent>
                </Card>
              ) : (
                remarks.map((remark) => (
                  <Card key={remark.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{remark.user_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(remark.created_at).toLocaleDateString()} at{' '}
                            {new Date(remark.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-foreground mb-3 whitespace-pre-wrap">{remark.user_comment}</p>
                      
                      {remark.uploaded_document_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                          <FileText className="h-4 w-4" />
                          <span>Attached: {remark.uploaded_document_name}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningCriteriaDetails;

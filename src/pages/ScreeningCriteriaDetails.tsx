import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

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
      overview: `This screening criteria evaluates ${criteriaName.toLowerCase()} risks in corporate lending and investment decisions.`,
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

  const getRiskLevel = (criteriaName: string) => {
    const highRiskCriteria = ["Money Laundering", "Human Rights Violations", "Thermal Coal Power Generation"];
    const mediumRiskCriteria = ["Environmental Violations", "Workplace Safety Violations"];
    
    if (highRiskCriteria.includes(criteriaName)) return "High";
    if (mediumRiskCriteria.includes(criteriaName)) return "Medium";
    return "Low";
  };

  const riskLevel = getRiskLevel(decodedCriteria);

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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{decodedCriteria}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              riskLevel === 'High' ? 'bg-red-100 text-red-800' :
              riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {riskLevel} Risk
            </span>
          </div>
          <p className="text-muted-foreground text-lg">{details.overview}</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Performance</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Performance Value</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-2xl font-bold text-primary">
                        {decodedCriteria === "Thermal Coal Mining" ? "2%" : 
                         decodedCriteria === "Human Rights Violations" ? "Risk score: 2" :
                         decodedCriteria === "Money Laundering" ? "Risk score: 6" :
                         decodedCriteria === "Thermal Coal Power Generation" ? "30%" :
                         decodedCriteria === "Uranium Mining" ? "0%" :
                         "Risk score: 3"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Threshold</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-lg font-medium text-foreground">
                        {details.threshold || "Risk score above 4"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Comparison Against Threshold</h3>
                  <div className={`p-4 rounded-md border-l-4 ${
                    (decodedCriteria === "Thermal Coal Power Generation" || 
                     decodedCriteria === "Money Laundering") 
                      ? "bg-red-50 border-red-500 text-red-800" 
                      : "bg-green-50 border-green-500 text-green-800"
                  }`}>
                    <p className="font-medium">
                      {(decodedCriteria === "Thermal Coal Power Generation" || 
                        decodedCriteria === "Money Laundering") 
                        ? "Performance exceeds threshold - Manual ESDD Required" 
                        : "Performance is within acceptable threshold - Pass"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Reference</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Referenced Document</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium text-foreground">Deutsche-Bank-Summary-ESDD.pdf</p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><span className="font-medium">Page Number:</span> {
                        decodedCriteria === "Thermal Coal Mining" ? "Page 15, Section 4.2" :
                        decodedCriteria === "Human Rights Violations" ? "Page 23, Section 6.1" :
                        decodedCriteria === "Money Laundering" ? "Page 31, Section 8.3" :
                        decodedCriteria === "Thermal Coal Power Generation" ? "Page 16, Section 4.3" :
                        decodedCriteria === "Uranium Mining" ? "Page 18, Section 4.5" :
                        "Page 25, Section 7.2"
                      }</p>
                      <p><span className="font-medium">Reference Source:</span> Company Annual Report 2024, ESG Risk Assessment Section</p>
                      <p><span className="font-medium">Data Extraction Date:</span> January 15, 2025</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Additional Context</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Performance data extracted from company's disclosed revenue breakdown and risk assessment reports. 
                      Cross-referenced with third-party ESG databases and regulatory filings to ensure accuracy and completeness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningCriteriaDetails;

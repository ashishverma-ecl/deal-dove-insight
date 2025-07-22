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
  const hasPercentageThreshold = details.threshold && (details.threshold.includes('%') || details.threshold === '0%');

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

        {hasPercentageThreshold ? (
          // New template matching the uploaded design for percentage-based thresholds
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Performance</h2>
              <div className="border border-border rounded-lg p-6 bg-card">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Performance Value</h3>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-3xl font-bold text-primary">
                        {decodedCriteria === "Thermal Coal Mining" ? "2%" : 
                         decodedCriteria === "Thermal Coal Power Generation" ? "30%" :
                         decodedCriteria === "Oil & Gas Extraction - Unconventional" ? "1%" :
                         decodedCriteria === "Oil & Gas Extraction - Arctic/Deep Sea" ? "0%" :
                         decodedCriteria === "Oil & Gas Extraction - Fracking" ? "3%" :
                         decodedCriteria === "Oil & Gas Extraction - Tar Sands" ? "0%" :
                         decodedCriteria === "Nuclear Power Generation" ? "0%" :
                         decodedCriteria === "Uranium Mining" ? "0%" :
                         decodedCriteria === "Asbestos Production" ? "0%" :
                         decodedCriteria === "Controversial Weapons" ? "0%" :
                         decodedCriteria === "Conventional Weapons" ? "12%" :
                         decodedCriteria === "Tobacco Production" ? "0%" :
                         decodedCriteria === "Tobacco Distribution" ? "7%" :
                         decodedCriteria === "Alcohol Production" ? "8%" :
                         decodedCriteria === "Gambling Operations" ? "0%" :
                         decodedCriteria === "Adult Entertainment" ? "0%" :
                         "0%"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Threshold</h3>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-lg font-medium text-foreground">
                        {details.threshold || "0%"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Comparison Against Threshold</h3>
                  <div className={`p-4 rounded-md border-l-4 ${
                    (decodedCriteria === "Thermal Coal Power Generation" || 
                     decodedCriteria === "Conventional Weapons") 
                      ? "bg-red-50 border-red-500" 
                      : "bg-green-50 border-green-500"
                  }`}>
                    <p className={`font-medium ${
                      (decodedCriteria === "Thermal Coal Power Generation" || 
                       decodedCriteria === "Conventional Weapons") 
                        ? "text-red-800" 
                        : "text-green-800"
                    }`}>
                      {(decodedCriteria === "Thermal Coal Power Generation" || 
                        decodedCriteria === "Conventional Weapons") 
                        ? "Performance exceeds threshold - Manual ESDD Required" 
                        : "Performance is within acceptable threshold - Pass"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Reference</h2>
              <div className="border border-border rounded-lg p-6 bg-card">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Referenced Document</h3>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground">Deutsche-Bank-Summary-ESDD.pdf</p>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div><span className="font-medium">Page Number:</span> {
                          decodedCriteria === "Thermal Coal Mining" ? "Page 15, Section 4.2" :
                          decodedCriteria === "Thermal Coal Power Generation" ? "Page 16, Section 4.3" :
                          decodedCriteria === "Oil & Gas Extraction - Unconventional" ? "Page 17, Section 4.4" :
                          decodedCriteria === "Oil & Gas Extraction - Arctic/Deep Sea" ? "Page 18, Section 4.5" :
                          decodedCriteria === "Oil & Gas Extraction - Fracking" ? "Page 19, Section 4.6" :
                          decodedCriteria === "Oil & Gas Extraction - Tar Sands" ? "Page 20, Section 4.7" :
                          decodedCriteria === "Nuclear Power Generation" ? "Page 21, Section 4.8" :
                          decodedCriteria === "Uranium Mining" ? "Page 22, Section 4.9" :
                          decodedCriteria === "Asbestos Production" ? "Page 23, Section 4.10" :
                          decodedCriteria === "Controversial Weapons" ? "Page 26, Section 6.1" :
                          decodedCriteria === "Conventional Weapons" ? "Page 27, Section 6.2" :
                          decodedCriteria === "Tobacco Production" ? "Page 28, Section 6.3" :
                          decodedCriteria === "Tobacco Distribution" ? "Page 29, Section 6.4" :
                          decodedCriteria === "Alcohol Production" ? "Page 30, Section 6.5" :
                          decodedCriteria === "Gambling Operations" ? "Page 31, Section 6.6" :
                          decodedCriteria === "Adult Entertainment" ? "Page 32, Section 6.7" :
                          "Page 25, Section 7.2"
                        }</div>
                        <div><span className="font-medium">Reference Source:</span> Company Annual Report 2024, ESG Risk Assessment Section</div>
                        <div><span className="font-medium">Data Extraction Date:</span> January 15, 2025</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Additional Context</h3>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Performance data extracted from company&apos;s disclosed revenue breakdown and risk assessment reports. 
                        Cross-referenced with third-party ESG databases and regulatory filings to ensure accuracy and completeness.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Original template for risk score-based thresholds
          <div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Risk Factors
                  </CardTitle>
                  <CardDescription>
                    Key risk elements evaluated for this criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {details.riskFactors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Assessment Process
                  </CardTitle>
                  <CardDescription>
                    How this criteria is evaluated and scored
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {details.assessmentProcess.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {details.threshold && (
                <Card>
                  <CardHeader>
                    <CardTitle>Threshold & Rationale</CardTitle>
                    <CardDescription>
                      Risk threshold and reasoning for this criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Risk Threshold</h4>
                        <p className="text-sm bg-muted p-3 rounded-md">{details.threshold}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Rationale</h4>
                        <p className="text-sm text-muted-foreground">{details.rationale}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                  <CardDescription>
                    Information sources used for assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {details.dataSources.map((source: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{source}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Methodology</CardTitle>
                <CardDescription>
                  Detailed assessment methodology for this screening criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {details.methodology}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningCriteriaDetails;

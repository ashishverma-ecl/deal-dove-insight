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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              riskLevel === 'High' ? 'bg-red-100 text-red-800' :
              riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {riskLevel} Risk
            </span>
          </div>
          <p className="text-muted-foreground">{details.overview}</p>
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
                <h2 className="text-xl font-bold text-foreground mb-4">Performance</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Performance Value</h3>
                      <p className="text-2xl font-bold text-primary">
                        {decodedCriteria === "Thermal Coal Mining" ? "3.2%" :
                         decodedCriteria === "Thermal Coal Power Generation" ? "4.8%" :
                         "2.1%"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Threshold</h3>
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
        </div>
      </div>
    </div>
  );
};

export default ScreeningCriteriaDetails;

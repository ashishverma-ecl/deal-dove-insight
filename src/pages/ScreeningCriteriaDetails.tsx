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

  const getRiskScoreFramework = (criteriaName: string) => {
    switch (criteriaName) {
      case "Deforestation & Illegal Logging":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The system shows clear evidence of being EUDR-ready, with commodity mapping completed, geolocation used for all EU-bound volumes, a live DDS process, a documented risk assessment and mitigation plan (including satellite checks), supplier contracts that prohibit deforestation post-2020 and ensure legal compliance, a published monitoring cadence, and an accessible grievance channel. There are no credible allegations pending.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "Policies align with the EUDR and NDPE, with over 90% geolocation coverage and a time-bound plan to address small gaps. DDS preparation is underway with pilot filings, and any isolated legacy allegations have been addressed with completed remediation. The system mainly operates in low to standard-risk regions.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "There are material gaps in traceability (e.g., only at the mill level) for some of the EU supply chain, and DDS has not been filed yet. A risk assessment is referenced but lacks evidence of systematic mitigation. There is partial reliance on certifications, and while allegations recur in parts of the supply chain, there has been no third-party verification of remediation. The supply mix includes both standard and high-risk sourcing.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "A significant portion of volumes lack plot-level geolocation, and sourcing is done from high-risk regions without enhanced due diligence. There is credible evidence of post-2020 deforestation, forest degradation, or illegal logging in the supply chain, with weak or denied remediation. DDS is not yet ready, and supplier enforcement is either weak or non-existent.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "There are confirmed links to post-2020 deforestation, illegal logging, active land-use violations, or enforcement actions (such as seizures, sanctions, or injunctions). Remediation efforts are either non-existent or ineffective, and there is continued sale to the EU without DDS. There is a refusal to provide geolocation, and the system has a high dependency on high-risk regions. It is recommended to not proceed, exit, or escalate the matter.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Biodiversity Destruction":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company has a biodiversity policy aligned with CBD guidelines, conducts biodiversity EIAs for all relevant projects, and does not operate in protected or high-biodiversity areas without offsets. It reports measurable positive biodiversity outcomes, and independent verification is available.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has isolated minor impacts in non-critical areas, conducts EIAs, and requires limited restoration. Remediation has been completed with evidence, and over 90% of operations are biodiversity-compliant. There are no repeated incidents.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company experiences multiple but non-systemic biodiversity impacts, with incomplete or delayed mitigation or restoration. Monitoring is limited, and there is partial compliance with CBD targets. Occasionally, operations occur in sensitive areas without offsets.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company has systemic biodiversity impacts in sensitive or protected areas, with inadequate or no mitigation efforts. There is recurring non-compliance with CBD objectives, and credible NGO/media allegations remain unremediated.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company is causing ongoing, large-scale biodiversity destruction, with confirmed illegal operations in protected areas. There is a loss of IUCN Red List species due to company activity, and no mitigation or restoration efforts are made. The company is under regulatory investigation or has been sanctioned.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Human Rights Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company has a public human rights policy aligned with UNGC Principles 1 & 2 and the UDHR, with a fully implemented human rights due diligence (HRDD) system across operations and the supply chain. It publishes annual impact assessments, has had no credible allegations in the past five years, provides independent third-party verification, and offers accessible grievance mechanisms with disclosed remediation records in all operating regions.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has minor, isolated allegations (e.g., a single discrimination complaint) that were investigated and remediated. The HRDD system covers over 90% of operations and key suppliers, with regular training and documented stakeholder engagement. There have been no repeat incidents.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company has multiple credible allegations in limited regions or supply chain tiers. The HRDD system is partial, covering only direct operations, and remediation efforts are underway but incomplete. Grievance mechanisms exist but lack accessibility or transparency for affected stakeholders.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company has systemic or recurring credible allegations, such as suppression of unions, forced displacement, or indigenous rights violations. There is an absence of comprehensive HRDD, with weak or absent remediation efforts and a failure to engage affected communities. Transparency in reporting is lacking.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company is involved in ongoing severe violations, such as complicity in killings, torture, or forced labor. There is no human rights policy or HRDD system in place, and the company refuses to remediate or engage. It is under investigation or sanctioned by international bodies, such as the UN or OECD NCP, for human rights abuses.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Labor Rights Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "No evidence of labor rights violations. The company fully complies with ILO Conventions No. 87 (Freedom of Association), No. 98 (Right to Organize and Collective Bargaining), and No. 100 (Equal Remuneration). Compliance is verified through audits, ILO databases, or ESG disclosures. The firm has publicly available labor policies, grievance redressal mechanisms, and high ESG ratings confirming adherence.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "There is a single, documented instance of a labor issue such as a delay in wage payments, unclear grievance procedures, or ambiguous union recognition policy. These are localized and non-systemic (e.g., one facility or subcontractor), and the company has acknowledged the incident and implemented a time-bound corrective action plan. There is evidence of follow-up via internal audits or stakeholder communication, indicating intent to align with ILO norms.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple but non-systemic violations are observed, such as delayed wages at multiple facilities, uncertified working hours, or frequent contractor-based employment lacking benefits. The company may publish partial disclosures (e.g., Code of Conduct) but lacks site-level verification, or corrective efforts are in early stages. There is no third-party validation, and the company does not provide full transparency on monitoring mechanisms.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "There is widespread evidence of labor rights violations such as consistent underpayment, forced overtime without consent, or banning of unions across operations or major suppliers. The company may deny the issues or provide inadequate disclosures. No third-party audits are available, and internal grievance mechanisms are either absent or dysfunctional. These violations suggest a pattern of disregard for ILO core labor standards.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "There are ongoing, systemic, and intentional abuses such as active union busting, physical threats against organizers, racial or gender-based pay discrimination, or use of forced/bonded labor. No remediation or transparency is evident. The company may be under investigation, face NGO blacklisting, or operate in high-risk jurisdictions with no effective labor oversight.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "OECD Guidelines Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "No evidence of OECD violations. Company demonstrates proactive adherence to all OECD Guidelines chapters, verified by NCP records, audits, or disclosures.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "Isolated allegation or NCP enquiry without confirmation of wrongdoing, remediated promptly, with corrective measures in place.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple allegations or controversies in different OECD principle areas without complete resolution. Limited corrective action or partial disclosures. No independent verification.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "NCP final statement or credible evidence confirming systemic non-compliance in one or more OECD chapters. Inadequate remediation or transparency.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Ongoing, systemic, and severe violations across multiple OECD principle areas. Repeated NCP findings of non-compliance, refusal to cooperate with OECD processes, or sanctions resulting from violations.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Corruption & Bribery":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "There is no evidence of corruption or bribery. The company proactively adheres to UNCAC principles with robust anti-bribery policies, employee training, third-party due diligence, and independent audits confirming compliance.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "An isolated allegation or regulatory inquiry related to bribery or facilitation payments occurred, but no wrongdoing was confirmed. Any identified issue has been promptly remediated with documented corrective measures and process improvements.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple allegations or confirmed minor incidents of bribery, fraud, or corrupt practices in different jurisdictions or business units, but without evidence of systemic issues. Remediation efforts are partial or lack independent verification.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Credible evidence or regulatory findings confirm significant bribery or corruption involving senior management, major contracts, or cross-border dealings. Remediation is inadequate, delayed, or lacks transparency, raising ongoing governance concerns.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Ongoing, systemic, and severe corruption or bribery exists across multiple operations or jurisdictions. There are repeated regulatory or judicial findings, refusal to cooperate with investigations, and substantial penalties, sanctions, or criminal convictions under anti-corruption laws.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Tax Evasion & Avoidance":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "There is no evidence of tax evasion or aggressive avoidance. The company provides transparent public tax reporting aligned with OECD principles, including country-by-country reporting and BEPS compliance.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "An isolated allegation or audit finding occurred without confirmation of wrongdoing. Any identified issue was promptly remediated with improved transparency and policy updates.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple allegations or confirmed minor incidents of tax avoidance occurred in different jurisdictions, but not on a systemic scale. Remediation efforts were limited or partial, with gaps in public tax disclosures.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Credible evidence or regulatory findings confirm significant tax evasion or aggressive avoidance strategies affecting multiple jurisdictions. Remediation is inadequate, delayed, or the company faces repeat allegations.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Ongoing, systemic, and severe tax evasion or avoidance schemes exist across multiple operations, confirmed by regulatory or judicial findings. The company refuses to cooperate with tax authorities, faces significant penalties, or has repeatedly violated OECD tax-related principles.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Money Laundering":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company has a comprehensive AML framework fully aligned with FATF Recommendations, conducts regular independent audits, maintains robust KYC/CDD processes, has zero enforcement actions, and provides transparent public disclosures on AML measures.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has an AML policy and systems in place, with minor procedural gaps identified and promptly remediated. No confirmed violations have occurred, and disclosures are transparent.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company has partial AML implementation, such as inconsistent CDD practices, isolated regulatory warnings, and gaps in reporting or monitoring. Remediation is in progress but remains unverified.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company has significant AML deficiencies, including confirmed violations or fines, inadequate KYC/CDD processes, operations in high-risk jurisdictions without effective mitigation, and weak disclosures.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company is experiencing ongoing, systemic AML failures, with repeated violations, deliberate evasion of AML requirements, and refusal to cooperate with regulators. It is under sanctions or criminal investigation for money laundering.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      default:
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "No violations found. The company complies with all relevant guidelines and regulations. The company has demonstrated full integration of risk management practices.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "Minor violations or isolated non-compliance have been identified. These violations are being addressed.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Several significant violations have been identified. The company is actively working to resolve the issues.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Multiple major violations have been identified with little or no efforts to comply. The company has not demonstrated adequate steps for remediation.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "These are severe violations that pose a substantial threat. The company has demonstrated lack of corrective measures.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];
    }
  };

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
  const [thresholdValue, setThresholdValue] = useState<string | null>(null);
  const [withinThresholdValue, setWithinThresholdValue] = useState<string | null>(null);
  const [referenceDocumentsValue, setReferenceDocumentsValue] = useState<string | null>(null);

  // Fetch current user and remarks on component mount
  useEffect(() => {
    const fetchUserAndRemarks = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // First, get the session_id from assessment_documents table
      if (assessmentId) {
        console.log('Fetching session_id for assessment:', assessmentId);
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
        console.log('Fetched session_id:', fetchedSessionId);
        setSessionId(fetchedSessionId);

        if (fetchedSessionId) {
          // Fetch existing remarks for this session and specific screening criteria
          console.log('Fetching remarks for session:', fetchedSessionId, 'and criteria:', decodedCriteria);
          const { data: remarksData, error: remarksError } = await supabase
            .from('user_remarks')
            .select('*')
            .eq('session_id', fetchedSessionId)
            .eq('screening_criterion', decodedCriteria)
            .order('created_at', { ascending: true });

          if (remarksError) {
            console.error('Error fetching remarks:', remarksError);
          } else {
            console.log('Fetched remarks:', remarksData);
            setRemarks(remarksData || []);
          }

          // Fetch AI output data for this session and criteria
          console.log('Fetching AI output for session:', fetchedSessionId, 'and criteria:', decodedCriteria);
          const { data: aiOutputData, error: aiOutputError } = await supabase
            .from('ai_output')
            .select('performance, context, threshold, within_threshold, reference_documents')
            .eq('session_id', fetchedSessionId)
            .eq('screening_criterion', decodedCriteria)
            .single();

          if (aiOutputError) {
            console.error('Error fetching ai_output data:', aiOutputError);
          } else {
            console.log('Fetched AI output data:', aiOutputData);
            setPerformanceValue(aiOutputData?.performance || null);
            setContextValue(aiOutputData?.context || null);
            setThresholdValue(aiOutputData?.threshold || null);
            setWithinThresholdValue(aiOutputData?.within_threshold || null);
            setReferenceDocumentsValue(aiOutputData?.reference_documents || null);
          }
        }
      }
    };

    fetchUserAndRemarks();
  }, [assessmentId, decodedCriteria]); // Added decodedCriteria to dependencies

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
        screening_criterion: decodedCriteria,
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

      // Refresh remarks list for this specific screening criteria
      console.log('Refreshing remarks for session:', sessionId, 'and criteria:', decodedCriteria);
      const { data, error: fetchError } = await supabase
        .from('user_remarks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('screening_criterion', decodedCriteria)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching updated remarks:', fetchError);
      } else {
        console.log('Updated remarks:', data);
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
              {/* Performance, Threshold, Outcome, Reference Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Performance</h2>
                  <p className="text-muted-foreground">{performanceValue || "Not applicable"}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Threshold</h2>
                  <p className="text-muted-foreground">{thresholdValue || "0-5%"}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Outcome</h2>
                  <p className="text-muted-foreground">{withinThresholdValue || "Not applicable"}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Reference</h2>
                  <p className="text-muted-foreground">{referenceDocumentsValue || "Not available"}</p>
                </div>
              </div>


              {/* Risk Score Framework */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Risk Score Framework</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-6">
                    Risk assessment framework based on a 1-5 scale for environmental compliance evaluation.
                  </p>
                  
                   <div className="grid gap-4">
                     {getRiskScoreFramework(decodedCriteria).map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${item.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg">Score {item.score}</span>
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
                        {thresholdValue || "No threshold data available"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Outcome</h2>
                    <p className="text-foreground font-medium">
                      {withinThresholdValue || "Performance value is below threshold - Pass"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference Section for Percentage-based criteria */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Reference</h2>
                <div className="space-y-4">
                  <p className="text-foreground">
                    {referenceDocumentsValue || (decodedCriteria === "Thermal Coal Mining" 
                      ? "Annual Sustainability Report 2024 - Energy Transition Strategy"
                      : decodedCriteria === "Thermal Coal Power Generation"
                      ? "Quarterly Financial Report Q3 2024 - Energy Portfolio Analysis"
                      : "Corporate ESG Assessment Report 2024")}
                  </p>
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

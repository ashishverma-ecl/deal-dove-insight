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

      case "Pollution & Contamination":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "No pollution violations found. The company complies fully with EBA guidelines and EU pollution control regulations. Evidence of pollution management systems in place, such as EMS, and compliance with EU emission limits and water/air quality standards.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "Minor pollution violations identified. The company has a documented plan to address these issues and has shown efforts to comply with EU pollution standards. Keywords: Minor violations, corrective actions, EU pollution regulations.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Several significant pollution violations identified, but the company is actively addressing the issues and working to comply with EBA guidelines and EU regulations. Some violations may remain unresolved. Keywords: Non-compliance, pollution violations, EU emissions limits, biodiversity impact.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Multiple serious violations identified. The company has shown little or no effort to resolve pollution issues or comply with EU pollution regulations. Keywords: Major violations, lack of corrective actions, EU pollution regulations breaches.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Severe pollution or contamination violations, with no corrective actions or plans. These violations represent a significant environmental threat and do not meet EBA guidelines or EU regulations. Immediate corrective action is required. Keywords: Severe violations, failure to address contamination, failure to comply with EU pollution control regulations.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Hazardous Waste":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company holds all required permits, manages waste according to legal requirements, uses licensed transporters, has had no violations in the past five years, provides transparent reporting of waste quantities and disposal methods, and is confirmed compliant through third-party audits.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has minor isolated lapses, such as an expired permit that was promptly renewed, with corrective actions completed. There has been no environmental harm, and the company follows mostly compliant practices.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company has repeated minor lapses, such as unverified waste tracking or incomplete reporting, and occasionally uses unlicensed handlers. No significant environmental damage has been confirmed.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company has major violations or systemic gaps, including unpermitted storage, illegal disposal, or spills, with inadequate remediation efforts. There have been multiple enforcement actions in the past three years.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company is engaged in ongoing illegal disposal or dumping, has caused severe contamination incidents, lacks permits or waste tracking, refuses to remediate, and is under criminal or regulatory investigation.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Child Labor":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company complies with ILO Conventions No. 138 and No. 182, with no child labor detected in its operations or supply chain. Policies explicitly prohibit child labor and hazardous work, supported by robust age-verification systems, supplier training, and accessible grievance mechanisms. Independent audits confirm compliance and effective resolution of concerns.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "A single, documented child labor incident occurred in a subcontractor or isolated facility, which has been addressed with immediate remediation, including removal from hazardous work and support for the child. A corrective action plan was implemented with follow-up, and no repeat cases have been reported in the last two audit cycles.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple child labor incidents occurred in lower-tier suppliers, but they are not widespread. Policies exist but are inconsistently enforced, with limited monitoring and unclear corrective actions. The company's child labor controls are in early stages or weakly implemented.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Widespread child labor exists in the company's operations or primary suppliers, with violations of ILO Conventions. The company denies or provides vague responses to allegations, lacks effective supplier monitoring, and has no accessible grievance systems, indicating systemic non-compliance.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company intentionally engages in severe child labor practices, including hazardous work, bonded labor, or trafficking. No remediation efforts or transparency are evident. The company may be under legal investigation or face sanctions, with operations in high-risk areas lacking proper oversight.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Forced Labor":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company complies with ILO Conventions No. 29 and No. 105, with no evidence of forced, bonded, or compulsory labor in its operations or supply chain. Policies prohibit all forms of coercion, involuntary work, debt bondage, or retention of workers' identity documents. Recruitment is ethical, with no fees charged to workers, and grievance mechanisms are accessible, trusted, and effective.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "A single case of forced or bonded labor occurred in a subcontractor or isolated facility, but it is not ongoing. The company has addressed the issue with immediate remediation, such as releasing affected workers and implementing corrective actions. No repeat incidents have occurred in the last two audit cycles.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple incidents of forced labor indicators, such as excessive recruitment fees or passport retention, were found in lower-tier suppliers or informal contractors, but not widely across operations. Monitoring and enforcement are weak, relying on supplier self-certification without independent verification, and corrective actions remain incomplete or lack transparency.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "There is evidence of forced labor in the company's operations or major suppliers, including coercion, debt bondage, and involuntary overtime. The company may deny these issues or issue generic statements without clear remediation measures. No credible audits or effective supplier monitoring exist, and grievance mechanisms are inaccessible.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company engages in systemic use of forced labor, including bonded labor, trafficking, or state-imposed forced labor. No remediation efforts are evident, and the company does not acknowledge the issue. It may be under legal investigation, sanctioned, or blacklisted by NGOs, operating in high-risk jurisdictions with inadequate oversight.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Workplace Safety Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "Fully compliant with ILO Conventions 155 and 187, with no evidence of safety violations. Independent audits confirm strong OHS systems, regular risk assessments, training, and preventive measures. Public policies, safety committees, accident reporting, and grievance mechanisms are in place, with documented corrective actions.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "A single, non-systemic safety incident (e.g., isolated PPE lapse or machinery accident) has occurred, promptly addressed with corrective measures, retraining, and hazard rectification. Company has acknowledged the issue, followed up, and prevented recurrence.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple non-systemic safety issues (e.g., PPE non-compliance, inadequate training) exist across several sites. Policies reference ILO Conventions but enforcement is weak, often relying on self-reporting. Corrective actions are partial or lack transparency, and injury data is limited.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Systemic safety failures such as repeated accidents, high injury rates, or lack of emergency preparedness are evident across operations. Company denies or downplays issues, has no credible audits, and safety committees or grievance channels are absent or ineffective.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Severe, ongoing, and willful safety negligence, including known hazards leading to fatalities or serious injuries. No remediation, transparency, or program improvement. Company may face legal action, sanctions, or blacklisting, often operating in high-risk sectors with weak safety oversight.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Supply Chain Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company's supply chain due diligence is fully aligned with UNGC Principles, with over 95% supplier coverage through audits. Zero tolerance policies are enforced, all incidents are remediated, and there is transparent reporting of supplier performance with third-party verification in place.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "Isolated supplier violations are identified and promptly remediated, with over 80% supplier coverage. Continuous improvement programs and training are in place, and there have been no repeat violations.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple non-systemic violations occur with less than 80% supplier due diligence coverage. Remediation plans are in progress but incomplete, and some repeat issues are found in lower-tier suppliers.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Systemic supplier violations are present in critical sourcing geographies, with inadequate remediation efforts. Supplier monitoring coverage is low, and repeated breaches of UNGC principles occur without supplier disengagement.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Widespread, ongoing supplier violations exist with no due diligence system in place. The company refuses to remediate and is confirmed complicit in forced labor, child labor, or severe environmental harm. It faces sanctions or trade restrictions due to supply chain abuses.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Community Impact Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "IFC-aligned ESIA and ESMP are implemented for all operations, with FPIC obtained for Indigenous Peoples projects. There are no unresolved grievances in the past 5 years, and public reporting on community impacts is available. Independent third-party verification confirms compliance with PS1, PS4, PS5, and PS7.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "A few minor concerns in the past 3 years were resolved with full compensation/mitigation within 90 days. The grievance mechanism is functional, accessible in local languages, with a ≥90% complaint closure rate, and annual stakeholder engagement is documented.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple credible complaints in the past 2 years, limited to certain sites or suppliers. ESIA coverage is partial, and compensation/mitigation was delayed (>6 months). The grievance mechanism exists but is inaccessible for marginalized groups, and FPIC is missing for some Indigenous Peoples projects.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "Systemic issues across multiple sites or supply chains, with unresolved grievances pending over 12 months. No FPIC for Indigenous Peoples projects, no ESIA for major projects, and repeated failure to provide adequate compensation. There are credible reports of safety, security, or livelihood impacts, with minimal monitoring or reporting.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "Ongoing severe harm, such as forced evictions, fatalities, or livelihood destruction, linked to operations. No consultation, compensation, or grievance mechanism is in place, and the company refuses to engage communities. The company is under investigation or sanctioned by IFC CAO or international bodies for violations.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "UN Global Compact Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "There is no evidence of UNGC violations. The company is an active participant with timely COP submissions, transparent disclosures, and full adherence to all Ten Principles, verified by audits or UNGC listings.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "A single minor breach (e.g., late COP submission) or an isolated allegation occurred, but it was remediated with corrective action, and the company remains in good standing.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "Multiple minor breaches or credible but unverified allegations involve more than one principle. Disclosure is partial, corrective action is incomplete, and no third-party verification is provided.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "There is evidence of systemic or repeated violations without adequate remediation. The company is under investigation or has been warned by UNGC.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company has been delisted or suspended from UNGC due to severe, systemic violations or persistent non-communication. Ongoing breaches span multiple principles with no corrective action taken.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Cybersecurity Failures":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company has a comprehensive cybersecurity program aligned with ISO/NIST standards, conducts annual third-party penetration tests, maintains a full incident response plan, has had no material breaches in the past 5 years, and provides timely, transparent disclosure of incidents. Ongoing employee training is in place.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has a strong cybersecurity framework with minor, promptly remediated incidents. Certifications are in place, annual risk assessments are conducted, and public breach disclosures are made within regulatory timelines.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company has basic policies and an incident response plan, but lacks full certification or external verification. Breach disclosures are partial, there are isolated delays in remediation, and board oversight of cyber risks is limited.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company has experienced repeated or major breaches in the last 3 years, lacks a comprehensive cybersecurity framework, and has delayed breach disclosures beyond regulatory requirements. There is limited evidence of remediation, and fines or regulatory warnings have been issued.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company faces ongoing systemic cybersecurity vulnerabilities, refuses to disclose breaches, lacks incident response capability, and has experienced repeated fines or sanctions. Material operational and financial losses from attacks have occurred.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Data Privacy Violations":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company demonstrates comprehensive GDPR/CCPA compliance, with transparent privacy policies, clear consent mechanisms, and no material violations in the past 5 years. It provides timely data breach notifications and conducts regular privacy audits and certifications.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has a strong privacy governance framework with minor issues that are promptly resolved. It adheres to breach notification timelines, regularly reviews and updates privacy notices, and has limited regulatory engagement.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company has privacy policies and consent mechanisms in place, but lacks external verification. There are some delays in fulfilling data subject requests, isolated breaches with delayed but eventual disclosure, and partial compliance in certain jurisdictions.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company has repeated or significant privacy violations in the last 3 years, with inadequate or outdated privacy policies. Breach notifications are incomplete, regulatory warnings or moderate fines have been issued, and there is evidence of systemic gaps in compliance.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company is non-compliant with GDPR/CCPA, with ongoing large-scale unauthorized data use, refusal to fulfill data subject rights, and repeated large fines or sanctions. There is no credible privacy program in place.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Board Governance Failures":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The board structure fully aligns with OECD and local governance codes, with a majority of independent members. It is diverse in gender, skills, and backgrounds, has active ESG oversight, transparent disclosures, and undergoes regular independent evaluations.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "There are minor gaps in diversity or formal processes, but effective oversight is demonstrated. The board has clear conflict of interest policies, functioning committees, and responds promptly to shareholder concerns.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The board has limited independence (below best-practice norms), minimal diversity, and ESG oversight is limited to compliance. There are occasional shareholder disputes over governance issues, with partial transparency in board evaluations.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The board is predominantly non-independent, with repeated conflicts of interest and no dedicated ESG oversight. Shareholder resolutions are routinely opposed without engagement, and there are regulatory warnings on governance.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company has a systemic governance failure with no independence, where the board acts primarily in management's interest. There are no conflict of interest controls, a refusal to address governance reforms, and regulatory sanctions or major governance scandals.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          }
        ];

      case "Conflict Minerals":
        return [
          { 
            score: "1", 
            level: "Full Compliance", 
            criteria: "The company implements all 5 OECD steps, publishes an annual conflict minerals report with smelter/refiner lists, sources only from RMAP-audited facilities, ensures full traceability to the mine of origin, has no unresolved risks, and maintains accessible grievance mechanisms.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "2", 
            level: "Low Risk", 
            criteria: "The company has an OECD-aligned policy and due diligence system, sources over 90% from RMAP-audited facilities, has isolated minor traceability gaps with a corrective action plan, and provides annual public reporting.", 
            color: "bg-green-50 border-green-200 text-green-800" 
          },
          { 
            score: "3", 
            level: "Moderate Risk", 
            criteria: "The company partially implements OECD standards, with policy and supplier engagement but lacks third-party audits. Smelter/refiner disclosures are incomplete, there are unresolved risks in parts of the supply chain, and remediation efforts are underway but unverified.", 
            color: "bg-yellow-50 border-yellow-200 text-yellow-800" 
          },
          { 
            score: "4", 
            level: "High Risk", 
            criteria: "The company shows systemic non-compliance with OECD standards, sources from CAHRAs without effective risk mitigation, lacks third-party audits, and faces credible allegations of contributing to armed group financing or human rights abuses.", 
            color: "bg-red-50 border-red-200 text-red-800" 
          },
          { 
            score: "5", 
            level: "Critical Risk", 
            criteria: "The company is confirmed to source from mines controlled by armed groups, lacks a policy or due diligence system, refuses to engage in audits or disclose supply chain details, and is under sanctions or regulatory investigation for conflict mineral violations.", 
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
  
  // Store original values to detect edits
  const [originalPerformanceValue, setOriginalPerformanceValue] = useState<string | null>(null);
  const [originalWithinThresholdValue, setOriginalWithinThresholdValue] = useState<string | null>(null);
  const [originalComments, setOriginalComments] = useState<string | null>(null);

  // Utility function to check if a value has been edited
  const isValueEdited = (currentValue: string | null, originalValue: string | null): boolean => {
    return currentValue !== originalValue && originalValue !== null;
  };

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
            .select('performance, context, threshold, within_threshold, reference_documents, comments')
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
            
            // Also fetch the original values to detect if they've been edited
            const { data: originalData, error: originalError } = await supabase
              .from('ai_output')
              .select('performance, within_threshold, comments')
              .eq('session_id', fetchedSessionId)
              .eq('screening_criterion', decodedCriteria)
              .eq('status', 'pending') // Original values before editing
              .single();
            
            if (!originalError && originalData) {
              setOriginalPerformanceValue(originalData.performance);
              setOriginalWithinThresholdValue(originalData.within_threshold);
              setOriginalComments(originalData.comments);
            } else {
              // If no pending status found, use current values as original
              setOriginalPerformanceValue(aiOutputData?.performance || null);
              setOriginalWithinThresholdValue(aiOutputData?.within_threshold || null);
              setOriginalComments(aiOutputData?.comments || null);
            }
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
                <div className={`p-3 rounded ${isValueEdited(performanceValue, originalPerformanceValue) ? 'bg-gray-300' : ''}`}>
                  <h2 className="text-xl font-bold text-foreground mb-2">Performance</h2>
                  <p className="text-muted-foreground">{performanceValue || "Not applicable"}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Threshold</h2>
                  <p className="text-muted-foreground">{thresholdValue || "0-5%"}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-3 rounded ${isValueEdited(withinThresholdValue, originalWithinThresholdValue) ? 'bg-gray-300' : ''}`}>
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
                    <div className={`p-3 rounded ${isValueEdited(performanceValue, originalPerformanceValue) ? 'bg-gray-300' : ''}`}>
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
                  <div className={`p-3 rounded ${isValueEdited(withinThresholdValue, originalWithinThresholdValue) ? 'bg-gray-300' : ''}`}>
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

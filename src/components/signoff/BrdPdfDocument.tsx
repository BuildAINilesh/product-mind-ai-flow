import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";
import { BRDData } from "./BRDDisplay";
import { format } from "date-fns";

// Remove custom font registration which can cause issues
// Font.register({
//   family: "Open Sans",
//   fonts: [
//     { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf", fontWeight: 400 },
//     { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf", fontWeight: 600 },
//     { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf", fontWeight: 700 },
//   ],
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica", // Use standard PDF font instead of Open Sans
    color: "#333",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    textAlign: "right",
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#2563EB",
    fontFamily: "Helvetica-Bold", // Use standard PDF font
  },
  projectName: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 5,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    fontFamily: "Helvetica-Bold", // Use standard PDF font
  },
  content: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  bulletPoints: {
    paddingLeft: 5,
  },
  bullet: {
    marginBottom: 5,
    flexDirection: "row",
  },
  bulletDot: {
    width: 10,
    marginRight: 5,
  },
  bulletText: {
    flex: 1,
  },
  testCaseStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 10,
  },
  testCase: {
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    textAlign: "center",
    width: "22%",
  },
  testCount: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
    color: "#2563EB",
  },
  testLabel: {
    fontSize: 8,
    color: "#64748b",
  },
  signoffSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 15,
  },
  signoffTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },
  signoffInfo: {
    flexDirection: "row",
    marginBottom: 5,
  },
  signoffLabel: {
    width: 100,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  signoffValue: {
    flex: 1,
  },
  signoffComment: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
    fontSize: 8,
    color: "#999",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confidenceIndicator: {
    marginTop: 15,
    marginBottom: 15,
    height: 10,
    flexDirection: "row",
    borderRadius: 5,
    overflow: "hidden",
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  approved: {
    backgroundColor: "#10B981",
  },
  rejected: {
    backgroundColor: "#EF4444",
  },
  pending: {
    backgroundColor: "#F59E0B",
  },
  ready: {
    backgroundColor: "#6B7280",
  },
});

interface BrdPdfDocumentProps {
  brdData: BRDData;
  projectName?: string;
}

// Helper function to parse array or string to array
const ensureArray = (value: string | string[] | undefined | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  // If it's a string that looks like a JSON array
  if (
    typeof value === "string" &&
    value.trim().startsWith("[") &&
    value.trim().endsWith("]")
  ) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // If parsing fails, split by newlines as fallback
    }
  }

  return value.split(/\n|•/).filter((item: string) => item.trim().length > 0);
};

// Helper function to get formatted test type
const getFormattedTestType = (testType: string): string => {
  const normalizedType = testType.toLowerCase().trim();

  if (normalizedType.includes("functional") || normalizedType === "function") {
    return "Functional";
  } else if (normalizedType.includes("edge")) {
    return "Edge";
  } else if (normalizedType.includes("negative")) {
    return "Negative";
  } else if (normalizedType.includes("integration")) {
    return "Integration";
  }

  // Default to Functional if unknown
  return "Functional";
};

// Main PDF Document Component
export const BrdPdfDocument: React.FC<BrdPdfDocumentProps> = ({
  brdData,
  projectName,
}) => {
  // Format date for display
  const formattedDate = brdData.updated_at
    ? format(new Date(brdData.updated_at), "MMMM d, yyyy")
    : "Not available";

  // Format sign-off date
  const signoffDate = brdData.signed_off_at
    ? format(new Date(brdData.signed_off_at), "MMMM d, yyyy")
    : "Not available";

  // Get status badge style
  const getStatusStyle = () => {
    switch (brdData.status.toLowerCase()) {
      case "signed_off":
        return styles.approved;
      case "rejected":
        return styles.rejected;
      case "ready":
        return styles.ready;
      default:
        return styles.pending;
    }
  };

  // Get status label
  const getStatusLabel = () => {
    switch (brdData.status.toLowerCase()) {
      case "signed_off":
        return "APPROVED";
      case "rejected":
        return "REJECTED";
      case "ready":
        return "REVIEW";
      default:
        return "PENDING";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Logo could be added here */}
            {/* <Image style={styles.logo} src="/images/logo.png" /> */}
            <Text style={styles.title}>Business Requirements Document</Text>
            <Text style={styles.projectName}>{projectName || "Project"}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text>Generated: {formattedDate}</Text>
            <Text>REQ ID: {brdData.requirement_id}</Text>
            <View style={{ marginTop: 5 }}>
              <Text style={[styles.statusBadge, getStatusStyle()]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>
        </View>

        {/* Project Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <Text style={styles.content}>{brdData.project_overview}</Text>
        </View>

        {/* Problem Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Statement</Text>
          <Text style={styles.content}>{brdData.problem_statement}</Text>
        </View>

        {/* Proposed Solution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposed Solution</Text>
          <Text style={styles.content}>{brdData.proposed_solution}</Text>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.bulletPoints}>
            {ensureArray(brdData.key_features).map((feature, index) => (
              <View key={`feature-${index}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Business Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Goals</Text>
          <View style={styles.bulletPoints}>
            {ensureArray(brdData.business_goals).map((goal, index) => (
              <View key={`goal-${index}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Target Audience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Audience</Text>
          <View style={styles.bulletPoints}>
            {ensureArray(brdData.target_audience).map((audience, index) => (
              <View key={`audience-${index}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{audience}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Market Research Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Research Summary</Text>
          <Text style={styles.content}>{brdData.market_research_summary}</Text>
        </View>

        {/* Validation Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Validation Summary</Text>
          <Text style={styles.content}>{brdData.validation_summary}</Text>
        </View>

        {/* User Stories Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Stories</Text>
          <View style={styles.bulletPoints}>
            {brdData.user_stories_summary.map((story, index) => (
              <View key={`story-${index}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{story}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Use Cases Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Use Cases</Text>
          <View style={styles.bulletPoints}>
            {brdData.use_cases_summary.map((useCase, index) => (
              <View key={`usecase-${index}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{useCase}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Test Cases */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Test Coverage</Text>

          {brdData.test_cases && brdData.test_cases.length > 0 ? (
            <View style={styles.content}>
              {(() => {
                // Track if we've output any tests
                let hasOutputtedTests = false;

                const testTypeElements = [
                  "Functional",
                  "Edge",
                  "Negative",
                  "Integration",
                ].map((testType) => {
                  const testsOfType =
                    brdData.test_cases?.filter(
                      (test) =>
                        getFormattedTestType(test.test_type) === testType
                    ) || [];

                  if (testsOfType.length > 0) {
                    hasOutputtedTests = true;
                    return (
                      <View key={testType} style={{ marginBottom: 10 }}>
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            marginBottom: 5,
                          }}
                        >
                          {testType} Tests:
                        </Text>
                        <View style={styles.bulletPoints}>
                          {testsOfType.map((test, idx) => (
                            <View key={idx} style={styles.bullet}>
                              <Text style={styles.bulletDot}>•</Text>
                              <Text style={styles.bulletText}>
                                {test.title ||
                                  test.test_title ||
                                  test.description?.substring(0, 50) +
                                    (test.description &&
                                    test.description.length > 50
                                      ? "..."
                                      : "") ||
                                  `${testType} Test ${idx + 1}`}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  }
                  return null;
                });

                // If we haven't output any tests, show a message
                if (!hasOutputtedTests) {
                  return (
                    <View style={{ padding: 10 }}>
                      <Text>No detailed test cases available.</Text>
                    </View>
                  );
                }

                return testTypeElements;
              })()}
            </View>
          ) : (
            <View style={styles.testCaseStats}>
              <View style={styles.testCase}>
                <Text style={styles.testLabel}>Total Tests</Text>
                <Text style={styles.testCount}>{brdData.total_tests}</Text>
              </View>
              <View style={styles.testCase}>
                <Text style={styles.testLabel}>Functional</Text>
                <Text style={styles.testCount}>{brdData.functional_tests}</Text>
              </View>
              <View style={styles.testCase}>
                <Text style={styles.testLabel}>Edge Cases</Text>
                <Text style={styles.testCount}>{brdData.edge_tests}</Text>
              </View>
              <View style={styles.testCase}>
                <Text style={styles.testLabel}>Negative</Text>
                <Text style={styles.testCount}>{brdData.negative_tests}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Risks & Mitigations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks & Mitigations</Text>
          <View style={styles.bulletPoints}>
            {brdData.risks_and_mitigations.map((risk, index) => (
              <View key={`risk-${index}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{risk}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Recommendation</Text>
          <Text style={styles.content}>{brdData.final_recommendation}</Text>
        </View>

        {/* AI Confidence */}
        <View style={styles.section}>
          <Text>AI Signoff Confidence: {brdData.ai_signoff_confidence}%</Text>
          <View style={styles.confidenceIndicator}>
            <View
              style={{
                backgroundColor:
                  brdData.ai_signoff_confidence >= 80
                    ? "#10B981"
                    : brdData.ai_signoff_confidence >= 60
                    ? "#F59E0B"
                    : "#EF4444",
                width: `${brdData.ai_signoff_confidence}%`,
                height: "100%",
              }}
            />
          </View>
        </View>

        {/* Sign-off Information */}
        <View style={styles.signoffSection}>
          <Text style={styles.signoffTitle}>Sign-off Information</Text>

          {brdData.status === "signed_off" && brdData.approver_name ? (
            <>
              <View style={styles.signoffInfo}>
                <Text style={styles.signoffLabel}>Approved by:</Text>
                <Text style={styles.signoffValue}>{brdData.approver_name}</Text>
              </View>
              <View style={styles.signoffInfo}>
                <Text style={styles.signoffLabel}>Signed off on:</Text>
                <Text style={styles.signoffValue}>{signoffDate}</Text>
              </View>
              {brdData.approver_comment && (
                <View style={styles.signoffComment}>
                  <Text>{brdData.approver_comment}</Text>
                </View>
              )}
            </>
          ) : brdData.status === "rejected" && brdData.approver_name ? (
            <>
              <View style={styles.signoffInfo}>
                <Text style={styles.signoffLabel}>Rejected by:</Text>
                <Text style={styles.signoffValue}>{brdData.approver_name}</Text>
              </View>
              <View style={styles.signoffInfo}>
                <Text style={styles.signoffLabel}>Rejected on:</Text>
                <Text style={styles.signoffValue}>{signoffDate}</Text>
              </View>
              {brdData.approver_comment && (
                <View style={styles.signoffComment}>
                  <Text>{brdData.approver_comment}</Text>
                </View>
              )}
            </>
          ) : (
            <Text>This document has not been signed off yet.</Text>
          )}
        </View>

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text>ProductMind BRD</Text>
          <Text>Generated on {format(new Date(), "MM/dd/yyyy")}</Text>
          <Text>Page 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default BrdPdfDocument;

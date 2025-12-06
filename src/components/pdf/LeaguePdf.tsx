import type { League } from "@/types/league";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.2,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    height: 80,
  },
  logo: { width: 60, height: 60 },
  headerTextContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "60%",
  },
  headerText: {
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Times-Roman",
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  horizontalLine: {
    marginTop: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: "black",
    width: "100%",
    marginBottom: 15,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  labelCol: { width: "25%" },
  separatorCol: { width: "5%", textAlign: "center" },
  valueCol: { width: "70%" },
  labelText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  valueText: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  highlightedText: {
    color: "#be9011ff",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  sectionTitle: {
    marginTop: 15,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  objectivesText: {
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 10,
    textIndent: 30,
    fontSize: 11,
  },
});

const DetailRow = ({
  label,
  value,
  isHighlight,
}: {
  label: string;
  value: string;
  isHighlight?: boolean;
}) => (
  <View style={styles.row}>
    <View style={styles.labelCol}>
      <Text style={styles.labelText}>{label || ""}</Text>
    </View>
    <View style={styles.separatorCol}>
      <Text style={styles.labelText}>:</Text>
    </View>
    <View style={styles.valueCol}>
      {/* FORCE STRING: Ensure value is never null/undefined */}
      <Text style={isHighlight ? styles.highlightedText : styles.valueText}>
        {value || ""}
      </Text>
    </View>
  </View>
);

const ActivityDesignDocument = ({
  leagueAdmin,
  league,
}: {
  leagueAdmin: LeagueAdministator;
  league: League;
}) => {
  // 1. Loading Guard: Do not attempt to render if data is missing
  if (
    !league ||
    !leagueAdmin ||
    !league.league_title ||
    typeof league.league_title !== "string" ||
    !league.league_schedule?.[0] ||
    !league.league_schedule?.[1] ||
    !league.league_description ||
    !league.league_objective ||
    !Array.isArray(league.league_rationale) ||
    !Array.isArray(league.sportsmanship_rules)
  ) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
              Preview loading... (Data incomplete - please wait or reset)
            </Text>
          </View>
        </Page>
      </Document>
    );
  }
  const getTotalTeams = Array.isArray(league.league_categories)
    ? league.league_categories.reduce(
        (total, category) => total + (category.max_team || 0),
        0
      )
    : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const safeAddress = () => {
    if (!leagueAdmin.organization_address) return "";
    return leagueAdmin.organization_address.split(",")[0].replace("Brgy. ", "");
  };

  const documentData = {
    details: [
      { label: "PROPONENT", value: leagueAdmin.organization_type || "N/A" },
      {
        label: "ACTIVITY TITLE",
        value: league.league_title || "Untitled League",
        isHighlight: true,
      },
      {
        label: "DURATION",
        value: `${formatDate(league.league_schedule?.[0])} - ${formatDate(
          league.league_schedule?.[1]
        )}`,
      },
      {
        label: "VENUE",
        value: league.league_courts?.length
          ? league.league_courts.map((c) => c.name).join(", ")
          : "TBD",
      },
      { label: "NO. OF TEAMS", value: `${getTotalTeams} Teams` },
      {
        label: "ESTIMATED COST",
        value: `P ${Number(league.league_budget || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`,
      },
      {
        label: "SOURCE OF FUNDS",
        value: `Budget of ${
          leagueAdmin.organization_type || "LG"
        } (Brgy. ${safeAddress()})`,
      },
    ],
    description: league.league_description || "",
    objective: league.league_objective || "",
    rationale: Array.isArray(league.league_rationale)
      ? league.league_rationale
      : [],
  };

  const LEFT_LOGO_URL =
    "https://res.cloudinary.com/dod3lmxm6/image/upload/v1756534465/logo-main_nvlqtm.png";
  const RIGHT_LOGO_URL = leagueAdmin.organization_logo_url;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Image src={LEFT_LOGO_URL} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>
              Republic of the{" "}
              {leagueAdmin.organization_country || "Philippines"}
            </Text>
            <Text style={styles.headerText}>
              Province of {leagueAdmin.organization_province || ""}
            </Text>
            <Text style={styles.headerText}>
              Municipality of {leagueAdmin.organization_municipality || ""}
            </Text>
            <Text
              style={{
                ...styles.headerText,
                fontFamily: "Helvetica-Bold",
                marginTop: 4,
              }}
            >
              Barangay of {safeAddress()}
            </Text>
          </View>
          {RIGHT_LOGO_URL && <Image src={RIGHT_LOGO_URL} style={styles.logo} />}
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>ACTIVITY DESIGN</Text>
          <View style={styles.horizontalLine} />
        </View>

        <View style={{ marginBottom: 20 }}>
          {documentData.details.map((item, index) => (
            <DetailRow
              key={index}
              label={item.label}
              value={item.value}
              isHighlight={item.isHighlight}
            />
          ))}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Objectives:</Text>
          <Text style={styles.objectivesText}>
            "{documentData.objective || "No objective set."}"
          </Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Rationale:</Text>
          {documentData.rationale.length > 0 ? (
            documentData.rationale.map((para, index) => (
              <Text key={index} style={styles.paragraph}>
                {para || ""}
              </Text>
            ))
          ) : (
            <Text style={styles.paragraph}>No rationale provided.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ActivityDesignDocument;

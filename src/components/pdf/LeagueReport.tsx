import type { League } from "@/types/league";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";

// --- Styles ---
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
  headerTextBold: {
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  reportLabel: {
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
  leagueTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 15,
    textTransform: "uppercase",
    color: "#222",
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 2,
  },
  paragraph: {
    textAlign: "justify",
    fontSize: 11,
    marginBottom: 5,
    fontFamily: "Times-Roman",
  },
  listContainer: {
    flexDirection: "column",
    marginLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bullet: {
    width: 15,
    fontSize: 14,
    textAlign: "center",
    color: "#444",
  },
  listItemText: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    flex: 1,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  categoryText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginRight: 10,
    marginBottom: 4,
    backgroundColor: "#eee",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
});

// --- Helper Component ---
// This component expects an array of STRINGS, not objects.
const BulletList = ({ items }: { items: string[] }) => (
  <View style={styles.listContainer}>
    {items.map((item, index) => (
      <View style={styles.listItem} key={index}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.listItemText}>{item}</Text>
      </View>
    ))}
  </View>
);

const LeagueReportDocument = ({
  leagueAdmin,
  league,
}: {
  leagueAdmin: LeagueAdministator;
  league: League;
}) => {
  if (!league || !leagueAdmin) return null;

  const safeAddress = () => {
    if (!leagueAdmin.organization_address) return "";
    return leagueAdmin.organization_address.split(",")[0].replace("Brgy. ", "");
  };

  const LEFT_LOGO_URL =
    "https://res.cloudinary.com/dod3lmxm6/image/upload/v1756534465/logo-main_nvlqtm.png";
  const RIGHT_LOGO_URL = leagueAdmin.organization_logo_url;

  // --- DATA MAPPING FIX ---

  // 1. Categories
  const categories = Array.isArray(league.league_categories)
    ? league.league_categories.map((c) => c.category_name)
    : [];

  // 2. Rules
  const rules = Array.isArray(league.sportsmanship_rules)
    ? league.sportsmanship_rules
    : [];

  // 3. Officials (Map Object -> String)
  // We combine full_name and role for a better display
  const officials = (league.league_officials || []).map((official) => {
    if (official.role) {
      return `${official.full_name} (${official.role})`;
    }
    return official.full_name;
  });

  // 4. Affiliates/Sponsors (Map Object -> String)
  // The error occurred here because we were passing the object. Now we pick .name
  const affiliates = (league.league_affiliates || []).map((affiliate) => {
    return affiliate.name;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- Header --- */}
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
            <Text style={styles.headerTextBold}>
              Barangay of {safeAddress()}
            </Text>
          </View>
          {RIGHT_LOGO_URL && <Image src={RIGHT_LOGO_URL} style={styles.logo} />}
        </View>

        {/* --- Report Title --- */}
        <View style={styles.titleContainer}>
          <Text style={styles.reportLabel}>ACTIVITY REPORT</Text>
          <View style={styles.horizontalLine} />
          <Text style={styles.leagueTitle}>
            {league.league_title || "League Title Here"}
          </Text>
        </View>

        {/* --- I. Description --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>I. Description</Text>
          <Text style={styles.paragraph}>
            {league.league_description || "No description provided."}
          </Text>
        </View>

        {/* --- II. Categories --- */}
        {categories.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              II. Participating Categories
            </Text>
            <View style={styles.categoriesRow}>
              {categories.map((cat, idx) => (
                <Text key={idx} style={styles.categoryText}>
                  {cat}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* --- III. Rules --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>III. Rules & Guidelines</Text>
          {rules.length > 0 ? (
            <BulletList items={rules} />
          ) : (
            <Text style={styles.paragraph}>No specific rules listed.</Text>
          )}
        </View>

        {/* --- IV. Officials --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>IV. League Officials</Text>
          {officials.length > 0 ? (
            <BulletList items={officials} />
          ) : (
            <Text style={styles.paragraph}>No officials listed.</Text>
          )}
        </View>

        {/* --- V. Affiliates --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>V. Sponsors & Partners</Text>
          {affiliates.length > 0 ? (
            <BulletList items={affiliates} />
          ) : (
            <Text style={styles.paragraph}>No affiliates listed.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export const openActivityReportPDF = async (
  league: League,
  leagueAdmin: LeagueAdministator
) => {
  try {
    const blob = await pdf(
      <LeagueReportDocument league={league} leagueAdmin={leagueAdmin} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000 * 60 * 5);
  } catch (error) {
    console.error("Failed to generate Activity Report PDF:", error);
    alert("Something went wrong while generating the PDF.");
  }
};

export default LeagueReportDocument;

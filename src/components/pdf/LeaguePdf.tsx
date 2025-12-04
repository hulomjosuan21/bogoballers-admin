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
  logo: {
    width: 60,
    height: 60,
  },
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
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  labelCol: {
    width: "25%",
  },
  separatorCol: {
    width: "5%",
    textAlign: "center",
  },
  valueCol: {
    width: "70%",
  },
  labelText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  valueText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
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

const documentData = {
  details: [
    { label: "PROPONENT", value: "Sangguniang Kabataan" },
    {
      label: "ACTIVITY TITLE",
      value: '"Malayo Sur Inter - Purok\nBasketball Tournament"',
      isHighlight: true,
    },
    { label: "DURATION", value: "March 09, 2013" },
    { label: "VENUE", value: "Malayo Sur Basketball Court" },
    { label: "NO. OF TEAMS", value: "7 Teams" },
    { label: "ESTIMATED COST", value: "P 35,000.00" },
    {
      label: "SOURCE OF FUNDS",
      value: "Budget of SK (Sports and Youth Development)",
    },
  ],
  objective:
    '"Enhancing the Development of Youth in the field of Sports to enable them to become law-abiding citizens as they learn the true essence of Sportsmanship and enhancing their skills in the field of Sports Activities."',
  rationale: [
    "We are now in a new generation, a generation that mostly affects the individuals. New high tech gadgets that makes a work more simple and easy to be done, a high speed internet connection into a Computer and now even more in modern Cell phones that let everyone connect to a multiple of persons around the world. But in this type of things, the Youth may be more prone to such things that are not good for them if they will not be guided, aside from that is that they may learn to do bad things that may apply into their daily life. This is just a thing that we can noticed in our life today, we cannot hide this because we all know that the fact is everyone are engaged in this situation even the young students. The essences of the Sports Activities are now being eliminated in the mind of the Youth.",
    "Nowadays, lots of changes happen in each of our lives, especially from the Youth. The Youth today are now more productive, serious yet aggressive in such thing that gives enjoyment from them. That's why mostly Youth are engaging into such addictive drugs, influence in liquor, crimes, and the worst part is the unwanted pregnancy or unprepared to become a young parents.",
    "We can noticed such that things in our generation today and this will not be simple to resolved by the Government, and if there's no further action in this type of problem then this happenings will be pass from generation to generation and become more complicated. That's why the SK (Sangguniang Kabataan) exists due to this type of problem since a good young leader of the new generation can heal and can understand the needs and problem of a youth.",
    "Therefore, the Sangguniang Kabataan of Barangay Malayo Sur is aware of this type of problem, that's why we have decided to conduct an Inter-Purok Basketball Tournament for the purpose of engaging the time of the youth in the field of sports instead of wasting their time into a bad influence. We also acquire this Activity in order to spread the good influence in this type of Activity like Teamwork that enables them to trust with each others, Challenges that enables them to pursue with hope in their mind and heart, a Law-abiding Citizens that enables them to follow the Rules and Regulations, Sportsmanship that enables them to accept failures as they continue showing their nice gratitude to the winners and most of all is to become a God Fearing Person with trust and love of God Almighty.",
  ],
};

const LEFT_LOGO_URL =
  "https://res.cloudinary.com/dod3lmxm6/image/upload/v1756534465/logo-main_nvlqtm.png";
const RIGHT_LOGO_URL =
  "https://www.nicepng.com/png/full/246-2467547_your-logo-here-your-logo-here-logo-png.png";

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
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <View style={styles.separatorCol}>
      <Text style={styles.labelText}>:</Text>
    </View>
    <View style={styles.valueCol}>
      <Text style={isHighlight ? styles.highlightedText : styles.valueText}>
        {value}
      </Text>
    </View>
  </View>
);

const ActivityDesignDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <Image src={LEFT_LOGO_URL} style={styles.logo} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Republic of the Philippines</Text>
          <Text style={styles.headerText}>Province of Cebu</Text>
          <Text style={styles.headerText}>Municipality of Bogo</Text>
          <Text
            style={{
              ...styles.headerText,
              fontFamily: "Helvetica-Bold",
              marginTop: 4,
            }}
          >
            Barangay of Malayo Sur
          </Text>
        </View>
        <Image src={RIGHT_LOGO_URL} style={styles.logo} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>ACTIVITY DESIGN</Text>
        <View style={styles.horizontalLine} />
      </View>

      {/* Details Table */}
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

      {/* Objectives */}
      <View>
        <Text style={styles.sectionTitle}>Objectives:</Text>
        <Text style={styles.objectivesText}>{documentData.objective}</Text>
      </View>

      {/* Rationale */}
      <View>
        <Text style={styles.sectionTitle}>Rationale:</Text>
        {documentData.rationale.map((para, index) => (
          <Text key={index} style={styles.paragraph}>
            {para}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default ActivityDesignDocument;

// --- Main App Component ---
// export default function App() {
//   return (
//     <div className="w-full h-screen bg-gray-100 flex flex-col">
//       <div className="bg-white p-4 shadow-sm border-b">
//         <h1 className="text-xl font-bold text-gray-800">
//           PDF Generator (React-PDF)
//         </h1>
//         <p className="text-sm text-gray-600">
//           Note: This preview may not render if @react-pdf/renderer is not
//           installed in the environment.
//         </p>
//       </div>

//       <div className="flex-1 overflow-hidden">
//         {/* The PDFViewer component renders the document inside an iframe */}
//         <PDFViewer style={styles.viewer} showToolbar={true}>
//           <ActivityDesignDocument />
//         </PDFViewer>
//       </div>
//     </div>
//   );
// }

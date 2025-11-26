import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { MatchBook, TeamBook } from "@/types/scorebook";

const MIN_ROWS = 12;
const formatTime = (totalSeconds: number) => {
  if (totalSeconds === null || totalSeconds === undefined) return "00:00";
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const getQuarterLabel = (q: number) => {
  if (q <= 4) return `Q${q}`;
  return `OT${q - 4}`;
};

const styles = StyleSheet.create({
  page: { padding: 20, flexDirection: "column", fontFamily: "Helvetica" },
  header: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subHeader: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 15,
    color: "#444",
  },

  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  halfWidth: { width: "48%" },

  tableContainer: {
    width: "100%",
    marginBottom: 5,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  teamHeader: {
    backgroundColor: "#f2c08a",
    padding: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  teamName: { fontSize: 12, fontWeight: "bold" },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    minHeight: 16,
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#000",
    height: 20,
  },
  totalsRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderColor: "#000",
    backgroundColor: "#f9f9f9",
    minHeight: 18,
    alignItems: "center",
  },

  cell: {
    fontSize: 7,
    textAlign: "center",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#eee",
  },
  cellName: { width: "25%", textAlign: "left", paddingLeft: 4 },
  cellNum: { width: "8%" },
  cellStat: { width: "10%" },
  cellSmall: { width: "6%" },
  bold: { fontWeight: "bold" },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    gap: 5,
  },
  label: { fontSize: 7, color: "#444" },
  value: { fontSize: 8, fontWeight: "bold" },

  qtrTable: {
    width: "55%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  qtrRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    height: 14,
    alignItems: "center",
  },
  qtrHeader: {
    backgroundColor: "#e0e0e0",
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    padding: 2,
  },
  qtrCell: {
    fontSize: 7,
    textAlign: "center",
    width: "33%",
    borderRightWidth: 1,
    borderColor: "#eee",
  },

  extrasContainer: {
    width: "43%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  timeoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  extraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 2,
  },

  footer: { marginTop: 10, fontSize: 8, textAlign: "center", color: "#666" },
});

const QuarterlySummary = ({ team }: { team: TeamBook }) => {
  const existingQuarters = team.score_per_qtr.map((s) => s.qtr);
  const maxQ = Math.max(4, ...existingQuarters);
  const quarters = Array.from({ length: maxQ }, (_, i) => i + 1);

  const totalScore = team.score_per_qtr.reduce(
    (acc, curr) => acc + (curr.score || 0),
    0
  );

  return (
    <View style={styles.qtrTable}>
      <View
        style={[
          styles.qtrRow,
          {
            backgroundColor: "#f2c08a",
            borderBottomWidth: 1,
            borderColor: "#000",
          },
        ]}
      >
        <Text style={styles.qtrCell}>Quarter</Text>
        <Text style={styles.qtrCell}>Score</Text>
        <Text style={[styles.qtrCell, { borderRightWidth: 0 }]}>
          Team Fouls
        </Text>
      </View>
      {quarters.map((q) => {
        const scoreObj = team.score_per_qtr.find((s) => s.qtr === q);
        const foulObj = team.teamF_per_qtr?.find((f) => f.qtr === q);
        return (
          <View style={styles.qtrRow} key={q}>
            <Text style={styles.qtrCell}>{getQuarterLabel(q)}</Text>
            <Text style={styles.qtrCell}>{scoreObj?.score || 0}</Text>
            <Text style={[styles.qtrCell, { borderRightWidth: 0 }]}>
              {foulObj?.foul || 0}
            </Text>
          </View>
        );
      })}

      <View
        style={[
          styles.qtrRow,
          {
            borderTopWidth: 1,
            borderColor: "#000",
            backgroundColor: "#f0f0f0",
          },
        ]}
      >
        <Text style={[styles.qtrCell, styles.bold]}>TOTAL</Text>
        <Text style={[styles.qtrCell, styles.bold]}>{totalScore}</Text>
        <Text style={[styles.qtrCell, { borderRightWidth: 0 }]}></Text>
      </View>
    </View>
  );
};

const TimeoutsAndExtras = ({ team }: { team: TeamBook }) => (
  <View style={styles.extrasContainer}>
    <Text style={[styles.bold, { fontSize: 8, marginBottom: 4 }]}>
      Timeouts Log
    </Text>
    {team.timeouts.length === 0 ? (
      <Text
        style={{
          fontSize: 7,
          fontStyle: "italic",
          color: "#666",
          marginBottom: 5,
        }}
      >
        No timeouts used.
      </Text>
    ) : (
      team.timeouts.map((t, i) => (
        <View style={styles.timeoutRow} key={i}>
          <Text style={{ fontSize: 7 }}>{getQuarterLabel(t.qtr)}</Text>
          <Text style={{ fontSize: 7 }}>{t.game_time}</Text>
        </View>
      ))
    )}
    <View style={styles.extraRow}>
      <Text style={styles.label}>Coach T:</Text>
      <Text style={styles.value}>{team.coachT}</Text>
    </View>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={styles.label}>Bench T:</Text>
      <Text style={styles.value}>{team.none_memberT}</Text>
    </View>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 2,
      }}
    >
      <Text style={styles.label}>CAPTAIN:</Text>
      <Text style={styles.value}>{team.capT_ball || "-"}</Text>
    </View>
  </View>
);

const TeamTable = ({ team, title }: { team: TeamBook; title: string }) => {
  const totals = team.players.reduce(
    (acc, p) => ({
      fg2m: acc.fg2m + (p.summary.fg2m || 0),
      fg2a: acc.fg2a + (p.summary.fg2a || 0),
      fg3m: acc.fg3m + (p.summary.fg3m || 0),
      fg3a: acc.fg3a + (p.summary.fg3a || 0),
      ftm: acc.ftm + (p.summary.ftm || 0),
      fta: acc.fta + (p.summary.fta || 0),
      reb: acc.reb + (p.summary.reb || 0),
      ast: acc.ast + (p.summary.ast || 0),
      stl: acc.stl + (p.summary.stl || 0),
      blk: acc.blk + (p.summary.blk || 0),
      tov: acc.tov + (p.summary.tov || 0),
      pf: acc.pf + (p.P || 0),
      tf: acc.tf + (p.T || 0),
      pts: acc.pts + (p.total_score || 0),
    }),
    {
      fg2m: 0,
      fg2a: 0,
      fg3m: 0,
      fg3a: 0,
      ftm: 0,
      fta: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
      pf: 0,
      tf: 0,
      pts: 0,
    }
  );

  const emptyRowCount = Math.max(0, MIN_ROWS - team.players.length);
  const emptyRows = Array.from({ length: emptyRowCount });

  return (
    <View>
      <View style={styles.tableContainer}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>
            {title}: {team.team_name}
          </Text>
          <Text style={{ fontSize: 9 }}>Coach: {team.coach}</Text>
        </View>

        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.cellNum, styles.bold]}>#</Text>
          <Text style={[styles.cell, styles.cellName, styles.bold]}>
            PLAYER
          </Text>
          <Text style={[styles.cell, styles.cellStat, styles.bold]}>2FG</Text>
          <Text style={[styles.cell, styles.cellStat, styles.bold]}>3FG</Text>
          <Text style={[styles.cell, styles.cellStat, styles.bold]}>FT</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>REB</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>AST</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>STL</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>BLK</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>TOV</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>PF</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>TF</Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>PTS</Text>
        </View>

        {team.players.map((p) => (
          <View style={styles.row} key={p.player_id}>
            <Text style={[styles.cell, styles.cellNum]}>{p.jersey_number}</Text>
            <Text style={[styles.cell, styles.cellName]}>{p.jersey_name}</Text>
            <Text style={[styles.cell, styles.cellStat]}>
              {p.summary.fg2m}/{p.summary.fg2a}
            </Text>
            <Text style={[styles.cell, styles.cellStat]}>
              {p.summary.fg3m}/{p.summary.fg3a}
            </Text>
            <Text style={[styles.cell, styles.cellStat]}>
              {p.summary.ftm}/{p.summary.fta}
            </Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.summary.reb}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.summary.ast}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.summary.stl}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.summary.blk}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.summary.tov}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.P}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{p.T || 0}</Text>
            <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
              {p.total_score}
            </Text>
          </View>
        ))}

        {emptyRows.map((_, i) => (
          <View style={styles.row} key={`empty-${i}`}>
            <Text style={[styles.cell, styles.cellNum]}>-</Text>
            <Text style={[styles.cell, styles.cellName]}></Text>
            <Text style={[styles.cell, styles.cellStat]}></Text>
            <Text style={[styles.cell, styles.cellStat]}></Text>
            <Text style={[styles.cell, styles.cellStat]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall]}></Text>
            <Text style={[styles.cell, styles.cellSmall, styles.bold]}>0</Text>
          </View>
        ))}

        <View style={styles.totalsRow}>
          <Text style={[styles.cell, styles.cellNum, styles.bold]}></Text>
          <Text style={[styles.cell, styles.cellName, styles.bold]}>
            TOTALS
          </Text>
          <Text style={[styles.cell, styles.cellStat, styles.bold]}>
            {totals.fg2m}/{totals.fg2a}
          </Text>
          <Text style={[styles.cell, styles.cellStat, styles.bold]}>
            {totals.fg3m}/{totals.fg3a}
          </Text>
          <Text style={[styles.cell, styles.cellStat, styles.bold]}>
            {totals.ftm}/{totals.fta}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.reb}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.ast}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.stl}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.blk}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.tov}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.pf}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.tf}
          </Text>
          <Text style={[styles.cell, styles.cellSmall, styles.bold]}>
            {totals.pts}
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <QuarterlySummary team={team} />
        <TimeoutsAndExtras team={team} />
      </View>
    </View>
  );
};

const ScorebookDocument = ({ data }: { data: MatchBook }) => (
  <Document>
    <Page size="LEGAL" orientation="landscape" style={styles.page}>
      <View>
        <Text style={styles.header}>BOGOBALLERS SCORESHEET</Text>
        <Text style={styles.subHeader}>
          Match ID: {data.public_match_id} | Time Remaining:{" "}
          {formatTime(data.time_seconds)} |{" "}
          {getQuarterLabel(data.current_quarter)}
        </Text>
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.halfWidth}>
          <TeamTable team={data.home_team} title="HOME" />
        </View>
        <View style={styles.halfWidth}>
          <TeamTable team={data.away_team} title="AWAY" />
        </View>
      </View>

      <Text style={styles.footer}>Generated by BogoBallers</Text>
    </Page>
  </Document>
);

export const printMatchScorebook = async (matchData: MatchBook) => {
  const blob = await pdf(<ScorebookDocument data={matchData} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

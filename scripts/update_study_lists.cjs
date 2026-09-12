const fs = require("fs");

// 1. Update roadmapProblems.js
let rp = fs.readFileSync("./src/data/roadmapProblems.js", "utf8");
if (!rp.includes("BLIND_75_IDS")) {
  const listsCode = `
export const BLIND_75_IDS = new Set([
  1, 3, 5, 11, 15, 19, 20, 21, 23, 33, 39, 42, 48, 49, 53, 54, 55, 56, 57, 62, 70, 73, 76, 79,
  91, 98, 100, 102, 104, 105, 121, 124, 125, 128, 133, 139, 141, 142, 143, 152, 153, 190, 191,
  198, 200, 206, 207, 208, 211, 212, 213, 217, 226, 230, 235, 238, 242, 252, 253, 268, 269, 295,
  300, 322, 323, 338, 347, 371, 416, 417, 424, 435, 547, 572, 647, 1143
]);

export const NEETCODE_150_IDS = new Set([
  ...BLIND_75_IDS,
  2, 4, 10, 17, 22, 25, 26, 27, 35, 36, 40, 45, 46, 72, 74, 75, 78, 84, 88, 90, 97, 110, 115,
  120, 122, 127, 130, 131, 134, 136, 138, 146, 150, 155, 167, 169, 189, 199, 209, 210, 215, 239,
  283, 287, 297, 309, 312, 329, 344, 355, 485, 494, 509, 518, 543, 567, 621, 684, 704, 724, 739,
  740, 746, 787, 846, 853, 875, 912, 973, 981, 994, 1448, 1480, 1851, 1899
]);

export const STRIVER_SHEET_IDS = new Set([
  1, 15, 18, 19, 21, 25, 26, 31, 33, 35, 39, 40, 42, 46, 48, 53, 56, 60, 61, 62, 73, 74, 75, 78,
  84, 88, 90, 98, 101, 102, 104, 106, 118, 121, 124, 128, 131, 138, 141, 142, 146, 151, 152, 153,
  160, 169, 206, 215, 225, 229, 232, 234, 236, 237, 239, 242, 287, 295, 300, 322, 347, 416, 460,
  540, 543, 662, 704, 739, 901, 987, 994, 1143
]);
`;
  rp += listsCode;
  fs.writeFileSync("./src/data/roadmapProblems.js", rp, "utf8");
  console.log("Exported curated study list sets in roadmapProblems.js");
}

// 2. Update ProblemsPage.jsx
let pp = fs.readFileSync("./src/pages/ProblemsPage.jsx", "utf8");

// Import study lists
pp = pp.replace(
  'import { ALL_PROBLEMS, TOPICS } from "../data/roadmapProblems.js";',
  'import { ALL_PROBLEMS, TOPICS, BLIND_75_IDS, NEETCODE_150_IDS, STRIVER_SHEET_IDS } from "../data/roadmapProblems.js";'
);

// Add studyList state
pp = pp.replace(
  "  const [statusFilter, setStatusFilter] = useState('All');",
  "  const [statusFilter, setStatusFilter] = useState('All');\n  const [studyList, setStudyList] = useState('All'); // 'All' | 'blind75' | 'neetcode150' | 'striver'"
);

// Filter logic update
const oldFiltered = `      // Status filter
      if (statusFilter === 'solved' && !solvedIds.has(p.id)) return false;
      if (statusFilter === 'unsolved' && solvedIds.has(p.id)) return false;
      if (statusFilter === 'preset' && !PRESET_SOLUTIONS[p.id]) return false;

      return true;
    });
  }, [search, selectedTopic, difficulty, statusFilter, solvedIds]);`;

const newFiltered = `      // Status filter
      if (statusFilter === 'solved' && !solvedIds.has(p.id)) return false;
      if (statusFilter === 'unsolved' && solvedIds.has(p.id)) return false;
      if (statusFilter === 'preset' && !PRESET_SOLUTIONS[p.id]) return false;

      // Curated study list filter
      if (studyList === 'blind75' && !BLIND_75_IDS.has(p.id)) return false;
      if (studyList === 'neetcode150' && !NEETCODE_150_IDS.has(p.id)) return false;
      if (studyList === 'striver' && !STRIVER_SHEET_IDS.has(p.id)) return false;

      return true;
    });
  }, [search, selectedTopic, difficulty, statusFilter, studyList, solvedIds]);

  // Curated study list progress
  const studyProgress = useMemo(() => {
    let targetSet = null;
    if (studyList === 'blind75') targetSet = BLIND_75_IDS;
    else if (studyList === 'neetcode150') targetSet = NEETCODE_150_IDS;
    else if (studyList === 'striver') targetSet = STRIVER_SHEET_IDS;
    if (!targetSet) return null;

    let totalInApp = 0;
    let solvedInApp = 0;
    for (const p of ALL_PROBLEMS) {
      if (targetSet.has(p.id)) {
        totalInApp++;
        if (solvedIds.has(p.id)) solvedInApp++;
      }
    }
    const percent = totalInApp > 0 ? Math.round((solvedInApp / totalInApp) * 100) : 0;
    return { solved: solvedInApp, total: totalInApp, percent };
  }, [studyList, solvedIds]);`;

pp = pp.replace(oldFiltered, newFiltered);

// Add study list tab UI row right above Quick Filter Buttons
const oldFilterRow = `      {/* ── Quick Filter Buttons ──────────────────────────────── */}`;
const newFilterRow = `      {/* ── Curated Study Lists Filter & Progress Bar ───────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--txt-bright, #f0f6fc)" }}>Study Lists:</span>
        {[
          { id: "All", label: "All Curated" },
          { id: "blind75", label: "🔥 Blind 75" },
          { id: "neetcode150", label: "⚡ NeetCode 150" },
          { id: "striver", label: "🎯 Striver SDE" }
        ].map(sl => (
          <button
            key={sl.id}
            type="button"
            className={\`fbtn \${studyList === sl.id ? "on" : ""}\`}
            onClick={() => { setStudyList(sl.id); setPage(1); }}
            style={{ fontSize: 11 }}
          >
            {sl.label}
          </button>
        ))}

        {studyProgress && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent-cyan, #38d9c5)" }}>
              {studyProgress.solved} / {studyProgress.total} Solved (<b>{studyProgress.percent}%</b>)
            </span>
            <div style={{ width: 90, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: \`\${studyProgress.percent}%\`, height: "100%", background: "linear-gradient(90deg, #6366f1, #38d9c5)", borderRadius: 3 }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Filter Buttons ──────────────────────────────── */}`;

pp = pp.replace(oldFilterRow, newFilterRow);
fs.writeFileSync("./src/pages/ProblemsPage.jsx", pp, "utf8");
console.log("Updated ProblemsPage.jsx with curated study list filters and progress bar!");

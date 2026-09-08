import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROADMAP_PROBLEMS, ALL_PROBLEMS } from '../data/roadmapProblems.js';
import { getProblemTemplate, PRESET_SOLUTIONS } from '../data/problemTemplates.js';
import { useTraceStore } from '../store/traceStore.js';

const STORAGE_KEY = 'trace_solved_problems';

const ROADMAP_LEVELS = [
  {
    num: 0,
    title: 'Programming Foundations',
    desc: 'Variables, loops, conditions, arrays, methods, basic Java syntax and Big-O complexity.',
    topics: ['Variables', 'Data Types', 'Operators', 'Loops', 'Functions', 'Arrays', 'Strings', 'Time Complexity'],
    isFoundation: true,
  },
  {
    num: 1,
    title: 'DSA Foundations',
    desc: 'Core linear data structures and foundational two-pointer / hashing patterns.',
    roadmapTopics: ['Arrays', 'Strings', 'HashMap / HashSet', 'Two Pointers', 'Sliding Window', 'Prefix Sum'],
  },
  {
    num: 2,
    title: 'Core Interview Patterns',
    desc: 'Master the patterns that appear in 70% of tech interview coding rounds.',
    roadmapTopics: ['Sorting', 'Binary Search', 'Linked List', 'Stack', 'Queue / Deque', 'Recursion', 'Matrix', 'Intervals', 'Bit Manipulation'],
  },
  {
    num: 3,
    title: 'Trees & Graphs',
    desc: 'Tree traversals, binary search trees, heaps, graph BFS/DFS, topological sorting, and union find.',
    roadmapTopics: ['Binary Tree', 'Binary Search Tree', 'Heap / Priority Queue', 'Graph BFS / DFS', 'Topological Sort', 'Shortest Path', 'Union Find'],
  },
  {
    num: 4,
    title: 'Advanced DSA',
    desc: 'Dynamic programming, backtracking combinatorial search, greedy strategies, tries, and segment trees.',
    roadmapTopics: ['Dynamic Programming', 'Backtracking', 'Greedy', 'Trie', 'Segment Tree'],
  },
  {
    num: 5,
    title: 'Big Tech Interview Ready',
    desc: 'Comprehensive multi-pattern synthesis, FAANG problem sets, and execution under interview constraints.',
    isCapStone: true,
  },
];

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { setCode, setInputs } = useTraceStore();

  // ── Solved status stored in localStorage
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set([1, 704, 1480, 283]);
    } catch {
      return new Set([1, 704, 1480, 283]);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(solvedIds)));
    } catch (e) {
      console.error('Failed to persist solved problems', e);
    }
  }, [solvedIds]);

  function toggleSolved(id) {
    setSolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // State for which topic accordion is expanded: { levelNum, topicName }
  const [expandedTopic, setExpandedTopic] = useState(null);

  function toggleTopicExpand(topicName) {
    setExpandedTopic(prev => (prev === topicName ? null : topicName));
  }

  // ── Handle Visualize click
  function handleVisualize(problem) {
    const template = getProblemTemplate(problem);
    setCode(template.code);
    setInputs(template.inputs);
    navigate('/');
  }

  // ── Compute Level stats
  const levelStats = useMemo(() => {
    return ROADMAP_LEVELS.map(lv => {
      if (lv.isFoundation) {
        return { total: 8, solved: 8, pct: 100, status: 'done' };
      }
      if (lv.isCapStone) {
        const total = ALL_PROBLEMS.length;
        let solved = 0;
        for (const p of ALL_PROBLEMS) {
          if (solvedIds.has(p.id)) solved++;
        }
        const pct = Math.round((solved / total) * 100);
        return { total, solved, pct, status: pct === 100 ? 'done' : pct > 0 ? 'active' : 'locked' };
      }

      let total = 0;
      let solved = 0;
      (lv.roadmapTopics || []).forEach(t => {
        const prods = ROADMAP_PROBLEMS[t] || [];
        total += prods.length;
        prods.forEach(p => {
          if (solvedIds.has(p.id)) solved++;
        });
      });

      const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
      const status = pct === 100 ? 'done' : pct > 0 ? 'active' : 'locked';
      return { total, solved, pct, status };
    });
  }, [solvedIds]);

  return (
    <div className="page">
      <div className="page-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">DSA Learning Roadmap</div>
          <div className="page-sub">
            A structured path from Foundations to Big Tech Ready with 290 curated LeetCode problems
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={() => navigate('/problems')}
        >
          View All Problems Table →
        </button>
      </div>

      <div className="roadmap-track" style={{ maxWidth: 840 }}>
        {ROADMAP_LEVELS.map((lv, i) => {
          const st = levelStats[i];
          return (
            <div className="rm-level" key={lv.num}>
              <div className="rm-spine">
                <div className={`rm-node ${st.status === 'done' ? 'done' : st.status === 'active' ? 'active' : 'locked'}`}>
                  {st.status === 'done' ? '✓' : lv.num}
                </div>
                {i < ROADMAP_LEVELS.length - 1 && <div className="rm-connector" />}
              </div>

              <div className={`rm-card ${st.status === 'active' ? 'active-card' : ''}`} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className="rm-title">Level {lv.num} — {lv.title}</div>
                  <span style={{ fontSize: 11, color: st.status === 'done' ? 'var(--green)' : st.status === 'active' ? 'var(--accent)' : 'var(--txt3)', flexShrink: 0, marginLeft: 8, fontWeight: 600 }}>
                    {st.status === 'done' ? 'Mastered' : st.status === 'active' ? `${st.pct}% In Progress` : 'Not Started'}
                  </span>
                </div>

                <div className="rm-desc">{lv.desc}</div>

                {/* Level Progress Bar */}
                <div className="prog-row" style={{ marginBottom: 12 }}>
                  <div className="prog-bar">
                    <div className={`prog-fill ${st.pct === 100 ? 'full' : ''}`} style={{ width: `${st.pct}%` }} />
                  </div>
                  <span className="prog-pct">{st.solved}/{st.total} ({st.pct}%)</span>
                </div>

                {/* Level 0 Foundation Chips */}
                {lv.isFoundation && (
                  <div className="rm-topics">
                    {lv.topics.map(t => (
                      <span key={t} className="t-chip" style={{ color: 'var(--green)' }}>✓ {t}</span>
                    ))}
                  </div>
                )}

                {/* Level 5 Capstone */}
                {lv.isCapStone && (
                  <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 6 }}>
                    Comprehensive mock readiness across all 290 problems in 27 DSA domains.
                  </div>
                )}

                {/* Topics in Level 1 - 4 with expandable problem lists */}
                {lv.roadmapTopics && (
                  <div className="rm-topics-grid">
                    {lv.roadmapTopics.map(t => {
                      const prods = ROADMAP_PROBLEMS[t] || [];
                      const tSolved = prods.filter(p => solvedIds.has(p.id)).length;
                      const isExpanded = expandedTopic === t;
                      const tPct = prods.length > 0 ? Math.round((tSolved / prods.length) * 100) : 0;

                      return (
                        <div key={t} className="rm-topic-box">
                          <div className="rm-topic-hd" onClick={() => toggleTopicExpand(t)}>
                            <div className="rm-topic-name">
                              <span>{isExpanded ? '▼' : '▶'}</span>
                              <span>{t}</span>
                            </div>
                            <div className="rm-topic-count">
                              <span style={{ color: tPct === 100 ? 'var(--green)' : tSolved > 0 ? 'var(--accent)' : 'var(--txt3)' }}>
                                {tSolved}/{prods.length}
                              </span>
                            </div>
                          </div>

                          {/* Mini Progress */}
                          <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${tPct}%`, height: '100%', background: tPct === 100 ? 'var(--green)' : 'var(--accent)' }} />
                          </div>

                          {/* Expanded Questions List */}
                          {isExpanded && (
                            <div className="rm-topic-problems">
                              {prods.map(p => {
                                const pSolved = solvedIds.has(p.id);
                                const isPreset = !!PRESET_SOLUTIONS[p.id];
                                return (
                                  <div key={p.id} className="rm-q-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                      <input
                                        type="checkbox"
                                        className="chk-box"
                                        checked={pSolved}
                                        onChange={() => toggleSolved(p.id)}
                                        title={pSolved ? 'Mark unsolved' : 'Mark solved'}
                                      />
                                      <span
                                        className="rm-q-title"
                                        onClick={() => handleVisualize({ ...p, topic: t })}
                                        title={`Visualize ${p.name}`}
                                      >
                                        #{p.id} {p.name}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                      <span className={`tag ${p.difficulty}`}>{p.difficulty[0].toUpperCase()}</span>
                                      <button
                                        className="btn-viz"
                                        style={{ padding: '2px 6px', fontSize: 9 }}
                                        onClick={() => handleVisualize({ ...p, topic: t })}
                                        title={isPreset ? 'Run verified solution' : 'Load template in visualizer'}
                                      >
                                        ▶ {isPreset ? 'Trace' : 'Viz'}
                                      </button>
                                      <a
                                        href={p.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-lc"
                                        style={{ padding: '2px 5px', fontSize: 9 }}
                                        title="Open in LeetCode"
                                      >
                                        ↗
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

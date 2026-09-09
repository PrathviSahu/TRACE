import { useNavigate } from 'react-router-dom';

export const GUIDES = [
  {
    title: 'Two Pointers Pattern',
    category: 'Foundations',
    topic: 'Two Pointers',
    summary: 'Master converging pointers, fast & slow pointers, and in-place array mutation.',
    readTime: '6 min read'
  },
  {
    title: 'Sliding Window Mastery',
    category: 'Arrays & Strings',
    topic: 'Sliding Window',
    summary: 'Dynamic and fixed window sizes for substring and contiguous subarray queries.',
    readTime: '8 min read'
  },
  {
    title: 'Prefix Sum & Range Queries',
    category: 'Mathematical',
    topic: 'Prefix Sum',
    summary: 'Precompute sums to answer subarray range queries in O(1) time.',
    readTime: '5 min read'
  },
  {
    title: 'Binary Search Invariants',
    category: 'Searching',
    topic: 'Binary Search',
    summary: 'Never write an infinite while(left <= right) loop again.',
    readTime: '7 min read'
  },
  {
    title: 'Monotonic Stack & Queue',
    category: 'Advanced Linear',
    topic: 'Stack',
    summary: 'Find Next Greater Element and largest rectangle in histogram in O(n).',
    readTime: '9 min read'
  },
  {
    title: 'Dynamic Programming Framework',
    category: 'Optimization',
    topic: 'Dynamic Programming',
    summary: 'State definition, transition equation, base cases, and space reduction from 2D to 1D.',
    readTime: '12 min read'
  }
];

export default function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-hd">
        <div className="page-title">Algorithmic Patterns & Guides</div>
        <div className="page-sub">
          Deep-dive tutorials and mental models for core DSA paradigms
        </div>
      </div>

      <div className="showcase-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {GUIDES.map(g => (
          <div key={g.title} className="feature-card">
            <span className="tag medium" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>{g.category}</span>
            <div className="feature-title">{g.title}</div>
            <p className="feature-desc">{g.summary}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--txt-muted, var(--txt3))' }}>{g.readTime}</span>
              <button
                className="btn-viz"
                onClick={() => navigate(`/problems?topic=${encodeURIComponent(g.topic)}`)}
              >
                Practice Problems →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

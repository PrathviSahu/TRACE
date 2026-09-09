import { useNavigate } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';

export const DS_LIST = [
  {
    name: 'Arrays & Strings',
    icon: '📊',
    desc: 'Contiguous memory, random access in O(1), dynamic arrays and string manipulation.',
    problemId: 'two-sum',
    color: '#8b5cf6'
  },
  {
    name: 'HashMap & HashSet',
    icon: '🗂️',
    desc: 'Hash function indexing, O(1) average lookup/insert, collision handling.',
    problemId: 'hashmap-hashset',
    color: '#38bdf8'
  },
  {
    name: 'Linked List',
    icon: '🔗',
    desc: 'Node-pointer based traversal, fast insertions/deletions, cycle detection.',
    problemId: 'linked-list',
    color: '#10b981'
  },
  {
    name: 'Stack',
    icon: '📚',
    desc: 'Last-In-First-Out (LIFO), monotonic stack, parentheses validation.',
    problemId: 'stack',
    color: '#f59e0b'
  },
  {
    name: 'Queue & Deque',
    icon: '📥',
    desc: 'First-In-First-Out (FIFO), double-ended queue, sliding window maximum.',
    problemId: 'queue-deque',
    color: '#ec4899'
  },
  {
    name: 'Binary Tree & BST',
    icon: '🌲',
    desc: 'Hierarchical node trees, inorder/preorder/postorder traversals, search tree invariants.',
    problemId: 'binary-tree',
    color: '#a855f7'
  },
  {
    name: 'Heap / Priority Queue',
    icon: '⚡',
    desc: 'Complete binary tree, Min-Heap and Max-Heap, top-K frequent elements in O(n log k).',
    problemId: 'heap-priority-queue',
    color: '#06b6d4'
  },
  {
    name: 'Graphs',
    icon: '🕸️',
    desc: 'Adjacency lists and matrices, BFS level-order, DFS topological sorts, shortest path.',
    problemId: 'graphs',
    color: '#6366f1'
  }
];

export default function DataStructuresPage() {
  const navigate = useNavigate();
  const { selectExample } = useTraceStore();

  function openDS(ds) {
    selectExample(ds.problemId);
    navigate('/');
  }

  return (
    <div className="page">
      <div className="page-hd">
        <div className="page-title">Data Structure Visualizers</div>
        <div className="page-sub">
          Interactive visual models for fundamental linear and non-linear data structures
        </div>
      </div>

      <div className="showcase-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {DS_LIST.map(ds => (
          <div key={ds.name} className="feature-card" onClick={() => openDS(ds)} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{ds.icon}</div>
            <div className="feature-title" style={{ color: ds.color }}>{ds.name}</div>
            <p className="feature-desc">{ds.desc}</p>
            <button className="btn-viz" style={{ marginTop: 12 }} onClick={(e) => { e.stopPropagation(); openDS(ds); }}>
              Explore in Visualizer →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const RESOURCES = [
  { id: 1, category: 'DSA', title: 'Arrays & Strings Masterclass', type: 'article', difficulty: 'Easy', duration: '30 min', url: 'https://leetcode.com/explore/learn/card/array-and-string/', tags: ['SDE', 'Data Scientist'] },
  { id: 2, category: 'DSA', title: 'Dynamic Programming Patterns', type: 'video', difficulty: 'Hard', duration: '2 hr', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', tags: ['SDE'] },
  { id: 3, category: 'System Design', title: 'Designing Scalable Systems', type: 'article', difficulty: 'Medium', duration: '45 min', url: 'https://github.com/donnemartin/system-design-primer', tags: ['SDE', 'DevOps'] },
  { id: 4, category: 'Behavioral', title: 'STAR Method for Interviews', type: 'guide', difficulty: 'Easy', duration: '20 min', url: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique', tags: ['SDE', 'PM', 'Data Scientist', 'DevOps'] },
  { id: 5, category: 'ML/AI', title: 'ML Fundamentals for Interviews', type: 'course', difficulty: 'Medium', duration: '3 hr', url: 'https://www.kaggle.com/learn', tags: ['Data Scientist'] },
  { id: 6, category: 'DevOps', title: 'Docker & Kubernetes Essentials', type: 'video', difficulty: 'Medium', duration: '1.5 hr', url: 'https://www.youtube.com/watch?v=PziYflu8cB8', tags: ['DevOps'] },
  { id: 7, category: 'PM', title: 'Product Sense Interview Guide', type: 'guide', difficulty: 'Medium', duration: '1 hr', url: 'https://www.productalliance.com/', tags: ['PM'] },
  { id: 8, category: 'DSA', title: 'Graph Algorithms Deep Dive', type: 'article', difficulty: 'Hard', duration: '1 hr', url: 'https://cp-algorithms.com/graph/', tags: ['SDE'] },
  { id: 9, category: 'Behavioral', title: 'Handling Pressure in Interviews', type: 'video', difficulty: 'Easy', duration: '15 min', url: 'https://www.youtube.com/watch?v=DHDrj0_bMQ0', tags: ['SDE', 'PM', 'Data Scientist', 'DevOps'] },
  { id: 10, category: 'System Design', title: 'Database Design Patterns', type: 'article', difficulty: 'Hard', duration: '1 hr', url: 'https://www.vertabelo.com/blog/database-design-patterns/', tags: ['SDE', 'Data Scientist'] },
  { id: 11, category: 'ML/AI', title: 'Statistics for Data Science', type: 'course', difficulty: 'Medium', duration: '2 hr', url: 'https://www.khanacademy.org/math/statistics-probability', tags: ['Data Scientist'] },
  { id: 12, category: 'DevOps', title: 'CI/CD Pipeline Best Practices', type: 'guide', difficulty: 'Medium', duration: '45 min', url: 'https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment', tags: ['DevOps'] },
  { id: 13, category: 'PM', title: 'Metrics & A/B Testing for PMs', type: 'article', difficulty: 'Hard', duration: '1 hr', url: 'https://www.productplan.com/learn/product-metrics/', tags: ['PM'] },
  { id: 14, category: 'DSA', title: 'Top 75 LeetCode Questions', type: 'guide', difficulty: 'Medium', duration: '10 hr', url: 'https://neetcode.io/', tags: ['SDE', 'Data Scientist'] },
  { id: 15, category: 'System Design', title: 'CAP Theorem Explained', type: 'article', difficulty: 'Hard', duration: '30 min', url: 'https://www.ibm.com/topics/cap-theorem', tags: ['SDE', 'DevOps'] },
  { id: 16, category: 'DSA', title: 'Strivers A2Z-DSA Course', type: 'course', difficulty: 'Hard', duration: '60 hr', url: 'https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz', tags: ['SDE', 'Data Scientist'] },
  { id: 17, category: 'DSA', title: 'DSA - Abdul Bari', type: 'course', difficulty: 'Medium', duration: '50 hr', url: 'https://youtube.com/playlist?list=PLAXnLdrLnQpRcveZTtD644gM9uzYqJCwr', tags: ['SDE', 'Data Scientist'] },
  { id: 18, category: 'DSA', title: 'Complete C++ Placement DSA Course', type: 'course', difficulty: 'Medium', duration: '80 hr', url: 'https://youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', tags: ['SDE'] },
  { id: 19, category: 'DSA', title: 'Strivers A2Z DSA Course/Sheet', type: 'guide', difficulty: 'Hard', duration: '100 hr', url: 'https://share.google/9wMcpjKPvMqnljRlc', tags: ['SDE', 'Data Scientist'] },
];

// GET /api/resources
router.get('/', protect, async (req, res) => {
  try {
    const { role, category, difficulty } = req.query;

    let filtered = [...RESOURCES];
    if (role && role !== 'all') {
      filtered = filtered.filter(r => r.tags.includes(role));
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(r => r.category === category);
    }
    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter(r => r.difficulty === difficulty);
    }

    const categories = [...new Set(RESOURCES.map(r => r.category))];

    res.json({ success: true, resources: filtered, categories, total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources.' });
  }
});

module.exports = router;

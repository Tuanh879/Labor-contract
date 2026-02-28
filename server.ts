import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('contracts.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT,
    department TEXT
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    month TEXT,
    employee_name TEXT,
    employee_id TEXT,
    position TEXT,
    department TEXT,
    salary REAL,
    contract_type TEXT,
    start_date TEXT,
    end_date TEXT,
    dlm_id TEXT,
    lm_id TEXT,
    hr_owner_id TEXT,
    dlm_status TEXT DEFAULT 'pending',
    lm_status TEXT DEFAULT 'pending',
    dlm_comment TEXT,
    lm_comment TEXT,
    dlm_updated_at TEXT,
    lm_updated_at TEXT,
    final_status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed some users if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, name, email, role, department) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('hr1', 'HR Admin', 'hr@company.com', 'HR', 'Human Resources');
  insertUser.run('dlm1', 'John DLM', 'dlm1@company.com', 'DLM', 'Engineering');
  insertUser.run('lm1', 'Jane LM', 'lm1@company.com', 'LM', 'Engineering');
  insertUser.run('bod1', 'Boss BOD', 'bod@company.com', 'BOD', 'Executive');
}

// Seed some contracts if empty
const contractCount = db.prepare('SELECT COUNT(*) as count FROM contracts').get() as { count: number };
if (contractCount.count === 0) {
  const insertContract = db.prepare(`
    INSERT INTO contracts (
      id, month, employee_name, employee_id, position, department, salary, contract_type, 
      start_date, end_date, dlm_id, lm_id, hr_owner_id, dlm_status, lm_status, final_status,
      dlm_comment, lm_comment, dlm_updated_at, lm_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const now = new Date().toISOString();
  
  insertContract.run(
    'c1', '2023-10', 'Alice Smith', 'EMP001', 'Software Engineer', 'Engineering', 5000, 'Full-time',
    '2023-10-01', '2024-09-30', 'dlm1', 'lm1', 'hr1', 'pending', 'pending', 'pending',
    null, null, null, null
  );
  insertContract.run(
    'c2', '2023-10', 'Bob Jones', 'EMP002', 'QA Engineer', 'Engineering', 4000, 'Contractor',
    '2023-10-01', '2024-03-31', 'dlm1', 'lm1', 'hr1', 'approved', 'pending', 'pending',
    'Looks good to me.', null, now, null
  );
  insertContract.run(
    'c3', '2023-10', 'Charlie Brown', 'EMP003', 'DevOps Engineer', 'Engineering', 6000, 'Full-time',
    '2023-10-01', '2024-09-30', 'dlm1', 'lm1', 'hr1', 'approved', 'approved', 'approved',
    'Approved.', 'Agreed, approved.', now, now
  );
  insertContract.run(
    'c4', '2023-10', 'Diana Prince', 'EMP004', 'Frontend Developer', 'Engineering', 5500, 'Full-time',
    '2023-10-01', '2024-09-30', 'dlm1', 'lm1', 'hr1', 'rejected', 'pending', 'rejected',
    'Salary is above budget for this role.', null, now, null
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  });

  app.get('/api/contracts', (req, res) => {
    const contracts = db.prepare('SELECT * FROM contracts ORDER BY created_at DESC').all();
    res.json(contracts);
  });

  app.post('/api/contracts', (req, res) => {
    const { contracts } = req.body;
    const insert = db.prepare(`
      INSERT INTO contracts (
        id, month, employee_name, employee_id, position, department, salary, contract_type, 
        start_date, end_date, dlm_id, lm_id, hr_owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((contracts) => {
      for (const c of contracts) {
        insert.run(
          c.id, c.month, c.employee_name, c.employee_id, c.position, c.department, c.salary, c.contract_type,
          c.start_date, c.end_date, c.dlm_id, c.lm_id, c.hr_owner_id
        );
      }
    });

    try {
      insertMany(contracts);
      res.json({ success: true, count: contracts.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to insert contracts' });
    }
  });

  app.patch('/api/contracts/:id/approve', (req, res) => {
    const { id } = req.params;
    const { role, comment } = req.body; // role: 'DLM' or 'LM'
    
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id) as any;
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const now = new Date().toISOString();
    let stmt;
    if (role === 'DLM') {
      stmt = db.prepare('UPDATE contracts SET dlm_status = ?, dlm_comment = ?, dlm_updated_at = ? WHERE id = ?');
      stmt.run('approved', comment || null, now, id);
      contract.dlm_status = 'approved';
    } else if (role === 'LM') {
      stmt = db.prepare('UPDATE contracts SET lm_status = ?, lm_comment = ?, lm_updated_at = ? WHERE id = ?');
      stmt.run('approved', comment || null, now, id);
      contract.lm_status = 'approved';
    }

    // Check final status
    if (contract.dlm_status === 'approved' && contract.lm_status === 'approved') {
      db.prepare('UPDATE contracts SET final_status = ? WHERE id = ?').run('approved', id);
    }

    res.json({ success: true });
  });

  app.patch('/api/contracts/:id/reject', (req, res) => {
    const { id } = req.params;
    const { role, comment } = req.body; // role: 'DLM' or 'LM'
    
    if (!comment) return res.status(400).json({ error: 'Reject reason required' });

    const now = new Date().toISOString();
    let stmt;
    if (role === 'DLM') {
      stmt = db.prepare('UPDATE contracts SET dlm_status = ?, dlm_comment = ?, dlm_updated_at = ?, final_status = ? WHERE id = ?');
      stmt.run('rejected', comment, now, 'rejected', id);
    } else if (role === 'LM') {
      stmt = db.prepare('UPDATE contracts SET lm_status = ?, lm_comment = ?, lm_updated_at = ?, final_status = ? WHERE id = ?');
      stmt.run('rejected', comment, now, 'rejected', id);
    }

    res.json({ success: true });
  });

  app.delete('/api/contracts/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM contracts WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

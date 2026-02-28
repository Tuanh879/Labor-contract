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
  insertUser.run('hr1', 'HR Admin', 'tuanhnguyen8799@gmail.com', 'HR', 'Human Resources');
  insertUser.run('dlm1', 'Group 1 (DLM)', 'group1@techtus.com', 'DLM', 'Engineering');
  insertUser.run('lm1', 'Line Manager 1', 'lm1@techtus.com', 'LM', 'Engineering');
  insertUser.run('bod1', 'BOD', 'bod@techtus.com', 'BOD', 'Executive');
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
  
  const contractsData = [
    { id: 'c1', name: 'Nguyễn Minh Quân', pos: 'Backend Developer', level: 'Middle', loc: 'Đà Nẵng', group: 'A', line: '1', type: 'HĐLĐ', date: '05/01/2026' },
    { id: 'c2', name: 'Trần Thu Hà', pos: 'QA Engineer', level: 'Junior', loc: 'Đà Nẵng', group: 'A', line: '1', type: 'HĐLĐ', date: '06/01/2026' },
    { id: 'c3', name: 'Lê Hoàng Nam', pos: 'Frontend Developer', level: 'Senior', loc: 'Đà Nẵng', group: 'A', line: '2', type: 'HĐLĐ', date: '06/01/2026' },
    { id: 'c4', name: 'Phạm Ngọc Anh', pos: 'HR Specialist', level: 'Middle', loc: 'HCM', group: 'C', line: '1', type: 'PLHĐLĐ', date: '08/01/2026' },
    { id: 'c5', name: 'Vũ Đức Long', pos: 'DevOps Engineer', level: 'Senior', loc: 'HCM', group: 'B', line: '3', type: 'HĐLĐ', date: '09/01/2026' },
    { id: 'c6', name: 'Bùi Thị Lan', pos: 'Accountant', level: 'Middle', loc: 'HCM', group: 'C', line: '1', type: 'HĐLĐ', date: '10/01/2026' },
    { id: 'c7', name: 'Đỗ Thành Trung', pos: 'Backend Developer', level: 'Junior', loc: 'Đà Nẵng', group: 'A', line: '1', type: 'HĐLĐ', date: '12/01/2026' },
    { id: 'c8', name: 'Nguyễn Thảo My', pos: 'IT Comtor', level: 'Junior', loc: 'Huế', group: 'B', line: '2', type: 'HĐLĐ', date: '12/01/2026' },
    { id: 'c9', name: 'Phan Quốc Huy', pos: 'Project Manager', level: 'Senior', loc: 'HCM', group: 'B', line: '3', type: 'PLHĐLĐ', date: '15/01/2026' },
    { id: 'c10', name: 'Lý Gia Hân', pos: 'UI/UX Designer', level: 'Middle', loc: 'Đà Nẵng', group: 'A', line: '2', type: 'HĐLĐ', date: '16/01/2026' },
    { id: 'c11', name: 'Trịnh Công Sơn', pos: 'Mobile Developer', level: 'Middle', loc: 'Đà Nẵng', group: 'A', line: '3', type: 'HĐLĐ', date: '18/01/2026' },
    { id: 'c12', name: 'Hoàng Thị Mai', pos: 'Recruiter', level: 'Junior', loc: 'HCM', group: 'C', line: '2', type: 'HĐLĐ', date: '20/01/2026' },
    { id: 'c13', name: 'Nguyễn Thanh Tùng', pos: 'Data Engineer', level: 'Senior', loc: 'HCM', group: 'B', line: '3', type: 'PLHĐLĐ', date: '22/01/2026' },
    { id: 'c14', name: 'Dương Khánh Linh', pos: 'Tester', level: 'Junior', loc: 'Huế', group: 'A', line: '1', type: 'HĐLĐ', date: '23/01/2026' },
    { id: 'c15', name: 'Phạm Quốc Bảo', pos: 'Tech Lead', level: 'Senior', loc: 'HCM', group: 'B', line: '3', type: 'PLHĐLĐ', date: '25/01/2026' },
    { id: 'c16', name: 'Võ Minh Khang', pos: 'Backend Developer', level: 'Middle', loc: 'Đà Nẵng', group: 'A', line: '2', type: 'HĐLĐ', date: '27/01/2026' },
    { id: 'c17', name: 'Lê Thị Hồng', pos: 'HR Admin', level: 'Junior', loc: 'Huế', group: 'C', line: '1', type: 'HĐLĐ', date: '28/01/2026' },
    { id: 'c18', name: 'Đặng Anh Tuấn', pos: 'Security Engineer', level: 'Senior', loc: 'HCM', group: 'B', line: '2', type: 'HĐLĐ', date: '30/01/2026' },
    { id: 'c19', name: 'Phan Minh Châu', pos: 'Business Analyst', level: 'Middle', loc: 'HCM', group: 'B', line: '1', type: 'PLHĐLĐ', date: '03/02/2026' },
    { id: 'c20', name: 'Trần Nhật Hoàng', pos: 'Frontend Developer', level: 'Junior', loc: 'Đà Nẵng', group: 'A', line: '3', type: 'HĐLĐ', date: '05/02/2026' },
  ];

  for (const c of contractsData) {
    // Random salary between 1000 and 5000 for demo
    const salary = Math.floor(Math.random() * 4000) + 1000;
    
    // Format date from DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = c.date.split('/');
    const startDate = `${year}-${month}-${day}`;
    const endDate = `${parseInt(year) + 1}-${month}-${day}`;
    
    insertContract.run(
      c.id, '2026-01', c.name, `EMP${c.id.replace('c', '').padStart(3, '0')}`, c.pos, c.loc, salary, c.type,
      startDate, endDate, 'dlm1', 'lm1', 'hr1', 'pending', 'pending', 'pending',
      null, null, null, null
    );
  }
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

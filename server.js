require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
// Use uma variável de ambiente para a secret em produção
const SECRET = process.env.JWT_SECRET || 'symptom-secret-key-2024';

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// --- Rotas de Autenticação ---
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
        const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
        const info = stmt.run(name, email, hashedPassword);
        
        const token = jwt.sign({ id: info.lastInsertRowid }, SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
            token, 
            user: { name, email } 
        });
    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Este e-mail já está em uso' });
        }
        res.status(500).json({ message: 'Erro interno ao criar conta' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'E-mail ou senha incorretos' });
        }

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { name: user.name, email: user.email } 
        });
    } catch (e) {
        res.status(500).json({ message: 'Erro ao processar login' });
    }
});

// --- Rotas de Sintomas ---
app.get('/api/symptoms', authMiddleware, (req, res) => {
    try {
        const symptoms = db.prepare('SELECT * FROM symptoms WHERE user_id = ? ORDER BY date DESC').all(req.userId);
        res.json(symptoms);
    } catch (e) {
        res.status(500).json({ message: 'Erro ao buscar sintomas' });
    }
});

app.post('/api/symptoms', authMiddleware, (req, res) => {
    const { category, level, notes, date } = req.body;
    
    if (!category || level === undefined) {
        return res.status(400).json({ message: 'Dados do sintoma incompletos' });
    }

    try {
        const stmt = db.prepare('INSERT INTO symptoms (user_id, category, level, notes, date) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(req.userId, category, level, notes, date || new Date().toISOString());
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (e) {
        res.status(500).json({ message: 'Erro ao salvar sintoma' });
    }
});

app.delete('/api/symptoms/:id', authMiddleware, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM symptoms WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Sintoma não encontrado' });
        }
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ message: 'Erro ao excluir sintoma' });
    }
});

// --- Rotas de Ciclo ---
app.get('/api/cycle', authMiddleware, (req, res) => {
    try {
        const days = db.prepare('SELECT date FROM cycle_days WHERE user_id = ?').all(req.userId);
        res.json(days.map(d => d.date));
    } catch (e) {
        res.status(500).json({ message: 'Erro ao buscar dados do ciclo' });
    }
});

app.post('/api/cycle/toggle', authMiddleware, (req, res) => {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: 'Data é obrigatória' });

    try {
        const existing = db.prepare('SELECT * FROM cycle_days WHERE user_id = ? AND date = ?').get(req.userId, date);

        if (existing) {
            db.prepare('DELETE FROM cycle_days WHERE user_id = ? AND date = ?').run(req.userId, date);
            res.json({ status: 'removed' });
        } else {
            db.prepare('INSERT INTO cycle_days (user_id, date) VALUES (?, ?)').run(req.userId, date);
            res.json({ status: 'added' });
        }
    } catch (e) {
        res.status(500).json({ message: 'Erro ao atualizar ciclo' });
    }
});

// Redireciona rotas desconhecidas para o index.html (Suporte a SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
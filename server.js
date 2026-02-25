// 服务器端代码 - 用于自动保存和加载游戏状态
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());

// 保存游戏状态的目录
const SAVE_DIR = path.join(__dirname, 'saves');
const USERS_DIR = path.join(__dirname, 'users');

// 确保保存目录存在
if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
}

if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
}

// 简单的用户存储
const users = new Map();

// 生成随机token
function generateToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 登录API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }
        
        // 检查用户是否存在
        const userFilePath = path.join(USERS_DIR, `${username}.json`);
        if (!fs.existsSync(userFilePath)) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
        
        // 验证密码
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // 生成token
        const token = generateToken();
        
        // 存储token
        users.set(token, {
            username: username,
            userId: username,
            gender: userData.gender,
            role: userData.role || 'player'
        });
        
        res.json({ 
            success: true, 
            token: token,
            user: {
                username: username,
                userId: username,
                gender: userData.gender,
                role: userData.role || 'player'
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// 注册API
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, gender } = req.body;
        
        if (!username || !password || !gender) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // 检查用户是否已存在
        const userFilePath = path.join(USERS_DIR, `${username}.json`);
        if (fs.existsSync(userFilePath)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // 生成密码哈希
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 创建新用户
        const userData = {
            password: hashedPassword,
            gender: gender,
            role: 'player'
        };
        
        fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
        
        // 生成token
        const token = generateToken();
        
        // 存储token
        users.set(token, {
            username: username,
            userId: username,
            gender: gender,
            role: 'player'
        });
        
        res.json({ 
            success: true, 
            token: token,
            user: {
                username: username,
                userId: username,
                gender: gender,
                role: 'player'
            }
        });
    } catch (error) {
        console.error('Error registering:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

// 验证token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = users.get(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
}

// 保存游戏状态
app.post('/api/save', verifyToken, (req, res) => {
    try {
        let { gameState } = req.body;
        const userId = req.user.userId;
        
        if (!gameState) {
            return res.status(400).json({ error: 'Missing gameState' });
        }
        
        // 过滤掉元数据部分和不需要存储的临时数据
        const metadataFields = ['equipmentRarities', 'equipmentTemplates', 'dropRates', 'enemyTypes', 'skills', 'shop', 'mapBackgrounds', 'sceneMonsters', 'user'];
        metadataFields.forEach(field => {
            if (gameState[field]) {
                delete gameState[field];
            }
        });
        
        // 删除resources对象中的energy相关属性
        if (gameState.resources) {
            delete gameState.resources.energy;
            delete gameState.resources.maxEnergy;
            delete gameState.resources.energyRate;
        }
        
        // 生成保存文件路径
        const saveFilePath = path.join(SAVE_DIR, `${userId}.json`);
        
        // 保存游戏状态到文件
        fs.writeFileSync(saveFilePath, JSON.stringify(gameState, null, 2));
        
        res.json({ success: true, message: 'Game state saved successfully' });
    } catch (error) {
        console.error('Error saving game:', error);
        res.status(500).json({ error: 'Failed to save game state' });
    }
});

// 加载游戏状态
app.get('/api/load', verifyToken, (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 生成保存文件路径
        const saveFilePath = path.join(SAVE_DIR, `${userId}.json`);
        
        // 检查文件是否存在
        if (!fs.existsSync(saveFilePath)) {
            return res.status(404).json({ error: 'Save file not found' });
        }
        
        // 读取游戏状态
        const gameState = JSON.parse(fs.readFileSync(saveFilePath, 'utf8'));
        
        res.json({ success: true, gameState });
    } catch (error) {
        console.error('Error loading game:', error);
        res.status(500).json({ error: 'Failed to load game state' });
    }
});

// 登出API
app.post('/api/logout', verifyToken, (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            users.delete(token);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

// 注销用户API
app.post('/api/delete-account', verifyToken, async (req, res) => {
    try {
        const { username, password } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }
        
        // 检查用户是否存在
        const userFilePath = path.join(USERS_DIR, `${username}.json`);
        if (!fs.existsSync(userFilePath)) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
        
        // 验证密码
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // 删除用户文件
        fs.unlinkSync(userFilePath);
        
        // 删除游戏存档文件
        const saveFilePath = path.join(SAVE_DIR, `${username}.json`);
        if (fs.existsSync(saveFilePath)) {
            fs.unlinkSync(saveFilePath);
        }
        
        // 删除token
        if (token) {
            users.delete(token);
        }
        
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// 导入游戏元数据
import gameMetadata from './game-metadata.js';

// 游戏元数据API - 需要登录验证
app.get('/api/metadata', verifyToken, (req, res) => {
    try {
        res.json({ success: true, metadata: gameMetadata });
    } catch (error) {
        console.error('Error getting metadata:', error);
        res.status(500).json({ error: 'Failed to get game metadata' });
    }
});

// 静态文件服务
app.use(express.static(__dirname));

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

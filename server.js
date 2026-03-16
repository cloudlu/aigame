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
const PORT = 3002;

// 启用CORS
app.use(cors({
    origin: 'http://localhost:3002',
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

// 生成初始游戏状态（新用户）- 创建最小化存档
function createInitialGameState(username, gender) {
    // 只创建最小框架，前端会自动调用初始化
    return {
        user: {
            loggedIn: true,
            username: username,
            userId: username,
            gender: gender,
            role: 'player'
        },
        player: {
            // 标记：需要初始化（前端检测到此标记会执行 initializeNewPlayer）
            isNewPlayer: true
        }
        // 其他所有字段由前端从 game-metadata.js 初始化
        // 这样可以保证前后端数据结构一致，避免重复逻辑
    };
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

        // 创建初始游戏存档
        const saveFilePath = path.join(SAVE_DIR, `${username}.json`);
        const initialGameState = createInitialGameState(username, gender);
        fs.writeFileSync(saveFilePath, JSON.stringify(initialGameState, null, 2));
        console.log(`Created initial save file for user: ${username}`);

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
        const metadataFields = ['equipmentRarities', 'equipmentTemplates', 'dropRates', 'enemyTypes', 'skills', 'shop', 'mapBackgrounds', 'sceneMonsters', 'user', 'metadata'];
        metadataFields.forEach(field => {
            if (gameState[field]) {
                delete gameState[field];
            }
        });
                
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

        // 初始化技能数据（如果不存在）
        if (gameState.player && !gameState.player.skills) {
            gameState.player.skills = {
                levels: {},
                equipped: {
                    attack: null,
                    defense: null,
                    recovery: null,
                    special: null
                }
            };
            fs.writeFileSync(saveFilePath, JSON.stringify(gameState, null, 2));
        }

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

// 加载充值码配置
const RECHARGE_CODES_PATH = path.join(__dirname, 'config', 'vipcode.json');
let rechargeCodes = [];
if (fs.existsSync(RECHARGE_CODES_PATH)) {
    try {
        rechargeCodes = JSON.parse(fs.readFileSync(RECHARGE_CODES_PATH, 'utf8'));
        console.log(`[充值] 已加载${rechargeCodes.length}个充值码`);
    } catch (e) {
        console.error('[充值] 充值码加载失败:', e);
    }
} else {
    console.warn('[充值] 未找到充值码配置文件:', RECHARGE_CODES_PATH);
}

// 充值套餐列表接口（不包含密码）
app.get('/api/recharge/packages', verifyToken, (req, res) => {
    try {
        const packages = rechargeCodes.map(r => ({ jade: r.jade, label: r.label }));
        res.json({ success: true, packages });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取套餐失败' });
    }
});

// 充值验证接口
app.post('/api/recharge', verifyToken, (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: '请输入充值码' });
        }

        const upperCode = code.trim().toUpperCase();
        const found = rechargeCodes.find(r => r.code === upperCode);
        if (!found) {
            return res.json({ success: false, message: '充值码无效！' });
        }

        // 读取用户存档并增加仙玉
        const userId = req.user.userId;
        const saveFilePath = path.join(SAVE_DIR, `${userId}.json`);
        if (!fs.existsSync(saveFilePath)) {
            return res.status(404).json({ success: false, message: '存档不存在' });
        }

        const gameState = JSON.parse(fs.readFileSync(saveFilePath, 'utf8'));

        // 初始化仙玉和VIP字段
        if (!gameState.resources) gameState.resources = {};
        if (gameState.resources.jade === undefined) gameState.resources.jade = 0;
        if (!gameState.vip) gameState.vip = { level: 0, totalRecharged: 0 };

        // 增加仙玉
        gameState.resources.jade += found.jade;
        gameState.vip.totalRecharged += found.jade;

        // 重新计算VIP等级
        let newLevel = 0;
        const VIP_LEVELS = [
            { level: 0,  requiredJade: 0,     label: '普通修士' },
            { level: 1,  requiredJade: 60,    label: '入门弟子' },
            { level: 2,  requiredJade: 360,   label: '外门弟子' },
            { level: 3,  requiredJade: 680,   label: '内门弟子' },
            { level: 4,  requiredJade: 1280,  label: '精英弟子' },
            { level: 5,  requiredJade: 2000,  label: '核心弟子' },
            { level: 6,  requiredJade: 3280,  label: '长老候选' },
            { level: 7,  requiredJade: 5000,  label: '执事长老' },
            { level: 8,  requiredJade: 6480,  label: '副掌门' },
            { level: 9,  requiredJade: 10000, label: '掌门' },
            { level: 10, requiredJade: 15000, label: '太上长老' },
            { level: 11, requiredJade: 20000, label: '圣者' },
            { level: 12, requiredJade: 30000, label: '仙尊' }
        ];
        for (const v of VIP_LEVELS) {
            if (gameState.vip.totalRecharged >= v.requiredJade) {
                newLevel = v.level;
            } else {
                break;
            }
        }
        const oldLevel = gameState.vip.level;
        gameState.vip.level = newLevel;

        // 保存存档
        fs.writeFileSync(saveFilePath, JSON.stringify(gameState, null, 2));

        // 构建响应
        const response = {
            success: true,
            jade: found.jade,
            totalJade: gameState.resources.jade,
            message: `充值成功！获得${found.jade}仙玉`,
            label: found.label,
            vipLevel: newLevel,
            vipLeveledUp: newLevel > oldLevel
        };

        if (response.vipLeveledUp) {
            response.vipInfo = VIP_LEVELS[newLevel];
        }

        res.json(response);
    } catch (error) {
        console.error('充值处理失败:', error);
        res.status(500).json({ success: false, message: '充值处理失败' });
    }
});

// 静态文件服务
app.use(express.static(__dirname));

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

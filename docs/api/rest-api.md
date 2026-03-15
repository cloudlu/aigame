# API 文档

## 基础信息

- **Base URL**: `http://localhost:3002`
- **认证方式**: Bearer Token
- **数据格式**: JSON

## 认证 API

### 注册

创建新用户账号。

**请求**
```
POST /api/register
Content-Type: application/json
```

**参数**
```json
{
  "username": "string",  // 用户名，必填
  "password": "string",  // 密码，必填
  "gender": "string"     // 性别 (male/female)，必填
}
```

**响应**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "username": "player1",
    "userId": "player1",
    "gender": "male",
    "role": "player"
  }
}
```

**错误响应**
```json
{
  "error": "Username already exists"
}
```

---

### 登录

用户登录获取 Token。

**请求**
```
POST /api/login
Content-Type: application/json
```

**参数**
```json
{
  "username": "string",  // 用户名，必填
  "password": "string"   // 密码，必填
}
```

**响应**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "username": "player1",
    "userId": "player1",
    "gender": "male",
    "role": "player"
  }
}
```

**错误响应**
```json
{
  "error": "Invalid password"
}
```

---

## 游戏 API

所有游戏 API 需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

### 获取游戏元数据

获取游戏配置和元数据。

**请求**
```
GET /api/metadata
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "metadata": {
    "realmSkills": [...],
    "enemies": [...],
    "items": [...],
    "realms": [...]
  }
}
```

---

### 保存游戏

保存当前游戏进度。

**请求**
```
POST /api/save
Authorization: Bearer <token>
Content-Type: application/json
```

**参数**
```json
{
  "gameState": {
    "player": {...},
    "resources": {...},
    "settings": {...}
  }
}
```

**响应**
```json
{
  "success": true,
  "message": "Game saved successfully"
}
```

---

### 加载游戏

加载游戏存档。

**请求**
```
GET /api/load
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "gameState": {
    "player": {...},
    "resources": {...},
    "settings": {...}
  }
}
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或Token无效）|
| 403 | 禁止访问（权限不足）|
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 请求示例

### JavaScript (Fetch API)

```javascript
// 登录
async function login(username, password) {
  const response = await fetch('http://localhost:3002/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    return data.user;
  } else {
    throw new Error(data.error);
  }
}

// 保存游戏
async function saveGame(gameState) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3002/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ gameState })
  });
  
  return await response.json();
}

// 加载游戏
async function loadGame() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3002/api/load', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3002/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"123456"}'

# 保存游戏
curl -X POST http://localhost:3002/api/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"gameState":{...}}'

# 加载游戏
curl -X GET http://localhost:3002/api/load \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 数据结构

### User

```typescript
interface User {
  username: string;
  userId: string;
  gender: 'male' | 'female';
  role: 'player' | 'admin';
}
```

### GameState

```typescript
interface GameState {
  user: User[];
  player: Player;
  resources: Resources;
  settings: Settings;
  battle: BattleState;
}
```

### Player

```typescript
interface Player {
  name: string;
  level: number;
  exp: number;
  realm: number;
  stage: number;
  maxHp: number;
  currentHp: number;
  maxEnergy: number;
  currentEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  equipment: Equipment;
  skills: string[];
  skillLevels: Record<string, number>;
  gold: number;
}
```

### Resources

```typescript
interface Resources {
  wood: Resource;
  iron: Resource;
  crystal: Resource;
}

interface Resource {
  current: number;
  max: number;
  rate: number;
}
```

---

## 认证流程

1. 用户注册或登录
2. 服务器生成并返回 Token
3. 客户端保存 Token (localStorage)
4. 后续请求在 Header 中携带 Token
5. 服务器验证 Token 有效性
6. 返回请求的数据

---

## 限流

当前版本没有实现限流，未来版本可能会添加：
- 每个IP的请求频率限制
- 每个用户的API调用次数限制

---

## WebSocket (未来功能)

计划在未来版本中添加 WebSocket 支持用于：
- 实时战斗同步
- 多人在线功能
- 实时通知

---

**API版本**: v1.0  
**最后更新**: 2024-03-07

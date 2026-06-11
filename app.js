// 你的 API 密钥
const API_KEY = '6858a0ae96541bb2a4c061150710d067';
// 注意：你需要将下面的 URL 替换为你所使用的 API 服务商提供的真实数据接口链接
const API_URL = `https://api.example.com/matches?key=${API_KEY}`;

// 初始化或读取本地余额 (默认给 1000 个模拟币)
let balance = localStorage.getItem('worldcup_balance');
if (!balance) {
    balance = 1000;
    localStorage.setItem('worldcup_balance', balance);
}
document.getElementById('balance').innerText = balance;

// 获取并渲染赛程
async function fetchMatches() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // 假设 API 返回的结构是 { data: [{ team1: '巴西', team2: '阿根廷', id: 1 }] }
        // 具体需要根据你的 API 文档来调整解析逻辑
        renderMatches(data.data); 
    } catch (error) {
        console.error("加载失败:", error);
        document.getElementById('matches-container').innerHTML = "赛程加载失败，请检查 API 文档或网络。";
    }
}

// 在页面上生成赛程列表
function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    container.innerHTML = ''; // 清空加载提示

    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div>
                <h3>${match.team1} VS ${match.team2}</h3>
                <p>比赛时间: ${match.time}</p>
            </div>
            <div>
                <button onclick="placeBet(100)">投入 100 币</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 模拟下注逻辑
window.placeBet = function(amount) {
    if (balance >= amount) {
        balance -= amount;
        localStorage.setItem('worldcup_balance', balance);
        document.getElementById('balance').innerText = balance;
        alert(`下注成功！扣除了 ${amount} 币。`);
    } else {
        alert("余额不足！");
    }
}

// 页面加载时执行
fetchMatches();

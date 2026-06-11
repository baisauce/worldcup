// 1. 配置你的 Cloudflare Worker 专属链接（已为你替换为真实链接）
const API_URL = 'https://worldcup-api.carl-ning-buaa.workers.dev/'; 

let currentUsername = localStorage.getItem('wc_logged_user') || null;

// 2. 登录与注册统一处理
async function handleAuth(type) {
    const u = document.getElementById('auth-username').value.trim();
    const p = document.getElementById('auth-password').value.trim();
    
    if(!u || !p) return alert("请输入账号和密码！");

    try {
        const response = await fetch(`${API_URL}?action=${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const res = await response.json();

        if (response.ok) {
            alert(res.message || "登录成功！");
            if(type === 'login' || type === 'register') {
                localStorage.setItem('wc_logged_user', u);
                currentUsername = u;
                initApp();
            }
        } else {
            alert("错误: " + res.error);
        }
    } catch (err) {
        alert("网络请求失败，请检查后端服务");
    }
}

// 退出登录
function handleLogout() {
    localStorage.removeItem('wc_logged_user');
    currentUsername = null;
    location.reload();
}

// 3. 初始化并拉取数据
async function initApp() {
    if (!currentUsername) {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('main-app').style.display = 'none';
        return;
    }

    // 隐藏登录页，显示主页
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('current-user-name').innerText = `👤 账号: ${currentUsername}`;

    try {
        // 请求后端获取赛程及该用户的资产、投注状态
        const response = await fetch(`${API_URL}?action=get_data&username=${currentUsername}`);
        const data = await response.json();

        if (data.error) {
            alert("数据同步失败: " + data.error);
            return;
        }

        // 更新余额显示
        document.getElementById('balance').innerText = data.user ? data.user.balance : 1000;
        
        // 渲染投注历史
        renderHistory(data.user ? data.user.bets : []);

        // 渲染赛程列表
        renderSchedule(data.schedule);

    } catch (error) {
        console.error(error);
        document.getElementById('matches-container').innerHTML = `<p class="loading" style="color:red;">数据加载失败</p>`;
    }
}

// 4. 渲染投注历史 (带输赢状态)
function renderHistory(bets) {
    const container = document.getElementById('history-container');
    if (!bets || bets.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无投注记录，快去预测比赛吧！</p>';
        return;
    }
    container.innerHTML = bets.map(bet => {
        let statusClass = `status-${bet.status}`;
        let statusText = bet.status === 'pending' ? '等待开赛' : bet.status;
        return `
            <div class="history-item">
                <div><strong>${bet.match_name}</strong></div>
                <div style="margin-top: 5px; color:#666;">
                    猜: <span class="history-tag" style="background:#e2e8f0;">${bet.prediction}</span> 
                    投了 <strong>${bet.amount}</strong> 🪙
                    <span class="status-tag ${statusClass}">${statusText}</span>
                </div>
                <div style="font-size:11px; color:#999; margin-top:2px;">下注时间: ${bet.time}</div>
            </div>
        `;
    }).join('');
}

// 5. 渲染赛程列表
function renderSchedule(dateGroups) {
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    dateGroups.forEach(group => {
        const dateBox = document.createElement('div');
        dateBox.className = 'date-group';
        dateBox.innerHTML = `<div class="date-title">${group.schedule_date_format} ${group.schedule_week}</div>`;

        group.schedule_list.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';

            const scoreDisplay = (match.match_status === "3") 
                ? `<span class="vs-score">${match.host_team_score} : ${match.guest_team_score}</span>`
                : `<span class="vs">VS</span>`;

            const isFinished = match.match_status === "3";
            const btnAttr = isFinished ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';

            card.innerHTML = `
                <div class="match-info">
                    <span>【${match.match_type_name}·${match.match_type_des}】</span> | 
                    <span>时间: ${match.date_time.substring(11, 16)}</span> | 
                    <span style="color:${match.match_status==='3'?'#999':'#2b6cb0'}">${match.match_des}</span>
                </div>
                <div class="match-teams">
                    <div class="team">
                        <img src="${match.host_team_logo_url}" onerror="this.src='https://via.placeholder.com/45?text=FLAG'">
                        <span>${match.host_team_name}</span>
                    </div>
                    <div>${scoreDisplay}</div>
                    <div class="team">
                        <img src="${match.guest_team_logo_url}" onerror="this.src='https://via.placeholder.com/45?text=FLAG'">
                        <span>${match.guest_team_name}</span>
                    </div>
                </div>
                <div class="bet-actions">
                    <button class="bet-btn" ${btnAttr} onclick="handleBet('${match.host_team_name} VS ${match.guest_team_name}', '${match.host_team_name} 胜')">主胜</button>
                    <button class="bet-btn" ${btnAttr} onclick="handleBet('${match.host_team_name} VS ${match.guest_team_name}', '平局')">平局</button>
                    <button class="bet-btn" ${btnAttr} onclick="handleBet('${match.host_team_name} VS ${match.guest_team_name}', '${match.guest_team_name} 胜')">客胜</button>
                </div>
            `;
            dateBox.appendChild(card);
        });
        container.appendChild(dateBox);
    });
}

// 6. 提交下注到云端
window.handleBet = async function(matchName, prediction) {
    const input = prompt(`请输入对【${matchName}】预测 [${prediction}] 的投注金额：`, "100");
    if (input === null) return;

    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) return alert("请输入有效金额！");

    try {
        const response = await fetch(`${API_URL}?action=place_bet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUsername,
                match_name: matchName,
                prediction: prediction,
                amount: amount
            })
        });
        const res = await response.json();

        if (response.ok) {
            alert("下注成功！");
            document.getElementById('balance').innerText = res.balance;
            renderHistory(res.bets);
        } else {
            alert("下注失败: " + res.error);
        }
    } catch (err) {
        alert("网络请求错误");
    }
};

// 页面加载入口
initApp();

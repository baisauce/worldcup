const API_URL = 'https://worldcup-api.carl-ning-buaa.workers.dev/'; 

let currentUsername = localStorage.getItem('wc_logged_user') || null;

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
            alert(res.message || "操作成功！");
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

function handleLogout() {
    localStorage.removeItem('wc_logged_user');
    currentUsername = null;
    location.reload();
}

async function initApp() {
    if (!currentUsername) {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('main-app').style.display = 'none';
        return;
    }

    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('current-user-name').innerText = `👤 账号: ${currentUsername}`;

    try {
        const response = await fetch(`${API_URL}?action=get_data&username=${currentUsername}`);
        const data = await response.json();

        if (data.error) {
            alert("数据同步失败: " + data.error);
            return;
        }

        if (data.user) {
            document.getElementById('total-asset').innerText = data.user.total_held;
            document.getElementById('balance').innerText = data.user.balance;
            document.getElementById('pending-asset').innerText = data.user.pending;
            renderHistory(data.user.bets);
        }
        
        renderLeaderboard(data.leaderboard);
        renderSchedule(data.schedule);

    } catch (error) {
        console.error(error);
        document.getElementById('matches-container').innerHTML = `<p class="loading" style="color:red;">数据加载失败</p>`;
    }
}

// 渲染个人历史记录 (显示当时锁定的下注赔率)
function renderHistory(bets) {
    const container = document.getElementById('history-container');
    if (!bets || bets.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无投注记录</p>';
        return;
    }
    container.innerHTML = bets.map(bet => {
        let statusClass = `status-${bet.status}`;
        let statusText = bet.status === 'pending' ? '等待开赛' : bet.status;
        let showOdds = bet.odds ? bet.odds.toFixed(2) : '2.00';
        return `
            <div class="history-item">
                <div><strong>${bet.match_name}</strong></div>
                <div style="margin-top: 5px; color:#666; font-size:13px;">
                    猜: <span class="history-tag" style="background:#e2e8f0;">${bet.prediction}</span> 
                    投了 <strong>${bet.amount}</strong> 🪙 (赔率: <span style="color:#b7791f;font-weight:bold;">${showOdds}</span>)
                    <span class="status-tag ${statusClass}">${statusText}</span>
                </div>
                <div style="font-size:11px; color:#999; margin-top:4px;">时间: ${bet.time}</div>
            </div>
        `;
    }).join('');
}

// 渲染全服大厅排行榜与全公开注单
function renderLeaderboard(users) {
    const container = document.getElementById('leaderboard-container');
    if (!users || users.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无玩家数据</p>';
        return;
    }

    container.innerHTML = users.map((user, index) => {
        let rankMedal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `【第${index + 1}名】`;
        
        let betsDetailHtml = "";
        if (user.bets && user.bets.length > 0) {
            betsDetailHtml = user.bets.map(b => {
                let sColor = b.status === 'pending' ? '#c05621' : b.status === '赢' ? '#22543d' : '#742a2a';
                let sName = b.status === 'pending' ? '在途' : b.status;
                let bOdds = b.odds ? b.odds.toFixed(2) : '2.00';
                return `
                    <div class="public-bet-row">
                        🎯 ${b.match_name} <br>
                        预测: <span class="mini-tag">${b.prediction}</span> | 金额: <b>${b.amount}</b> | 赔率: <b style="color:#b7791f;">${bOdds}</b> | 状态: <span style="color:${sColor};font-weight:bold;">${sName}</span>
                    </div>
                `;
            }).join('');
        } else {
            betsDetailHtml = '<div style="color:#a0aec0;font-size:12px;padding:5px 0;">该账号目前没有任何历史下注</div>';
        }

        const isMe = user.username === currentUsername ? 'style="border: 2px solid #3182ce; background:#f7fafc;"' : '';

        return `
            <div class="rank-card" ${isMe}>
                <div class="rank-main-info">
                    <span>${rankMedal} <strong>${user.username}</strong></span>
                    <span style="color:#2b6cb0; font-weight:bold;">总资产: ${user.total_held} 🪙</span>
                </div>
                <div class="rank-sub-info">
                    可用余额: ${user.balance} | 冻结在途: ${user.pending}
                </div>
                <div class="rank-details-box">
                    <details>
                        <summary>查看该账号投注明细 (${user.bets.length}笔)</summary>
                        <div class="public-bets-list">
                            ${betsDetailHtml}
                        </div>
                    </details>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染赛程列表（在投注按钮上直接展现高能赔率）
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

            // 提取后端传入的手动赔率进行格式化显示
            const oddsObj = match.custom_odds || {};
            const hOdds = oddsObj[`${match.host_team_name} 胜`] ? oddsObj[`${match.host_team_name} 胜`].toFixed(2) : '--';
            const dOdds = oddsObj['平局'] ? oddsObj['平局'].toFixed(2) : '--';
            const gOdds = oddsObj[`${match.guest_team_name} 胜`] ? oddsObj[`${match.guest_team_name} 胜`].toFixed(2) : '--';

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
                    <button class="bet-btn" ${btnAttr} onclick="handleBet('${match.host_team_name} VS ${match.guest_team_name}', '${match.host_team_name} 胜')">主胜 [${hOdds}]</button>
                    <button class="bet-btn" ${btnAttr} onclick="handleBet('${match.host_team_name} VS ${match.guest_team_name}', '平局')">平局 [${dOdds}]</button>
                    <button class="bet-btn" ${btnAttr} onclick="handleBet('${match.host_team_name} VS ${match.guest_team_name}', '${match.guest_team_name} 胜')">客胜 [${gOdds}]</button>
                </div>
            `;
            dateBox.appendChild(card);
        });
        container.appendChild(dateBox);
    });
}

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
            alert("下注成功！赔率已被锁定，在途资金已冻结。");
            document.getElementById('total-asset').innerText = res.total_held;
            document.getElementById('balance').innerText = res.balance;
            document.getElementById('pending-asset').innerText = res.pending;
            renderHistory(res.bets);
            initApp(); 
        } else {
            alert(res.error);
        }
    } catch (err) {
        alert("网络请求错误");
    }
};

initApp();

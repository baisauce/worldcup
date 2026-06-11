// 1. 配置你的 Cloudflare Worker 专属链接
// ⚠️ 请务必替换为你在 Cloudflare 得到的真实域名
const API_URL = 'https://worldcup-api.carl-ning-buaa.workers.dev/'; 

// 2. 初始化本地钱包和投注历史
let balance = parseInt(localStorage.getItem('wc_balance')) || 1000;
let betHistory = JSON.parse(localStorage.getItem('wc_history')) || [];

// 刷新顶部余额显示
function updateBalanceDisplay() {
    document.getElementById('balance').innerText = balance;
    localStorage.setItem('wc_balance', balance);
}

// 刷新历史投注显示
function updateHistoryDisplay() {
    const container = document.getElementById('history-container');
    if (betHistory.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无投注记录，快去预测比赛吧！</p>';
        return;
    }
    container.innerHTML = betHistory.map(bet => `
        <div class="history-item">
            <div><strong>${bet.match}</strong></div>
            <div style="margin-top: 5px; color:#666;">
                <span class="history-tag" style="background:#feebc8; color:#c05621;">猜: ${bet.prediction}</span> 
                投了 <strong>${bet.amount}</strong> 🪙
            </div>
            <div style="font-size:11px; color:#999; margin-top:2px;">时间: ${bet.time}</div>
        </div>
    `).join('');
}

// 3. 异步获取赛程数据
async function fetchSchedule() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();

        if (json.error_code === 0) {
            // 成功拿到数据，开始渲染
            renderSchedule(json.result.data);
        } else {
            document.getElementById('matches-container').innerHTML = `<p class="loading" style="color:red;">API 报错: ${json.reason}</p>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById('matches-container').innerHTML = `
            <p class="loading" style="color:red;">加载失败。请检查 Cloudflare Worker 链接是否填写正确，或稍后重试。</p>
        `;
    }
}

// 4. 渲染赛程列表（严格匹配聚合数据嵌套结构）
function renderSchedule(dateGroups) {
    const container = document.getElementById('matches-container');
    container.innerHTML = ''; // 清空加载中提示

    dateGroups.forEach(group => {
        // 创建日期组大盒子
        const dateBox = document.createElement('div');
        dateBox.className = 'date-group';
        
        // 日期头部 (例如: 06月12日 周五)
        dateBox.innerHTML = `<div class="date-title">${group.schedule_date_format} ${group.schedule_week}</div>`;

        // 循环该日期下的每一场比赛列表 schedule_list
        group.schedule_list.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';

            // 判断是否已完赛来决定显示比分还是显示 "VS"
            const scoreDisplay = (match.match_status === "3") 
                ? `<span class="vs-score">${match.host_team_score} : ${match.guest_team_score}</span>`
                : `<span class="vs">VS</span>`;

            // 根据状态控制按钮是否可用（已完赛的不能再下注）
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

// 5. 处理投注动作
window.handleBet = function(matchName, prediction) {
    const input = prompt(`请输入对【${matchName}】预测 [${prediction}] 的投注金额：`, "100");
    if (input === null) return; // 用户取消

    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) {
        alert("请输入有效的正整数金额！");
        return;
    }

    if (amount > balance) {
        alert("余额不足，无法下注！");
        return;
    }

    // 扣钱
    balance -= amount;
    
    // 写入历史
    const newBet = {
        match: matchName,
        prediction: prediction,
        amount: amount,
        time: new Date().toLocaleTimeString()
    };
    betHistory.unshift(newBet); // 最新的排在最前面
    
    // 限制历史记录最多保存 50 条，防止 localStorage 撑爆
    if (betHistory.length > 50) {
        betHistory.pop();
    }
    
    localStorage.setItem('wc_history', JSON.stringify(betHistory));

    // 更新界面
    updateBalanceDisplay();
    updateHistoryDisplay();

    alert(`下注成功！成功为 ${matchName} (${prediction}) 投注 ${amount} 币。`);
};

// 页面首次加载初始化
updateBalanceDisplay();
updateHistoryDisplay();
fetchSchedule();

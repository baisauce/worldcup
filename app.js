// 1. 配置你的聚合 API 密钥
const API_KEY = '6858a0ae96541bb2a4c061150710d067';

// ⚠️ 重要提示：聚合数据限制了浏览器直接跨域(CORS)请求。
// 如果你在本地或 GitHub Pages 运行时遇到跨域报错，可以使用下面的免费代理 URL 包装它：
const REAL_API_URL = `https://apis.juhe.cn/fapigw/worldcup2026/schedule?key=${API_KEY}`;
// 如果报错跨域，请取消注释下一行，并使用代理 URL：
// const API_URL = `https://cors-anywhere.herokuapp.com/${REAL_API_URL}`; 
const API_URL = REAL_API_URL;

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
            <p class="loading" style="color:red;">加载失败。提示：如果遇到跨域问题，请查看代码中的代理服务器设置。</p>
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

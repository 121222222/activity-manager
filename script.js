// 全局变量
let activityData = {
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    route: '',
    notes: ''
};

let participationData = {
    confirmed: 25,
    pending: 8,
    declined: 5
};

let photos = [];
let charts = {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initNoticeForm();
    initStatsCharts();
    initPhotoUpload();
    initReviewForm();
    loadLocalData();
});

// 标签切换功能
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 添加活动状态
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 通知生成功能
function initNoticeForm() {
    const form = document.getElementById('noticeForm');
    const copyBtn = document.getElementById('copyNotice');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        activityData.name = document.getElementById('activityName').value;
        activityData.startDate = document.getElementById('activityStartDate').value;
        activityData.endDate = document.getElementById('activityEndDate').value;
        activityData.location = document.getElementById('activityLocation').value;
        activityData.route = document.getElementById('activityRoute').value;
        activityData.notes = document.getElementById('activityNotes').value;

        // 生成通知文案
        const noticeText = generateNoticeText();
        
        // 显示结果
        document.getElementById('noticeText').textContent = noticeText;
        document.getElementById('noticeResult').style.display = 'block';
        
        // 保存到本地
        saveLocalData();

        // 滚动到结果
        document.getElementById('noticeResult').scrollIntoView({ behavior: 'smooth' });
    });

    copyBtn.addEventListener('click', () => {
        const text = document.getElementById('noticeText').textContent;
        copyToClipboard(text);
    });
}

// 生成通知文案
function generateNoticeText() {
    const startDate = new Date(activityData.startDate);
    const endDate = new Date(activityData.endDate);
    const startDateStr = formatDateTime(startDate);
    const endDateStr = formatDateTime(endDate);
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][startDate.getDay()];

    let notice = `【活动通知】${activityData.name}\n\n`;
    notice += `欢迎大家报名参与${activityData.name}，以下是本次活动详情：\n\n`;
    notice += `🎉 活动信息：\n`;
    notice += `📅 开始时间：${startDateStr} (${weekday})\n`;
    notice += `📅 结束时间：${endDateStr}\n`;
    notice += `📍 地点：${activityData.location}\n`;
    notice += `🚗 活动路线：${activityData.route}\n\n`;
    
    notice += `⚠️ 注意事项：\n`;
    notice += `1. 请大家提前15分钟到达集合地点\n`;
    notice += `2. 建议穿着舒适的运动装和运动鞋\n`;
    notice += `3. 请根据天气情况准备防晒或雨具\n`;
    notice += `4. 活动期间请注意安全,听从组织者安排\n`;
    notice += `5. 建议携带水杯和少量零食\n`;
    
    // 智能完善文案要点
    if (activityData.notes) {
        const enhancedNotes = enhanceNotesPoints(activityData.notes);
        if (enhancedNotes.length > 0) {
            enhancedNotes.forEach((note, index) => {
                notice += `${6 + index}. ${note}\n`;
            });
        }
    }
    
    notice += `\n📝 参与确认：\n`;
    notice += `请在本周五前回复确认是否参加,方便我们统计人数和做好准备工作。\n`;
    notice += `✅ 已确认\n`;
    notice += `❓ 待定\n`;
    notice += `❌ 无法参加\n\n`;
    notice += `期待大家的参与！如有疑问请随时联系活动组织者。`;

    return notice;
}

// 智能完善文案要点
function enhanceNotesPoints(notes) {
    const enhanced = [];
    const notesLower = notes.toLowerCase();
    
    // 精确关键词映射 - 优先匹配
    const keywordMap = {
        '泳衣': '请自备泳衣、泳镜、泳帽等游泳装备,现场不提供',
        '游泳': '请自备泳衣、泳镜、泳帽等游泳装备,现场不提供',
        '午餐': '本次活动不提供午餐,请大家自备食物和饮品',
        '自带午餐': '本次活动不提供午餐,请大家自备食物和饮品',
        '雨天': '如遇恶劣天气(大雨、台风等),活动将改期,我们会提前通知',
        '天气': '如遇恶劣天气(大雨、台风等),活动将改期,我们会提前通知',
        '停车': '现场停车位有限,建议大家拼车或乘坐公共交通前往',
        '车位': '现场停车位有限,建议大家拼车或乘坐公共交通前往',
        '费用': '活动费用为AA制,预计人均费用将在活动后统一结算',
        'aa': '活动费用为AA制,预计人均费用将在活动后统一结算',
        '宠物': '考虑到活动场地限制,请勿携带宠物参加',
        '儿童': '欢迎携带家属儿童参加,但请家长全程照看好孩子的安全',
        '家属': '欢迎携带家属儿童参加,但请家长全程照看好孩子的安全',
        '拍照': '活动将有专人负责拍照记录,精彩瞬间会上传至群相册',
        '照相': '活动将有专人负责拍照记录,精彩瞬间会上传至群相册',
        '签到': '请大家到达后及时签到,以便统计实际参与人数',
        '准时': '请务必准时到达,活动将按时开始,迟到可能错过重要环节'
    };
    
    // 按行分割处理
    const lines = notes.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const lineLower = line.toLowerCase();
        let matched = false;
        
        // 检查是否匹配关键词
        for (const [keyword, enhancedText] of Object.entries(keywordMap)) {
            if (lineLower.includes(keyword)) {
                if (!enhanced.includes(enhancedText)) {
                    enhanced.push(enhancedText);
                }
                matched = true;
                break;
            }
        }
        
        // 如果没有匹配关键词，进行智能扩展
        if (!matched) {
            const expandedText = expandTextPoint(line.trim());
            enhanced.push(expandedText);
        }
    });
    
    return enhanced;
}

// 智能扩展文案要点
function expandTextPoint(text) {
    // 去除开头的序号
    text = text.replace(/^[\d.、]+/, '').trim();
    
    // 确认相关
    if (text.includes('确认') && (text.includes('出行') || text.includes('参加'))) {
        return '请大家务必在指定时间前确认是否参加，以便我们提前做好人数统计和活动安排';
    }
    
    // 车辆相关
    if (text.includes('自带车') || text.includes('租车') || (text.includes('车') && text.includes('确认'))) {
        return '请提前确认出行方式（自驾或拼车），自驾的同伴请在群内登记，方便安排停车和协调拼车事宜';
    }
    
    // 安全相关
    if (text.includes('安全') || text.includes('注意')) {
        return '活动期间请注意人身和财物安全，听从组织者的统一安排，切勿擅自离队或进入危险区域';
    }
    
    // 时间相关
    if (text.includes('时间') || text.includes('点前') || text.includes('准时')) {
        const timeMatch = text.match(/(\d+)[点:：时](\d*)/);
        if (timeMatch) {
            const hour = timeMatch[1];
            const minute = timeMatch[2] || '00';
            return `请务必在${hour}:${minute}前完成相关事项，逾期可能影响活动安排，敬请理解配合`;
        }
        return '请严格遵守时间安排，准时到达指定地点，避免影响整体活动进程';
    }
    
    // 物品携带相关
    if (text.includes('带') || text.includes('携带') || text.includes('准备')) {
        return `${text}，请大家提前检查准备好相关物品，避免遗漏影响活动体验`;
    }
    
    // 费用相关
    if (text.includes('费用') || text.includes('钱') || text.includes('支付')) {
        return `${text}，具体金额和支付方式将在活动前统一通知，请大家保持关注`;
    }
    
    // 其他情况 - 根据句子特征智能补充
    if (text.length < 15) {
        // 短句子，需要补充更多说明
        if (text.includes('请') || text.includes('需要') || text.includes('必须')) {
            return `${text}，这对活动的顺利进行非常重要，请大家务必配合`;
        } else {
            return `关于${text}，请大家提前做好相应准备，如有疑问可随时在群内咨询`;
        }
    } else {
        // 长句子，适当补充
        return `${text}，感谢大家的理解与配合`;
    }
}

// 格式化日期时间
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

// 初始化数据统计图表
function initStatsCharts() {
    const updateBtn = document.getElementById('updateStats');
    
    // 创建图表
    createParticipationChart();
    createTrendChart();
    updateStatsSummary();

    updateBtn.addEventListener('click', () => {
        participationData.confirmed = parseInt(document.getElementById('confirmedCount').value) || 0;
        participationData.pending = parseInt(document.getElementById('pendingCount').value) || 0;
        participationData.declined = parseInt(document.getElementById('declinedCount').value) || 0;
        
        updateCharts();
        updateStatsSummary();
        saveLocalData();
    });
}

// 创建参与状态分布图
function createParticipationChart() {
    const ctx = document.getElementById('participationChart').getContext('2d');
    charts.participation = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['已确认', '待确认', '无法参加'],
            datasets: [{
                data: [participationData.confirmed, participationData.pending, participationData.declined],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                }
            }
        }
    });
}

// 创建参与趋势图
function createTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '确认人数',
                data: [5, 10, 15, 18, 22, 24, 25],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });
}

// 更新图表
function updateCharts() {
    charts.participation.data.datasets[0].data = [
        participationData.confirmed,
        participationData.pending,
        participationData.declined
    ];
    charts.participation.update();
}

// 更新统计摘要
function updateStatsSummary() {
    const total = participationData.confirmed + participationData.pending + participationData.declined;
    const confirmRate = total > 0 ? ((participationData.confirmed / total) * 100).toFixed(1) : 0;
    const responseRate = total > 0 ? (((participationData.confirmed + participationData.declined) / total) * 100).toFixed(1) : 0;

    document.getElementById('totalInvited').textContent = total;
    document.getElementById('confirmRate').textContent = confirmRate + '%';
    document.getElementById('responseRate').textContent = responseRate + '%';
}

// 照片上传功能
function initPhotoUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const photoUpload = document.getElementById('photoUpload');
    const gallery = document.getElementById('photoGallery');

    uploadBtn.addEventListener('click', () => {
        photoUpload.click();
    });

    photoUpload.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const photo = {
                        id: Date.now() + Math.random(),
                        src: event.target.result,
                        name: file.name,
                        date: new Date().toISOString().split('T')[0]
                    };
                    
                    photos.push(photo);
                    addPhotoToGallery(photo);
                    saveLocalData();
                };
                
                reader.readAsDataURL(file);
            }
        });

        // 清空input以允许重复上传同一文件
        photoUpload.value = '';
    });

    // 初始化模态框
    initPhotoModal();
}

// 添加照片到相册
function addPhotoToGallery(photo) {
    const gallery = document.getElementById('photoGallery');
    
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
        <img src="${photo.src}" alt="${photo.name}">
        <div class="photo-info">
            <span class="photo-date">${photo.date}</span>
        </div>
    `;
    
    photoItem.addEventListener('click', () => {
        showPhotoModal(photo);
    });
    
    gallery.appendChild(photoItem);
}

// 初始化照片模态框
function initPhotoModal() {
    const modal = document.getElementById('photoModal');
    const closeBtn = document.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 显示照片模态框
function showPhotoModal(photo) {
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    
    modal.style.display = 'block';
    modalImg.src = photo.src;
    caption.textContent = `${photo.name} - ${photo.date}`;
}

// 复盘邮件生成功能
function initReviewForm() {
    const form = document.getElementById('reviewForm');
    const copyBtn = document.getElementById('copyReview');

    // 自动填充活动名称
    if (activityData.name) {
        document.getElementById('reviewActivityName').value = activityData.name;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reviewData = {
            activityName: document.getElementById('reviewActivityName').value,
            actualParticipants: document.getElementById('actualParticipants').value,
            photoCount: document.getElementById('photoCount').value,
            highlights: document.getElementById('highlights').value,
            improvements: document.getElementById('improvements').value,
            budget: document.getElementById('budget').value
        };

        const reviewEmail = generateReviewEmail(reviewData);
        
        document.getElementById('reviewText').textContent = reviewEmail;
        document.getElementById('reviewResult').style.display = 'block';
        
        document.getElementById('reviewResult').scrollIntoView({ behavior: 'smooth' });
    });

    copyBtn.addEventListener('click', () => {
        const text = document.getElementById('reviewText').textContent;
        copyToClipboard(text);
    });
}

// 生成复盘邮件
function generateReviewEmail(data) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    
    let email = `主题：${data.activityName} - 活动复盘总结\n\n`;
    email += `各位同事：\n\n`;
    email += `${data.activityName}已于近期圆满结束,现将活动情况总结如下：\n\n`;
    
    email += `📊 活动数据：\n`;
    email += `• 实际参与人数：${data.actualParticipants}人\n`;
    email += `• 活动照片数量：${data.photoCount}张\n`;
    if (data.budget) {
        email += `• 费用情况：${data.budget}\n`;
    }
    email += `\n`;
    
    email += `✨ 活动亮点：\n`;
    if (data.highlights) {
        const highlights = data.highlights.split('\n').filter(h => h.trim());
        highlights.forEach((h, i) => {
            email += `${i + 1}. ${h.trim()}\n`;
        });
    } else {
        email += `• 活动组织有序,参与度高\n`;
        email += `• 团队氛围融洽,互动良好\n`;
        email += `• 活动目标基本达成\n`;
    }
    email += `\n`;
    
    email += `💡 改进建议：\n`;
    if (data.improvements) {
        const improvements = data.improvements.split('\n').filter(i => i.trim());
        improvements.forEach((imp, i) => {
            email += `${i + 1}. ${imp.trim()}\n`;
        });
    } else {
        email += `• 建议提前做好天气预案\n`;
        email += `• 可以增加更多互动环节\n`;
        email += `• 后勤准备可以更充分\n`;
    }
    email += `\n`;
    
    email += `📷 活动照片已上传至活动相册,欢迎大家查看和下载留念。\n\n`;
    email += `感谢各位的积极参与和支持,期待下次活动再见！\n\n`;
    email += `此致\n敬礼\n\n`;
    email += `活动组织团队\n`;
    email += `${dateStr}`;

    return email;
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess();
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// 降级复制方案
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        alert('复制失败,请手动复制');
    }
    
    document.body.removeChild(textarea);
}

// 显示复制成功提示
function showCopySuccess() {
    const toast = document.createElement('div');
    toast.className = 'copy-success';
    toast.textContent = '✅ 复制成功！';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 保存数据到本地存储
function saveLocalData() {
    const data = {
        activityData,
        participationData,
        photos: photos.slice(0, 20) // 限制存储的照片数量
    };
    localStorage.setItem('activityManagementData', JSON.stringify(data));
}

// 从本地存储加载数据
function loadLocalData() {
    const saved = localStorage.getItem('activityManagementData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            if (data.activityData) {
                activityData = data.activityData;
                // 填充表单
                if (activityData.name) {
                    document.getElementById('reviewActivityName').value = activityData.name;
                }
            }
            
            if (data.participationData) {
                participationData = data.participationData;
                document.getElementById('confirmedCount').value = participationData.confirmed;
                document.getElementById('pendingCount').value = participationData.pending;
                document.getElementById('declinedCount').value = participationData.declined;
                updateCharts();
                updateStatsSummary();
            }
            
            if (data.photos && data.photos.length > 0) {
                photos = data.photos;
                const gallery = document.getElementById('photoGallery');
                gallery.innerHTML = '';
                photos.forEach(photo => addPhotoToGallery(photo));
            }
        } catch (e) {
            console.error('加载本地数据失败:', e);
        }
    }
}

// ========== 多语言文本 ==========
const I18N = {
    zh: {
        title: '员工考勤', subtitle: '填写签到/签退信息',
        step1: '1. 选择姓名', step2: '2. 签到类型', step3: '3. 确认信息',
        checkin: '签到上班', checkout: '签退下班',
        confirmName: '姓名', confirmType: '类型', confirmTime: '时间', confirmDate: '日期',
        submit: '✅ 确认提交', success: '签到成功！', back: '返回',
        historyTitle: '📋 今日签到记录', adminLink: '📊 管理后台',
        namePlaceholder: '其他姓名', notesPlaceholder: '备注（可选）',
        early: '签到', late: '签退', normal: '正常', lateStatus: '迟到', earlyStatus: '早退'
    },
    la: {
        title: 'ລະບົບການເຊັກອິນ', subtitle: 'ບັນທຶກເວລາເຂົ້າ-ອອກງານ',
        step1: '1. ເລືອກຊື່', step2: '2. ປະເພດການເຊັກ', step3: '3. ຢືນຢັນຂໍ້ມູນ',
        checkin: 'ເຂົ້າງານ', checkout: 'ອອກງານ',
        confirmName: 'ຊື່', confirmType: 'ປະເພດ', confirmTime: 'ເວລາ', confirmDate: 'ວັນທີ',
        submit: '✅ ຢືນຢັນ', success: 'ບັນທຶກສຳເລັດ!', back: 'ກັບຄືນ',
        historyTitle: '📋 ບັນທຶກມື້ນີ້', adminLink: '📊 ຈັດການ',
        namePlaceholder: 'ຊື່ອື່ນໆ', notesPlaceholder: 'ບັນທຶກເພີ່ມເຕີມ',
        early: 'ເຂົ້າ', late: 'ອອກ', normal: 'ປົກກະຕິ', lateStatus: 'ຊ້າ', earlyStatus: 'ໄວ'
    }
};

let currentLang = localStorage.getItem('lang') || CONFIG.DEFAULT_LANG;
let selectedName = '';
let selectedType = '';

function init() { renderNames(); updateLang(); startClock(); loadTodayHistory(); }

function setLang(lang) { currentLang = lang; localStorage.setItem('lang', lang); updateLang(); }
function t(key) { return I18N[currentLang][key] || I18N.zh[key] || key; }

function updateLang() {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + currentLang)?.classList.add('active');
    const map = {
        'title': t('title'), 'subtitle': t('subtitle'), 'step1-label': t('step1'),
        'step2-label': t('step2'), 'step3-label': t('step3'),
        'label-checkin': t('checkin'), 'label-checkout': t('checkout'),
        'confirm-name-label': t('confirmName'), 'confirm-type-label': t('confirmType'),
        'confirm-time-label': t('confirmTime'), 'confirm-date-label': t('confirmDate'),
        'submit-label': t('submit'), 'success-text': t('success'),
        'back-label': t('back'), 'history-title': t('historyTitle'), 'admin-link': t('adminLink')
    };
    for (const [id, text] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
    const nameInput = document.getElementById('custom-name-input');
    if (nameInput) nameInput.placeholder = t('namePlaceholder');
}

function renderNames() {
    const grid = document.getElementById('name-grid');
    grid.innerHTML = CONFIG.EMPLOYEES.map(name =>
        `<button class="name-btn" onclick="selectName('${name}', this)">${name}</button>`
    ).join('');
}

function selectName(name, btn) {
    selectedName = name;
    document.querySelectorAll('.name-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('custom-name-input').value = '';
    setTimeout(() => {
        document.getElementById('step2').classList.remove('hidden');
        document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('custom-name-input');
    if (input) input.addEventListener('input', () => {
        if (input.value.trim()) {
            selectedName = input.value.trim();
            document.querySelectorAll('.name-btn').forEach(b => b.classList.remove('selected'));
        }
    });
});

function selectType(type) {
    selectedType = type;
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.type-btn.${type}`).classList.add('selected');
    const now = new Date();
    document.getElementById('confirm-name').textContent = selectedName;
    document.getElementById('confirm-type').textContent = type === 'checkin' ? t('checkin') : t('checkout');
    document.getElementById('confirm-time').textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('confirm-date').textContent = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    setTimeout(() => {
        document.getElementById('step3').classList.remove('hidden');
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
}

async function submitRecord() {
    if (!selectedName || !selectedType) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toISOString().slice(0, 10);
    const timeMinutes = now.getHours() * 60 + now.getMinutes();
    const workStartMin = parseInt(CONFIG.WORK_START.split(':')[0]) * 60 + parseInt(CONFIG.WORK_START.split(':')[1]);
    const workEndMin = parseInt(CONFIG.WORK_END.split(':')[0]) * 60 + parseInt(CONFIG.WORK_END.split(':')[1]);
    let status = 'normal';
    if (selectedType === 'checkin' && timeMinutes > workStartMin) status = 'late';
    if (selectedType === 'checkout' && timeMinutes < workEndMin) status = 'early';
    const record = {
        name: selectedName, type: selectedType, time: timeStr, date: dateStr,
        status: status, notes: document.getElementById('notes-input')?.value || '',
        work_start: CONFIG.WORK_START, work_end: CONFIG.WORK_END
    };
    try {
        await Store.insert(record);
        document.querySelector('.form-card').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
        loadTodayHistory();
    } catch (err) { alert('提交失败: ' + err.message); }
}

function resetForm() {
    selectedName = ''; selectedType = '';
    document.querySelectorAll('.name-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('notes-input').value = '';
    document.querySelector('.form-card').classList.remove('hidden');
    document.getElementById('success-msg').classList.add('hidden');
    window.scrollTo(0, 0);
}

async function loadTodayHistory() {
    try {
        const records = await Store.today();
        const list = document.getElementById('history-list');
        if (!records || records.length === 0) {
            list.innerHTML = `<div style="text-align:center;color:#94a3b8;padding:12px;font-size:13px;">今日暂无记录</div>`;
            return;
        }
        list.innerHTML = records.map(r => `
            <div class="history-item ${r.type === 'checkin' ? 'checkin-item' : 'checkout-item'}">
                <span class="history-name">${r.name}</span>
                <span class="history-badge ${r.type === 'checkin' ? 'badge-checkin' : 'badge-checkout'}">${r.type === 'checkin' ? t('early') : t('late')}</span>
                <span class="history-time">${r.time?.slice(0, 5) || '--'}</span>
            </div>
        `).join('');
    } catch (e) { console.error('Load history failed:', e); }
}

function startClock() {
    function update() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    }
    update(); setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', init);
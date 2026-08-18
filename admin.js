// ========== 管理后台逻辑 ==========
let allRecords = [];
let currentLang = localStorage.getItem('lang') || CONFIG.DEFAULT_LANG;

const I18N = {
    zh: {
        title: '📊 考勤管理', subtitle: '查看所有签到记录',
        from: '开始日期', to: '结束日期', nameFilter: '姓名筛选', allNames: '全部',
        search: '🔍 查询', export: '📥 导出CSV',
        total: '总记录', people: '出勤人数', late: '迟到', early: '早退',
        recordsTitle: '签到记录',
        thDate: '日期', thName: '姓名', thType: '类型', thTime: '时间', thStatus: '状态', thNotes: '备注',
        checkin: '签到', checkout: '签退', normal: '正常', lateStatus: '迟到', earlyStatus: '早退',
        empty: '暂无记录', backLink: '← 返回签到页'
    },
    la: {
        title: '📊 ຈັດການລະບົບ', subtitle: 'ເບິ່ງບັນທຶກທັງໝົດ',
        from: 'ວັນທີເລີ່ມ', to: 'ວັນທີສິ້ນສຸດ', nameFilter: 'ກອກຊື່', allNames: 'ທັງໝົດ',
        search: '🔍 ຄົ້ນຫາ', export: '📥 ສົ່ງອອກ',
        total: 'ບັນທຶກ', people: 'ຄົນ', late: 'ຊ້າ', early: 'ໄວ',
        recordsTitle: 'ບັນທຶກ',
        thDate: 'ວັນທີ', thName: 'ຊື່', thType: 'ປະເພດ', thTime: 'ເວລາ', thStatus: 'ສະຖານະ', thNotes: 'ບັນທຶກ',
        checkin: 'ເຂົ້າງານ', checkout: 'ອອກງານ', normal: 'ປົກກະຕິ', lateStatus: 'ຊ້າ', earlyStatus: 'ໄວ',
        empty: 'ຍັງບໍ່ມີບັນທຶກ', backLink: '← ກັບຄືນ'
    }
};

function t(key) { return I18N[currentLang][key] || I18N.zh[key] || key; }
function setLang(lang) { currentLang = lang; localStorage.setItem('lang', lang); updateLang(); }

function updateLang() {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + currentLang)?.classList.add('active');
    const map = {
        'admin-title': t('title'), 'admin-subtitle': t('subtitle'),
        'label-from': t('from'), 'label-to': t('to'), 'label-name-filter': t('nameFilter'),
        'btn-search': t('search'), 'btn-export': t('export'),
        'stat-total-label': t('total'), 'stat-people-label': t('people'),
        'stat-late-label': t('late'), 'stat-early-label': t('early'),
        'records-title': t('recordsTitle'),
        'th-date': t('thDate'), 'th-name': t('thName'), 'th-type': t('thType'),
        'th-time': t('thTime'), 'th-status': t('thStatus'), 'th-notes': t('thNotes'),
        'empty-text': t('empty'), 'back-link': t('backLink')
    };
    for (const [id, text] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
}

async function init() {
    updateLang();
    setDefaultDates();
    await loadNames();
    await loadRecords();
}

function setDefaultDates() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('filter-to').value = today;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    document.getElementById('filter-from').value = weekAgo;
}

async function loadNames() {
    const select = document.getElementById('filter-name');
    CONFIG.EMPLOYEES.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name; opt.textContent = name;
        select.appendChild(opt);
    });
}

async function loadRecords() {
    const from = document.getElementById('filter-from').value;
    const to = document.getElementById('filter-to').value;
    const name = document.getElementById('filter-name').value;
    try {
        allRecords = await Store.query({ from, to, name: name || undefined });
        renderStats(); renderTable();
    } catch (err) { console.error('Load records failed:', err); }
}

function renderStats() {
    document.getElementById('stat-total').textContent = allRecords.length;
    const people = new Set(allRecords.map(r => r.name));
    document.getElementById('stat-people').textContent = people.size;
    document.getElementById('stat-late').textContent = allRecords.filter(r => r.status === 'late').length;
    document.getElementById('stat-early').textContent = allRecords.filter(r => r.status === 'early').length;
}

function renderTable() {
    const tbody = document.getElementById('records-body');
    const empty = document.getElementById('empty-state');
    if (allRecords.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    tbody.innerHTML = allRecords.map(r => {
        const typeLabel = r.type === 'checkin' ? t('checkin') : t('checkout');
        let statusClass = 'status-normal', statusText = t('normal');
        if (r.status === 'late') { statusClass = 'status-late'; statusText = t('lateStatus'); }
        if (r.status === 'early') { statusClass = 'status-early'; statusText = t('earlyStatus'); }
        return `<tr>
            <td>${r.date || r.created_at?.slice(0, 10) || '--'}</td>
            <td><strong>${r.name}</strong></td>
            <td>${typeLabel}</td>
            <td>${r.time || '--'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${r.notes || ''}</td>
        </tr>`;
    }).join('');
}

function exportCSV() {
    if (allRecords.length === 0) { alert('没有数据可导出'); return; }
    const BOM = '\uFEFF';
    const headers = [t('thDate'), t('thName'), t('thType'), t('thTime'), t('thStatus'), t('thNotes')];
    const rows = allRecords.map(r => {
        const typeLabel = r.type === 'checkin' ? t('checkin') : t('checkout');
        let statusText = t('normal');
        if (r.status === 'late') statusText = t('lateStatus');
        if (r.status === 'early') statusText = t('earlyStatus');
        return [r.date || '', r.name, typeLabel, r.time || '', statusText, r.notes || ''];
    });
    const csv = BOM + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', init);
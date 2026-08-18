// ========== 配置文件 ==========
// 请将下方 SUPABASE_URL 和 SUPABASE_ANON_KEY 替换为你自己的 Supabase 项目信息
// 注册地址: https://supabase.com (免费，无需信用卡)

const CONFIG = {
    // Supabase 配置（必填）
    SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
    SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',

    // 员工名单（姓名会显示在签到页面上）
    EMPLOYEES: [
        'ທ່ານ ວິໄລ',
        'ທ່ານ ມີນາ',
        'ທ່ານ ກິດ',
        'ທ່ານ ບົວ',
        'ທ່ານ ໂຊກ',
        'ທ່ານ ໃຈ',
        'ທ່ານ ແກ້ວ',
        'ທ່ານ ມະນີ',
        'ທ່ານ ພຸດ',
        'ທ່ານ ສີ',
        'ທ່ານ ອ້າຍ',
        'ທ່ານ ເອື້ອຍ',
        'ທ່ານ ນ້ອຍ'
    ],

    // 上班时间（用于判断迟到）
    WORK_START: '08:00',
    WORK_END: '17:00',

    // 默认语言：'zh' 中文 | 'la' 老挝语
    DEFAULT_LANG: 'zh'
};

// ========== Supabase 操作封装 ==========
const DB = {
    headers() {
        return {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    },
    async insert(record) {
        const url = `${CONFIG.SUPABASE_URL}/rest/v1/attendance`;
        const res = await fetch(url, { method: 'POST', headers: this.headers(), body: JSON.stringify(record) });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },
    async query(params = {}) {
        let url = `${CONFIG.SUPABASE_URL}/rest/v1/attendance?order=created_at.desc`;
        if (params.from) url += `&created_at=gte.${params.from}T00:00:00`;
        if (params.to) url += `&created_at=lte.${params.to}T23:59:59`;
        if (params.name) url += `&name=eq.${encodeURIComponent(params.name)}`;
        const res = await fetch(url, { headers: this.headers() });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },
    async today() {
        const today = new Date().toISOString().slice(0, 10);
        return this.query({ from: today, to: today });
    }
};

// ========== 本地存储 fallback ==========
const LOCAL_DB = {
    KEY: 'attendance_records',
    getAll() { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
    insert(record) {
        const records = this.getAll();
        record.id = Date.now();
        record.created_at = new Date().toISOString();
        records.unshift(record);
        localStorage.setItem(this.KEY, JSON.stringify(records));
        return record;
    },
    query(params = {}) {
        let records = this.getAll();
        if (params.from) records = records.filter(r => r.created_at >= params.from + 'T00:00:00');
        if (params.to) records = records.filter(r => r.created_at <= params.to + 'T23:59:59');
        if (params.name) records = records.filter(r => r.name === params.name);
        return records;
    },
    today() {
        const today = new Date().toISOString().slice(0, 10);
        return this.query({ from: today, to: today });
    }
};

// 自动检测：Supabase 配置了就用云端，否则用本地存储
const Store = (CONFIG.SUPABASE_URL.includes('YOUR_PROJECT')) ? LOCAL_DB : DB;
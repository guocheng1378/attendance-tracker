const CONFIG={
    DEFAULT_LANG:'zh',
    SUPABASE_URL:'https://sholqzupbmydiecgrlso.supabase.co',
    SUPABASE_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobHF6dXBibW15ZGllY2dybHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMzQ4NzIsImV4cCI6MjEwMjYxMDg3Mn0.iVfHE5FFh8kPKAkyuG4aZE6OwX8d8jLNJFSZOY3N6Y0',
    EMPLOYEES:[
        {id:1,name:'ໂອນ',nameZh:'盘'},
        {id:2,name:'ມູ',nameZh:'姆'},
        {id:3,name:'ຣິມ',nameZh:'松'},
        {id:4,name:'ບາວ',nameZh:'巴'},
        {id:5,name:'ຊົງ',nameZh:'棋'},
        {id:6,name:'ຈົງ',nameZh:'乐昂'},
        {id:7,name:'ເບີນ',nameZh:'文'},
        {id:8,name:'ຕົງ',nameZh:'米'},
        {id:9,name:'ຈົງ',nameZh:'拽'},
        {id:10,name:'ກິນ',nameZh:'春'},
        {id:11,name:'ຄົງ',nameZh:'研'},
        {id:12,name:'ວົງ',nameZh:'孙'},
        {id:13,name:'ມົວ',nameZh:'罗'}
    ],
    STATUS:{FULL:'full',HALF:'half',ABSENT:'absent'},
    LO:{TITLE:'ບັນຊາການເຊັກອິນ',SUBTITLE:'ລາຍງານການເຂົ້າວຽກລາຍວັນ',FULL:'ມື້ເຕັມ',HALF:'ມື້ຄ້າງ',ABSENT:'ບໍ່ມາ',SAVE:'ບັນທຶກ',SAVED:'✅ ສຳເລັດ!',ADMIN:'📊 ແຜງຄວບຄຸມ',ADMIN_TITLE:'📊 ແຜງຄວບຄຸມ',ADMIN_SUB:'ສະຫຼຸບການເຊັກອິນລາຍເດືອນ',DETAIL:'ລາຍລະອຽດ',EXPORT:'📥 ສົ່ງອອກ CSV',BACK:'📋 ກັບໄປເຊັກອິນ',NO_DATA:'ຍັງບໍ່ມີຂໍ້ມູນ',TOTAL:'ລວມ',WORKERS:'ຄົນ'},
    ZH:{TITLE:'考勤签到表',SUBTITLE:'每日出勤记录',FULL:'全天',HALF:'半天',ABSENT:'缺勤',SAVE:'保存记录',SAVED:'✅ 已保存!',ADMIN:'📊 管理后台',ADMIN_TITLE:'📊 管理后台',ADMIN_SUB:'月度考勤汇总',DETAIL:'详细信息',EXPORT:'📥 导出 CSV',BACK:'📋 返回签到',NO_DATA:'暂无数据',TOTAL:'共',WORKERS:'人'}
};

// Supabase API helper
const DB={
    headers(){return{'apikey':CONFIG.SUPABASE_KEY,'Authorization':'Bearer '+CONFIG.SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'};},
    async save(date,statuses){
        const records=CONFIG.EMPLOYEES.map(e=>({date,worker_id:e.id,name:e.name,name_zh:e.nameZh,status:(statuses||{})[e.id]||'absent'}));
        await fetch(CONFIG.SUPABASE_URL+'/rest/v1/attendance',{method:'POST',headers:{...this.headers(),'Prefer':'resolution=merge-duplicates'},body:JSON.stringify(records)});
    },
    async query(dateFrom,dateTo){
        const q=`date=gte.${dateFrom}&date=lte.${dateTo}&order=date`;
        const r=await fetch(CONFIG.SUPABASE_URL+'/rest/v1/attendance?'+q,{headers:this.headers()});
        return r.json();
    }
};
const qs = require('querystring');
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const config = require('./account.json');

const email = config.email;
const passwd = config.pwd;


const onSign = async () => {
    try {
        const { headers } = await fetch('https://paoluz.link/auth/login');
        const cookie = headers.get('set-cookie') || '';
        const cfduid = getCookie('__cfduid', cookie);
        console.log("cfduid" + cfduid);
        if (cfduid) {
            await login(cfduid);
        }
    } catch (error) {
        console.log("ERROR:" + error);
    }
}

const login = async (uuid) => {
    const data = await fetch('https://paoluz.link/auth/login', {
        body: qs.stringify({
            email,
            passwd,
            code: '',
        }),
        method: 'POST', headers: {
            'cookie': `__cfduid=${uuid}; lang=zh-cn`,
            'content-type': 'application/x-www-form-urlencoded'
        }
    })
    const cookie = data.headers.get('set-cookie') || '';
    const cfduid = getCookie('__cfduid', cookie);
    const key = getCookie('key', cookie);
    const uid = getCookie('uid', cookie);
    const ip = getCookie('ip', cookie);
    const expire_in = getCookie('expire_in', cookie);
    const res = await data.json();

    console.log(res.msg);
    if (res.ret === 1) {
        await checkin(cfduid, key, uid, ip, expire_in);
    }

}

const checkin = async (cfduid, key, uid, ip, expire_in) => {
    const data = await fetch('https://paoluz.link/user/checkin', {
        method: 'POST',
        headers: {
            cookie: `__cfduid=${cfduid}; lang=zh-cn; cnxad_lunbo=yes; _ga=GA1.2.1656003110.1594518881; _gid=GA1.2.1056328585.1594518881; uid=${uid}; email=${email}; key=${key}; ip=${ip}; expire_in=${expire_in}`
        }
    });
    const res = await data.json();
    console.log(res.msg);
    if (res.ret === 1) {
        console.log("success");
    } else {
        console.log("false");
    }
    console.log(JSON.stringify(res.msg), '-', new Date().toString());
};

function getCookie(str, cookie) {
    return (cookie.match(`${str}=([^;]+)`) || [])[1]
}
onSign();

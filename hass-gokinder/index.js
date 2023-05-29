const request = require('request').defaults({ jar: true })
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const GOKINDER_URL = process.env.GOKINDER_HOSTNAME || '';
const GOKINDER_USERNAME = process.env.GOKINDER_USERNAME || '';
const GOKINDER_PASSWORD = process.env.GOKINDER_PASSWORD || '';
const TIMEOUT = process.env.GOKINDER_TIMEOUT || 60;

const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN;

var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
};

const getGalerija = () => {
    request.post({
        url: `https://${GOKINDER_URL}/login.php`,
        form: {
            username: GOKINDER_USERNAME,
            password: GOKINDER_PASSWORD,
            jezik: 'SR'
        },
        headers: headers
    }, function (e, r, body) {
        if (e) {
            console.log(e);
            process.exit(1);
        }
        let form1 = {
            fleg: 'albumi_roditelja',
            mesec: new String(new Date().getMonth() + 1).padStart(2, '0'),
            godina: new Date().getFullYear()
        }
        request.post({
            url: `https://${GOKINDER_URL}/ajax/albumi.php`,
            form: form1,
            headers: headers
        }, function (e, r, body) {
            if (e) {
                console.log(e);
                getOpet();
            } else {
                const dom = new JSDOM(body);
                let x = dom.window.document.querySelectorAll('a');
                const galerija = x[x.length - 1].innerHTML;
                if (galerija && galerija.length) {
                    console.log(`Poslednji album: ${galerija}`);
                    getOpet();
                    sendToHass(galerija);
                } else {
                    getOpet();
                    console.log('Nemoguce dobiti poslednji album', galerija);
                }
            }
        });
    });
}

const sendToHass = (galerijaNaziv) => {
    request.post({
        url: 'http://supervisor/core/api/states/sensor.gokinder_galerija',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPERVISOR_TOKEN}`
        },
        json: {
            state: galerijaNaziv
        }
    })
}

const getOpet = () => {
    console.log(`Checking again in ${TIMEOUT} minutes`);
    setTimeout(() => {
        getGalerija();
    }, TIMEOUT * 60 * 1000);
}

getGalerija();
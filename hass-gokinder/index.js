const request = require('request').defaults({ jar: true })
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const GOKINDER_URL = process.env.GOKINDER_HOSTNAME || 'zvjezdicavrtic.gokinder.com';
const GOKINDER_USERNAME = process.env.GOKINDER_USERNAME || 'dkasipovic1';
const GOKINDER_PASSWORD = process.env.GOKINDER_PASSWORD || 'umvxqf7axa';
const TIMEOUT = process.env.GOKINDER_TIMEOUT || '60';

const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN;

var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
};

const getGalerija = (mjesec, godina, onSuccess, onFail) => {
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
            mesec: mjesec,
            godina: godina
        }
        console.log('>', form1);
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
                if (x && x.length > 0) {
                    const galerija = x[x.length - 1].innerHTML;
                    if (galerija && galerija.length) {
                        console.log(`Poslednji album: ${galerija}`);
                        onSuccess(galerija);
                    } else {
                        console.log('#1 Nemoguce dobiti poslednji album');
                        onFail();
                    }
                } else {
                    console.log('#2 Nemoguce dobiti poslednji album');
                    onFail();
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
    }, parseInt(TIMEOUT) * 60 * 1000);
}

let mjesec = new String(new Date().getMonth() + 1).padStart(2, '0');
let godina = new Date().getFullYear();

getGalerija(
    mjesec,
    godina,
    (galerija) => {
        console.log('Preuzeta galerija za tekuci mjesec, slanje u HASS', galerija);
        sendToHass(galerija);
        getOpet();
    },
    () => {
        let prosli_mjesec = new String(new Date(new Date().setDate(0)).getMonth() + 1).padStart(2, '0');
        let prosla_godina = new Date(new Date().setDate(0)).getFullYear();
        console.log('Nema galerija za tekuci mjesec, provjeravam prosli');
        getGalerija(
            prosli_mjesec,
            prosla_godina,
            (galerija) => {
                console.log('Preuzeta galerija za prosli mjesec, slanje u HASS', galerija)
                sendToHass(galerija);
                getOpet();
            },
            () => {
                console.log('Nemoguce pokupiti galeriju ni za prosli mjesec');
                getOpet();
            }
        );
    }
);
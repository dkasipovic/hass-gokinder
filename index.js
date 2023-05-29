const request = require('request').defaults({ jar: true })
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const GOKINDER_URL = 'zvjezdicavrtic.gokinder.com';
const GOKINDER_USERNAME = 'dkasipovic1';
const GOKINDER_PASSWORD = 'umvxqf7axa';

var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
};

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
            process.exit(1);
        } else {
            const dom = new JSDOM(body);
            let x = dom.window.document.querySelectorAll('a');
            console.log(`Poslednji album: ${x[x.length - 1].innerHTML}`);
        }
    });
});

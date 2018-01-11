const puppeteer = require('puppeteer')
var {timeout} = require('./tools.js');
var {sleep} = require('./sleep.js');
var axios = require('axios');
var fs = require('fs'),
    mens = JSON.parse(fs.readFileSync('./mes.json'));
    daans = JSON.parse(fs.readFileSync('./daan.json'));

function autoDoIt(who) { 
    puppeteer.launch({headless: false}).then(async browser => {
        var page = await browser.newPage()
        page.setViewport({width: 1200, height: 1000})

        try {
            await page.goto('https://ks.gdycjy.gov.cn/')
            await timeout(1000)
            

            var beginKaoShi = await page.$('[class=bnt_enter]')

            //点击开始考试
            beginKaoShi.click()
            await timeout(1000)

            var nameIpt = await page.$('input[name=name]')
            await nameIpt.click()
            await page.type('#name',who.name, {delay: 20})

            var cardIpt = await page.$('input[name=identityCard]')
            await cardIpt.click()
            await page.type('#identityCard',who.cardid, {delay: 20})
            
            var mobileIpt = await page.$('input[name=mobile]')
            await mobileIpt.click()
            await page.type('#mobile',who.pnum, {delay: 20})
            

            await page.select('select#jobGradeId', '2');

            var newAreaIpt = await page.$('[id=newAreaId]')

            await page.select('select#newAreaId', '0e02b1822440424f8f42c1740b5df418');

            await page.select('select#newCityId', 'd3816b18cc9546ae8a469e8726e76ffb');

            await page.select('select#newUnitId', 'a1302a5d127046b7b3f803ceeed8f5ce');

            await page.select('select#subUnit_0_Id', '0116ba43fa8d493ba925a4208f6f72a4');

            await page.select('select#subUnit_1_Id', '0229b7fb87f9450c8e3a27ed2c228891');

            await page.select('select#subUnit_2_Id', 'dffd3160b2cc4ccf865685e5fcfbb6d9');

            var yzmiIpt = await page.$('[id=patchcafield]')
            await yzmiIpt.click()
            //获取验证码图片
            let imgURL = await page.evaluate(() => {
                let imgURL = ''
                let selector = '#patchcaId';
                let imgUrlList = [...document.querySelectorAll(selector)];
                imgUrlList.forEach(e => {
                    imgURL = e.src
                })
                return imgURL
            });


            axios.get(imgURL, {
                responseType: 'stream'
            }).then(res => {
                res.data.pipe(fs.createWriteStream('./meizi/yzm.png'));
            })

            await timeout(5000)

            var BtnIpt = await page.$('input[class=subtn]')
            await BtnIpt.click()

            await timeout(50)

            var qrBtnIpt = await page.$$('a[href="javascript:void(0);"]')

            await qrBtnIpt[0].click()


            //开始答题
            await timeout(1000)


            try {
                for (let t = 0; t <= 5; t++) {
                    const frame = await page.frames().find(f => f.name() === 'myIframe');

                    const preloadHref = await frame.$$eval('li', els => Array.from(els).map(el=> el.textContent.trim()));
        
                    let elements = await frame.$$(".fontest li input")
                    
                    for (let k = 0; k < preloadHref.length; k++) {
                        for (let u = 0; u < daans.length; u++) {
                            if (preloadHref[k] == daans[u].right) {
                                console.log(k+1,daans[u].right)
                                await elements[k].click();
                                await timeout(1000)
                            }
                        }
                    }

                    await timeout(2000)
                    var nextIpt = await frame.$$("#pageForm a")
                    await nextIpt[t+1].click()
                    await timeout(1000)
                }
            } catch (error) {
                    
            }
            //提交问卷
            console.log('准备提交问卷')

            const aframe = await page.frames().find(f => f.name() === 'myIframe');
            var subIpt = await aframe.$(".enter a")
            var sureIpt = await page.$$(".bnt1 a")
            
            await subIpt.click()
            await timeout(1000)
            await sureIpt[0].click()
            // Tesseract.recognize('./meizi/yzm.png',{
            //     lang: "eng",
            //     classify_bln_numeric_mode: 1
            // })
            // .progress(message => console.log(message))
            // .then(function(result){
            //     console.log(result.text.replace(/\s+/g, ''))
            // })

        } catch (e) {
            console.log('sf err:', e);
        }

        // await page.close()
        // browser.close()
    })

}

autoDoIt(mens[0])

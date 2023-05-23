const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = require('../server');

const port = process.env.PORT || 3000;
const address = process.env.ADDRESS || '0.0.0.0'; // Add this line

describe('Selenium GUI Test', () => {
  let driver;
  let server;

  beforeAll(async () => {
    server = app.listen(port, address, (err) => {
      console.log(`Genetix Webapp listening at http://${address}:${port}`);
    });
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  afterAll(async () => {
    await driver.quit();
    await server.close();
  });

  test('Test Server Connection', async () => {
    await driver.get('http://0.0.0.0:3000');

    await driver.wait(until.titleContains('GNX Webapp'), 5000);
    const title = await driver.getTitle();
    expect(title).toContain('GNX Webapp');

    // get the <a> element with class register-text. There's also a div with the same class
    const registerLink = await driver.findElement(By.css('a.register-text'));
    // click on the register link
    await registerLink.click();
    // test that the title says "Register"
    await driver.wait(until.titleContains('Register'), 5000);
    const registerTitle = await driver.getTitle();
    expect(registerTitle).toContain('Register');
  });

});

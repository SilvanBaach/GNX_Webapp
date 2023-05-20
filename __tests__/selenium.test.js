const {Builder, By, Key, until} = require('selenium-webdriver');
const app = require('../server');

const port = process.env.PORT || 3000;
const address = process.env.ADDRESS || '0.0.0.0'; // Add this line

describe('Example Selenium Test', () => {
  let driver;
  let server;

  beforeAll(async () => {
    server = app.listen(port, address, (err) => {
      console.log(`Genetix Webapp listening at http://${address}:${port}`);
    });
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
    await server.close();
  });

  test('Test Connection', async () => {
    await driver.get('http://0.0.0.0:3000');
    //const searchBox = await driver.findElement(By.name('q'));
    //await searchBox.sendKeys('OpenAI', Key.RETURN);
    await driver.wait(until.titleContains('GNX Webapp'), 5000);
    const title = await driver.getTitle();
    expect(title).toContain('GNX Webapp');
  });
});

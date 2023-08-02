const app = require('./server');
const {logMessage, LogLevel} = require('./js/serverJS/logger.js');

const port = process.env.PORT || 3000;
const address = process.env.ADDRESS || '0.0.0.0'; // Add this line

app.listen(port, address, () => { // Update this line
    console.log(`Genetix Webapp listening at http://${address}:${port}`); // Update this line
    logMessage(`Genetix Webapp listening at http://${address}:${port}`, LogLevel.INFO, null)
});

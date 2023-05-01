const app = require('./server');

const port = process.env.PORT || 80;
const address = process.env.ADDRESS || '0.0.0.0'; // Add this line

app.listen(port, address, () => { // Update this line
    console.log(`Genetix Webapp listening at http://${address}:${port}`); // Update this line
});

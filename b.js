const app = require('express')();
const http = require('http');

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/c.html`);
});

app.listen(3000);
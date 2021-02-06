const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { router } = require('./routes.js');


const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(router);

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});
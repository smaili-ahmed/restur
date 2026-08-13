const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`[server] CyberGuard API listening on http://localhost:${config.port}`);
});

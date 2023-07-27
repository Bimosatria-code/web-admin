'use strict'

const path = require('path');
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');
const csrf = require('csurf');
const dbConfig  = require('./utils/database');
const flash = require('connect-flash');

const errorController = require('./controllers/error');

const app = express();

const options = {
    table: 'webadmin.sessions',
    autoRemove: true,
    useUTC: true
}

const store = new MSSQLStore(dbConfig.dbConnection(callback), options);

app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routers/auth');
const dashboardRoutes = require('./routers/dashboard');
const userRouters = require('./routers/user');
const roleRouters = require('./routers/role');
const settingRouters = require('./routers/setting');
const profileRouters = require('./routers/profile');
const feeRouters = require('./routers/fee');
const planProductRouters = require('./routers/plan_product');
const campaignRouters = require('./routers/campaign');
const feeMaster = require('./routers/fee_master');
const logs = require('./routers/log');
const reporting = require('./routers/reporting');

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
    secret: '@n/n&wJZostY;!M',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/', authRoutes);
app.use(dashboardRoutes);
app.use(userRouters);
app.use(roleRouters);
app.use(settingRouters);
app.use(profileRouters);
app.use(feeRouters);
app.use(planProductRouters);
app.use(campaignRouters);
app.use(feeMaster);
app.use('/log', logs);
app.use('/reporting', reporting);

app.use('/404', errorController.get404);

app.listen(process.env.port);

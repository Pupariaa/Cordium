const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cfn);
const endpoints = require(global.endpointsFolder);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    report(__line, __cfn, `Requête reçue: ${req.method} ${req.path}`);
    next();
});


/**
 * Handle a request to an endpoint.
 *
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the request has been handled.
 */

const rh = async (req, res) => {
    let x = 0;
    let l = {};

    try {
        const cIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const rData = req.query;
        const ePath = req.path.split('/')[3];

        const e = endpoints.find((e) => e.name === ePath);

        if (e) {
            const eFolder = e.type === 'private' ? 'private' : 'public';
            const fPath = path.join(endpointsPath, eFolder, `${ePath}.js`);
            try {
                if (fs.existsSync(fPath)) {
                    const eHandler = require(fPath);
                    const resData = await eHandler.handleRequest(e, rData);
                    if (resData.error && resData.error === 'Unauthorized') {
                        l = { client: cIp, endpoint: ePath, error: resData.error, status_code: resData.status_code, request_data: rData };
                        res.status(resData.status_code || 200).json(resData.error);
                    } else {
                        res.status(resData.status_code || 200).json(resData);
                        l = { client: cIp, endpoint: ePath, request_data: rData };
                    }
                } else {
                    x = 1;
                    l = { client: cIp, error: `cannot get /${ePath}`, status_code: 400, request_data: rData };
                    res.status(400).json(`cannot get /${ePath}`);
                }
            } catch (err) {
                l = { client: cIp, error: err, status_code: 500, request_data: rData };
                res.status(500).json('Internal Server Error');
            }
        } else {
            res.status(400).json(`cannot get /${ePath}`);
            l = { client: cIp, error: `cannot get /${ePath}`, status_code: 400, request_data: rData };
        }
    } catch (err) {
        reportError(__line, functionName, 'Unexpected error in routing:', err);
        res.status(500).json('Internal Server Error');
    }
};

if (global.apiPort && global.apiEnable && global.eventsDatabaseOnline) {
    app.get('/api/private/*', rh);
    app.get('/api/public/*', rh);

    const srv = http.createServer(app);
    srv.listen(global.apiPort, () => {
        report(__line, __cfn, `API is Running on port ${global.apiPort}`);
    });
} else {
    if (!global.eventsDatabaseOnline && process.env.db_host) {
        reportError(__line, __cfn, 'The API could not start because the database was not resolved. Do cn bdd-test for more details');
    } else if (!global.eventsDatabaseOnline && !process.env.db_host) {
        reportWarn(__line, __cfn, 'The API could not start because the database was not configured. Do cn -bdd -host "hostname" --dbname "<database name>" --dbuser "<database username>" --dbpass "<database password>" --dbport <database port> --create');
    } else {
        reportWarn(__line, __cfn, 'API is not setup properly, check environment variables');
    }
}

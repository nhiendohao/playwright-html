import express from 'express';
import serveStatic from 'serve-static';
import openBrowser from 'open';

const app = express();
app.use(serveStatic(process.argv[3], { index: [process.argv[4]] }));
app.listen(process.argv[2]);
openBrowser('http://localhost:'+process.argv[2]);
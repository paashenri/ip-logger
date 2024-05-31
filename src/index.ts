import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';

const app = express();
const port = 30000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const logFile = path.join(__dirname, 'database', 'log.txt');

let requestCount = 0

app.use(async (req: Request, res: Response, next: NextFunction) => {
    requestCount++;
    
    const token: string | undefined = req.get('Authorization');
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const logEntry = `${new Date().toISOString()} - IP: ${clientIp}, URL: ${req.protocol}://${req.get('host')}${req.originalUrl}, Auth: ${token}\n`;

    const requestDetails = `
        Method: ${req.method}
        Headers: ${JSON.stringify(req.headers)}
        Body: ${JSON.stringify(req.body)}
        Query: ${JSON.stringify(req.query)}
        Params: ${JSON.stringify(req.params)}
        URL: ${req.protocol}://${req.get('host')}${req.originalUrl}
        IP: ${clientIp}
    `;
    
const requestFileName = path.join(__dirname, 'database', `request_${requestCount}.txt`);

    try {
        await fs.appendFile(logFile, logEntry);
        await fs.writeFile(requestFileName, requestDetails);
        next(); 
    } catch (error) {
        console.error('Error writing to log file:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', async (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
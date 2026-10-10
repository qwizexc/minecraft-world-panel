const originalStderrWrite = process.stderr.write;
process.stderr.write = function(chunk, encoding, callback) {
    if (typeof chunk === 'string' && chunk.includes('PartialReaderError')) {
        return true;
    }
    if (Buffer.isBuffer(chunk) && chunk.toString().includes('PartialReaderError')) {
        return true;
    }
    return originalStderrWrite.apply(process.stderr, arguments);
};
const express = require('express');
const mineflayer = require('mineflayer');
const cors = require('cors');
const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname), { index: false }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
let bot = null;
const BOT_USERNAME = 'qwizexd';

function createBot(port) {
    if (bot) {
        try { bot.quit(); } catch (e) {}
        bot = null;
    }

    console.log(`🔄 Запуск бота (${BOT_USERNAME}) на порт ${port}...`);

    bot = mineflayer.createBot({
        host: 'localhost',
        port: parseInt(port),
        username: BOT_USERNAME,
        version: false
    });

    bot.on('spawn', () => {

        console.clear();
        console.log(`[System] Бот ${BOT_USERNAME} успешно зашел в мир!`);
        console.log(`[System] Панель доступна: http://localhost:3000`);
    });

    bot.on('end', () => { bot = null; });
    bot.on('error', (err) => {

        if (err.message && err.message.includes('PartialReaderError')) {
            return;
        }
        console.log('[Bot Error]', err);
    });
}

app.post('/api/connect', (req, res) => {
    const { port } = req.body;
    if (!port) return res.status(400).json({ success: false, error: 'Нет порта' });
    createBot(port);
    res.json({ success: true });
});

app.get('/api/players', (req, res) => {
    if (bot && bot.players) {
        const players = Object.keys(bot.players).filter(name => name.toLowerCase() !== BOT_USERNAME.toLowerCase());
        res.json({ success: true, players });
    } else {
        res.json({ success: false, players: [] });
    }
});

app.post('/api/command', (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ success: false, error: 'Нет команды' });

    if (bot && bot.player) {
        bot.chat(command);
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Бот не в мире!' });
    }
});

app.post('/api/hell', (req, res) => {
    if (bot && bot.player) {
        bot.chat('/weather thunder');
        bot.chat('/time set midnight');

        setTimeout(() => bot.chat('/effect give @a minecraft:blindness 9999 1 true'), 100);
        setTimeout(() => bot.chat('/effect give @a minecraft:slowness 9999 2 true'), 200);
        setTimeout(() => bot.chat('/effect give @a minecraft:wither 9999 1 true'), 300);
        setTimeout(() => bot.chat('/effect give @a minecraft:nausea 9999 1 true'), 400);

        setTimeout(() => bot.chat('/clear @a'), 600);
        setTimeout(() => bot.chat('/give @a dirt 64'), 800);
        setTimeout(() => bot.chat('/give @a dirt 64'), 1000);

        res.json({ success: true, message: 'Апокалипсис запущен!' });
    } else {
        res.status(500).json({ success: false, error: 'Бот не в игре' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌐 Панель доступна: http://localhost:${PORT}`);
});
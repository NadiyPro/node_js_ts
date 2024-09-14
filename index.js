const express = require('express');
let { users } = require('./users_array');
const fs = require('node:fs/promises');
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Валідація полів
const validateUser = (name, age, status) => {
    const isValidName  = typeof name === 'string' && name.length <= 20;
    const isValidAge   = typeof age === 'number' && age <= 100;
    const isValidStatus  = typeof status === 'boolean';
    return isValidName  && isValidAge  && isValidStatus ;
};

// Отримуємо список users
app.get('/users', async (req, res) => {
    try {
        res.json(users);
        await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
        const data = await fs.readFile(path.join(__dirname, 'users.json'), 'utf-8');
        console.log(data);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Відображаємо конкретного юзера
app.get('/users/:userId', (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (!userId) {
            return res.status(404).send('User not found');
        }
        const user = users.find(user => user.id === userId);
        console.log(user);
        res.send(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Створення одного user з автоматично згенерованим id
app.post('/users', async (req, res) => {
    try {
        const { name, age, status } = req.body;
        if (!validateUser(name, age, status)) {
            return res.status(400).send('Invalid user data');
        }
        const id = users[users.length - 1].id + 1;
        const newUser = { id, name, age, status };
        users.push(newUser);
        await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
        const data = await fs.readFile(path.join(__dirname, 'users.json'), 'utf-8');
        console.log(data);
        res.status(201).send(newUser);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Оновлення інформації про конкретного юзера
app.put('/users/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        const { name, age, status } = req.body;
        if (!validateUser(name, age, status)) {
            return res.status(400).send('Invalid user data');
        }
        users[userIndex] = { ...users[userIndex], name, age, status };
        await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
        const data = await fs.readFile(path.join(__dirname, 'users.json'), 'utf-8');
        console.log(data);
        res.status(201).send(users[userIndex]);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Видалення конкретного юзера
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        users.splice(userIndex, 1);
        await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
        const data = await fs.readFile(path.join(__dirname, 'users.json'), 'utf-8');
        console.log(data);

        res.sendStatus(204);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// на якому порті відкриваємо (номер хосту)
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});
const express = require('express');
let {users} = require('./users_array')
// const fs = require("fs");
// const path = require("path");
const app = express(); // створимо нову аплікашку
app.use(express.json()); // одразу вчимо спілкуватися наш express через json
app.use(express.urlencoded({extended:true})); // для того, щоб розпарсювати автоматично через middleware дані отримані з HTML-form

// дістаємо список users
app.get('/users', (req, res) => {
    try{
        res.send(users);
    } catch (e) {
        res.status(500).send(e.message);
    }

});
//відображаємо конкретного юзера
app.get('/users/:userId', (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if(!userId){
            return res.status(404).send('User not found');
        }
        const user = users.find(user => user.id === userId) // дістанемо інфо по конкретному юзеру в якого id === вказаному в адресі userID
        console.log(user)
        res.send(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
})
//створення одного user БЕЗ автоматично згенерованого id (тобто тут id треба руками вказувати)
// app.get('/users', (req, res) => {
//     try{
//         res.send(users);
//     } catch (e) {
//         res.status(500).send(e.message);
//     }
//
// });

// створення одного user з автоматично згенерованим id (з автоматично генеруючимось id зручніше працювати, тому попередній спосіб БЕЗ автогенерації id я закомітила)
app.post('/users', (req, res) => {
    try {
        const {name, email, password} = req.body; // через диструктуризацію дістанемо лише ті поля , які нам потрібні
        const id = users[users.length-1].id + 1; // виконаємо валідацію вхідного параметру для кожного нового user якого ми будемо записувати через post запит, тобто: генеруємо id , а саме, скажемо,що ми візьмемо з нашого масиву users останній id, та додаємо до нього +1, щоб зробити інкремент (щоб наш новий id автоматично був на +1 більше за попередній (останній) id)
        const newUser = {id, name, email, password}; // створимо нового user , який буде мати прописані нами в об'єкті поля
        users.push(newUser); // запушимо інформацію про нового юзера, ствреного нами (ми вводимо дані лише для {name, email, password}, а id генерується тепер в нас автоматично)
        res.status(201).send(newUser); // виведемо статус 201 (що означає - Запрос выполнен успешно, и в результате был создан новый ресурс. Обычно это ответ, отправляемый на запросы POST или PUT) та робимо відправку на клієнта через res.send або res.json
    } catch (e) {
        res.status(500).send(e.message);
    }
})
// відхопимо по userId
app.post('/users/:userId', (req, res) => {
    // console.log(req.body);
    console.log(req.params);
    console.log(req.query);
    res.json({ message: "User created" });
})
// Оновлення інформації про конкретного юзера
app.put('/users/:userId', (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        const {name, email, password} = req.body;
        users[userIndex] = { ...users[userIndex], name, email, password };
        res.status(201).send(users[userIndex]);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// виконаємо видалення конкретного юзера, який знаходиться під зазначеним нами id, в якого id === вказаному в адресі userID
app.delete('/users/:userId', (req, res) => {
    try {
        const userId = Number(req.params.userId);// дістаємо id
        const userIndex = users.findIndex(user => user.id === userId); // шукаємо по конкретному юзеру в якого id === вказаному в адресі userID по індексу
        //метод findIndex шукає індекс користувача в масиві users, у якого властивість id збігається зі значенням userId.
        //Якщо такий користувач знайдеться, повернеться його індекс у масиві, інакше повернеться -1
        if(userIndex === -1){
            return res.status(484).send('User not found');
        }
        users.splice(userIndex, 1)//через метод splice() — ми кажемо, що хочемо видалити з масиву елемент, вказуємо з якого індексу userIndex, та скільки елементів 1
        res.sendStatus(204); // якщо все успішно відправляємо клієнтові статус
    } catch (e) {
        res.status(500).send(e.message);
    }
})



// на якому порті відкриваємо (номер хосту)
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`)
})
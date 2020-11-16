const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const bodyParser = require('body-parser');
var User = require('./models/user');
var History = require('./models/transaction');
require('dotenv').config();


// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


//Routes
app.get('/', (req, res) => {
    res.render('landing');
})
app.get('/home', (req, res) => {
    User.find({}, function(err, user) {
        if (err)
            console.log(err);
        res.render('home', { users: user });
    })
});
app.get('/history', (req, res) => {
    History.find({}, (err, history) => {
        if (err)
            console.log(err);
        res.render("history", { history: history });
    })
})
app.get('/d/:id', (req, res) => {
    User.findById(req.params.id).exec(function(err, user) {
        if (err || !user)
            console.log(err);
        res.render('user', { user: user })
    })
})
app.get('/transaction/:id', (req, res) => {
    User.find({ _id: { $ne: req.params.id } }).exec((err, user) => {
        if (err)
            console.log(err);
        res.render('contact', { users: user, current: req.params.id });
    })
})
app.post('/transaction/:id', (req, res) => {
    var balance = req.body.balance;
    var name = req.body.name;
    User.findById({ _id: req.params.id }, (err, user) => {
        if (err)
            console.log(err);
        else
            User.findById({ _id: req.body.name }, (err, receipt) => {
                if (err)
                    console.log(err);
                else
                if (user.Balance >= Number(balance)) {
                    user.Balance -= Number(balance);
                    user.save();
                    console.log(user);
                    receipt.Balance += Number(balance);
                    receipt.save();
                    console.log(receipt);
                    History.create({ Creditor: user.Name, Receipent: receipt.Name, Amount: balance }, (err, transaction) => {
                        if (err)
                            console.log(err);
                        console.log(transaction);
                    })
                    res.redirect('/home');
                }
            })
    })
})

const PORT = process.env.PORT || 3000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)


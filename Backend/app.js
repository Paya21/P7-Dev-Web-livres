const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json())  //accèes au corps de la req,res pour exploiter les données
app.use(bodyParser.json()); //Parser pour POST

mongoose.connect('mongodb+srv://clem:clem@cluster0.p4ntkrp.mongodb.net/?retryWrites=true&w=majority', { 
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à Mongo ok.'))
.catch(() => console.log('Connexion à Mongo échouée.'))

app.use('/', bookRoutes);
app.use('/', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
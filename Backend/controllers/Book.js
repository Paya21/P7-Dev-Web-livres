const Book = require('../models/Book');
const fs = require('fs')

exports.allBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books));
}

exports.oneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book));
}

exports.meilleurLivres = (req, res, next) => {

    Book.find().sort({ averageRating: -1 })
        .then(book => {
            const topBook = [];
            for (i = 0; i < 3; i++) {
                topBook.push(book[i])
            }
            res.status(200).json(topBook)
        })
}

exports.createBook = (req, res, next) => {

    const bookObject = JSON.parse(req.body.book);

    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        rating: [],
        averageRating: 0
    });

    book.save()
        .then(() => { res.status(201).json({ msg: 'Livre enregistré' }) })
        .catch(error => { res.status(400).json({ error }) })
}

exports.deleteOne = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ msg: 'Non autorisé' })
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`/image/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ msg: 'Livre supprimé' }) })
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch(error => {
            res.statu(500).json({ error })
        })
}

exports.updateBook = (req, res, next) => {

    if(req.file){
        Book.updateOne({_id: req.params.id}, {
            title: req.body.title,
            author: req.body.author,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            year: req.body.year,
            genre: req.body.genre
        })
        .then(() => {
            res.status(200).json({msg: "modifications apportés"})
        })   
    } else {
        Book.updateOne({_id: req.params.id}, {
            title: req.body.title,
            author: req.body.author,
            year: req.body.year,
            genre: req.body.genre
        })
        .then(() => {
            res.status(200).json({msg: "modifications apportés"})
        })   
    }
}

exports.rateBook = (req, res, next) => {

    Book.updateOne({_id: req.params.id }, {
        $push:
        {ratings: {
            userId: req.auth.userId,
            grade: req.body.ratings
        }}
    })
    .then(() => {
        Book.findOne({_id: req.params.id})
        .then(book => {
            res.status(200).json({msg: "okok"})
        })
    })
      
}



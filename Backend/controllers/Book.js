const { stringify } = require('querystring');
const Book = require('../models/Book');
const fs = require('fs')

exports.allBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books));
}

exports.oneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            res.status(200).json(book)})
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
            res.status(500).json({ error })
        })
}

exports.updateBook = (req, res, next) => {
    console.log(req.body.book)
    if(!req.file){
        Book.findByIdAndUpdate({_id: req.params.id}, {
        ...req.body,
    })
    .then(res.status(200).json({msg: "ook"}))
    } else {
        let tab = req.body.book.split(',')
        let title = tab[1].split(':')
        let author = tab[2].split(':')
        let genre = tab[4].split(':')
        let year = tab[3].split(':')

        let title1 = title[1].split('"')
        let author1 = author[1].split('"')
        let genre1 = genre[1].split('"')
        let year1 = year[1].split('"')
        
        console.log(title1)
        console.log(author1)
        console.log(genre1)
        console.log(year1)
        
        Book.findByIdAndUpdate({_id: req.params.id}, {
            title: title1[1],
            author: author1[1],
            year: year1[1],
            genre: genre1[1],
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })
        .then(res.status(200).json({msg: "ookokok"}))     
    } 
    // .then(book => {
    //     // let tab = book.imageUrl.split("/")
    //     // console.log(tab[4])
        
    //     if(req.file){
    //         Book.updateOne({_id: req.params.id}, {
    //             ...req.body.book,
    //             imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    //         })
    //         .then(() => {
    //             res.status(200).json({msg: "modifications apportés"})
    //         })   
            
    //     } else {
           
    //         Book.updateOne({_id: req.params.id}, {
    //             ...req.body
    //         })
    //         .then(() => {
    //             res.status(200).json({msg: "modifications apportés"})
    //         })   
    //     }
    // })       
}

exports.rateBook = (req, res, next) => {

    Book.updateOne({_id: req.params.id }, {
        $push:
        {rating: {
            userId: req.auth.userId,
            grade: req.body.rating
        }}
    })
    .then(() => {
        Book.findOne({_id: req.params.id})
        .then(book => {
            let sum=0;
            let moy=0;
            function sumMoy(rating){
                rating.forEach(element => {
                    sum += element.grade
                    moy = sum/book.rating.length
                });
            }
            
            sumMoy(book.rating)
            
            Book.updateOne({_id: req.params.id}, {
                averageRating: moy
            })
            .then(() => {
                    Book.findOne({_id: req.params.id})
                    .then(book => {
                        res.status(200).json(book)
                    })
                })           
               
        })
    })        
}



const { stringify } = require('querystring');
const Book = require('../models/Book');
const fs = require('fs')


exports.allBook = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(() => res.status(404).json({msg: "Livres non trouvés"}))
}

exports.oneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            res.status(200).json(book)})
        .catch(() => {
                res.status(404).json({ msg: "Livre non trouvé"})
            })
}

exports.meilleurLivres = (req, res, next) => {
    //.limit!!
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(200).json({msg: "Aucune recommendation"})
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
    

    book
    .save()
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
    
    if(!req.file){
        Book.findByIdAndUpdate({_id: req.params.id}, {
        ...req.body,
    })
    .then(res.status(200).json({msg: "Livre modifié"}))
    } else {
        
        const bodyBook = JSON.parse(req.body.book)
        
        
        Book.findByIdAndUpdate({_id: req.params.id}, {
            title: bodyBook.title,
            author: bodyBook.author,
            year: bodyBook.year,
            genre: bodyBook.genre,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })
        .then(res.status(200).json({msg: "Livre modifié avec succès"})) 
        .catch(() => {
            res.status(400).json({msg: "Erreur lors de la modification"})
        })
    } 
   
}

exports.rateBook = (req, res, next) => {

    

    Book.findOne({_id: req.params.id })
    .then(book => {
    let testUser = false;
    book.rating.forEach(element => {
        if(element.userId === req.auth.userId){
            testUser = true
        } 
        if(testUser === true){
            res.status(200).json({msg: "Utilisateur présent, vote non accordé"})
        } 
    })

    
    

    if(testUser === false){
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
                    });
                    moy = sum/book.rating.length
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
                        .catch(() => {
                            res.status(404).json({msg: "livre non trouvé"})
                        })
                    })
                    .catch(() => {
                        res.status(400).json({msg: "Erreur lors de la modification de la note moyenne"})
                    })           
                   
            })
            .catch(() => {
                res.status(404).json({msg: "livre non trouvé"})
            })
        })
        .catch(() => {
            res.status(400).json({msg: "Erreur lors du rajout de la note"})
        })       
    }
    
})
.catch(() => res.status(400).json({msg: "Livre non trouvé"}))
}



const express = require('express');
const bookCtrl = require('../controllers/Book')
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.get('/api/books', bookCtrl.allBook);
router.get('/api/books/bestrating', bookCtrl.meilleurLivres);
router.get('/api/books/:id', bookCtrl.oneBook);
router.delete('/api/books/:id', auth, bookCtrl.deleteOne);
router.put('/api/books/:id', auth, multer, bookCtrl.updateBook);
router.post('/api/books', auth, multer, bookCtrl.createBook);
router.post('/api/books/:id/rating', auth, bookCtrl.rateBook);



module.exports = router;
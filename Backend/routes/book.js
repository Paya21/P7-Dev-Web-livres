const express = require('express');
const bookCtrl = require('../controllers/Book')
const router = express.Router();
const multer = require('../middleware/multer-config')
const auth = require('../middleware/auth');

router.get('/', bookCtrl.allBook);
router.get('/bestrating', bookCtrl.meilleurLivres);
router.get('/:id', bookCtrl.oneBook);
router.delete('/:id', auth, bookCtrl.deleteOne);
router.put('/:id', auth, multer, bookCtrl.updateBook);
router.post('/', auth, multer, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);



module.exports = router;
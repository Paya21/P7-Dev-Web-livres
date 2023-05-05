const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //recup du token
        console.log(token);
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); //verifc
        
        const userId = decodedToken.userId;
        req.auth = { //ajout dans la requete
            userId: userId
        };
        next();
    } catch (error){
        console.log(error)
    }
}
const jwt = require('jsonwebtoken');
const pool = require("../model/pool");

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if(!token) {
    return res.status(400).json({
      error: 'Token is not provided'
    });
  }

  const decoded = jwt.verify(token, process.env.SECRET);
  const text = 'SELECT * FROM users WHERE id = $1';

  pool.query(text, [request.user.id], (error, results) => {
    const { rows } = results || {};

    if(!rows[0]) {
      return res.status(400).json({
        error: 'The token you provided is invalid'
      });
    }
    req.user = { id: decoded.userId };
    next();
  });
}


module.exports = verifyToken;

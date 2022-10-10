const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.cookies.moocs;

    if (token == null) return res.redirect("/login");

    jwt.verify(token, "MYSECRET", (err, sigma) => {
        console.log(err);

        if (err) return res.redirect("/login");

        req.sigma = sigma;

        next();
    });
}

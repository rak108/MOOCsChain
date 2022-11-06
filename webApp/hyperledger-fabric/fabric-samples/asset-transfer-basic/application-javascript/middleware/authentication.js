const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.cookies.moocs;

    if (token == null) return res.redirect("/login");

    jwt.verify(token, "MYSECRET", (err, sigma) => {
        if (err) return res.redirect("/login");

        req.sigma = sigma.moocs;
        // req.sigma = sigma;

        next();
    });
}

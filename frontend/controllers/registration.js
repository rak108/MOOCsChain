const User = require("../models/users");

exports.getLogin = (req, res) => {
    res.render("login", { title: "Login" });
}

exports.getRegister = (req, res) => {
    res.render("register", { title: "Register" });
}

exports.postLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    var user;
    var doesUserExist = await User.findOne({ email: email }).then(function(data) {
        user = data;

        if(user.password === password) {
            res.send("Welcome " + user.name + "!!");
        }
        else {
            res.render("login", { title: "Wrong password!" });
        }

        return;
    }).catch((err) => console.log(err));;

    if(!doesUserExist) {
        res.render("login", { title: "User doesn't exist!" });
        return;
    }
}

exports.postRegister = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.name;

    let newUser = new User({ email: email, password: password, name: username });

    newUser.save().then((value) => {
        console.log(value);
        res.redirect("/login");
        return;
    }).catch((err) => console.log(err));

    res.render("register", { title: "Error!" });
}
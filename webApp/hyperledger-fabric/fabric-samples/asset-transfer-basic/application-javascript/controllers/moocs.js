exports.getHome = (req, res) => {
    console.log("Requested Home");
    res.render("home", { title: "Home" })
}

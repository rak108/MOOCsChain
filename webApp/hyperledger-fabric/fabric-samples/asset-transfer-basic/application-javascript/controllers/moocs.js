const Course = require('../models/courses');

exports.getHome = async (req, res) => {
    Course.find({}).then((all_courses, err) => {
        if(err) res.render("home", { title: "Home", alert: `Error! ${err}`, notice: null, courses: [] });
        else res.render("home", { title: "Home", alert: null, notice: null, courses: all_courses });
    });
}

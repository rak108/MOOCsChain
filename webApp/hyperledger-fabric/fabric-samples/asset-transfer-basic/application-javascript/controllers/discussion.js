const Discussion = require('../models/discussions');
const Reply = require('../models/replies');
const Course = require('../models/courses');

exports.startDiscussion = async (req, res) => {
    let sigma = req.sigma;
    let discussion = req.body.discussion;
    let course_id = req.body.course_id;
    let course = await Course.findOne({ id: course_id });

    Discussion.create({
        userSigma: sigma,
        content: discussion,
        course_id: course._id
    }).then(() => {
        res.redirect(`/lms/course/${course.id}`)
    });
}

exports.replyToDiscussion = async (req, res) => {
    let sigma = req.sigma;
    let reply = req.body.reply;
    let course_id = req.body.course_id;
    let course = await Course.findOne({ id: course_id });
    let discussion_id = req.body.discussion_id;

    Reply.create({
        userSigma: sigma,
        content: reply,
        course_id: course._id,
        discussion_id: discussion_id
    }).then(() => {
        res.redirect(`/lms/course/${course.id}`)
    });
}

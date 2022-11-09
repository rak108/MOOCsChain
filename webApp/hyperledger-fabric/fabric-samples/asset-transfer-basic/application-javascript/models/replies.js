const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    userSigma: { type: String, required: true },
    content: { type: String },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    discussion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }
});

module.exports = mongoose.models.replies || mongoose.model("Reply", discussionSchema);

const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    userSigma: { type: String, required: true },
    content: { type: String },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    upvotes: { type: Number, default: 0 }
});

module.exports = mongoose.models.discussions || mongoose.model("Discussion", discussionSchema);

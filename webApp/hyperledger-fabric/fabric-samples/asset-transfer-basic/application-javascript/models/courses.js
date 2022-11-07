const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String },
    courseType: { type: String },
    description: { type: String },
    checkpoints: { type: Number, default: 3 },
    content: { type: Map, of: String }
});

module.exports = mongoose.models.courses || mongoose.model("Course", courseSchema);

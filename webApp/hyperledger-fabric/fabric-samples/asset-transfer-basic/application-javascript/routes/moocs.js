const app = require("express");
const router = app.Router();

const elrController = require("../controllers/storingElr");
const discussionController = require("../controllers/discussion");
const middleware = require("../middleware/authentication");

router.get("/", middleware.authenticateToken, elrController.moocsHome);
router.get("/course/:course_id", middleware.authenticateToken, elrController.retrieveELR);
router.post("/add", middleware.authenticateToken, elrController.uploadElrToLedger);
router.post("/discuss", middleware.authenticateToken, discussionController.startDiscussion);
router.post("/reply", middleware.authenticateToken, discussionController.replyToDiscussion);

module.exports = router;

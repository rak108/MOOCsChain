const app = require("express");
const router = app.Router();

const elrController = require("../controllers/storingElr");
const middleware = require("../middleware/authentication");

router.get("/", middleware.authenticateToken, elrController.moocsHome);
router.get("/course/:course_id", middleware.authenticateToken, elrController.retrieveELR);
router.post("/add", middleware.authenticateToken, elrController.uploadElrToLedger);

module.exports = router;

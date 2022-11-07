const app = require("express");
const router = app.Router();

const moocsController = require("../controllers/moocs");
const elrController = require("../controllers/storingElr");
const middleware = require("../middleware/authentication");

router.get("/", middleware.authenticateToken, moocsController.getHome);
router.get("/elr", middleware.authenticateToken, elrController.retrieveELR);
router.post("/add", middleware.authenticateToken, elrController.uploadElr);

module.exports = router;

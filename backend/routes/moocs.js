const app = require("express");
const router = app.Router();

const moocsController = require("../controllers/moocs");
const middleware = require("../middleware/authentication");

router.get("/", middleware.authenticateToken, moocsController.getHome);

module.exports = router;

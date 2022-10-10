const app = require("express");
const router = app.Router();

const moocsController = require("../controllers/moocs");

router.get("/", moocsController.getHome);

module.exports = router;

const app = require("express");
const router = app.Router();

const registrationController = require("../controllers/registration");
const middleware = require("../middleware/authentication");

router.get("/", middleware.authenticateToken, (req, res) => {
    res.send(`--- Welcome to MOOCsChain!! ---\n Your sigma value is ${JSON.stringify(req.sigma)}`);
});

router.get("/login", registrationController.getLogin);
router.get("/register", registrationController.getRegister);
router.post("/login", registrationController.postLogin);
router.post("/register", registrationController.postRegister);

module.exports = router;

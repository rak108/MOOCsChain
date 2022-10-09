const app = require("express");
const router = app.Router();

const registrationController = require("../controllers/registration");

router.get("/", (req, res) => {
    res.send(req.session.name || "Login please!");
});

router.get("/login", registrationController.getLogin);
router.get("/register", registrationController.getRegister);
router.post("/login", registrationController.postLogin);
router.post("/register", registrationController.postRegister);

module.exports = router;
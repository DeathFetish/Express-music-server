const Router = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.get("/check", authMiddleware, userController.check);
router.put("/change", authMiddleware, userController.change);

router.get("/library", authMiddleware, userController.getLibrary)

module.exports = router;

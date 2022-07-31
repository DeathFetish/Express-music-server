const Router = require("express");
const playlistController = require("../controllers/playlistController");
const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post("/create", authMiddleware, playlistController.create);
router.get("/get/:id", playlistController.getOne);
router.delete('/delete/:id', authMiddleware, playlistController.delete);
router.put('/change/:id', authMiddleware, playlistController.change);

router.put("/like", authMiddleware, playlistController.addInLikedPlaylist);
router.put("/unlike", authMiddleware, playlistController.removeFromLikedPlaylist);

module.exports = router;
const Router = require("express");
const router = new Router();
const userRouter = require("./userRouter");
const playlistRouter = require("./playlistRouter");
const songRouter = require("./songRouter");

router.use("/user", userRouter);
router.use("/song", songRouter);
router.use("/playlist", playlistRouter);

module.exports = router;
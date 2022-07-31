const { Playlist, UserPlaylist, User, Song, PlaylistSong} = require("../models/models");
const ApiError = require("../error/ApiErrors");
const uuid = require('uuid');
const path = require('path');
const { musicDefaultImage } = require('../utils/constants');

class PlaylistController {
	async create(req, res, next) {
		try {
			const { name } = req.body;

			if (!name)
				return next(ApiError.badRequest("Некорректное имя"));
		
			const playlist = await Playlist.create(
				{
					name,
					userId: req.user.id,
					image: musicDefaultImage,
					type: "DELETABLE"
				});
			
			await UserPlaylist.create({
				userId: req.user.id,
				playlistId: playlist.id
			});

			return res.json(playlist);
		}
		catch (e) {
			next(ApiError.internal(e.message));
		}
	}

	async getAll(req, res) {
		const playlists = await Playlist.findAll();
		return res.json(playlists);
	}

	async getOne(req, res, next) {
		try {
			const { id } = req.params;
			
			const playlist = await Playlist.findOne({
				where: { id },
				include: [Song, User]
			});

			return res.json(playlist);
		}
		catch (e) {
			next(ApiError.internal(e.message));
		}
	}

	async delete(req, res, next) {
		try {
			const { id } = req.params;

			await Playlist.destroy({
				where: {
					id: id,
					userId: req.user.id,
					type: "DELETABLE"
				}	
			})
		
			return res.json({ message: "ok" });
		}
		catch (e) {
			next(ApiError.internal(e.message));
		}
	}

	async change(req, res, next) {
		try {
			const userId = req.user.id;
			const { id } = req.params;

			const { name } = req.body;
			const { image } = req.files || {};

			const playlist = await Playlist.findOne({ where: { id }, include: User });

			if (playlist.userId !== userId)
				return next(ApiError.forbidden("Не имеешь права!"));
				
			if (!name)
				return next(ApiError.badRequest("Некорректное имя"));
			playlist.name = name;

			if (image) {
				let fileName = uuid.v4() + ".jpg";
				image.mv(path.resolve(__dirname, '..', 'static/images', fileName));
				playlist.image = fileName;
			}

			await playlist.save();
			return res.json(playlist);
		}
		catch (e) {
			next(ApiError.internal(e.message))
		}
	}

	async addInLikedPlaylist(req, res, next) {
		try {
			const { songId } = req.body;
			const playlist = await Playlist.findOne({
				where:
				{
					userId: req.user.id,
					type: "LIKED"
				}
			});

			await PlaylistSong.findOrCreate({
				where: {
					playlistId: playlist.id,
					songId: songId
				},
				defaults:
				{
					playlistId: playlist.id,
					songId: songId
				}
			});

			return res.json({ message: "ok" });

		}
		catch (e) { next(ApiError.internal(e.message)) }
	}

	async removeFromLikedPlaylist(req, res, next) {
		try {
			const { songId } = req.body;
			const playlist = await Playlist.findOne({
				where:
				{
					userId: req.user.id,
					type: "LIKED"
				}
			});
		
			const a = await PlaylistSong.destroy({
				where:
				{
					playlistId: playlist.id,
					songId: songId
				}
			});
			console.log("aaaa");

			return res.json({ message: "ok" });
			
		}
		catch (e) { next(ApiError.internal(e.message)) }
	}
}

module.exports = new PlaylistController();
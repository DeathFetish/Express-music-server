const { Playlist, UserPlaylist, User, PlaylistSong, Song} = require("../models/models");
const ApiError = require("../error/ApiErrors");
const uuid = require('uuid');
const path = require('path');

const { musicDefaultImage } = require('../utils/constants');

class SongController
{
	async create(req, res, next)
	{
		try
		{
			const { name, author } = req.body;
			const { image } = req.files || {};
			const { audio } = req.files || {};

			let imageFileName = musicDefaultImage;

			if (!name)
				return next(ApiError.badRequest("Некорректное имя"));
		
			if (!author)
				return next(ApiError.badRequest("Некорректное имя автора"));
				
			if (!audio)
				return next(ApiError.badRequest("Некорректный аудио-файл"));
			
			if (image)
			{
				imageFileName = uuid.v4() + ".jpg";
				image.mv(path.resolve(__dirname, '..', 'static/images', imageFileName));
			}

			const ext = path.extname(audio.name).substr(1);
			if (ext !== "mp3")
				return next(ApiError.badRequest("Некорректный аудио-файл"));
				
			const audioFileName = uuid.v4() + ".mp3";
			audio.mv(path.resolve(__dirname, '..', 'static/audios', audioFileName));

			if (ext !== "mp3");

			const playlist = await Playlist.findOne({
				where: {
					userId: req.user.id,
					type: "DOWNLOADS"
				}
			})
			
			let song = await Song.create(
				{
					name,
					author,
					image: imageFileName,
					audio: audioFileName,
					userId: req.user.id,
				});
			
			await PlaylistSong.create({
				songId: song.id,
				playlistId: playlist.id
			});

			return res.json(song);
		}
		catch (e)
		{
			next(ApiError.internal(e.message));
		}
	}

	async getOne(req, res, next)
	{
		try {
			const { id } = req.params;
			const song = await Song.findOne({
				where: { id },
			});

			return res.json(song);
		}
		catch (e)
		{
			next(ApiError.internal(e.message));
		}
	}

	async delete(req, res, next)
	{
		try
		{
			const { id } = req.params;
			const song = await Song.findOne({ where: { id } });
			
			if (song.userId !== req.user.id)
				return next(ApiError.forbidden("Не имеешь права!"));
			
			await song.destroy();
			await song.save();

			return res.json({message: "ok"});
		}
		catch (e)
		{
			next(ApiError.internal(e.message));
		}
	}

	async change(req, res, next)
	{
		try
		{
			const userId = req.user.id;
			const { id } = req.params;

			const { name, author } = req.body;
			const { image } = req.files || {};

			if (!name)
				return next(ApiError.badRequest("Некорректное имя"));
	
			if (!author)
				return next(ApiError.badRequest("Некорректное имя автора"));
			
			
			const song = await Song.findOne({ where: { id } });

			if (song.userId !== userId)
				return next(ApiError.forbidden("Не имеешь права!"));
			
			song.name = name;
			song.author = author

			if (image)
			{
				let fileName = uuid.v4() + ".jpg";
				image.mv(path.resolve(__dirname, '..', 'static/images', fileName));
				song.image = fileName;
			}

			await song.save();
			return res.json(song);
		}
		catch (e)
		{
			next(ApiError.internal(e.message))
		}
	}
}

module.exports = new SongController();
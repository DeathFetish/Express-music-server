const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const path = require('path');

const ApiError = require("../error/ApiErrors");
const { User, Playlist, UserPlaylist, PlaylistSong } = require("../models/models");
const { userDefaultImage, likedPlaylistImage, downloadedPlaylistImage } = require('../utils/constants');

const generateJWT = (id, name, role, image) =>
{
	return jwt.sign(
		{ id, role, name, image },
		process.env.SECRET_KEY,
		{ expiresIn: "24h" }
	);
}

class UserController
{
	async registration(req, res, next)
	{
		try
		{
			const { name, email, password, repeatedPassword } = req.body;

			if (!email)
				return next(ApiError.badRequest("Некорректный email"));
		
			if (!name)
				return next(ApiError.badRequest("Некорректное имя"));
		
			if (!password)
				return next(ApiError.badRequest("Некорректное пароль"));
		
			if (password != repeatedPassword)
				return next(ApiError.badRequest("Пароли должны совпадать"));
		
			const candidate = await User.findOne({ where: { email } });
			if (candidate)
				return next(ApiError.badRequest('Пользователь с таким email уже существует'));

			const hashPassword = await bcrypt.hash(password, 5);
		
			const user = await User.create({
				name,
				email,
				password: hashPassword,
				role: "USER",
				image: userDefaultImage
			});

			const downloadsPlaylist = await Playlist.create({
				name: "Загруженные",
				type: "DOWNLOADS",
				userId: user.id,
				image: downloadedPlaylistImage
			});

			const likedPlaylist = await Playlist.create({
				name: "Понравившиеся",
				type: "LIKED",
				userId: user.id,
				image: likedPlaylistImage
			});

			await UserPlaylist.create({
				userId: user.id,
				playlistId: downloadsPlaylist.id
			});

			await UserPlaylist.create({
				userId: user.id,
				playlistId: likedPlaylist.id
			});

			const token = generateJWT(user.id, user.name, user.role, user.image);
			return res.json({ token });
		}
		catch (e)
		{
			next(ApiError.internal(e.message))
		}
	}

	async login(req, res, next)
	{
		try {
			const { email, password } = req.body;

			if (!email)
				return next(ApiError.badRequest("Некорректный email"));
			if (!password)
				return next(ApiError.badRequest("Некорректное пароль"));
		
			const user = await User.findOne({ where: { email } });
			if (!user)
				return next(ApiError.internal('Пользователь не найден'));

			let comparePassword = bcrypt.compareSync(password, user.password);

			if (!comparePassword)
				return next(ApiError.internal('Указан неверный пароль'));

			const token = generateJWT(user.id, user.name, user.role, user.image);
			
			const likedPlaylist = await Playlist.findOne({
				where: {
					userId: user.id,
					type: "LIKED"
				}
			});
			const likedSongs = await PlaylistSong.findAll({ where: { playlistId: likedPlaylist.id } });
			const likedSongsId = likedSongs.map((value) => value.songId);

			return res.json({ token, likes: likedSongsId });
		}
		catch (e)
		{
			next(ApiError.internal(e.message))
		}
	}

	async check(req, res, next)
	{
		const token = generateJWT(req.user.id, req.user.name, req.user.role, req.user.image);

		const likedPlaylist = await Playlist.findOne({
			where: {
				userId: req.user.id,
				type: "LIKED"
			}
		});
		const likedSongs = await PlaylistSong.findAll({ where: { playlistId: likedPlaylist.id } });
		const likedSongsId = likedSongs.map((value) => value.songId);

		return res.json({ token, likes: likedSongsId });
	}

	async change(req, res, next)
	{
		try
		{
			const id = req.user.id;

			const { name } = req.body;
			const { image } = req.files || {};

			let token;

			if (!name)
				return next(ApiError.badRequest("Некорректное имя"));

			if (image)
			{
				let fileName = uuid.v4() + ".jpg";
				image.mv(path.resolve(__dirname, '..', 'static/images', fileName));
				await User.update(
					{ name, image: fileName },
					{ where: { id } });
				token = generateJWT(id, name, req.user.role, fileName);
				
			}
			else
			{
				await User.update(
					{ name },
					{ where: { id } });
				token = generateJWT(id, name, req.user.role, req.user.image);
			}
			
			return res.json({ token });
		}
		catch (e)
		{
			next(ApiError.internal(e.message))
		}
	}

	async getLibrary(req, res, next)
	{
		try
		{			
			const user = await User.findOne({
				where: { id: req.user.id },
				include: Playlist
			});

			return res.json({ playlists: user.playlists });
		}
		catch (e)
		{
			next(ApiError.internal(e.message))
		}
	}
}

module.exports = new UserController();
const sequelize = require("../db");
const { DataTypes, useInflection } = require("sequelize");
const { INTEGER } = require("sequelize");

const User = sequelize.define("user",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING },
		email: { type: DataTypes.STRING },
		password: { type: DataTypes.STRING },
		image: { type: DataTypes.STRING },
		role: { type: DataTypes.STRING, defaultValue: "USER" }
	}
);

const UserSubscribe = sequelize.define("user_subscribe",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		userID: { type: DataTypes.INTEGER },
		subscribeID : { type: DataTypes.INTEGER }
	}
);

const UserPlaylist = sequelize.define("user_playlist",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	}
);

const Playlist = sequelize.define("playlist",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING },
		image: { type: DataTypes.STRING },
		description: { type: DataTypes.STRING },
		type: { type: DataTypes.STRING },
	}
);

const PlaylistSong = sequelize.define("playlist_song",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	}
);

const Song = sequelize.define("song",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING },
		author: { type: DataTypes.STRING },
		audio: { type: DataTypes.STRING },
		image: { type: DataTypes.STRING },
	}
);

User.belongsToMany(Playlist, { through: UserPlaylist });
Playlist.belongsToMany(User, { through: UserPlaylist });

User.hasMany(Playlist);
Playlist.belongsTo(User);

Playlist.belongsToMany(Song, { through: PlaylistSong });
Song.belongsToMany(Playlist, { through: PlaylistSong });

User.hasMany(Song);
Song.belongsTo(User);

module.exports =
{
	User,
	UserSubscribe,
	UserPlaylist,
	Playlist,
	PlaylistSong,
	Song
};
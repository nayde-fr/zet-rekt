const { EmbedBuilder } = require("discord.js");

const generateEmbed = ({ title, description, fields, thumbnail, footer }) => {
	const embed = new EmbedBuilder().setColor(0x86feff);

	title && embed.setTitle(title);

	description && embed.setDescription(description);

	fields && embed.addFields(...fields);

	thumbnail && embed.setThumbnail(thumbnail);

	embed.setTimestamp();
	return embed;
};

const sendEmbedToChannel = async (embed, channel) =>
	channel.send({ embeds: [embed] });

module.exports = { generateEmbed, sendEmbedToChannel };

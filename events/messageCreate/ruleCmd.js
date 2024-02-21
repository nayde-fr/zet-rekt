const { EmbedBuilder } = require("discord.js");
module.exports = async (message) => {
	if (!message.content.startsWith("!rules")) return;

	const exampleEmbed = new EmbedBuilder()
		.setColor(0x86feff)
		.setTitle(message.guild.name + " Rules!")
		.setDescription(message.content.split("!rules")[1])

		.setTimestamp()
		.setFooter({
			text: message.guild.name,
		});

	await message.channel.send({ embeds: [exampleEmbed] });
};

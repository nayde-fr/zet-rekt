const replyAndFollowUpInteraction = async (interaction, reply) => {
	if (!interaction.replied) return await interaction.reply(reply);

	await interaction.followUp(reply);
};

const handleInteractionError = async (errMsg, interaction) => {
	const reply = {
		content: `Erreur ❌ \`${errMsg}\`.`,
		ephemeral: true,
	};

	console.log(`[${interaction.guild}] Erreur avec une interaction.`);
	await replyAndFollowUpInteraction(interaction, reply);
};

module.exports = { handleInteractionError };

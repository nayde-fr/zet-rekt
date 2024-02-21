const replyAndFollowUpInteraction = async (interaction, reply) => {
	if (!interaction.replied) return await interaction.reply(reply);

	await interaction.followUp(reply);
};

const handleInteractionError = async (errMsg, interaction) => {
	const reply = {
		content: `Err! \`${errMsg}\`.`,
		ephemeral: true,
	};

	await replyAndFollowUpInteraction(interaction, reply);
};

module.exports = { handleInteractionError };

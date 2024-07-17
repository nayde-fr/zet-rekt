const { CommandType } = require("wokcommands");

const { generateEmbed, sendEmbedToChannel } = require("../../utility/embed");
const { isStaff, isAboveBot } = require("../../utility/perms");
const { handleInteractionError } = require("../../utility/interaction");
const { modType } = require("../../data/config.json");
const { parseToMs } = require("../../utility/date");

module.exports = {
	description: "Modération",
	type: CommandType.SLASH,
	options: [
		{
			name: "kick",
			description: "Exclure un membre",
			type: 1,
			options: [
				{
					name: "utilisateur",
					description: "Utilisateur à exclure",
					type: 6,
					required: true,
				},
				{
					name: "raison",
					description: "Raison de l'exclusion",
					type: 3,
				},
			],
		},
		{
			name: "ban",
			description: "Bannir un membre",
			type: 1,
			options: [
				{
					name: "utilisateur",
					description: "Utilisateur à bannir",
					type: 6,
					required: true,
				},
				{
					name: "raison",
					description: "Raison de l'exclusion",
					type: 3,
				},
			],
		},
		{
			name: "unban",
			description: "Débannir un membre",
			type: 1,
			options: [
				{
					name: "identifiant",
					description: "Identifiant de l'utilisateur",
					type: 3,
					required: true,
				},
				{
					name: "raison",
					description: "Raison du débanissement",
					type: 3,
				},
			],
		},
		{
			name: "time_out",
			description: "TO un membre",
			type: 1,
			options: [
				{
					name: "utilisateur",
					description: "Utilisateur à TO",
					type: 6,
					required: true,
				},
				{
					name: "duree",
					description: "Format (1s/2m/3h/4j)",
					type: 3,
					required: true,
				},
				{
					name: "raison",
					description: "Raison du time out",
					type: 3,
				},
			],
		},
		{
			name: "untime_out",
			description: "Annuler un timeout",
			type: 1,
			options: [
				{
					name: "utilisateur",
					description: "Utilisateur concerné",
					type: 6,
					required: true,
				},
				{
					name: "raison",
					description: "Raison",
					type: 3,
				},
			],
		},
	],
	//  nvoked when a user runs the ping command
	callback: async ({ interaction }) => {
		try {
			const { options, user, channel, guild, member, client } = interaction;

			const commandType = options.getSubcommand();

			let mentionedMember = options.getMember("utilisateur");
			const mentionedUserId = options.getString("identifiant");
			let durationInStr = options.getString("duree");
			const raison = options.getString("raison") ?? "Non-mentionnée";

			isStaff(member);

			if (commandType !== "unban" && !mentionedMember)
				throw new Error("Merci de mentionner un membre valide");

			if (mentionedMember) isAboveBot(client, mentionedMember, guild);

			if (commandType === "kick"){
				console.log(`[${interaction.guild}] ${interaction.user.displayName}(${interaction.user.username}) utilise la commande 'kick' sur l'utilisateur ${mentionedMember}`);
				await mentionedMember.kick(raison);
			}

			if (commandType === "ban") {
				console.log(`[${interaction.guild}] ${interaction.user.displayName}(${interaction.user.username}) utilise la commande 'ban' sur l'utilisateur ${mentionedMember}`);
				if (!mentionedMember.bannable)
					throw new Error("Ce membre ne peut pas être banni");		
				await mentionedMember.ban({ raison });
			}

			if (commandType === "unban") {
				console.log(`[${interaction.guild}] ${interaction.user.displayName}(${interaction.user.username}) utilise la commande 'unban' sur l'utilisateur <@${mentionedUserId}>`);
				await guild.bans.fetch(mentionedUserId); // will throw error if no ban found
				mentionedMember = await guild.bans.remove(mentionedUserId, raison);
			}

			if (commandType === "time_out") {
				console.log(`[${interaction.guild}] ${interaction.user.displayName}(${interaction.user.username}) utilise la commande 'time_out' sur l'utilisateur ${mentionedMember}`);
				if (mentionedMember.isCommunicationDisabled())
					throw new Error("Ce membre est déjà muté");

				const durationInMs = parseToMs(durationInStr);
		
				await mentionedMember.disableCommunicationUntil(
					Date.now() + durationInMs,
					raison
				);
			}

			if (commandType === "untime_out") {
				console.log(`[${interaction.guild}] ${interaction.user.displayName}(${interaction.user.username}) utilise la commande 'untime_out' sur l'utilisateur ${mentionedMember}`);
				if (!mentionedMember.isCommunicationDisabled())
					throw new Error("Ce membre n'est actuellement pas muté");

				await mentionedMember.disableCommunicationUntil(null, raison);
			}

			await interaction.reply({
				content: "Action effectuée avec succès ✅",
				ephemeral: true,
			});

			// setup some content

			const title = `${modType[commandType]}`;

			let description = `**Cible** : ${mentionedMember} | **Modérateur** : ${user}\n`;

			durationInStr && (durationInStr = durationInStr.replace('s', 'sec'));
			durationInStr && (durationInStr = durationInStr.replace('m', 'min'));

			durationInStr && (description += `**Durée** : \`${durationInStr}\`\n`);
			description += `**Raison:** \`${raison}\``;

			const fields = [
				{ name: "Cible", value: `${mentionedMember}`, inline: false },
				{ name: "Modérateur", value: `${user}`, inline: false },
			];

			durationInStr &&
				fields.push({ name: "Durée", value: durationInStr, inline: false });

			fields.push({ name: "Raison", value: raison ?? "Non-mentionnée", inline: false });

			// generate embeds
			const embed = generateEmbed({
				title,
				description,
				thumbnail: mentionedMember.displayAvatarURL(),
			});

			// const logEmbed = generateEmbed({
			// 	title,
			// 	fields,
			// 	thumbnail: mentionedMember.displayAvatarURL(),
			// });

			await sendEmbedToChannel(embed, channel);
		} catch (error) {
			console.log(error);
			await handleInteractionError(error.message, interaction);
		}
	},
};

const { CommandType } = require("wokcommands");

const { generateEmbed, sendEmbedToChannel } = require("../../utility/embed");
const { isStaff, isAboveBot } = require("../../utility/perms");
const { handleInteractionError } = require("../../utility/interaction");
const { modType, logChannelId } = require("../../data/config.json");
const { parseToMs } = require("../../utility/date");

module.exports = {
	description: "Mod a member!",
	type: CommandType.SLASH,
	options: [
		{
			name: "kick",
			description: "kick a member",
			type: 1,
			options: [
				{
					name: "user",
					description: "member to kick",
					type: 6,
					required: true,
				},
				{
					name: "reason",
					description: "reason for kick",
					type: 3,
				},
			],
		},
		{
			name: "ban",
			description: "ban a member",
			type: 1,
			options: [
				{
					name: "user",
					description: "member to ban",
					type: 6,
					required: true,
				},
				{
					name: "reason",
					description: "reason for kick",
					type: 3,
				},
			],
		},
		{
			name: "unban",
			description: "unban a member",
			type: 1,
			options: [
				{
					name: "user_id",
					description: "member id to unban",
					type: 3,
					required: true,
				},
				{
					name: "reason",
					description: "reason for unban",
					type: 3,
				},
			],
		},
		{
			name: "time_out",
			description: "max limit: 28 days",
			type: 1,
			options: [
				{
					name: "user",
					description: "member to time out",
					type: 6,
					required: true,
				},
				{
					name: "duration",
					description: "Format (1s/3h/4d/2w)",
					type: 3,
					required: true,
				},
				{
					name: "reason",
					description: "reason for time out",
					type: 3,
				},
			],
		},
		{
			name: "untime_out",
			description: "untime_out a member",
			type: 1,
			options: [
				{
					name: "user",
					description: "member to act on",
					type: 6,
					required: true,
				},
				{
					name: "reason",
					description: "reason",
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

			let mentionedMember = options.getMember("user");
			const mentionedUserId = options.getString("user_id");
			const durationInStr = options.getString("duration");
			const reason = options.getString("reason") ?? "None";

			isStaff(member);

			if (commandType !== "unban" && !mentionedMember)
				throw new Error("Please mention correct member");

			if (mentionedMember) isAboveBot(client, mentionedMember, guild);

			if (commandType === "kick") await mentionedMember.kick(reason);

			if (commandType === "ban") {
				if (!mentionedMember.bannable)
					throw new Error("Member is not bannable.");
				await mentionedMember.ban({ reason });
			}

			if (commandType === "unban") {
				await guild.bans.fetch(mentionedUserId); // will throw error if no ban found
				mentionedMember = await guild.bans.remove(mentionedUserId, reason);
			}

			if (commandType === "time_out") {
				if (mentionedMember.isCommunicationDisabled())
					throw new Error("Member is already muted");

				const durationInMs = parseToMs(durationInStr);

				await mentionedMember.disableCommunicationUntil(
					Date.now() + durationInMs,
					reason
				);
			}

			if (commandType === "untime_out") {
				if (!mentionedMember.isCommunicationDisabled())
					throw new Error("Member is not muted");

				await mentionedMember.disableCommunicationUntil(null, reason);
			}

			await interaction.reply({
				content: "Success!",
				ephemeral: true,
			});

			// setup some content

			const title = `User ${modType[commandType]}`;

			let description = `**Target**: ${mentionedMember} | **Mod**: ${user}\n`;

			durationInStr && (description += `**Duration**: \`${durationInStr}\`\n`);
			description += `**Reason:** \`${reason}\``;

			const fields = [
				{ name: "Target", value: `${mentionedMember}`, inline: false },
				{ name: "Moderator", value: `${user}`, inline: false },
			];

			durationInStr &&
				fields.push({ name: "Duration", value: durationInStr, inline: false });

			fields.push({ name: "Reason", value: reason ?? "None", inline: false });

			// generate embeds
			const embed = generateEmbed({
				title,
				description,
				thumbnail: mentionedMember.displayAvatarURL(),
			});

			const logEmbed = generateEmbed({
				title,
				fields,
				thumbnail: mentionedMember.displayAvatarURL(),
			});

			// send em
			const logChannel = await guild.channels.fetch(logChannelId);

			await Promise.all([
				sendEmbedToChannel(embed, channel),
				sendEmbedToChannel(logEmbed, logChannel),
			]);
		} catch (error) {
			console.log(error);
			await handleInteractionError(error.message, interaction);
		}
	},
};

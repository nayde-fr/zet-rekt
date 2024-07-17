const { PermissionFlagsBits } = require("discord.js");
const { staffRoles } = require("./../data/config.json");

const isAdmin = (member) =>
	member.permissions.has(PermissionFlagsBits.Administrator);

const isStaff = function (member) {
	const hasAnyStaffRole = staffRoles.some((role) =>
		member.roles.cache.has(role)
	);

	if (!hasAnyStaffRole && !isAdmin(member)) throw new Error("Vous n'êtes pas autorisé à utiliser cette commande");
};

const isAboveBot = function (bot, member, guild) {
	const botMember = guild.members.cache.get(bot.user.id);

	if (
		botMember.roles.highest.position <= member.roles.highest.position ||
		isAdmin(member)
	)
		throw new Error("Vous ne pouvez pas effectuer cette action sur ce membre car son rôle est plus elevé que celui du bot");
};

module.exports = { isStaff, isAboveBot };

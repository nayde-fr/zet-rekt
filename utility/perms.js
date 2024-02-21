const { PermissionFlagsBits } = require("discord.js");
const { staffRoles } = require("./../data/config.json");

const isAdmin = (member) =>
	member.permissions.has(PermissionFlagsBits.Administrator);

const isStaff = function (member) {
	const hasAnyStaffRole = staffRoles.some((role) =>
		member.roles.cache.has(role)
	);

	if (!hasAnyStaffRole && !isAdmin(member)) throw new Error("Staff only");
};

const isAboveBot = function (bot, member, guild) {
	const botMember = guild.members.cache.get(bot.user.id);

	if (
		botMember.roles.highest.position <= member.roles.highest.position ||
		isAdmin(member)
	)
		throw new Error("You can not perform action on this member");
};

module.exports = { isStaff, isAboveBot };

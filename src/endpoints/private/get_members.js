'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "roleId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "status", type: "string", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			// Get specific member
			if (params.memberId) {
				const member = await global.guild.members.fetch(params.memberId);
				if (!member) {
					return { status_code: 404, error: 'Member not found' };
				}

				return {
					status_code: 200,
					member: {
						id: member.id,
						username: member.user.username,
						discriminator: member.user.discriminator,
						displayName: member.displayName,
						nickname: member.nickname,
						avatarURL: member.user.displayAvatarURL({ size: 256 }),
						bot: member.user.bot,
						joinedAt: member.joinedTimestamp,
						accountCreatedAt: member.user.createdTimestamp,
						premiumSince: member.premiumSinceTimestamp,
						roles: member.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
						status: member.presence?.status || 'offline',
						activities: member.presence?.activities?.map(a => ({ name: a.name, type: a.type })) || [],
						permissions: member.permissions.toArray(),
						isOwner: member.id === global.guild.ownerId
					}
				};
			}

			// Get all members
			let members = Array.from(global.guild.members.cache.values());

			// Filter by role if specified
			if (params.roleId) {
				const role = global.guild.roles.cache.get(params.roleId);
				if (!role) {
					return { status_code: 404, error: 'Role not found' };
				}
				members = members.filter(m => m.roles.cache.has(params.roleId));
			}

			// Filter by status if specified
			if (params.status) {
				members = members.filter(m => (m.presence?.status || 'offline') === params.status);
			}

			const membersList = members.map(member => ({
				id: member.id,
				username: member.user.username,
				displayName: member.displayName,
				nickname: member.nickname,
				avatarURL: member.user.displayAvatarURL({ size: 128 }),
				bot: member.user.bot,
				status: member.presence?.status || 'offline',
				roles: member.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name })),
				isOwner: member.id === global.guild.ownerId
			}));

			return {
				status_code: 200,
				members: membersList,
				count: membersList.length
			};
		} catch (err) {
			console.reportError('Error in get_members:', err);
			return { status_code: 500, error: err.message };
		}
	},
};



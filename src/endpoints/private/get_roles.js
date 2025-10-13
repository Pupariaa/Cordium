'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "roleId", type: "string", mandatory: false, range: [17, 20] },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			// Get specific role
			if (params.roleId) {
				const role = global.guild.roles.cache.get(params.roleId);
				if (!role) {
					return { status_code: 404, error: 'Role not found' };
				}

				return {
					status_code: 200,
					role: {
						id: role.id,
						name: role.name,
						color: role.color,
						hexColor: role.hexColor,
						position: role.position,
						permissions: role.permissions.toArray(),
						hoist: role.hoist,
						managed: role.managed,
						mentionable: role.mentionable,
						memberCount: role.members.size,
						createdAt: role.createdTimestamp
					}
				};
			}

			// Get all roles
			const roles = [];
			global.guild.roles.cache.forEach(role => {
				roles.push({
					id: role.id,
					name: role.name,
					color: role.color,
					hexColor: role.hexColor,
					position: role.position,
					hoist: role.hoist,
					managed: role.managed,
					mentionable: role.mentionable,
					memberCount: role.members.size
				});
			});

			roles.sort((a, b) => b.position - a.position);

			return {
				status_code: 200,
				roles: roles,
				count: roles.length
			};
		} catch (err) {
			console.reportError('Error in get_roles:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


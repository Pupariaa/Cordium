'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "roleId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "name", type: "string", mandatory: false, range: [1, 100] },
		{ name: "color", type: "string", mandatory: false },
		{ name: "hoist", type: "boolean", mandatory: false },
		{ name: "mentionable", type: "boolean", mandatory: false },
		{ name: "permissions", type: "array", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const role = global.guild.roles.cache.get(params.roleId);
			if (!role) {
				return { status_code: 404, error: 'Role not found' };
			}

			const updates = {};
			if (params.name) updates.name = params.name;
			if (params.color) updates.color = params.color;
			if (params.hoist !== undefined) updates.hoist = params.hoist;
			if (params.mentionable !== undefined) updates.mentionable = params.mentionable;
			if (params.permissions) updates.permissions = params.permissions;

			await role.edit(updates);

			return {
				status_code: 200,
				role: {
					id: role.id,
					name: role.name,
					color: role.color,
					hexColor: role.hexColor
				}
			};
		} catch (err) {
			console.reportError('Error in edit_role:', err);
			return { status_code: 500, error: err.message };
		}
	},
};








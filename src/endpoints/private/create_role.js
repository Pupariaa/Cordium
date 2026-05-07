'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "name", type: "string", mandatory: true, range: [1, 100] },
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

			const roleData = {
				name: params.name,
				color: params.color || '#99AAB5',
				hoist: params.hoist || false,
				mentionable: params.mentionable || false
			};

			if (params.permissions) {
				roleData.permissions = params.permissions;
			}

			const role = await global.guild.roles.create(roleData);

			return {
				status_code: 201,
				role: {
					id: role.id,
					name: role.name,
					color: role.color,
					hexColor: role.hexColor,
					position: role.position
				}
			};
		} catch (err) {
			console.reportError('Error in create_role:', err);
			return { status_code: 500, error: err.message };
		}
	},
};








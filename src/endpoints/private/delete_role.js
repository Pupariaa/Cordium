'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "roleId", type: "string", mandatory: true, range: [17, 20] },
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

			if (role.managed) {
				return { status_code: 403, error: 'Cannot delete a managed role' };
			}

			if (role.id === global.guild.id) {
				return { status_code: 403, error: 'Cannot delete the @everyone role' };
			}

			const roleName = role.name;
			await role.delete();

			return {
				status_code: 200,
				deleted: {
					id: params.roleId,
					name: roleName
				}
			};
		} catch (err) {
			console.reportError('Error in delete_role:', err);
			return { status_code: 500, error: err.message };
		}
	},
};








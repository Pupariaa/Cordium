'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "memberId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "roleId", type: "string", mandatory: true, range: [17, 20] },
		{ name: "action", type: "string", mandatory: false }, // 'add' or 'remove'
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const member = await global.guild.members.fetch(params.memberId);
			if (!member) {
				return { status_code: 404, error: 'Member not found' };
			}

			const role = global.guild.roles.cache.get(params.roleId);
			if (!role) {
				return { status_code: 404, error: 'Role not found' };
			}

			const action = params.action || 'add';

			if (action === 'add') {
				await member.roles.add(role);
			} else if (action === 'remove') {
				await member.roles.remove(role);
			} else {
				return { status_code: 400, error: 'Action must be "add" or "remove"' };
			}

			return {
				status_code: 200,
				member: {
					id: member.id,
					displayName: member.displayName,
					roles: member.roles.cache.map(r => ({ id: r.id, name: r.name }))
				}
			};
		} catch (err) {
			console.reportError('Error in assign_role:', err);
			return { status_code: 500, error: err.message };
		}
	},
};


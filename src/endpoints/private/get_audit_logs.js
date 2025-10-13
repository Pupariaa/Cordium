'use strict';

module.exports = {
	listen: true,
	report: true,
	params: [
		{ name: "key", type: "string", mandatory: false, length: 32 },
		{ name: "limit", type: "int", mandatory: false, range: [1, 100] },
		{ name: "userId", type: "string", mandatory: false, range: [17, 20] },
		{ name: "actionType", type: "int", mandatory: false },
	],
	handler: async function (params) {
		try {
			if (!global.guild) {
				return { status_code: 503, error: 'Bot not connected to guild' };
			}

			const fetchOptions = {
				limit: params.limit || 50
			};

			if (params.userId) {
				fetchOptions.user = params.userId;
			}

			if (params.actionType) {
				fetchOptions.type = params.actionType;
			}

			const auditLogs = await global.guild.fetchAuditLogs(fetchOptions);

			const logs = auditLogs.entries.map(entry => ({
				id: entry.id,
				actionType: entry.actionType,
				targetType: entry.targetType,
				targetId: entry.targetId,
				executorId: entry.executor?.id,
				executorUsername: entry.executor?.username,
				reason: entry.reason,
				changes: entry.changes,
				createdAt: entry.createdTimestamp
			}));

			return {
				status_code: 200,
				logs: logs,
				count: logs.length
			};
		} catch (err) {
			console.reportError('Error in get_audit_logs:', err);
			return { status_code: 500, error: err.message };
		}
	},
};



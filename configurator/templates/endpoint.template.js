'use strict';

const path = require('path');

const endpointName = path.basename(__filename, path.extname(__filename));

module.exports = {
	type: 'private',
	name: endpointName,
	method: 'GET',
	callback: async function (req, res) {
		try {
			const { param } = req.query;
			
			res.json({
				success: true,
				message: 'Endpoint working',
				data: { param }
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				error: error.message
			});
		}
	}
};



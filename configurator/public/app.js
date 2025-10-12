let currentTheme = 'dark';
let currentEditor = null;
let currentConfig = {};
let currentPage = 'setup';

document.addEventListener('DOMContentLoaded', async () => {
	initTheme();
	const statusResponse = await fetch('/api/config/status');
	const statusData = await statusResponse.json();

	if (statusData.configured) {
		initDashboard();
		const savedPage = localStorage.getItem('currentPage') || 'server';
		loadPage(savedPage);
		document.querySelectorAll('.nav-link').forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('data-page') === savedPage) {
				link.classList.add('active');
			}
		});
	} else {
		initSetupWizard();
	}
});

function initSetupWizard() {
	document.body.classList.add('setup-mode');
	document.body.classList.remove('dashboard-mode');
	document.getElementById('pageTitle').textContent = 'Cordium Setup';
	document.getElementById('setupWizard').style.display = 'block';
	document.getElementById('dashboard').style.display = 'none';
	renderSetupWizard();
}

function initDashboard() {
	document.body.classList.remove('setup-mode');
	document.body.classList.add('dashboard-mode');
	document.getElementById('pageTitle').textContent = 'Cordium Manager';
	document.getElementById('setupWizard').style.display = 'none';
	document.getElementById('dashboard').style.display = 'block';
	checkConfigStatus();
	initNavigation();
}

function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'dark';
	setTheme(savedTheme);
}

function setTheme(theme) {
	currentTheme = theme;
	document.documentElement.setAttribute('data-bs-theme', theme);
	localStorage.setItem('theme', theme);

	const icon = document.getElementById('themeIcon');
	if (theme === 'dark') {
		icon.className = 'bi bi-sun-fill';
	} else {
		icon.className = 'bi bi-moon-fill';
	}

	if (currentEditor) {
		currentEditor.setOption('theme', theme === 'dark' ? 'dracula' : 'elegant');
	}
}

async function renderSetupWizard() {
	const response = await fetch('/api/config');
	const config = await response.json();
	let setupStep = 1;

	const wizardContainer = document.getElementById('setupWizard');
	wizardContainer.innerHTML = `
		<div class="setup-wizard">
			<div class="wizard-header">
				<div class="container">
					<div class="text-center">
						<i class="bi bi-lightning-charge-fill text-warning" style="font-size: 2.5rem;"></i>
						<h1 class="fw-bold mt-2 text-gradient" style="font-size: 2rem;">Welcome to Cordium</h1>
						<p class="text-muted mb-0" style="font-size: 0.95rem;">Let's get your Discord bot up and running in just a few steps</p>
					</div>
				</div>
			</div>
			
			<div class="container py-3" style="flex: 1; display: flex; flex-direction: column;">
				<div class="row justify-content-center" style="flex: 1;">
					<div class="col-lg-8" style="display: flex; flex-direction: column;">
						<div class="wizard-steps mb-3">
							<div class="step active" data-step="1">
								<div class="step-number">1</div>
								<div class="step-label">Discord Setup</div>
							</div>
							<div class="step-line"></div>
							<div class="step" data-step="2">
								<div class="step-number">2</div>
								<div class="step-label">Database</div>
							</div>
							<div class="step-line"></div>
							<div class="step" data-step="3">
								<div class="step-number">3</div>
								<div class="step-label">Redis</div>
							</div>
							<div class="step-line"></div>
							<div class="step" data-step="4">
								<div class="step-number">4</div>
								<div class="step-label">Complete</div>
							</div>
						</div>

						<div class="wizard-content" style="flex: 1;">
							<div id="wizardStep1" style="width: 100%;">
								<div class="card shadow-lg">
									<div class="card-body">
										<h3>Discord Bot Configuration</h3>
										<p class="text-muted">Connect your Discord bot credentials</p>
										
										<form id="wizardDiscordForm">
											<div class="mb-3">
												<label class="form-label fw-bold">Bot Token</label>
												<input type="password" class="form-control" id="wizard_client_token" value="${config.client_token || ''}" required>
												<small class="form-text text-muted">Developer Portal > Bot > Reset Token</small>
											</div>
											<div class="mb-3">
												<label class="form-label fw-bold">Client ID</label>
												<input type="text" class="form-control" id="wizard_client_id" value="${config.client_id || ''}" required>
												<small class="form-text text-muted">Developer Portal > General Information</small>
											</div>
											<div class="mb-3">
												<label class="form-label fw-bold">Guild ID (Server ID)</label>
												<input type="text" class="form-control" id="wizard_discord_guild_id" value="${config.discord_guild_id || ''}" required>
												<small class="form-text text-muted">Right-click server > Copy Server ID</small>
											</div>
											
											<div class="alert alert-warning py-2">
												<small><strong>Enable Intents:</strong> Presence, Server Members, Message Content</small>
											</div>

											<div id="wizardInviteLink" class="alert alert-info py-2" style="display: none;">
												<small><strong>Invite Link:</strong></small>
												<div class="input-group input-group-sm mt-1">
													<input type="text" class="form-control" id="wizardInviteLinkInput" readonly>
													<button class="btn btn-primary" type="button" id="wizardCopyInviteBtn">
														<i class="bi bi-clipboard"></i>
													</button>
												</div>
											</div>

											<div class="d-grid mt-3">
												<button type="submit" class="btn btn-primary">
													Continue to Database Setup <i class="bi bi-arrow-right ms-2"></i>
												</button>
											</div>
										</form>
									</div>
								</div>
							</div>

							<div id="wizardStep2" style="display: none; width: 100%;">
								<div class="card shadow-lg">
									<div class="card-body">
										<h3>Database Configuration</h3>
										<p class="text-muted">Optional: MySQL/MariaDB for event logging</p>
										
										<form id="wizardDatabaseForm">
											<div class="row">
												<div class="col-md-6 mb-2">
													<label class="form-label fw-bold">Host</label>
													<input type="text" class="form-control" id="wizard_db_host" value="${config.db_host || ''}" placeholder="localhost">
												</div>
												<div class="col-md-6 mb-2">
													<label class="form-label fw-bold">Database Name</label>
													<input type="text" class="form-control" id="wizard_db_name" value="${config.db_name || ''}" placeholder="cordium_events">
												</div>
											</div>
											<div class="row">
												<div class="col-md-4 mb-2">
													<label class="form-label fw-bold">Port</label>
													<input type="number" class="form-control" id="wizard_db_port" value="${config.db_port || ''}" placeholder="3306">
												</div>
												<div class="col-md-4 mb-2">
													<label class="form-label fw-bold">User</label>
													<input type="text" class="form-control" id="wizard_db_user" value="${config.db_user || ''}" placeholder="username">
												</div>
												<div class="col-md-4 mb-2">
													<label class="form-label fw-bold">Password</label>
													<input type="password" class="form-control" id="wizard_db_pass" value="${config.db_pass || ''}" placeholder="password">
												</div>
											</div>
											
											<div id="wizardDbTestResult" class="mb-2" style="display: none; font-size: 0.85rem;"></div>
											
											<div class="d-flex gap-2 mt-3">
												<button type="button" class="btn btn-outline-light" onclick="wizardGoToStep(1)">
													<i class="bi bi-arrow-left"></i>
												</button>
												<button type="button" class="btn btn-info flex-fill" id="wizardTestDbBtn">
													<i class="bi bi-wifi me-1"></i> Test
												</button>
												<button type="submit" class="btn btn-primary flex-fill">
													Continue <i class="bi bi-arrow-right"></i>
												</button>
											</div>
											<button type="button" class="btn btn-link w-100 p-1 mt-1" onclick="wizardSkipDatabase()" style="font-size: 0.85rem;">
												Skip database
											</button>
										</form>
									</div>
								</div>
							</div>

							<div id="wizardStep3" style="display: none; width: 100%;">
								<div class="card shadow-lg">
									<div class="card-body">
										<h3>Redis Cache Configuration</h3>
										<p class="text-muted">Optional: Redis for ultra-fast caching</p>
										
										<form id="wizardRedisForm">
											<div class="row">
												<div class="col-md-6 mb-2">
													<label class="form-label fw-bold">Host</label>
													<input type="text" class="form-control" id="wizard_redis_host" value="${config.redis_host || ''}" placeholder="localhost">
												</div>
												<div class="col-md-6 mb-2">
													<label class="form-label fw-bold">Port</label>
													<input type="number" class="form-control" id="wizard_redis_port" value="${config.redis_port || ''}" placeholder="6379">
												</div>
											</div>
											<div class="row">
												<div class="col-md-6 mb-2">
													<label class="form-label fw-bold">Password</label>
													<input type="password" class="form-control" id="wizard_redis_password" value="${config.redis_password || ''}" placeholder="Optional">
												</div>
												<div class="col-md-6 mb-2">
													<label class="form-label fw-bold">Database Number</label>
													<input type="number" class="form-control" id="wizard_redis_db" value="${config.redis_db || ''}" placeholder="0">
												</div>
											</div>
											
											<div class="alert alert-info py-2">
												<small><strong>What is Redis?</strong> In-memory cache for faster data access and reduced database load</small>
											</div>
											
											<div id="wizardRedisTestResult" class="mb-2" style="display: none; font-size: 0.85rem;"></div>
											
											<div class="d-flex gap-2 mt-3">
												<button type="button" class="btn btn-outline-light" onclick="wizardGoToStep(2)">
													<i class="bi bi-arrow-left"></i>
												</button>
												<button type="button" class="btn btn-info flex-fill" id="wizardTestRedisBtn">
													<i class="bi bi-wifi me-1"></i> Test
												</button>
												<button type="submit" class="btn btn-success flex-fill">
													Complete <i class="bi bi-check"></i>
												</button>
											</div>
											<button type="button" class="btn btn-link w-100 p-1 mt-1" onclick="wizardSkipRedis()" style="font-size: 0.85rem;">
												Skip Redis
											</button>
										</form>
									</div>
								</div>
							</div>

							<div id="wizardStep4" style="display: none; width: 100%;">
								<div class="card shadow-lg border-success">
									<div class="card-body text-center">
										<i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
										<h3 class="mt-3 mb-2">All Set!</h3>
										<p class="text-muted mb-3">Your bot is configured and ready to launch.</p>
										
										<div class="alert alert-info text-start py-2 mb-3">
											<strong style="font-size: 0.9rem;">Next Steps:</strong>
											<ol class="mb-0 mt-1" style="font-size: 0.85rem;">
												<li>Close this window (Ctrl+C in terminal)</li>
												<li>Restart with <code>npm start</code></li>
												<li>Dashboard will be at <code>http://localhost:3001</code></li>
											</ol>
										</div>

										<div class="d-grid">
											<button class="btn btn-success" onclick="window.location.reload()">
												<i class="bi bi-arrow-clockwise me-2"></i>Reload Dashboard
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	document.getElementById('wizard_client_id').addEventListener('input', updateWizardInviteLink);
	updateWizardInviteLink();

	document.getElementById('wizardCopyInviteBtn').addEventListener('click', () => {
		const input = document.getElementById('wizardInviteLinkInput');
		input.select();
		document.execCommand('copy');
		showNotification('Invite link copied to clipboard!', 'success');
	});

	document.getElementById('wizardDiscordForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await saveWizardConfig(['client_token', 'client_id', 'discord_guild_id'], 'wizard_');
		wizardGoToStep(2);
	});

	document.getElementById('wizardDatabaseForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await saveWizardConfig(['db_host', 'db_name', 'db_port', 'db_user', 'db_pass'], 'wizard_');
		wizardGoToStep(3);
	});

	document.getElementById('wizardTestDbBtn').addEventListener('click', async () => {
		await testWizardDatabaseConnection();
	});

	document.getElementById('wizardRedisForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await saveWizardConfig(['redis_host', 'redis_port', 'redis_password', 'redis_db'], 'wizard_');
		wizardGoToStep(4);
	});

	document.getElementById('wizardTestRedisBtn').addEventListener('click', async () => {
		await testWizardRedisConnection();
	});
}

function updateWizardInviteLink() {
	const clientId = document.getElementById('wizard_client_id').value.trim();
	const inviteLinkDiv = document.getElementById('wizardInviteLink');
	const inviteLinkInput = document.getElementById('wizardInviteLinkInput');

	if (clientId) {
		const permissions = '8';
		const scopes = 'bot%20applications.commands';
		const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}&integration_type=0`;
		inviteLinkInput.value = inviteUrl;
		inviteLinkDiv.style.display = 'block';
	} else {
		inviteLinkDiv.style.display = 'none';
	}
}

function wizardGoToStep(step) {
	document.getElementById('wizardStep1').style.display = step === 1 ? 'block' : 'none';
	document.getElementById('wizardStep2').style.display = step === 2 ? 'block' : 'none';
	document.getElementById('wizardStep3').style.display = step === 3 ? 'block' : 'none';
	document.getElementById('wizardStep4').style.display = step === 4 ? 'block' : 'none';

	document.querySelectorAll('.wizard-steps .step').forEach(s => {
		const stepNum = parseInt(s.getAttribute('data-step'));
		s.classList.toggle('active', stepNum <= step);
		s.classList.toggle('completed', stepNum < step);
	});
}

async function wizardSkipDatabase() {
	if (confirm('Skip database configuration? You can add it later in Settings.')) {
		wizardGoToStep(3);
	}
}

async function wizardSkipRedis() {
	if (confirm('Skip Redis configuration? You can add it later in Settings.')) {
		wizardGoToStep(4);
	}
}

async function saveWizardConfig(fields, prefix) {
	try {
		showLoading();
		const response = await fetch('/api/config');
		const currentConfig = await response.json();

		fields.forEach(field => {
			const element = document.getElementById(prefix + field);
			if (element) {
				currentConfig[field] = element.value;
			}
		});

		const saveResponse = await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(currentConfig)
		});

		const data = await saveResponse.json();
		if (data.success) {
			showNotification('Configuration saved!', 'success');
		} else {
			showNotification('Error saving configuration', 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	} finally {
		hideLoading();
	}
}

async function testWizardDatabaseConnection() {
	const dbConfig = {
		host: document.getElementById('wizard_db_host').value,
		name: document.getElementById('wizard_db_name').value,
		port: document.getElementById('wizard_db_port').value,
		user: document.getElementById('wizard_db_user').value,
		pass: document.getElementById('wizard_db_pass').value
	};

	if (!dbConfig.host || !dbConfig.name) {
		showNotification('Please fill in at least host and database name', 'warning');
		return;
	}

	const resultDiv = document.getElementById('wizardDbTestResult');
	resultDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Testing connection...';
	resultDiv.className = 'alert alert-info mb-2';
	resultDiv.style.display = 'block';

	try {
		const response = await fetch('/api/test-db', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dbConfig)
		});

		const data = await response.json();

		if (data.success) {
			resultDiv.className = 'alert alert-success mb-2';
			resultDiv.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Database connection successful!';
		} else {
			resultDiv.className = 'alert alert-danger mb-2';
			resultDiv.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i>Connection failed: ${data.error}`;
		}
	} catch (err) {
		resultDiv.className = 'alert alert-danger mb-2';
		resultDiv.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i>Error: ${err.message}`;
	}
}

async function testWizardRedisConnection() {
	const redisConfig = {
		host: document.getElementById('wizard_redis_host').value,
		port: document.getElementById('wizard_redis_port').value,
		password: document.getElementById('wizard_redis_password').value,
		db: document.getElementById('wizard_redis_db').value
	};

	if (!redisConfig.host) {
		showNotification('Please fill in at least the host', 'warning');
		return;
	}

	const resultDiv = document.getElementById('wizardRedisTestResult');
	resultDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Testing connection...';
	resultDiv.className = 'alert alert-info mb-2';
	resultDiv.style.display = 'block';

	try {
		const response = await fetch('/api/test-redis', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(redisConfig)
		});

		const data = await response.json();

		if (data.success) {
			resultDiv.className = 'alert alert-success mb-2';
			resultDiv.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Redis connection successful!';
		} else {
			resultDiv.className = 'alert alert-danger mb-2';
			resultDiv.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i>Connection failed: ${data.error}`;
		}
	} catch (err) {
		resultDiv.className = 'alert alert-danger mb-2';
		resultDiv.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i>Error: ${err.message}`;
	}
}

function initNavigation() {
	const themeToggle = document.getElementById('themeToggle');
	if (themeToggle && !themeToggle.hasAttribute('data-initialized')) {
		themeToggle.setAttribute('data-initialized', 'true');
		themeToggle.addEventListener('click', () => {
			const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
			setTheme(newTheme);
		});
	}

	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', async (e) => {
			e.preventDefault();
			const page = link.getAttribute('data-page');

			document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
			link.classList.add('active');

			loadPage(page);
		});
	});
}

async function checkConfigStatus() {
	try {
		const response = await fetch('/api/config/status');
		const data = await response.json();
		return data.configured;
	} catch (err) {
		console.error('Failed to check config status:', err);
		return false;
	}
}

function filterServerContent() {
	const searchTerm = document.getElementById('serverSearch')?.value.toLowerCase() || '';

	// Get active tab
	const activeTab = document.querySelector('#serverTabs .nav-link.active')?.id;

	if (!activeTab || !searchTerm) {
		// Show all items if no search
		document.querySelectorAll('.list-group-item').forEach(item => {
			item.style.display = '';
		});
		return;
	}

	let items;
	if (activeTab === 'channels-tab') {
		items = document.querySelectorAll('#channels .list-group-item');
	} else if (activeTab === 'roles-tab') {
		items = document.querySelectorAll('#roles .list-group-item');
	} else if (activeTab === 'members-tab') {
		items = document.querySelectorAll('#members .list-group-item');
	} else if (activeTab === 'messages-tab') {
		items = document.querySelectorAll('#messagesContainer .list-group-item');
	}

	if (items) {
		items.forEach(item => {
			let searchableText = '';

			// Get all text content
			searchableText += item.textContent.toLowerCase();

			// Get all data attributes
			for (let attr of item.attributes) {
				if (attr.name.startsWith('data-')) {
					searchableText += ' ' + attr.value.toLowerCase();
				}
			}

			// Get onclick attributes (for IDs in function calls)
			const onclickAttr = item.getAttribute('onclick');
			if (onclickAttr) {
				searchableText += ' ' + onclickAttr.toLowerCase();
			}

			// Search in all buttons inside the item
			const buttons = item.querySelectorAll('button');
			buttons.forEach(btn => {
				const btnOnclick = btn.getAttribute('onclick');
				if (btnOnclick) {
					// Extract IDs from function calls like copyChannelId('123456')
					const matches = btnOnclick.match(/'([^']+)'/g);
					if (matches) {
						matches.forEach(match => {
							searchableText += ' ' + match.replace(/'/g, '').toLowerCase();
						});
					}
				}
			});

			// For messages, also search in message ID attribute
			if (activeTab === 'messages-tab') {
				const messageId = item.getAttribute('data-message-id');
				if (messageId) {
					searchableText += ' ' + messageId.toLowerCase();
				}
			}

			// Show/hide based on search
			item.style.display = searchableText.includes(searchTerm) ? '' : 'none';
		});
	}
}

function clearServerSearch() {
	const searchInput = document.getElementById('serverSearch');
	if (searchInput) {
		searchInput.value = '';
		filterServerContent();
	}
}

async function showReactionDetails(messageId, emoji) {
	try {
		const response = await fetch(`/api/server/message-history?messageId=${messageId}`);
		const data = await response.json();

		if (data.error) {
			showToast('Unable to load reaction details', 'warning');
			return;
		}

		// Filter reactions for this specific emoji
		const emojiReactions = data.reactions.filter(r =>
			r.emoji === emoji && r.action === 'add'
		);

		if (emojiReactions.length === 0) {
			showToast('No reaction history found', 'info');
			return;
		}

		// Group by user (keep only latest action)
		const userReactions = {};
		emojiReactions.forEach(r => {
			userReactions[r.userId] = r;
		});

		const users = Object.values(userReactions);

		let detailsHTML = `
			<div class="modal fade show" id="reactionDetailsModal" tabindex="-1" style="display: block;" aria-modal="true">
				<div class="modal-dialog modal-sm">
					<div class="modal-content bg-dark text-white">
						<div class="modal-header">
							<h6 class="modal-title">
								${emoji} Reactions (${users.length})
							</h6>
							<button type="button" class="btn-close btn-close-white" onclick="closeReactionDetails()"></button>
						</div>
						<div class="modal-body p-2">
							<div class="list-group list-group-flush">
								${users.map(u => `
									<div class="list-group-item bg-dark text-white border-secondary py-2 px-3">
										<strong>${u.username}</strong>
									</div>
								`).join('')}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-backdrop fade show"></div>
		`;

		document.body.insertAdjacentHTML('beforeend', detailsHTML);
	} catch (err) {
		showToast('Error loading reaction details', 'danger');
	}
}

function closeReactionDetails() {
	const modal = document.getElementById('reactionDetailsModal');
	const backdrop = document.querySelectorAll('.modal-backdrop');
	if (modal) modal.remove();
	backdrop.forEach(b => b.remove());
}

async function reloadServerOverview() {
	await loadPage('server');
	showToast('Server overview reloaded', 'success');
}

async function loadPage(page) {
	currentPage = page;
	localStorage.setItem('currentPage', page);
	const content = document.getElementById('content');
	showLoading();

	try {
		switch (page) {
			case 'config':
				await renderConfigPage(content);
				break;
			case 'server':
				await renderServerPage(content);
				break;
			case 'commands':
				await renderFilesPage(content, 'commands', 'Commands');
				break;
			case 'events':
				await renderFilesPage(content, 'events', 'Events');
				break;
			case 'endpoints':
				await renderFilesPage(content, 'endpoints', 'Endpoints');
				break;
			case 'sandbox':
				await renderFilesPage(content, 'sandbox', 'Sandbox');
				break;
		}
	} catch (err) {
		content.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Error loading page: ${err.message}
            </div>
        `;
	} finally {
		hideLoading();
	}
}

async function renderServerPage(container) {
	try {
		const response = await fetch('/api/server/info');
		const serverInfo = await response.json();

		if (serverInfo.error) {
			container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">
							<i class="bi bi-server me-2"></i>
							Server Overview
                </h2>
						<div class="alert alert-warning" role="alert">
							<i class="bi bi-exclamation-triangle-fill me-2"></i>
							${serverInfo.error}
							<br><small>Make sure the bot is running and connected to the server.</small>
                    </div>
                    </div>
            </div>
			`;
			return;
		}

		const channelTypeNames = {
			0: 'Text',
			2: 'Voice',
			4: 'Category',
			5: 'News',
			13: 'Stage',
			15: 'Forum'
		};

		const channelTypeIcons = {
			0: 'bi-hash',
			2: 'bi-volume-up',
			4: 'bi-folder',
			5: 'bi-megaphone',
			13: 'bi-broadcast',
			15: 'bi-chat-square-text'
		};

		const categories = serverInfo.channels.filter(c => c.type === 4);
		const noCategory = serverInfo.channels.filter(c => c.type !== 4 && !c.parentId);

		let channelsHTML = `
			<div class="list-group-item bg-primary text-white d-flex justify-content-between align-items-center">
				<div>
					<strong>Create New Channel/Category</strong>
        </div>
				<button class="btn btn-sm btn-light" onclick="createChannel()" title="Create channel">
					<i class="bi bi-plus-circle"></i> New Channel
				</button>
                            </div>
		`;

		noCategory.forEach(channel => {
			const icon = channelTypeIcons[channel.type] || 'bi-circle';
			const typeName = channelTypeNames[channel.type] || 'Unknown';
			const sendAction = channel.type === 0 ? `
				<button onclick="sendMessageToChannel('${channel.id}', '${channel.name}')">
					<i class="bi bi-send"></i>
					<span>Send Message</span>
				</button>
			` : '';
			channelsHTML += `
				<div class="list-group-item d-flex justify-content-between align-items-center">
					<div>
						<i class="bi ${icon} me-2"></i>
						<strong>${channel.name}</strong>
						<span class="badge bg-secondary ms-2">${typeName}</span>
						${channel.members !== null ? `<span class="badge bg-info ms-1">${channel.members} members</span>` : ''}
						${channel.topic ? `<br><small class="text-muted ms-4">${channel.topic}</small>` : ''}
                            </div>
					<div class="item-menu">
						<button class="item-menu-btn" onclick="toggleMenu(this)">
							<i class="bi bi-three-dots-vertical"></i>
						</button>
						<div class="item-menu-dropdown">
							${sendAction}
							${sendAction ? '<div class="divider"></div>' : ''}
							<button onclick="editChannel('${channel.id}', '${channel.name}', '${channel.type}', '${(channel.topic || '').replace(/'/g, "\\'")}')">
								<i class="bi bi-pencil"></i>
								<span>Edit</span>
							</button>
							<button onclick="copyChannelId('${channel.id}')">
								<i class="bi bi-clipboard"></i>
								<span>Copy ID</span>
							</button>
							<div class="divider"></div>
							<button class="text-danger" onclick="deleteChannel('${channel.id}', '${channel.name}')">
								<i class="bi bi-trash"></i>
								<span>Delete</span>
							</button>
                            </div>
                            </div>
                            </div>
			`;
		});

		categories.forEach(category => {
			const childChannels = serverInfo.channels.filter(c => c.parentId === category.id);

			channelsHTML += `
				<div class="list-group-item bg-body-secondary d-flex justify-content-between align-items-center">
					<div>
						<i class="bi bi-folder me-2"></i>
						<strong>${category.name.toUpperCase()}</strong>
						<span class="badge bg-secondary ms-2">${childChannels.length} channels</span>
                    </div>
					<div class="item-menu">
						<button class="item-menu-btn" onclick="toggleMenu(this)">
							<i class="bi bi-three-dots-vertical"></i>
                            </button>
						<div class="item-menu-dropdown">
							<button onclick="createChannel('${category.id}')">
								<i class="bi bi-plus-circle"></i>
								<span>Add Channel</span>
							</button>
							<button onclick="editChannel('${category.id}', '${category.name}', '4', '')">
								<i class="bi bi-pencil"></i>
								<span>Edit Category</span>
							</button>
							<div class="divider"></div>
							<button class="text-danger" onclick="deleteChannel('${category.id}', '${category.name}')">
								<i class="bi bi-trash"></i>
								<span>Delete Category</span>
							</button>
						</div>
					</div>
            </div>
			`;

			childChannels.forEach(channel => {
				const icon = channelTypeIcons[channel.type] || 'bi-circle';
				const typeName = channelTypeNames[channel.type] || 'Unknown';
				const sendAction = channel.type === 0 ? `
					<button onclick="sendMessageToChannel('${channel.id}', '${channel.name}')">
						<i class="bi bi-send"></i>
						<span>Send Message</span>
					</button>
				` : '';
				channelsHTML += `
					<div class="list-group-item ps-5 d-flex justify-content-between align-items-center">
						<div>
							<i class="bi ${icon} me-2"></i>
							${channel.name}
							<span class="badge bg-secondary ms-2">${typeName}</span>
							${channel.members !== null ? `<span class="badge bg-info ms-1">${channel.members} members</span>` : ''}
							${channel.topic ? `<br><small class="text-muted ms-4">${channel.topic}</small>` : ''}
                            </div>
						<div class="item-menu">
							<button class="item-menu-btn" onclick="toggleMenu(this)">
								<i class="bi bi-three-dots-vertical"></i>
							</button>
							<div class="item-menu-dropdown">
								${sendAction}
								${sendAction ? '<div class="divider"></div>' : ''}
								<button onclick="editChannel('${channel.id}', '${channel.name}', '${channel.type}', '${(channel.topic || '').replace(/'/g, "\\'")}')">
									<i class="bi bi-pencil"></i>
									<span>Edit</span>
								</button>
								<button onclick="copyChannelId('${channel.id}')">
                                    <i class="bi bi-clipboard"></i>
									<span>Copy ID</span>
								</button>
								<div class="divider"></div>
								<button class="text-danger" onclick="deleteChannel('${channel.id}', '${channel.name}')">
									<i class="bi bi-trash"></i>
									<span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
				`;
			});
		});

		let membersHTML = '';
		const statusIcons = {
			online: '<i class="bi bi-circle-fill text-success"></i>',
			idle: '<i class="bi bi-circle-fill text-warning"></i>',
			dnd: '<i class="bi bi-circle-fill text-danger"></i>',
			offline: '<i class="bi bi-circle text-secondary"></i>'
		};

		serverInfo.members.forEach(member => {
			const statusIcon = statusIcons[member.status] || statusIcons.offline;
			const ownerBadge = member.isOwner ? '<span class="badge bg-warning"><i class="bi bi-crown"></i> Owner</span>' : '';
			const botBadge = member.bot ? '<span class="badge bg-secondary"><i class="bi bi-robot"></i> Bot</span>' : '';
			const premiumBadge = member.premiumSince ? '<span class="badge bg-info"><i class="bi bi-gem"></i> Booster</span>' : '';

			const joinDate = new Date(member.joinedAt).toLocaleDateString();
			const accountAge = new Date(member.accountCreatedAt).toLocaleDateString();
			const accountDays = Math.floor((Date.now() - member.accountCreatedAt) / (1000 * 60 * 60 * 24));
			const memberDays = Math.floor((Date.now() - member.joinedAt) / (1000 * 60 * 60 * 24));

			const rolesDisplay = member.roles.map(r =>
				`<span class="badge" style="background-color: ${r.color};">${r.name}</span>`
			).join(' ');

			const activities = member.activities.length > 0 ?
				`<br><small class="text-muted"><i class="bi bi-controller"></i> ${member.activities.join(', ')}</small>` : '';

			const actionButtons = !member.isOwner ? `
				<div class="item-menu">
					<button class="item-menu-btn" onclick="event.stopPropagation(); toggleMenu(this)">
						<i class="bi bi-three-dots-vertical"></i>
					</button>
					<div class="item-menu-dropdown">
						<button onclick="event.stopPropagation(); showMemberDetails('${member.id}', '${member.username.replace(/'/g, "\\'")}')">
							<i class="bi bi-info-circle"></i>
							<span>Full Details</span>
						</button>
						<div class="divider"></div>
						<button onclick="event.stopPropagation(); manageMemberRoles('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')">
							<i class="bi bi-shield"></i>
							<span>Manage Roles</span>
						</button>
						<button onclick="event.stopPropagation(); changeNickname('${member.id}', '${member.nickname ? member.nickname.replace(/'/g, "\\'") : ''}')">
							<i class="bi bi-pencil"></i>
							<span>Change Nickname</span>
						</button>
						<button onclick="event.stopPropagation(); copyMemberId('${member.id}')">
							<i class="bi bi-clipboard"></i>
							<span>Copy ID</span>
						</button>
						<div class="divider"></div>
						<button onclick="event.stopPropagation(); timeoutMember('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')">
							<i class="bi bi-clock"></i>
							<span>Timeout</span>
						</button>
						<button class="text-danger" onclick="event.stopPropagation(); kickMember('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')">
							<i class="bi bi-box-arrow-right"></i>
							<span>Kick</span>
						</button>
						<button class="text-danger" onclick="event.stopPropagation(); banMember('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')">
							<i class="bi bi-hammer"></i>
							<span>Ban</span>
						</button>
                </div>
            </div>
			` : `
				<div class="item-menu">
					<button class="item-menu-btn" onclick="event.stopPropagation(); toggleMenu(this)">
						<i class="bi bi-three-dots-vertical"></i>
					</button>
					<div class="item-menu-dropdown">
						<button onclick="event.stopPropagation(); showMemberDetails('${member.id}', '${member.username.replace(/'/g, "\\'")}')">
							<i class="bi bi-info-circle"></i>
							<span>Full Details</span>
						</button>
						<button onclick="event.stopPropagation(); copyMemberId('${member.id}')">
							<i class="bi bi-clipboard"></i>
							<span>Copy ID</span>
						</button>
					</div>
            </div>
			`;

			membersHTML += `
				<div class="list-group-item">
					<div class="d-flex align-items-start justify-content-between">
						<div class="d-flex align-items-start flex-grow-1" style="cursor: pointer;" onclick="showMemberDetails('${member.id}', '${member.username.replace(/'/g, "\\'")}')">
							<img src="${member.avatarURL}" alt="${member.displayName}" class="rounded-circle me-2" width="56" height="56">
							<div class="flex-grow-1">
								<div class="d-flex align-items-center mb-1">
									${statusIcon}
									<strong class="ms-2" style="color: ${member.color};">${member.displayName}</strong>
									${member.nickname ? `<small class="text-muted ms-2">(${member.username})</small>` : ''}
                            </div>
								<div class="mb-1">
									${ownerBadge} ${botBadge} ${premiumBadge}
                            </div>
								${rolesDisplay ? `<div class="mb-1">${rolesDisplay}</div>` : ''}
								<small class="text-muted">
									<i class="bi bi-calendar-plus"></i> Joined ${memberDays}d ago • Account ${accountDays}d old
									${activities}
                                </small>
                                    </div>
                                </div>
						${actionButtons}
                                    </div>
                                </div>
			`;
		});

		let rolesHTML = '';
		rolesHTML += `
			<div class="list-group-item bg-success text-white d-flex justify-content-between align-items-center">
				<div>
					<strong>Create New Role</strong>
                                    </div>
				<button class="btn btn-sm btn-light" onclick="createRole()" title="Create role">
					<i class="bi bi-plus-circle"></i> New Role
                            </button>
                                </div>
		`;

		serverInfo.roles.forEach(role => {
			const colorStyle = role.color !== 0 ? `style="color: ${role.hexColor};"` : '';
			const badges = [];
			if (role.hoist) badges.push('<span class="badge bg-info">Hoisted</span>');
			if (role.managed) badges.push('<span class="badge bg-warning">Managed</span>');
			if (role.mentionable) badges.push('<span class="badge bg-success">Mentionable</span>');

			const isEveryoneRole = role.name === '@everyone';
			const deleteAction = !isEveryoneRole ? `
				<button class="text-danger" onclick="deleteRole('${role.id}', '${role.name}')">
					<i class="bi bi-trash"></i>
					<span>Delete</span>
                </button>
			` : '';

			rolesHTML += `
				<div class="list-group-item d-flex justify-content-between align-items-center">
					<div>
						<i class="bi bi-circle-fill me-2" ${colorStyle}></i>
						<strong ${colorStyle}>${role.name}</strong>
						${badges.join(' ')}
						<span class="badge bg-secondary ms-2">${role.memberCount} members</span>
                            </div>
					<div class="item-menu">
						<button class="item-menu-btn" onclick="toggleMenu(this)">
							<i class="bi bi-three-dots-vertical"></i>
                                </button>
						<div class="item-menu-dropdown">
							<button onclick="showRoleMembers('${role.id}', '${role.name}')">
								<i class="bi bi-people"></i>
								<span>View Members</span>
                                </button>
							<button onclick="assignRole('${role.id}', '${role.name}')">
								<i class="bi bi-person-plus"></i>
								<span>Assign to Member</span>
							</button>
							<div class="divider"></div>
							<button onclick="editRole('${role.id}', '${role.name}', '${role.hexColor}')">
								<i class="bi bi-pencil"></i>
								<span>Edit</span>
							</button>
							<button onclick="copyRoleId('${role.id}')">
                                    <i class="bi bi-clipboard"></i>
								<span>Copy ID</span>
                                </button>
							${deleteAction ? '<div class="divider"></div>' + deleteAction : ''}
                            </div>
                    </div>
                </div>
			`;
		});

		container.innerHTML = `
                            <div class="row">
				<div class="col-12">
					<h2 class="mb-4">
						<i class="bi bi-server me-2"></i>
						Server Overview - ${serverInfo.guildName}
					</h2>
            </div>
        </div>
        
			<div class="row mb-3">
				<div class="col-md-2">
					<div class="card">
						<div class="card-body text-center py-2">
							<h6 class="card-title mb-1">${serverInfo.memberCount}</h6>
							<small class="text-muted">Total Members</small>
                            </div>
                            </div>
                                    </div>
				<div class="col-md-2">
					<div class="card">
						<div class="card-body text-center py-2">
							<h6 class="card-title mb-1">${serverInfo.members.filter(m => m.status !== 'offline').length}</h6>
							<small class="text-muted">Online</small>
                                </div>
                            </div>
				</div>
				<div class="col-md-2">
					<div class="card">
						<div class="card-body text-center py-2">
							<h6 class="card-title mb-1">${serverInfo.members.filter(m => m.bot).length}</h6>
							<small class="text-muted">Bots</small>
						</div>
					</div>
				</div>
				<div class="col-md-2">
					<div class="card">
						<div class="card-body text-center py-2">
							<h6 class="card-title mb-1">${serverInfo.channels.length}</h6>
							<small class="text-muted">Channels</small>
						</div>
					</div>
				</div>
				<div class="col-md-2">
					<div class="card">
						<div class="card-body text-center py-2">
							<h6 class="card-title mb-1">${serverInfo.roles.length}</h6>
							<small class="text-muted">Roles</small>
						</div>
					</div>
				</div>
				<div class="col-md-2">
					<div class="card">
						<div class="card-body text-center py-2">
							<h6 class="card-title mb-1">${serverInfo.members.filter(m => m.premiumSince).length}</h6>
							<small class="text-muted">Boosters</small>
						</div>
					</div>
				</div>
			</div>

			<div class="row mb-3">
            <div class="col-12">
					<div class="card bg-dark text-white">
						<div class="card-body py-2 px-3">
							<div class="d-flex align-items-center justify-content-between">
								<strong><i class="bi bi-lightning-charge-fill text-danger me-2"></i>Cache Status</strong>
								<div id="cacheStats" class="d-flex gap-3 align-items-center">
									<small><i class="bi bi-hourglass-split"></i> Loading...</small>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

                            <div class="row">
            <div class="col-12">
					<div class="d-flex justify-content-between align-items-center mb-3">
						<ul class="nav nav-tabs flex-grow-1 mb-0" id="serverTabs" role="tablist" style="border-bottom: none;">
							<li class="nav-item" role="presentation">
								<button class="nav-link active" id="channels-tab" data-bs-toggle="tab" data-bs-target="#channels" type="button" role="tab">
									<i class="bi bi-list-ul me-2"></i>Channels (${serverInfo.channels.length})
	                                </button>
							</li>
							<li class="nav-item" role="presentation">
								<button class="nav-link" id="roles-tab" data-bs-toggle="tab" data-bs-target="#roles" type="button" role="tab">
									<i class="bi bi-shield-check me-2"></i>Roles (${serverInfo.roles.length})
	                                </button>
							</li>
							<li class="nav-item" role="presentation">
								<button class="nav-link" id="members-tab" data-bs-toggle="tab" data-bs-target="#members" type="button" role="tab">
									<i class="bi bi-people-fill me-2"></i>Members (${serverInfo.members.length})
								</button>
							</li>
							<li class="nav-item" role="presentation">
								<button class="nav-link" id="messages-tab" data-bs-toggle="tab" data-bs-target="#messages" type="button" role="tab" onclick="loadMessages(true)">
									<i class="bi bi-chat-dots me-2"></i>Messages
								</button>
							</li>
						</ul>
						<div class="d-flex align-items-center gap-2 ms-3">
							<div class="input-group" style="width: 220px;">
								<input type="text" id="serverSearch" class="form-control form-control-sm" placeholder="Search..." oninput="filterServerContent()" style="height: 31px; font-size: 0.875rem;">
								<button class="btn btn-sm btn-outline-secondary" type="button" onclick="clearServerSearch()" style="height: 31px; padding: 0 0.5rem; display: flex; align-items: center; border-left: 0;">
									<i class="bi bi-x" style="font-size: 1rem;"></i>
								</button>
							</div>
							<button class="btn btn-sm btn-primary" onclick="reloadServerOverview()" title="Reload" style="height: 31px; width: 31px; padding: 0; display: flex; align-items: center; justify-content: center;">
								<i class="bi bi-arrow-clockwise" style="font-size: 0.875rem;"></i>
							</button>
						</div>
                                    </div>
					<div class="tab-content" id="serverTabContent">
						<div class="tab-pane fade show active" id="channels" role="tabpanel">
							<div class="card">
								<div class="card-body p-0">
									<div class="list-group list-group-flush" style="max-height: 600px; overflow-y: auto;">
										${channelsHTML}
                                </div>
                                    </div>
                                </div>
                            </div>
						<div class="tab-pane fade" id="roles" role="tabpanel">
							<div class="card">
								<div class="card-body p-0">
									<div class="list-group list-group-flush" style="max-height: 600px; overflow-y: auto;">
										${rolesHTML}
        </div>
								</div>
							</div>
						</div>
						<div class="tab-pane fade" id="members" role="tabpanel">
							<div class="card">
								<div class="card-body p-0">
									<div class="list-group list-group-flush" style="max-height: 600px; overflow-y: auto;">
										${membersHTML}
									</div>
								</div>
							</div>
						</div>
						<div class="tab-pane fade" id="messages" role="tabpanel">
							<div class="card">
								<div class="card-header d-flex justify-content-between align-items-center">
									<strong><i class="bi bi-chat-dots me-2"></i>Recent Messages</strong>
									<div id="messagesStats">
										<small class="text-muted">Click to load</small>
									</div>
								</div>
								<div class="card-body p-0">
									<div id="messagesContainer" class="list-group list-group-flush" style="max-height: 600px; overflow-y: auto;">
										<div class="text-center py-5 text-muted">
											<i class="bi bi-chat-dots" style="font-size: 3rem;"></i>
											<p class="mt-3">Click this tab to load messages</p>
										</div>
									</div>
								</div>
							</div>
                    </div>
                </div>
            </div>
        </div>
    `;

		loadCacheStats();
	} catch (err) {
		container.innerHTML = `
			<div class="alert alert-danger" role="alert">
				<i class="bi bi-exclamation-triangle-fill me-2"></i>
				Error loading server information: ${err.message}
                    </div>
		`;
	}
}

async function loadCacheStats() {
	try {
		const response = await fetch('/api/server/cache-stats');
		const stats = await response.json();

		if (stats.error) {
			document.getElementById('cacheStats').innerHTML = '<small class="text-warning">Cache not available</small>';
			return;
		}

		const statusIcon = stats.redisEnabled
			? '<i class="bi bi-circle-fill text-success"></i> Redis'
			: '<i class="bi bi-circle text-warning"></i> Memory Only';

		document.getElementById('cacheStats').innerHTML = `
			<small>${statusIcon}</small>
			<small><i class="bi bi-bullseye"></i> Hit Rate: <strong>${stats.hitRate}</strong></small>
			<small><i class="bi bi-check-circle"></i> Hits: <strong>${stats.hits}</strong> (Redis: ${stats.redisHits}, Memory: ${stats.memoryHits})</small>
			<small><i class="bi bi-x-circle"></i> Misses: <strong>${stats.misses}</strong></small>
			<small><i class="bi bi-database"></i> Memory Size: <strong>${stats.memorySize}</strong></small>
			<button class="btn btn-sm btn-outline-light" onclick="flushCache()">
				<i class="bi bi-trash"></i> Flush Cache
                                </button>
		`;
	} catch (err) {
		document.getElementById('cacheStats').innerHTML = '<small class="text-danger">Error loading cache stats</small>';
	}
}

async function flushCache() {
	if (!confirm('Flush all cache data? This will clear both Redis and memory cache.')) return;

	try {
		const response = await fetch('/api/server/cache-flush', {
			method: 'POST'
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Cache flushed successfully!', 'success');
			loadCacheStats();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

let messagesLoading = false;
let messagesHasMore = true;
let messagesOffset = 0;
let messagesAutoRefresh = null;

async function refreshMessages() {
	const container = document.getElementById('messagesContainer');
	if (!container) return;

	messagesOffset = 0;
	messagesHasMore = true;
	container.innerHTML = '';
	await loadMessages(true);
}

async function loadMessages(reset = false) {
	if (messagesLoading) return;

	if (reset) {
		messagesOffset = 0;
		messagesHasMore = true;
		const container = document.getElementById('messagesContainer');
		container.innerHTML = `
			<div class="text-center py-5" id="messagesLoader">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
                            </div>
				<p class="text-muted mt-3">Loading messages...</p>
                    </div>
		`;
	}

	try {
		messagesLoading = true;

		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('Request timeout')), 5000)
		);

		const fetchPromise = fetch(messagesOffset > 0
			? `/api/server/messages?limit=30&offset=${messagesOffset}`
			: '/api/server/messages?limit=30'
		).then(res => res.json());

		const data = await Promise.race([fetchPromise, timeoutPromise]);

		if (data.error) {
			const container = document.getElementById('messagesContainer');
			container.innerHTML = `
				<div class="alert alert-warning m-3">
					<i class="bi bi-exclamation-triangle me-2"></i>
					${data.error}
					<br><small>Messages history requires Redis to be configured.</small>
                </div>
    `;
			document.getElementById('messages-tab').classList.add('disabled');
			return;
		}

		messagesHasMore = data.hasMore;

		const container = document.getElementById('messagesContainer');
		const loader = document.getElementById('messagesLoader');
		if (loader) loader.remove();

		if (data.messages.length === 0 && messagesOffset === 0) {
			container.innerHTML = `
				<div class="text-center py-5 text-muted">
					<i class="bi bi-chat-dots" style="font-size: 3rem;"></i>
					<p class="mt-3">No messages yet. Send some messages in Discord to see them here!</p>
            </div>
			`;
			return;
		}

		const fragment = document.createDocumentFragment();

		data.messages.forEach(msg => {
			const time = new Date(msg.timestamp);
			const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

			const messageItem = document.createElement('div');
			messageItem.className = 'list-group-item';
			messageItem.setAttribute('data-message-id', msg.id);

			let contentHTML = `
				<div class="d-flex align-items-start justify-content-between">
					<div class="d-flex align-items-start flex-grow-1">
						<small class="text-muted me-3 flex-shrink-0" style="min-width: 45px;">${timeStr}</small>
						<img src="${msg.authorAvatar}" alt="${msg.authorDisplayName}" class="rounded-circle me-2" width="40" height="40" loading="lazy">
						<div class="flex-grow-1">
							<div class="mb-1">
								<strong style="color: var(--primary-color);">${msg.authorDisplayName}</strong>
								<small class="text-muted ms-2">#${msg.channelName}</small>
								${msg.pinned ? '<i class="bi bi-pin-fill text-warning ms-2" title="Pinned"></i>' : ''}
								${msg.edited ? '<span class="badge bg-secondary ms-2" title="Edited"><i class="bi bi-pencil-fill"></i> Edited</span>' : ''}
        </div>
							<div class="message-content">${msg.content || '<em class="text-muted">No content</em>'}</div>`;

			if (msg.attachments && msg.attachments.length > 0) {
				contentHTML += '<div class="mt-2 message-attachments">';
				msg.attachments.forEach(a => {
					const imageUrl = a.savedLocally && a.localPath ? a.localPath : a.url;
					const linkUrl = a.savedLocally && a.localPath ? a.localPath : a.url;

					if (a.isImage) {
						contentHTML += `
							<div class="message-image mb-2 ${a.savedLocally ? 'saved-locally' : ''}">
								<a href="${linkUrl}" target="_blank">
									<img src="${imageUrl}" alt="${a.name}" class="img-fluid rounded" style="max-width: 400px; max-height: 300px; cursor: pointer;" loading="lazy">
								</a>
								${a.savedLocally ? '<span class="saved-badge"><i class="bi bi-check-circle-fill"></i> Saved</span>' : ''}
                    </div>
						`;
					} else {
						contentHTML += `
							<a href="${linkUrl}" target="_blank" class="badge ${a.savedLocally ? 'bg-success' : 'bg-secondary'} me-1 mb-1">
								<i class="bi bi-${a.savedLocally ? 'check-circle-fill' : 'paperclip'}"></i> ${a.name}
							</a>
						`;
					}
				});
				contentHTML += '</div>';
			}

			if (msg.embeds > 0) {
				contentHTML += `<small class="badge bg-info mt-1">${msg.embeds} embed(s)</small>`;
			}

			if (msg.reactions && msg.reactions.length > 0) {
				contentHTML += '<div class="message-reactions mt-2">';
				msg.reactions.forEach(r => {
					const emojiDisplay = r.isCustom && r.emojiUrl
						? `<img src="${r.emojiUrl}" alt="${r.emoji}" width="18" height="18">`
						: r.emoji;
					contentHTML += `
						<span class="reaction-badge" onclick="showReactionDetails('${msg.id}', '${r.emoji}')" style="cursor: pointer;" title="Click to see who reacted">
							${emojiDisplay}
							<span class="reaction-count">${r.count}</span>
						</span>
					`;
				});
				contentHTML += '</div>';
			}

			contentHTML += `</div>
                </div>
					<div class="item-menu">
						<button class="item-menu-btn" onclick="toggleMenu(this)">
							<i class="bi bi-three-dots-vertical"></i>
						</button>
						<div class="item-menu-dropdown">
							<button onclick="viewMessageHistory('${msg.id}')">
								<i class="bi bi-clock-history"></i>
								<span>View History</span>
							</button>
							<button onclick="toggleMessagePriority('${msg.id}')">
								<i class="bi bi-star text-warning"></i>
								<span>Priority Reload</span>
							</button>
							<div class="divider"></div>
							<button class="text-danger" onclick="deleteMessageFromCache('${msg.id}', '${msg.channelId}')">
								<i class="bi bi-trash"></i>
								<span>Delete</span>
							</button>
            </div>
        </div>
				</div>`;

			messageItem.innerHTML = contentHTML;
			fragment.appendChild(messageItem);
		});

		container.appendChild(fragment);

		if (data.messages.length > 0) {
			messagesOffset = data.offset;
		}

		if (messagesHasMore) {
			const existingBtn = document.getElementById('loadMoreMessages');
			if (existingBtn) existingBtn.remove();

			const loadMoreBtn = document.createElement('div');
			loadMoreBtn.id = 'loadMoreMessages';
			loadMoreBtn.className = 'text-center py-3';
			loadMoreBtn.innerHTML = `
				<button class="btn btn-sm btn-primary" onclick="loadMessages()">
					<i class="bi bi-arrow-down-circle me-1"></i> Load More
				</button>
			`;
			container.appendChild(loadMoreBtn);
		} else {
			const existingBtn = document.getElementById('loadMoreMessages');
			if (existingBtn) existingBtn.remove();
		}

		if (messagesOffset === 0 || reset) {
			const statsResponse = await fetch('/api/server/messages-stats');
			const stats = await statsResponse.json();

			if (!stats.error && stats.total) {
				document.getElementById('messagesStats').innerHTML = `
					<small class="text-success">
						<i class="bi bi-database me-1"></i>${stats.total} messages
					</small>
				`;
			}
		}

		setupInfiniteScroll();
	} catch (err) {
		const container = document.getElementById('messagesContainer');
		if (messagesOffset === 0) {
			container.innerHTML = `
				<div class="alert alert-danger m-3">
					<i class="bi bi-x-circle me-2"></i>
					${err.message === 'Request timeout' ? 'Request timed out. Check Redis connection.' : 'Error: ' + err.message}
				</div>
			`;
		} else {
			showNotification('Error loading more messages: ' + err.message, 'danger');
		}
	} finally {
		messagesLoading = false;
	}
}

function setupInfiniteScroll() {
	const container = document.getElementById('messagesContainer');
	if (!container || container.hasAttribute('data-scroll-initialized')) return;

	container.setAttribute('data-scroll-initialized', 'true');

	container.addEventListener('scroll', () => {
		const scrollPercentage = (container.scrollTop + container.clientHeight) / container.scrollHeight;

		if (scrollPercentage > 0.9 && messagesHasMore && !messagesLoading) {
			const loadMoreBtn = document.getElementById('loadMoreMessages');
			if (loadMoreBtn) loadMoreBtn.remove();
			loadMessages();
		}
	});
}

async function viewMessageHistory(messageId) {
	try {
		const response = await fetch(`/api/server/message-history?messageId=${messageId}`);
		const data = await response.json();

		console.log('Message History Data:', data);

		if (data.error) {
			showToast(data.error, 'danger');
			return;
		}

		let historyHTML = `
			<div class="modal fade show" id="messageHistoryModal" tabindex="-1" style="display: block;" aria-modal="true">
				<div class="modal-dialog modal-lg modal-dialog-scrollable">
					<div class="modal-content bg-dark text-white">
						<div class="modal-header">
							<h5 class="modal-title">
								<i class="bi bi-clock-history me-2"></i>Message History
							</h5>
							<button type="button" class="btn-close btn-close-white" onclick="closeMessageHistory()"></button>
						</div>
						<div class="modal-body">
							<ul class="nav nav-tabs mb-3" id="historyTabs" role="tablist">
								<li class="nav-item" role="presentation">
									<button class="nav-link active" id="edits-tab" onclick="switchHistoryTab('edits')" type="button">
										<i class="bi bi-pencil"></i> Edits (${data.edits.length})
									</button>
								</li>
								<li class="nav-item" role="presentation">
									<button class="nav-link" id="reactions-tab" onclick="switchHistoryTab('reactions')" type="button">
										<i class="bi bi-emoji-smile"></i> Reactions (${data.reactions.length})
									</button>
								</li>
								<li class="nav-item" role="presentation">
									<button class="nav-link" id="replies-tab" onclick="switchHistoryTab('replies')" type="button">
										<i class="bi bi-reply"></i> Replies (${data.replies.length})
									</button>
								</li>
							</ul>
							<div class="tab-content">
								<div class="tab-pane show active" id="edits-pane" role="tabpanel">
									${renderEdits(data.edits)}
								</div>
								<div class="tab-pane" id="reactions-pane" role="tabpanel" style="display: none;">
									${renderReactions(data.reactions)}
								</div>
								<div class="tab-pane" id="replies-pane" role="tabpanel" style="display: none;">
									${renderReplies(data.replies)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-backdrop fade show"></div>
		`;

		document.body.insertAdjacentHTML('beforeend', historyHTML);
	} catch (err) {
		showToast('Error loading message history', 'danger');
	}
}

function renderEdits(edits) {
	if (!edits || edits.length === 0) {
		return '<p class="text-muted">No edits recorded</p>';
	}

	return `
		<div class="list-group list-group-flush">
			${edits.map(edit => {
		const time = new Date(edit.timestamp);
		return `
					<div class="list-group-item bg-dark text-white border-secondary">
						<small class="text-muted">${time.toLocaleString()}</small>
						<div class="mt-2">
							<div class="mb-2">
								<strong class="text-danger"><i class="bi bi-dash-circle"></i> Before:</strong>
								<div class="p-2 bg-dark border border-danger rounded mt-1">
									${edit.oldContent || '<em class="text-muted">Empty</em>'}
								</div>
							</div>
							<div>
								<strong class="text-success"><i class="bi bi-plus-circle"></i> After:</strong>
								<div class="p-2 bg-dark border border-success rounded mt-1">
									${edit.newContent || '<em class="text-muted">Empty</em>'}
								</div>
							</div>
						</div>
					</div>
				`;
	}).join('')}
		</div>
	`;
}

function renderReactions(reactions) {
	if (!reactions || reactions.length === 0) {
		return '<p class="text-muted">No reactions recorded</p>';
	}

	return `
		<div class="list-group list-group-flush">
			${reactions.map(reaction => {
		const time = new Date(reaction.timestamp);
		const emojiDisplay = reaction.emojiUrl
			? `<img src="${reaction.emojiUrl}" alt="${reaction.emoji}" width="20" height="20">`
			: reaction.emoji;
		const actionIcon = reaction.action === 'add'
			? '<i class="bi bi-plus-circle text-success"></i>'
			: '<i class="bi bi-dash-circle text-danger"></i>';
		const actionText = reaction.action === 'add' ? 'added' : 'removed';
		const countBadge = reaction.count && reaction.count > 1
			? `<span class="badge bg-secondary ms-2">${reaction.count}x</span>`
			: '';

		return `
					<div class="list-group-item bg-dark text-white border-secondary d-flex align-items-center">
						<div class="flex-grow-1">
							${actionIcon}
							<strong class="ms-2">${reaction.username}</strong>
							<span class="text-muted ms-2">${actionText} reaction</span>
							<span class="ms-2">${emojiDisplay}</span>
							${countBadge}
						</div>
						<small class="text-muted">${time.toLocaleString()}</small>
					</div>
				`;
	}).join('')}
		</div>
	`;
}

function renderReplies(replies) {
	if (!replies || replies.length === 0) {
		return '<p class="text-muted">No replies recorded</p>';
	}

	return `
		<div class="list-group list-group-flush">
			${replies.map(reply => `
				<div class="list-group-item bg-dark text-white border-secondary">
					<div class="d-flex align-items-start">
						<img src="${reply.authorAvatar}" alt="${reply.authorName}" class="rounded-circle me-2" width="32" height="32">
						<div class="flex-grow-1">
							<strong>${reply.authorName}</strong>
							<small class="text-muted ms-2">${new Date(reply.timestamp).toLocaleString()}</small>
							<div class="mt-1">${reply.content}</div>
						</div>
					</div>
				</div>
			`).join('')}
		</div>
	`;
}

function switchHistoryTab(tabName) {
	// Remove active class from all tabs
	document.querySelectorAll('#historyTabs .nav-link').forEach(tab => {
		tab.classList.remove('active');
	});

	// Hide all panes
	document.querySelectorAll('#messageHistoryModal .tab-pane').forEach(pane => {
		pane.style.display = 'none';
		pane.classList.remove('show', 'active');
	});

	// Activate selected tab and pane
	document.getElementById(`${tabName}-tab`).classList.add('active');
	const pane = document.getElementById(`${tabName}-pane`);
	pane.style.display = 'block';
	pane.classList.add('show', 'active');
}

function closeMessageHistory() {
	const modal = document.getElementById('messageHistoryModal');
	const backdrop = document.querySelector('.modal-backdrop');
	if (modal) modal.remove();
	if (backdrop) backdrop.remove();
}

async function toggleMessagePriority(messageId) {
	try {
		const response = await fetch('/api/server/message-priority', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId, isPriority: true })
		});

		const data = await response.json();

		if (data.success) {
			const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
			if (messageElement) {
				messageElement.classList.toggle('priority');
			}
			showToast('Message marked as priority for reload', 'success');
		} else {
			showToast(data.error || 'Failed to set priority', 'danger');
		}
	} catch (err) {
		showToast('Error setting message priority', 'danger');
	}
}

async function deleteMessageFromCache(messageId, channelId) {
	if (!confirm('Delete this message from Discord and cache?')) return;

	try {
		const response = await fetch('/api/server/delete-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId, channelId })
		});

		const data = await response.json();
		if (data.success) {
			const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
			if (messageElement) {
				messageElement.remove();
			}
			showNotification('Message deleted!', 'success');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function renderConfigPage(container) {
	const response = await fetch('/api/config');
	const config = await response.json();
	currentConfig = config;

	container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">
                    <i class="bi bi-gear me-2"></i>
                    Settings
                </h2>
            </div>
        </div>
        
        <div class="row g-4 mb-4">
            <div class="col-md-6">
                <div class="card config-card">
                    <div class="card-body">
                        <h5 class="mb-3"><i class="bi bi-discord me-2"></i>Discord Credentials</h5>
                        <form id="discordCredentialsForm">
                            <div class="mb-3">
                                <label class="form-label">Bot Token</label>
                                <input type="password" class="form-control" id="settings_client_token" value="${config.client_token || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Client ID</label>
                                <input type="text" class="form-control" id="settings_client_id" value="${config.client_id || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Guild ID</label>
                                <input type="text" class="form-control" id="settings_discord_guild_id" value="${config.discord_guild_id || ''}" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-save me-2"></i>Save Discord Config
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card config-card">
                    <div class="card-body">
                        <h5 class="mb-3"><i class="bi bi-database me-2"></i>Database Connection</h5>
                        <form id="databaseCredentialsForm">
                            <div class="mb-3">
                                <label class="form-label">Host</label>
                                <input type="text" class="form-control" id="settings_db_host" value="${config.db_host || ''}" placeholder="localhost">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Database Name</label>
                                <input type="text" class="form-control" id="settings_db_name" value="${config.db_name || ''}" placeholder="cordium_events">
                            </div>
                            <div class="row">
                                <div class="col-4">
                                    <div class="mb-3">
                                        <label class="form-label">Port</label>
                                        <input type="number" class="form-control" id="settings_db_port" value="${config.db_port || ''}" placeholder="3306">
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="mb-3">
                                        <label class="form-label">User</label>
                                        <input type="text" class="form-control" id="settings_db_user" value="${config.db_user || ''}" placeholder="username">
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input type="password" class="form-control" id="settings_db_pass" value="${config.db_pass || ''}" placeholder="password">
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success w-100">
                                <i class="bi bi-save me-2"></i>Save Database Config
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card config-card">
                    <div class="card-body">
                        <h5 class="mb-3"><i class="bi bi-lightning-charge me-2 text-danger"></i>Redis Cache</h5>
                        <form id="redisCredentialsForm">
                            <div class="row">
                                <div class="col-6">
                                    <div class="mb-3">
                                        <label class="form-label">Host</label>
                                        <input type="text" class="form-control" id="settings_redis_host" value="${config.redis_host || ''}" placeholder="localhost">
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="mb-3">
                                        <label class="form-label">Port</label>
                                        <input type="number" class="form-control" id="settings_redis_port" value="${config.redis_port || ''}" placeholder="6379">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input type="password" class="form-control" id="settings_redis_password" value="${config.redis_password || ''}" placeholder="Optional">
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="mb-3">
                                        <label class="form-label">Database</label>
                                        <input type="number" class="form-control" id="settings_redis_db" value="${config.redis_db || ''}" placeholder="0">
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-danger w-100">
                                <i class="bi bi-save me-2"></i>Save Redis Config
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="row">
            <div class="col-12">
                <div class="card config-card">
                    <div class="card-body">
                        <h5 class="mb-3"><i class="bi bi-sliders me-2"></i>Advanced Settings</h5>
                        <form id="advancedConfigForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5 class="mb-3">Events</h5>
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="listen_events" 
                                                   ${config.listen_events === 'true' ? 'checked' : ''}>
                                            <label class="form-check-label" for="listen_events">
                                                Listen to Events
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="report_events" 
                                                   ${config.report_events === 'true' ? 'checked' : ''}>
                                            <label class="form-check-label" for="report_events">
                                                Report Events
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Events Folder</label>
                                        <input type="text" class="form-control" id="events_folder" 
                                               value="${config.events_folder || 'src/events'}">
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <h5 class="mb-3">Endpoints</h5>
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="listen_endpoints" 
                                                   ${config.listen_endpoints === 'true' ? 'checked' : ''}>
                                            <label class="form-check-label" for="listen_endpoints">
                                                Listen to Endpoints
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="report_endpoints" 
                                                   ${config.report_endpoints === 'true' ? 'checked' : ''}>
                                            <label class="form-check-label" for="report_endpoints">
                                                Report Endpoints
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Endpoints Folder</label>
                                        <input type="text" class="form-control" id="endpoints_folder" 
                                               value="${config.endpoints_folder || 'src/endpoints'}">
                                    </div>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Commands Folder</label>
                                        <input type="text" class="form-control" id="commands_folder" 
                                               value="${config.commands_folder || 'src/commands'}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Files Folder</label>
                                        <input type="text" class="form-control" id="files_folder" 
                                               value="${config.files_folder || 'src/files'}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Sandbox Folder</label>
                                        <input type="text" class="form-control" id="sandbox_folder" 
                                               value="${config.sandbox_folder || 'src/sandbox'}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">API Port</label>
                                        <input type="number" class="form-control" id="api_port" 
                                               value="${config.api_port || '8080'}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Timezone</label>
                                        <input type="text" class="form-control" id="timezone" 
                                               value="${config.timezone || 'UTC'}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Locale</label>
                                        <input type="text" class="form-control" id="locale" 
                                               value="${config.locale || 'en-US'}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="dev" 
                                           ${config.dev === 'true' ? 'checked' : ''}>
                                    <label class="form-check-label" for="dev">
                                        Development Mode (Hot Reload)
                                    </label>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="save_attachments" 
                                           ${config.save_attachments === 'true' ? 'checked' : ''}>
                                    <label class="form-check-label" for="save_attachments">
                                        Save Attachments Locally (Images/Videos preserved even if deleted)
                                    </label>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-save me-2"></i>
                                Save All Configuration
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

	document.getElementById('databaseCredentialsForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await saveWizardConfig(['db_host', 'db_name', 'db_port', 'db_user', 'db_pass'], 'settings_');
		showNotification('Database config saved!', 'success');
	});

	document.getElementById('redisCredentialsForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await saveWizardConfig(['redis_host', 'redis_port', 'redis_password', 'redis_db'], 'settings_');
		showNotification('Redis config saved!', 'success');
	});

	document.getElementById('advancedConfigForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await saveFullConfig();
	});
}

async function renderFilesPage(container, category, title) {
	const response = await fetch(`/api/files/${category}`);
	const files = await response.json();

	container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">
                    <i class="bi bi-folder me-2"></i>
                    ${title}
                </h2>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-3">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <strong>Files</strong>
                    </div>
                    <div class="card-body p-2" id="filesList">
                        ${files.length === 0 ? '<p class="text-muted p-3">No files found</p>' : ''}
                    </div>
                    ${category === 'commands' || category === 'sandbox' ? `
                        <div class="card-footer">
                            <button class="btn btn-success btn-sm w-100" id="createFileBtn">
                                <i class="bi bi-plus-circle me-1"></i>
                                New File
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="col-md-9">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong id="currentFileName">Select a file to edit</strong>
                        <div>
                            <button class="btn btn-primary btn-sm me-2" id="saveFileBtn" disabled>
                                <i class="bi bi-save me-1"></i>
                                Save
                            </button>
                            ${category === 'commands' || category === 'sandbox' ? `
                                <button class="btn btn-danger btn-sm" id="deleteFileBtn" disabled>
                                    <i class="bi bi-trash me-1"></i>
                                    Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <textarea id="fileEditor"></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;

	const filesList = document.getElementById('filesList');
	const fileNameDisplay = document.getElementById('currentFileName');
	const saveBtn = document.getElementById('saveFileBtn');
	const deleteBtn = document.getElementById('deleteFileBtn');

	currentEditor = CodeMirror.fromTextArea(document.getElementById('fileEditor'), {
		mode: 'javascript',
		theme: currentTheme === 'dark' ? 'dracula' : 'elegant',
		lineNumbers: true,
		autoCloseBrackets: true,
		matchBrackets: true,
		indentUnit: 4,
		tabSize: 4,
		indentWithTabs: true
	});

	let currentFile = null;

	files.forEach(file => {
		const fileItem = document.createElement('div');
		fileItem.className = 'file-item';
		fileItem.innerHTML = `
            <i class="bi bi-file-code me-2"></i>
            ${file.path}
        `;
		fileItem.addEventListener('click', async () => {
			document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
			fileItem.classList.add('active');
			await loadFile(category, file.path);
			currentFile = file.path;
			fileNameDisplay.textContent = file.path;
			saveBtn.disabled = false;
			if (deleteBtn) deleteBtn.disabled = false;
		});
		filesList.appendChild(fileItem);
	});

	saveBtn.addEventListener('click', async () => {
		if (currentFile) {
			await saveFile(category, currentFile, currentEditor.getValue());
		}
	});

	if (deleteBtn) {
		deleteBtn.addEventListener('click', async () => {
			if (currentFile && confirm(`Delete ${currentFile}?`)) {
				await deleteFile(category, currentFile);
				await loadPage(currentPage);
			}
		});
	}

	const createBtn = document.getElementById('createFileBtn');
	if (createBtn) {
		createBtn.addEventListener('click', () => {
			const fileName = prompt('Enter file name (e.g., myfile.js):');
			if (fileName) {
				currentFile = fileName;
				fileNameDisplay.textContent = fileName;
				currentEditor.setValue('');
				saveBtn.disabled = false;
				if (deleteBtn) deleteBtn.disabled = false;
			}
		});
	}
}

async function loadFile(category, filePath) {
	try {
		const response = await fetch(`/api/file/${category}?path=${encodeURIComponent(filePath)}`);
		const data = await response.json();
		currentEditor.setValue(data.content);
	} catch (err) {
		showNotification('Error loading file: ' + err.message, 'danger');
	}
}

async function saveFile(category, filePath, content) {
	try {
		showLoading();
		const response = await fetch(`/api/file/${category}?path=${encodeURIComponent(filePath)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('File saved successfully', 'success');
		} else {
			showNotification('Error saving file', 'danger');
		}
	} catch (err) {
		showNotification('Error saving file: ' + err.message, 'danger');
	} finally {
		hideLoading();
	}
}

async function deleteFile(category, filePath) {
	try {
		showLoading();
		const response = await fetch(`/api/file/${category}?path=${encodeURIComponent(filePath)}`, {
			method: 'DELETE'
		});

		const data = await response.json();
		if (data.success) {
			showNotification('File deleted successfully', 'success');
		} else {
			showNotification('Error deleting file', 'danger');
		}
	} catch (err) {
		showNotification('Error deleting file: ' + err.message, 'danger');
	} finally {
		hideLoading();
	}
}

async function saveFullConfig() {
	try {
		showLoading();
		const response = await fetch('/api/config');
		const currentConfig = await response.json();

		const fields = [
			'listen_events', 'report_events', 'events_folder',
			'listen_endpoints', 'report_endpoints', 'endpoints_folder',
			'commands_folder', 'files_folder', 'sandbox_folder',
			'api_port', 'timezone', 'locale', 'dev', 'save_attachments'
		];

		fields.forEach(field => {
			const element = document.getElementById(field);
			if (element) {
				if (element.type === 'checkbox') {
					currentConfig[field] = element.checked ? 'true' : 'false';
				} else {
					currentConfig[field] = element.value;
				}
			}
		});

		const saveResponse = await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(currentConfig)
		});

		const data = await saveResponse.json();
		if (data.success) {
			showNotification('Configuration saved successfully', 'success');
		} else {
			showNotification('Error saving configuration', 'danger');
		}
	} catch (err) {
		showNotification('Error saving configuration: ' + err.message, 'danger');
	} finally {
		hideLoading();
	}
}

function showLoading() {
	document.querySelector('.loading-overlay').style.display = 'block';
	document.querySelector('.loading-spinner').style.display = 'block';
}

function hideLoading() {
	document.querySelector('.loading-overlay').style.display = 'none';
	document.querySelector('.loading-spinner').style.display = 'none';
}

function showNotification(message, type) {
	const alertDiv = document.createElement('div');
	alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
	alertDiv.style.cssText = `
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		min-width: 300px;
		max-width: 600px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	`;
	alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
	document.body.appendChild(alertDiv);

	setTimeout(() => {
		alertDiv.classList.remove('show');
		setTimeout(() => alertDiv.remove(), 150);
	}, 3000);
}

async function sendMessageToChannel(channelId, channelName) {
	const message = prompt(`Send a message to #${channelName}:`);
	if (!message) return;

	try {
		const response = await fetch('/api/server/send-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ channelId, message })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Message sent successfully!', 'success');
		} else {
			showNotification('Failed to send message: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

function toggleMenu(button) {
	const dropdown = button.nextElementSibling;
	const allDropdowns = document.querySelectorAll('.item-menu-dropdown.show');

	allDropdowns.forEach(d => {
		if (d !== dropdown) {
			d.classList.remove('show');
		}
	});

	dropdown.classList.toggle('show');

	if (dropdown.classList.contains('show')) {
		setTimeout(() => {
			document.addEventListener('click', function closeMenu(e) {
				if (!button.contains(e.target) && !dropdown.contains(e.target)) {
					dropdown.classList.remove('show');
					document.removeEventListener('click', closeMenu);
				}
			});
		}, 10);
	}
}

function copyChannelId(channelId) {
	navigator.clipboard.writeText(channelId);
	showNotification('Channel ID copied to clipboard!', 'success');
}

function copyRoleId(roleId) {
	navigator.clipboard.writeText(roleId);
	showNotification('Role ID copied to clipboard!', 'success');
}

async function showRoleMembers(roleId, roleName) {
	try {
		const response = await fetch(`/api/server/role-members?roleId=${roleId}`);
		const data = await response.json();

		if (data.error) {
			showNotification('Error: ' + data.error, 'danger');
			return;
		}

		const membersList = data.members.map(m => `${m.username} (${m.displayName})`).join('\n');
		alert(`Members with role "${roleName}" (${data.members.length}):\n\n${membersList}`);
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function createChannel(parentId = null) {
	const name = prompt('Channel name:');
	if (!name) return;

	const type = prompt('Channel type:\n0 = Text\n2 = Voice\n4 = Category\n5 = News\n13 = Stage\n15 = Forum', '0');
	if (type === null) return;

	try {
		const response = await fetch('/api/server/create-channel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, type: parseInt(type), parentId })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Channel created successfully!', 'success');
			await loadPage('server');
			document.getElementById('channels-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function editChannel(channelId, currentName, type, currentTopic) {
	const name = prompt('New channel name:', currentName);
	if (name === null) return;

	let topic = null;
	if (type === '0') {
		topic = prompt('Channel topic (optional):', currentTopic);
		if (topic === null) topic = currentTopic;
	}

	try {
		const response = await fetch('/api/server/edit-channel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ channelId, name, topic })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Channel updated successfully!', 'success');
			await loadPage('server');
			document.getElementById('channels-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function deleteChannel(channelId, channelName) {
	if (!confirm(`Delete "${channelName}"?\n\nThis action cannot be undone!`)) return;

	try {
		const response = await fetch('/api/server/delete-channel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ channelId })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Channel deleted successfully!', 'success');
			await loadPage('server');
			document.getElementById('channels-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function createRole() {
	const name = prompt('Role name:');
	if (!name) return;

	const color = prompt('Role color (hex code, e.g., #FF5733):', '#99AAB5');
	if (color === null) return;

	try {
		const response = await fetch('/api/server/create-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, color })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Role created successfully!', 'success');
			await loadPage('server');
			document.getElementById('roles-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function editRole(roleId, currentName, currentColor) {
	const name = prompt('New role name:', currentName);
	if (name === null) return;

	const color = prompt('Role color (hex code):', currentColor);
	if (color === null) return;

	try {
		const response = await fetch('/api/server/edit-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roleId, name, color })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Role updated successfully!', 'success');
			await loadPage('server');
			document.getElementById('roles-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function deleteRole(roleId, roleName) {
	if (!confirm(`Delete role "${roleName}"?\n\nThis action cannot be undone!`)) return;

	try {
		const response = await fetch('/api/server/delete-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roleId })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Role deleted successfully!', 'success');
			await loadPage('server');
			document.getElementById('roles-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function assignRole(roleId, roleName) {
	const userId = prompt(`Enter member ID to assign role "${roleName}":`);
	if (!userId) return;

	try {
		const response = await fetch('/api/server/assign-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roleId, userId })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Role assigned successfully!', 'success');
			await loadPage('server');
			document.getElementById('members-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function showMemberDetails(memberId, username) {
	try {
		const response = await fetch(`/api/server/member-details?memberId=${memberId}`);
		const data = await response.json();

		if (data.error) {
			showNotification('Error: ' + data.error, 'danger');
			return;
		}

		const member = data.member;
		const joinDate = new Date(member.joinedAt).toLocaleString();
		const accountDate = new Date(member.accountCreatedAt).toLocaleString();
		const boostDate = member.premiumSince ? new Date(member.premiumSince).toLocaleString() : 'Never';

		const rolesText = member.roles.map(r => `${r.name}`).join(', ') || 'None';
		const permissionsText = member.permissions.slice(0, 10).join(', ') + (member.permissions.length > 10 ? ` (+${member.permissions.length - 10} more)` : '');
		const activitiesText = member.activities.length > 0 ? member.activities.join(', ') : 'None';

		const details = `
Member Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 User Information:
   • Username: ${member.username}#${member.discriminator}
   • Display Name: ${member.displayName}
   • Nickname: ${member.nickname || 'None'}
   • ID: ${member.id}
   • Bot: ${member.bot ? 'Yes' : 'No'}
   • Owner: ${member.isOwner ? 'Yes' : 'No'}

📊 Status:
   • Status: ${member.status.toUpperCase()}
   • Activities: ${activitiesText}

🎨 Roles (${member.roles.length}):
   ${rolesText}

📅 Dates:
   • Account Created: ${accountDate}
   • Joined Server: ${joinDate}
   • Boosting Since: ${boostDate}

🔑 Key Permissions:
   ${permissionsText}

🌐 Avatar URL:
   ${member.avatarURL}
		`;

		alert(details);
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

function copyMemberId(memberId) {
	navigator.clipboard.writeText(memberId);
	showNotification('Member ID copied to clipboard!', 'success');
}

async function manageMemberRoles(memberId, displayName) {
	const action = prompt(`Manage roles for ${displayName}:\n\n1 - Add role\n2 - Remove role\n\nEnter your choice:`);
	if (!action) return;

	const roleId = prompt('Enter role ID:');
	if (!roleId) return;

	const endpoint = action === '1' ? '/api/server/add-member-role' : '/api/server/remove-member-role';

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId, roleId })
		});

		const data = await response.json();
		if (data.success) {
			showNotification(action === '1' ? 'Role added!' : 'Role removed!', 'success');
			await loadPage('server');
			document.getElementById('members-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function changeNickname(memberId, currentNickname) {
	const nickname = prompt('New nickname (leave empty to reset):', currentNickname);
	if (nickname === null) return;

	try {
		const response = await fetch('/api/server/change-nickname', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId, nickname })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Nickname changed!', 'success');
			await loadPage('server');
			document.getElementById('members-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function timeoutMember(memberId, displayName) {
	const duration = prompt(`Timeout ${displayName} for how many minutes?`, '60');
	if (!duration) return;

	const reason = prompt('Reason (optional):');

	try {
		const response = await fetch('/api/server/timeout-member', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId, duration: parseInt(duration), reason })
		});

		const data = await response.json();
		if (data.success) {
			showNotification(`${displayName} timed out for ${duration} minutes!`, 'success');
			await loadPage('server');
			document.getElementById('members-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function kickMember(memberId, displayName) {
	const reason = prompt(`Kick ${displayName}?\n\nReason:`);
	if (reason === null) return;

	if (!confirm(`Are you sure you want to kick ${displayName}?`)) return;

	try {
		const response = await fetch('/api/server/kick-member', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId, reason })
		});

		const data = await response.json();
		if (data.success) {
			showNotification(`${displayName} kicked!`, 'success');
			await loadPage('server');
			document.getElementById('members-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function banMember(memberId, displayName) {
	const reason = prompt(`Ban ${displayName}?\n\nReason:`);
	if (reason === null) return;

	const deleteMessages = confirm('Delete their messages from the last 7 days?');

	if (!confirm(`Are you ABSOLUTELY sure you want to BAN ${displayName}?\n\nThis is a serious action!`)) return;

	try {
		const response = await fetch('/api/server/ban-member', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId, reason, deleteMessageDays: deleteMessages ? 7 : 0 })
		});

		const data = await response.json();
		if (data.success) {
			showNotification(`${displayName} banned!`, 'success');
			await loadPage('server');
			document.getElementById('members-tab').click();
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}



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
	updateNavbarStats();
	setInterval(updateNavbarStats, 5000);
}

async function updateNavbarStats() {
	try {
		const response = await fetch('/api/server/info');
		const data = await response.json();

		if (!data.error && data.process) {
			const cpuElement = document.getElementById('cpuUsage');
			const ramElement = document.getElementById('ramUsage');
			const uptimeElement = document.getElementById('uptimeDisplay');

			if (cpuElement && data.process.cpuUsage !== undefined) {
				cpuElement.textContent = `${data.process.cpuUsage.toFixed(1)}%`;
			}

			if (ramElement && data.process.memoryUsage !== undefined) {
				ramElement.textContent = `${Math.round(data.process.memoryUsage)}MB`;
			}

			if (uptimeElement && data.process.uptime !== undefined) {
				uptimeElement.textContent = formatUptime(data.process.uptime);
			}
		}
	} catch (error) {
		console.log('Failed to update navbar stats:', error);
	}
}

function formatUptime(seconds) {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (days > 0) {
		return `${days}d ${hours}h`;
	} else if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else {
		return `${minutes}m`;
	}
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
	const savedStep = parseInt(config.wizard_step) || 1;
	const savedMode = config.wizard_mode || '';
	let setupStep = savedStep;

	const wizardContainer = document.getElementById('setupWizard');
	wizardContainer.innerHTML = `
		<div class="setup-wizard">
			<div class="wizard-header">
				<div class="container">
					<div class="text-center">
						<img src="cordium-1000x700.png" alt="Cordium" style="height: 80px; width: auto; margin-bottom: 1rem;">
						<h1 class="fw-bold mt-2" style="font-size: 2rem; color: white;">Welcome to Cordium</h1>
						<p class="mb-0" style="font-size: 0.95rem; color: rgba(255, 255, 255, 0.8);">Let's get your Discord bot up and running in just a few steps</p>
					</div>
				</div>
			</div>
			
			<div class="container py-3" style="flex: 1; display: flex; flex-direction: column; max-width: 1000px;">
				<div class="row justify-content-center" style="flex: 1;">
					<div class="col-12" style="display: flex; flex-direction: column;">
						<div class="wizard-steps mb-2">
							<div class="step active" data-step="1">
								<div class="step-number">1</div>
								<div class="step-label">Mode</div>
							</div>
							<div class="step-line"></div>
							<div class="step" data-step="2">
								<div class="step-number">2</div>
								<div class="step-label">Discord</div>
							</div>
							<div class="step-line"></div>
							<div class="step" data-step="3">
								<div class="step-number">3</div>
								<div class="step-label">Configuration</div>
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
										<h3>Choose Your Setup Mode</h3>
										<p class="text-muted">Select how you want to run Cordium</p>
										
										<div class="row g-3">
											<div class="col-md-6">
												<div class="mode-card" onclick="selectMode('standalone')" id="modeStandalone">
													<div class="mode-icon">
														<i class="bi bi-laptop"></i>
													</div>
													<h5>Standalone</h5>
													<p class="small mb-2">Simple local setup</p>
													<ul class="small text-start">
														<li>SQLite database (local file)</li>
														<li>No Redis required</li>
														<li>Easy setup, slower performance</li>
														<li>Perfect for testing</li>
													</ul>
												</div>
											</div>
											<div class="col-md-6">
												<div class="mode-card" onclick="selectMode('component')" id="modeComponent">
													<div class="mode-icon">
														<i class="bi bi-server"></i>
													</div>
													<h5>Component</h5>
													<p class="small mb-2">Production-ready setup</p>
													<ul class="small text-start">
														<li>MySQL/MariaDB database</li>
														<li>Redis cache layer</li>
														<li>Fast, scalable performance</li>
														<li>Recommended for production</li>
													</ul>
												</div>
											</div>
										</div>
										
										<input type="hidden" id="selectedMode" value="">
										
										<div class="d-grid mt-3">
											<button type="button" class="btn btn-primary" id="continueFromModeBtn" disabled>
												Continue <i class="bi bi-arrow-right ms-2"></i>
											</button>
										</div>
									</div>
								</div>
							</div>

							<div id="wizardStep2" style="display: none; width: 100%;">
								<div class="card shadow-lg">
									<div class="card-body">
										<h3>Discord Bot Configuration</h3>
										<p class="text-muted mb-3">Connect your Discord bot credentials</p>
										
										<form id="wizardDiscordForm">
											<div class="mb-2">
												<label class="form-label">Bot Token</label>
												<input type="password" class="form-control" id="wizard_client_token" value="${config.client_token || ''}" required>
												<small class="form-text text-muted">Developer Portal > Bot > Reset Token</small>
											</div>
											<div class="row g-2 mb-2">
												<div class="col-md-6">
													<label class="form-label">Client ID</label>
												<input type="text" class="form-control" id="wizard_client_id" value="${config.client_id || ''}" required>
													<small class="form-text text-muted">General Information</small>
											</div>
												<div class="col-md-6">
													<label class="form-label">Guild ID (Server ID)</label>
												<input type="text" class="form-control" id="wizard_discord_guild_id" value="${config.discord_guild_id || ''}" required>
													<small class="form-text text-muted">Right-click server</small>
												</div>
											</div>
											<div class="mb-2">
												<div class="d-flex justify-content-between align-items-center mb-2">
													<label class="form-label mb-0">Bot Permissions</label>
													<span class="badge bg-secondary" id="wizardBotPermissionsCount">0 selected</span>
												</div>
												<div class="permissions-actions mb-2">
													<button type="button" class="btn btn-sm btn-outline-primary" onclick="selectWizardBotPermissionsPreset('recommended')">
														<i class="bi bi-stars me-1"></i>Recommended
													</button>
													<button type="button" class="btn btn-sm btn-outline-secondary" onclick="selectWizardBotPermissionsPreset('minimal')">
														<i class="bi bi-sliders me-1"></i>Minimal
													</button>
													<button type="button" class="btn btn-sm btn-outline-secondary" onclick="selectWizardBotPermissionsPreset('admin')">
														<i class="bi bi-shield-lock me-1"></i>Administrator
													</button>
													<button type="button" class="btn btn-sm btn-outline-danger" onclick="selectWizardBotPermissionsPreset('none')">
														<i class="bi bi-x-circle me-1"></i>Clear
													</button>
												</div>
												<div class="permissions-grid" id="wizardBotPermissionsContainer"></div>
												<div class="permissions-summary mt-2" id="wizardBotPermissionsSummary">
													Permissions bitfield: 0 • No permissions selected
												</div>
											</div>
											
											<div class="alert alert-warning py-2 mb-2">
												<i class="bi bi-exclamation-triangle me-2"></i>
												<small><strong>Enable Intents:</strong> Presence, Server Members, Message Content</small>
											</div>

											<div id="wizardInviteLink" class="alert alert-info py-2 mb-2" style="display: none;">
												<small><strong>Invite Link:</strong></small>
												<div class="input-group input-group-sm mt-1">
													<input type="text" class="form-control" id="wizardInviteLinkInput" readonly>
													<button class="btn btn-primary" type="button" id="wizardCopyInviteBtn">
														<i class="bi bi-clipboard"></i>
													</button>
												</div>
											</div>

											<div class="d-flex gap-2 mt-3 pt-2 border-top">
												<button type="button" class="btn btn-outline-light" onclick="wizardBack(1)">
													<i class="bi bi-arrow-left me-2"></i> Back
												</button>
												<button type="submit" class="btn btn-primary flex-fill">
													Continue <i class="bi bi-arrow-right ms-2"></i>
												</button>
											</div>
										</form>
									</div>
								</div>
							</div>


							<div id="wizardStep3" style="display: none; width: 100%;">
								<div class="card shadow-lg">
									<div class="card-body">
										<h3 class="mb-2">Infrastructure Setup</h3>
										<p class="text-muted mb-3" style="font-size: 0.85rem;">Configure MySQL database and Redis cache</p>
										
										
										<form id="wizardComponentForm">
											<div class="row g-2">
												<div class="col-lg-6">
													<div class="wizard-config-card mb-2">
														<div class="wizard-config-header">
															<i class="bi bi-database me-1"></i>MySQL
												</div>
														<div class="wizard-config-body">
															<input type="text" class="form-control form-control-sm mb-2" id="wizard_db_host" value="${config.db_host || ''}" placeholder="Host (localhost)" required>
															<input type="text" class="form-control form-control-sm mb-2" id="wizard_db_name" value="${config.db_name || ''}" placeholder="Database Name" required>
															<div class="row g-2 mb-2">
																<div class="col-4">
																	<input type="number" class="form-control form-control-sm" id="wizard_db_port" value="${config.db_port || ''}" placeholder="Port" required>
												</div>
																<div class="col-4">
																	<input type="text" class="form-control form-control-sm" id="wizard_db_user" value="${config.db_user || ''}" placeholder="User" required>
											</div>
																<div class="col-4">
																	<input type="password" class="form-control form-control-sm" id="wizard_db_pass" value="${config.db_pass || ''}" placeholder="Pass" required>
												</div>
												</div>
															<div id="wizardDbTestResult" style="display: none;" class="mb-2"></div>
															<div class="d-flex gap-1">
																<button type="button" class="btn btn-xs btn-outline-primary flex-fill" id="wizardTestDbBtn">
																	<i class="bi bi-wifi"></i> Test
												</button>
																<button type="button" class="btn btn-xs btn-primary flex-fill" id="wizardCreateDbBtn">
																	<i class="bi bi-database-add"></i> Create
												</button>
											</div>
									</div>
								</div>
							</div>

												<div class="col-lg-6">
													<div class="wizard-config-card mb-2">
														<div class="wizard-config-header">
															<i class="bi bi-lightning-charge me-1"></i>Redis
												</div>
														<div class="wizard-config-body">
															<div class="row g-2 mb-2">
																<div class="col-8">
																	<input type="text" class="form-control form-control-sm" id="wizard_redis_host" value="${config.redis_host || ''}" placeholder="Host (localhost)" required>
												</div>
																<div class="col-4">
																	<input type="number" class="form-control form-control-sm" id="wizard_redis_port" value="${config.redis_port || ''}" placeholder="Port" required>
											</div>
												</div>
															<div class="row g-2 mb-2">
																<div class="col-8">
																	<input type="password" class="form-control form-control-sm" id="wizard_redis_password" value="${config.redis_password || ''}" placeholder="Password (optional)">
												</div>
																<div class="col-4">
																	<input type="number" class="form-control form-control-sm" id="wizard_redis_db" value="${config.redis_db || '0'}" placeholder="DB">
											</div>
															</div>
															<div id="wizardRedisTestResult" style="display: none;" class="mb-2"></div>
															<button type="button" class="btn btn-xs btn-outline-info w-100" id="wizardTestRedisBtn">
																<i class="bi bi-wifi"></i> Test Connection
															</button>
														</div>
													</div>
												</div>
											</div>
											
											<div class="d-flex gap-2 mt-2 pt-2 border-top">
												<button type="button" class="btn btn-sm btn-outline-light" onclick="wizardBack(2)">
													<i class="bi bi-arrow-left"></i>
												</button>
												<button type="submit" class="btn btn-success flex-fill">
													<i class="bi bi-check-circle me-1"></i> Complete Setup
												</button>
											</div>
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

	renderWizardBotPermissions(config);

	document.getElementById('wizard_client_id').addEventListener('input', updateWizardInviteLink);
	document.getElementById('wizard_discord_guild_id').addEventListener('input', updateWizardInviteLink);
	updateWizardInviteLink();

	document.getElementById('wizardCopyInviteBtn').addEventListener('click', () => {
		const input = document.getElementById('wizardInviteLinkInput');
		input.select();
		document.execCommand('copy');
		showNotification('Invite link copied to clipboard!', 'success');
	});

	if (savedMode) {
		document.getElementById('selectedMode').value = savedMode;
		const modeCard = document.getElementById(`mode${savedMode.charAt(0).toUpperCase() + savedMode.slice(1)}`);
		if (modeCard) {
			modeCard.classList.add('selected');
			document.getElementById('continueFromModeBtn').disabled = false;
		}
	}

	wizardGoToStep(savedStep);

	document.getElementById('continueFromModeBtn').addEventListener('click', async () => {
		const mode = document.getElementById('selectedMode').value;
		if (mode) {
			await saveWizardProgress(2, mode);
			wizardGoToStep(2);
		}
	});

	document.getElementById('wizardDiscordForm').addEventListener('submit', async (e) => {
		e.preventDefault();

		try {
			await saveWizardConfig(
				['client_token', 'client_id', 'discord_guild_id'],
				'wizard_',
				{ showLoading: false, showNotification: false, throwOnError: true }
			);
			await saveWizardBotPermissions({ showLoading: false, showNotification: false, throwOnError: true });

			const response = await fetch('/api/config');
			const updatedConfig = await response.json();
			const mode = updatedConfig.wizard_mode || 'component';

			showNotification('Discord configuration saved', 'success');

			if (mode === 'standalone') {
				await saveStandaloneConfig();
				await clearWizardProgress();
				wizardGoToStep(4);
			} else {
				await saveWizardProgress(3, mode);
				wizardGoToStep(3);
			}
		} catch (err) {
			console.error('Error in wizard step 2:', err);
			showNotification('Error: ' + err.message, 'danger');
		}
	});

	document.getElementById('wizardComponentForm').addEventListener('submit', async (e) => {
		e.preventDefault();

		const response = await fetch('/api/config');
		const currentConfig = await response.json();

		currentConfig.db_type = 'mysql';
		currentConfig.db_host = document.getElementById('wizard_db_host').value;
		currentConfig.db_name = document.getElementById('wizard_db_name').value;
		currentConfig.db_port = document.getElementById('wizard_db_port').value;
		currentConfig.db_user = document.getElementById('wizard_db_user').value;
		currentConfig.db_pass = document.getElementById('wizard_db_pass').value;
		currentConfig.redis_host = document.getElementById('wizard_redis_host').value;
		currentConfig.redis_port = document.getElementById('wizard_redis_port').value;
		currentConfig.redis_password = document.getElementById('wizard_redis_password').value;
		currentConfig.redis_db = document.getElementById('wizard_redis_db').value;

		delete currentConfig.db_path;

		await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(currentConfig)
		});

		await clearWizardProgress();
		wizardGoToStep(4);
	});

	document.getElementById('wizardTestDbBtn').addEventListener('click', async () => {
		await testWizardDatabaseConnection();
	});

	document.getElementById('wizardCreateDbBtn').addEventListener('click', async () => {
		showLoading('Creating database and tables...');
		await createWizardDatabase();
		hideLoading();
	});

	document.getElementById('wizardTestRedisBtn').addEventListener('click', async () => {
		await testWizardRedisConnection();
	});
}

function updateWizardInviteLink() {
	const clientId = document.getElementById('wizard_client_id').value.trim();
	const inviteLinkDiv = document.getElementById('wizardInviteLink');
	const inviteLinkInput = document.getElementById('wizardInviteLinkInput');

	const { bitfield } = updateWizardBotPermissionsSummary();
	const permissions = bitfield > 0n ? bitfield.toString() : '0';

	if (clientId) {
		const scopes = 'bot%20applications.commands';
		const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}&integration_type=0`;
		inviteLinkInput.value = inviteUrl;
		inviteLinkDiv.style.display = 'block';
	} else {
		inviteLinkDiv.style.display = 'none';
	}
}

window.selectMode = function (mode) {
	document.getElementById('selectedMode').value = mode;
	document.querySelectorAll('.mode-card').forEach(card => {
		card.classList.remove('selected');
	});
	document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('selected');
	document.getElementById('continueFromModeBtn').disabled = false;
};

async function saveStandaloneConfig() {
	try {
		const response = await fetch('/api/config');
		const currentConfig = await response.json();

		currentConfig.db_type = 'sqlite';
		currentConfig.db_path = './src/cordium.sqlite';

		delete currentConfig.db_host;
		delete currentConfig.db_port;
		delete currentConfig.db_name;
		delete currentConfig.db_user;
		delete currentConfig.db_pass;
		delete currentConfig.redis_host;
		delete currentConfig.redis_port;
		delete currentConfig.redis_password;
		delete currentConfig.redis_db;
		delete currentConfig.wizard_step;
		delete currentConfig.wizard_mode;

		const saveResponse = await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(currentConfig)
		});

		const result = await saveResponse.json();
		if (result.success) {
			showNotification('Standalone configuration saved', 'success');
		}
	} catch (err) {
		console.error('Error saving standalone config:', err);
	}
}

function wizardGoToStep(step) {
	document.getElementById('wizardStep1').style.display = step === 1 ? 'block' : 'none';
	document.getElementById('wizardStep2').style.display = step === 2 ? 'block' : 'none';
	document.getElementById('wizardStep3').style.display = step === 3 ? 'block' : 'none';
	document.getElementById('wizardStep4').style.display = step === 4 ? 'block' : 'none';

	document.querySelectorAll('.wizard-steps .step').forEach(s => {
		const stepNum = parseInt(s.getAttribute('data-step'));
		s.classList.toggle('active', stepNum === step);
		s.classList.toggle('completed', stepNum < step);
	});
}

window.wizardGoToStep = wizardGoToStep;

async function wizardBack(step) {
	const response = await fetch('/api/config');
	const config = await response.json();
	await saveWizardProgress(step, config.wizard_mode);
	wizardGoToStep(step);
}

window.wizardBack = wizardBack;

async function saveWizardProgress(step, mode) {
	try {
		const response = await fetch('/api/config');
		const config = await response.json();

		config.wizard_step = step.toString();
		if (mode) {
			config.wizard_mode = mode;
		}

		await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(config)
		});
	} catch (err) {
		console.error('Error saving wizard progress:', err);
	}
}

async function clearWizardProgress() {
	try {
		const response = await fetch('/api/config');
		const config = await response.json();

		delete config.wizard_step;
		delete config.wizard_mode;

		await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(config)
		});
	} catch (err) {
		console.error('Error clearing wizard progress:', err);
	}
}

async function saveWizardConfig(fields, prefix, options = {}) {
	const {
		showLoading: shouldShowLoading = true,
		showNotification: shouldShowNotification = true,
		throwOnError = false
	} = options;

	try {
		if (shouldShowLoading) showLoading();
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
			if (shouldShowNotification) {
				showNotification('Configuration saved!', 'success');
			}
			return true;
		} else {
			const errorMessage = data.error || 'Error saving configuration';
			if (shouldShowNotification) {
				showNotification(errorMessage, 'danger');
			}
			if (throwOnError) {
				throw new Error(errorMessage);
			}
			return false;
		}
	} catch (err) {
		if (shouldShowNotification) {
			showNotification('Error: ' + err.message, 'danger');
		}
		if (throwOnError) {
			throw err;
		}
		return false;
	} finally {
		if (shouldShowLoading) hideLoading();
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

async function createWizardDatabase() {
	const dbConfig = {
		db_host: document.getElementById('wizard_db_host').value,
		db_name: document.getElementById('wizard_db_name').value,
		db_port: document.getElementById('wizard_db_port').value,
		db_user: document.getElementById('wizard_db_user').value,
		db_pass: document.getElementById('wizard_db_pass').value
	};

	if (!dbConfig.db_host || !dbConfig.db_name || !dbConfig.db_user || !dbConfig.db_pass) {
		showNotification('Please fill in all database fields', 'warning');
		return;
	}

	try {
		const response = await fetch('/api/config/create-database', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dbConfig)
		});

		const result = await response.json();

		if (result.success) {
			showNotification(`Database created! ${result.tablesCreated} tables synchronized`, 'success');
		} else {
			showNotification('Database creation failed: ' + (result.error || 'Unknown error'), 'danger');
		}
	} catch (err) {
		showNotification('Error creating database: ' + err.message, 'danger');
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

			await loadPage(page);
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
	clearSelection();
	currentPage = page;
	localStorage.setItem('currentPage', page);
	const content = document.getElementById('content');
	showLoading();

	try {
		const templateResponse = await fetch(`pages/${page}.html`);
		if (!templateResponse.ok) {
			throw new Error(`Failed to load template: ${templateResponse.statusText}`);
		}
		const templateHTML = await templateResponse.text();
		content.innerHTML = templateHTML;

		switch (page) {
			case 'config':
				await initConfigPage();
				break;
			case 'server':
				await initServerPage();
				break;
			case 'channels':
				await initChannelsPage();
				break;
			case 'roles':
				await initRolesPage();
				break;
			case 'auto-roles':
				await initAutoRolesPage();
				break;
			case 'members':
				await initMembersPage();
				break;
			case 'messages':
				await initMessagesPage();
				break;
			case 'member-details':
				await initMemberDetailsPage();
				break;
			case 'commands':
				await initFilesPage('commands', 'Commands');
				break;
			case 'events':
				await initFilesPage('events', 'Events');
				break;
			case 'endpoints':
				await initFilesPage('endpoints', 'Endpoints');
				break;
			case 'sandbox':
				await initFilesPage('sandbox', 'Sandbox');
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

let serverData = null;

async function initServerPage() {
	try {
		const response = await fetch('/api/server/info');
		const serverInfo = await response.json();

		if (serverInfo.error) {
			document.getElementById('serverError').style.display = 'block';
			document.getElementById('serverErrorMessage').textContent = serverInfo.error;
			document.getElementById('serverContent').style.display = 'none';
			return;
		}

		document.getElementById('serverError').style.display = 'none';
		document.getElementById('serverContent').style.display = 'block';

		document.getElementById('serverMemberCount').textContent = serverInfo.memberCount;
		document.getElementById('serverChannelCount').textContent = serverInfo.channels.length;
		document.getElementById('serverRoleCount').textContent = serverInfo.roles.length;

		const statsResponse = await fetch('/api/server/messages-stats');
		const stats = await statsResponse.json();
		document.getElementById('serverMessageCount').textContent = stats.totalMessages || 0;

		serverData = serverInfo;

		await initServerCharts();

		setTimeout(() => {
			const tabButtons = document.querySelectorAll('#serverTabs button[data-bs-toggle="tab"]');
			tabButtons.forEach(btn => {
				btn.addEventListener('shown.bs.tab', () => {
					clearSelection();
				});
			});
		}, 100);

	} catch (err) {
		console.error('Error loading server page:', err);
		document.getElementById('serverError').style.display = 'block';
		document.getElementById('serverErrorMessage').textContent = err.message;
		document.getElementById('serverContent').style.display = 'none';
	}
}

async function initServerCharts() {
	await createMessagesChart();
	await createMemberActivityChart();
	await createChannelDistributionChart();
	await createHourlyActivityChart();
}

async function createMessagesChart() {
	const ctx = document.getElementById('messagesChart');
	if (!ctx) return;

	try {
		const response = await fetch('/api/server/analytics/messages-by-day');
		const result = await response.json();

		const labels = result.data.map(d => {
			const date = new Date(d.date);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		});
		const data = result.data.map(d => d.count);

		new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: 'Messages',
					data: data,
					borderColor: '#5865F2',
					backgroundColor: 'rgba(88, 101, 242, 0.1)',
					tension: 0.4,
					fill: true,
					borderWidth: 2
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)'
						}
					},
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)'
						}
					}
				}
			}
		});
	} catch (err) {
		console.error('Error creating messages chart:', err);
	}
}

async function createMemberActivityChart() {
	const ctx = document.getElementById('memberActivityChart');
	if (!ctx) return;

	try {
		const response = await fetch('/api/server/analytics/member-activity');
		const result = await response.json();

		const labels = result.joins.map(d => {
			const date = new Date(d.date);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		});
		const joinsData = result.joins.map(d => d.count);
		const leavesData = result.leaves.map(d => d.count);

		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: 'Joins',
					data: joinsData,
					backgroundColor: '#57F287',
					borderRadius: 4
				}, {
					label: 'Leaves',
					data: leavesData,
					backgroundColor: '#ED4245',
					borderRadius: 4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top',
						labels: {
							color: 'rgba(255, 255, 255, 0.9)'
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)'
						}
					},
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)'
						}
					}
				}
			}
		});
	} catch (err) {
		console.error('Error creating member activity chart:', err);
	}
}

async function createChannelDistributionChart() {
	const ctx = document.getElementById('channelDistributionChart');
	if (!ctx) return;

	try {
		const response = await fetch('/api/server/analytics/messages-by-channel');
		const result = await response.json();

		if (!result.data || result.data.length === 0) {
			ctx.parentElement.innerHTML = '<p class="text-muted text-center p-4">No data available</p>';
			return;
		}

		const top10 = result.data.slice(0, 10);
		const labels = top10.map(d => d.channelName || d.channel || 'Unknown');
		const data = top10.map(d => d.count || 0);

		const colors = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#00b4d8', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6b7280'];

		new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [{
					data: data,
					backgroundColor: colors
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right',
						labels: {
							color: 'rgba(255, 255, 255, 0.9)'
						}
					}
				}
			}
		});
	} catch (err) {
		console.error('Error creating channel distribution chart:', err);
	}
}

async function createHourlyActivityChart() {
	const ctx = document.getElementById('hourlyActivityChart');
	if (!ctx) return;

	try {
		const response = await fetch('/api/server/analytics/hourly-activity');
		const result = await response.json();

		const labels = result.data.map(d => `${d.hour}:00`);
		const data = result.data.map(d => d.count);

		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: 'Messages',
					data: data,
					backgroundColor: '#5865F2',
					borderRadius: 4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)'
						}
					},
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)',
							maxRotation: 45,
							minRotation: 45
						}
					}
				}
			}
		});
	} catch (err) {
		console.error('Error creating hourly activity chart:', err);
	}
}

async function initChannelsPage() {
	try {
		const response = await fetch('/api/server/info');
		const serverInfo = await response.json();

		if (serverInfo.error) {
			throw new Error(serverInfo.error);
		}

		const textChannels = serverInfo.channels.filter(c => c.type === 0).length;
		const voiceChannels = serverInfo.channels.filter(c => c.type === 2).length;
		const categories = serverInfo.channels.filter(c => c.type === 4).length;
		const forumChannels = serverInfo.channels.filter(c => c.type === 15).length;

		document.getElementById('textChannelCount').textContent = textChannels;
		document.getElementById('voiceChannelCount').textContent = voiceChannels;
		document.getElementById('categoryCount').textContent = categories;
		document.getElementById('forumChannelCount').textContent = forumChannels;

		populateChannelsList(serverInfo.channels);
	} catch (err) {
		console.error('Error loading channels page:', err);
	}
}

async function initRolesPage() {
	try {
		const response = await fetch('/api/server/info');
		const serverInfo = await response.json();

		if (serverInfo.error) {
			throw new Error(serverInfo.error);
		}

		const hoistedRoles = serverInfo.roles.filter(r => r.hoist).length;
		const managedRoles = serverInfo.roles.filter(r => r.managed).length;

		document.getElementById('totalRoleCount').textContent = serverInfo.roles.length;
		document.getElementById('hoistedRoleCount').textContent = hoistedRoles;
		document.getElementById('managedRoleCount').textContent = managedRoles;

		populateRolesList(serverInfo.roles);
	} catch (err) {
		console.error('Error loading roles page:', err);
	}
}

async function initAutoRolesPage() {
	try {
		const response = await fetch('/api/server/info');
		const serverInfo = await response.json();

		if (serverInfo.error) {
			throw new Error(serverInfo.error);
		}

		const configJsonResponse = await fetch('/api/config/json');
		const configJson = await configJsonResponse.json();

		const autoRoles = configJson.autoRoles || [];

		document.getElementById('totalRolesCount').textContent = serverInfo.roles.length;
		document.getElementById('autoRolesCount').textContent = autoRoles.length;

		const autoRolesList = document.getElementById('autoRolesList');
		let html = '<div class="row">';

		serverInfo.roles.forEach(role => {
			if (role.name !== '@everyone') {
				const isChecked = autoRoles.includes(role.name);
				html += `
					<div class="col-md-6 mb-3">
						<div class="form-check p-3 border rounded ${isChecked ? 'bg-success bg-opacity-10 border-success' : ''}">
							<input class="form-check-input" type="checkbox" value="${role.name}" id="autoRole_${role.id}" ${isChecked ? 'checked' : ''}>
							<label class="form-check-label d-flex align-items-center" for="autoRole_${role.id}">
								<span class="badge me-2" style="background-color: ${role.hexColor};">&nbsp;</span>
								<strong>${role.name}</strong>
								<span class="text-muted small ms-2">(${role.memberCount} members)</span>
							</label>
						</div>
					</div>
				`;
			}
		});

		html += '</div>';
		autoRolesList.innerHTML = html;
	} catch (err) {
		console.error('Error loading auto roles page:', err);
		showNotification('Error loading auto roles: ' + err.message, 'danger');
	}
}

window.saveAutoRoles = async function () {
	try {
		const checkboxes = document.querySelectorAll('#autoRolesList input[type="checkbox"]');
		const selectedRoles = Array.from(checkboxes)
			.filter(cb => cb.checked)
			.map(cb => cb.value);

		showLoading('Saving configuration...');

		const configData = {
			autoRoles: selectedRoles
		};

		const saveResponse = await fetch('/api/config/json', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(configData)
		});

		const data = await saveResponse.json();
		if (data.success) {
			showNotification(`Auto roles configuration saved (${selectedRoles.length} role(s))`, 'success');
			document.getElementById('autoRolesCount').textContent = selectedRoles.length;
		} else {
			showNotification('Error saving auto roles configuration', 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	} finally {
		hideLoading();
	}
};

async function initMembersPage() {
	try {
		const response = await fetch('/api/server/all-members');
		const result = await response.json();

		console.log('Members API response:', result);

		if (result.error) {
			console.error('Members API error:', result.error);
			showNotification(result.error, 'warning');
		}

		if (!result.members || result.members.length === 0) {
			const membersList = document.getElementById('membersList');
			if (membersList) {
				membersList.innerHTML = '<div class="text-center p-4 text-muted">No members found</div>';
			}
			return;
		}

		const activeMembers = result.members.filter(m => m.isActive);
		const onlineMembers = activeMembers.filter(m => m.status === 'online').length;
		const bots = result.members.filter(m => m.bot).length;
		const boosters = activeMembers.filter(m => m.premiumSince).length;

		document.getElementById('totalMemberCount').textContent = result.members.length;
		document.getElementById('onlineMemberCount').textContent = onlineMembers;
		document.getElementById('botCount').textContent = bots;
		document.getElementById('boosterCount').textContent = boosters;

		populateMembersList(result.members);
		initServerSearch();
	} catch (err) {
		console.error('Error loading members page:', err);
		showNotification('Error loading members: ' + err.message, 'danger');
	}
}

async function initMessagesPage() {
	try {
		const statsResponse = await fetch('/api/server/messages-stats');
		const stats = await statsResponse.json();

		document.getElementById('totalMessageCount').textContent = stats.totalMessages || 0;
		document.getElementById('recentMessageCount').textContent = stats.last24h || 0;
		document.getElementById('attachmentCount').textContent = stats.withAttachments || 0;

		await loadCachedMessages();
		initMessageSearch();
	} catch (err) {
		console.error('Error loading messages page:', err);
	}
}

function initMessageSearch() {
	setTimeout(() => {
		const searchInput = document.getElementById('messageSearch');
		const clearBtn = document.getElementById('clearMessageSearch');

		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				const query = e.target.value.toLowerCase();
				const messages = document.querySelectorAll('#messagesContainer .list-group-item');
				messages.forEach(message => {
					const text = message.textContent.toLowerCase();
					message.style.display = text.includes(query) ? '' : 'none';
				});
			});
		}

		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				if (searchInput) {
					searchInput.value = '';
					const messages = document.querySelectorAll('#messagesContainer .list-group-item');
					messages.forEach(message => message.style.display = '');
				}
			});
		}
	}, 100);
}

function populateChannelsList(channels) {
	const channelsList = document.getElementById('channelsList');
	const channelTypeNames = { 0: 'Text', 2: 'Voice', 4: 'Category', 5: 'News', 13: 'Stage', 15: 'Forum' };
	const channelTypeIcons = { 0: 'bi-hash', 2: 'bi-volume-up', 4: 'bi-folder', 5: 'bi-megaphone', 13: 'bi-broadcast', 15: 'bi-chat-square-text' };

	const categories = channels.filter(c => c.type === 4);
	const noCategory = channels.filter(c => c.type !== 4 && !c.parentId);

	let html = `
		<div class="select-all-container">
			<input type="checkbox" class="item-checkbox" id="selectAllCheckbox" onchange="selectAllItems('channel')">
			<label for="selectAllCheckbox">Select All</label>
		</div>
		<div class="list-group-item bg-primary text-white d-flex justify-content-between align-items-center">
			<div><strong>Create New Channel/Category</strong></div>
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
		html += `
			<div class="list-group-item d-flex justify-content-between align-items-center" data-item-id="${channel.id}">
				<div class="d-flex align-items-center gap-2">
					<input type="checkbox" class="item-checkbox" data-item-type="channel" value="${channel.id}" onchange="toggleItemSelection('${channel.id}', 'channel')" onclick="event.stopPropagation()">
					<i class="bi ${icon}"></i>
					<div>
						<strong>${channel.name}</strong>
						<span class="badge bg-secondary ms-2">${typeName}</span>
						${channel.members !== null ? `<span class="badge bg-info ms-1">${channel.members} members</span>` : ''}
						${channel.topic ? `<br><small class="text-muted ms-4">${channel.topic}</small>` : ''}
					</div>
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
		const childChannels = channels.filter(c => c.parentId === category.id);
		html += `
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
			html += `
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

	channelsList.innerHTML = html;
}

function populateRolesList(roles) {
	const rolesList = document.getElementById('rolesList');
	let html = `
		<div class="select-all-container">
			<input type="checkbox" class="item-checkbox" id="selectAllCheckbox" onchange="selectAllItems('role')">
			<label for="selectAllCheckbox">Select All</label>
		</div>
		<div class="list-group-item bg-success text-white d-flex justify-content-between align-items-center">
			<div><strong>Create New Role</strong></div>
			<div>
				<button class="btn btn-sm btn-light me-2" onclick="showSetupRoleModal()" title="Create pre-configured role">
					<i class="bi bi-magic"></i> Pre-configured Role
				</button>
				<button class="btn btn-sm btn-light" onclick="createRole()" title="Create role">
					<i class="bi bi-plus-circle"></i> New Role
				</button>
			</div>
		</div>
	`;

	roles.forEach(role => {
		html += `
			<div class="list-group-item d-flex justify-content-between align-items-center" data-item-id="${role.id}">
				<div class="d-flex align-items-center gap-2">
					<input type="checkbox" class="item-checkbox" data-item-type="role" value="${role.id}" onchange="toggleItemSelection('${role.id}', 'role')" onclick="event.stopPropagation()">
					<i class="bi bi-shield-fill" style="color: ${role.hexColor}"></i>
					<div>
						<strong>${role.name}</strong>
						<span class="badge bg-secondary ms-2">${role.memberCount} members</span>
						${role.hoist ? '<span class="badge bg-primary ms-1">Hoisted</span>' : ''}
						${role.managed ? '<span class="badge bg-warning ms-1">Managed</span>' : ''}
					</div>
				</div>
				<div class="item-menu">
					<button class="item-menu-btn" onclick="toggleMenu(this)">
						<i class="bi bi-three-dots-vertical"></i>
					</button>
					<div class="item-menu-dropdown">
						<button onclick="viewRoleMembers('${role.id}', '${role.name}')">
							<i class="bi bi-people"></i>
							<span>View Members</span>
						</button>
						<button onclick="editRole('${role.id}', '${role.name}', '${role.hexColor}')">
							<i class="bi bi-pencil"></i>
							<span>Edit</span>
						</button>
						<button onclick="copyRoleId('${role.id}')">
							<i class="bi bi-clipboard"></i>
							<span>Copy ID</span>
						</button>
						<div class="divider"></div>
						<button class="text-danger" onclick="deleteRole('${role.id}', '${role.name}')">
							<i class="bi bi-trash"></i>
							<span>Delete</span>
						</button>
					</div>
				</div>
			</div>
		`;
	});

	rolesList.innerHTML = html;
}

function populateMembersList(members) {
	const membersList = document.getElementById('membersList');
	const statusIcons = {
		online: '<i class="bi bi-circle-fill text-success"></i>',
		idle: '<i class="bi bi-circle-fill text-warning"></i>',
		dnd: '<i class="bi bi-circle-fill text-danger"></i>',
		offline: '<i class="bi bi-circle text-secondary"></i>',
		left: '<i class="bi bi-door-closed text-danger"></i>'
	};

	let html = '';
	members.forEach(member => {
		membersDataCache[member.id] = {
			displayName: member.displayName || member.username,
			avatarURL: member.avatarURL,
			nickname: member.nickname,
			roles: member.roles || []
		};

		const statusIcon = statusIcons[member.status] || statusIcons.offline;
		const ownerBadge = member.isOwner ? '<span class="badge bg-warning ms-2"><i class="bi bi-crown"></i> Owner</span>' : '';
		const botBadge = member.bot ? '<span class="badge bg-secondary ms-2">Bot</span>' : '';
		const boosterBadge = member.premiumSince ? '<span class="badge bg-info ms-2"><i class="bi bi-gem"></i> Booster</span>' : '';
		const leftBadge = !member.isActive ? '<span class="badge bg-danger ms-2"><i class="bi bi-door-closed"></i> Left</span>' : '';

		html += `
			<div class="list-group-item d-flex align-items-center ${!member.isActive ? 'opacity-75' : ''}" style="cursor: pointer;" onclick="viewMemberDetailsPage('${member.id}')">
				<img src="${member.avatarURL}" alt="${member.displayName}" class="rounded-circle me-3" width="40" height="40">
				<div class="flex-grow-1">
					<div>
						${statusIcon}
						<strong class="ms-2">${member.displayName || member.username}</strong>
						${ownerBadge}
						${botBadge}
						${boosterBadge}
						${leftBadge}
					</div>
					<small class="text-muted">${member.username}</small>
				</div>
				<div class="item-menu" onclick="event.stopPropagation()">
					<button class="item-menu-btn" onclick="toggleMenu(this)">
						<i class="bi bi-three-dots-vertical"></i>
					</button>
					<div class="item-menu-dropdown">
						<button onclick="viewMemberDetailsPage('${member.id}')">
							<i class="bi bi-person-circle"></i>
							<span>View Profile</span>
						</button>
						${member.isActive ? `
							<button onclick="manageMemberRoles('${member.id}', '${member.displayName}')">
								<i class="bi bi-shield"></i>
								<span>Manage Roles</span>
							</button>
							<button onclick="changeNickname('${member.id}', '${member.displayName}')">
								<i class="bi bi-pencil"></i>
								<span>Change Nickname</span>
							</button>
						` : ''}
						<button onclick="copyMemberId('${member.id}')">
							<i class="bi bi-clipboard"></i>
							<span>Copy ID</span>
						</button>
						${member.isActive ? `
							<div class="divider"></div>
							<button class="text-warning" onclick="timeoutMember('${member.id}', '${member.displayName}')">
								<i class="bi bi-clock"></i>
								<span>Timeout</span>
							</button>
							<button class="text-danger" onclick="kickMember('${member.id}', '${member.displayName}')">
								<i class="bi bi-door-open"></i>
								<span>Kick</span>
							</button>
							<button class="text-danger" onclick="banMember('${member.id}', '${member.displayName}')">
								<i class="bi bi-ban"></i>
								<span>Ban</span>
							</button>
						` : ''}
					</div>
				</div>
			</div>
		`;
	});

	membersList.innerHTML = html;
}

window.viewMemberDetailsPage = function (memberId) {
	sessionStorage.setItem('selectedMemberId', memberId);
	loadPage('member-details');
};

async function initMemberDetailsPage() {
	const memberId = sessionStorage.getItem('selectedMemberId');

	if (!memberId) {
		document.getElementById('content').innerHTML = `
			<div class="alert alert-warning">
				<i class="bi bi-exclamation-triangle me-2"></i>
				No member selected
			</div>
		`;
		return;
	}

	try {
		const response = await fetch(`/api/server/member-details?memberId=${memberId}`);
		const data = await response.json();

		if (data.error) {
			throw new Error(data.error);
		}

		const member = data.member || data;

		document.getElementById('memberDetailsName').textContent = member.displayName || member.username;
		document.getElementById('memberAvatar').src = member.avatarURL;
		document.getElementById('memberDisplayName').textContent = member.displayName || member.username;
		document.getElementById('memberUsername').textContent = `@${member.username}`;
		document.getElementById('memberUserId').textContent = member.id;

		const badges = [];
		if (member.isOwner) badges.push('<span class="badge bg-warning"><i class="bi bi-crown"></i> Server Owner</span>');
		if (member.bot) badges.push('<span class="badge bg-secondary">Bot</span>');
		if (member.premiumSince) badges.push('<span class="badge bg-info"><i class="bi bi-gem"></i> Server Booster</span>');
		if (!member.isActive) badges.push('<span class="badge bg-danger"><i class="bi bi-door-closed"></i> Left Server</span>');
		document.getElementById('memberBadges').innerHTML = badges.join(' ');

		const statusIcons = {
			online: '<span class="badge bg-success"><i class="bi bi-circle-fill"></i> Online</span>',
			idle: '<span class="badge bg-warning"><i class="bi bi-circle-fill"></i> Idle</span>',
			dnd: '<span class="badge bg-danger"><i class="bi bi-circle-fill"></i> Do Not Disturb</span>',
			offline: '<span class="badge bg-secondary"><i class="bi bi-circle"></i> Offline</span>',
			left: '<span class="badge bg-danger"><i class="bi bi-door-closed"></i> Left Server</span>'
		};
		document.getElementById('memberStatus').innerHTML = statusIcons[member.status] || statusIcons.offline;

		if (member.joinedAt) {
			const joinDate = new Date(member.joinedAt);
			document.getElementById('memberJoinedAt').textContent = joinDate.toLocaleString();
			const daysOnServer = Math.floor((Date.now() - member.joinedAt) / (1000 * 60 * 60 * 24));
			document.getElementById('memberDaysOnServer').textContent = `${daysOnServer} days`;
		} else {
			document.getElementById('memberJoinedAt').textContent = 'Unknown';
			document.getElementById('memberDaysOnServer').textContent = 'Unknown';
		}

		if (member.accountCreatedAt) {
			const createDate = new Date(member.accountCreatedAt);
			document.getElementById('memberCreatedAt').textContent = createDate.toLocaleString();
			const accountDays = Math.floor((Date.now() - member.accountCreatedAt) / (1000 * 60 * 60 * 24));
			document.getElementById('memberAccountAge').textContent = `${accountDays} days`;
		} else {
			document.getElementById('memberCreatedAt').textContent = 'Unknown';
			document.getElementById('memberAccountAge').textContent = 'Unknown';
		}

		if (member.nickname) {
			document.getElementById('memberNicknameRow').style.display = 'flex';
			document.getElementById('memberNickname').textContent = member.nickname;
		}

		if (member.premiumSince) {
			document.getElementById('memberBoostRow').style.display = 'flex';
			const boostDate = new Date(member.premiumSince);
			document.getElementById('memberBoostingSince').textContent = boostDate.toLocaleString();
		}

		if (member.roles && member.roles.length > 0) {
			const rolesHTML = member.roles.map(r =>
				`<span class="badge me-1 mb-1" style="background-color: ${r.color};">${r.name}</span>`
			).join('');
			document.getElementById('memberRolesDisplay').innerHTML = rolesHTML;
		} else {
			document.getElementById('memberRolesDisplay').innerHTML = '<span class="text-muted">No roles</span>';
		}

		if (member.activities && member.activities.length > 0) {
			document.getElementById('memberActivitiesCard').style.display = 'block';
			const activitiesHTML = member.activities.map(a =>
				`<div class="mb-2"><i class="bi bi-controller me-2"></i>${a.name || a}</div>`
			).join('');
			document.getElementById('memberActivities').innerHTML = activitiesHTML;
		}

		if (member.recentActivity && member.recentActivity.length > 0) {
			const activityHTML = member.recentActivity.slice(0, 20).map(event => {
				const date = new Date(parseInt(event.timestamp));
				let eventData = {};
				try {
					eventData = JSON.parse(event.event_data || '{}');
				} catch (e) {
					eventData = {};
				}

				const icons = {
					'MessageCreate': 'chat-left-text',
					'MessageUpdate': 'pencil-square',
					'MessageDelete': 'trash',
					'MessageReactionAdd': 'emoji-smile',
					'MessageReactionRemove': 'emoji-neutral',
					'GuildMemberAdd': 'door-open',
					'GuildMemberRemove': 'door-closed',
					'GuildMemberUpdate': 'person-badge',
					'VoiceStateUpdate': 'mic',
					'GuildBanAdd': 'ban',
					'GuildBanRemove': 'check-circle',
					'InteractionCreate': 'cursor',
					'InviteCreate': 'link-45deg',
					'InviteDelete': 'link-45deg',
					'GuildRoleCreate': 'plus-circle',
					'GuildRoleUpdate': 'arrow-repeat',
					'GuildRoleDelete': 'x-circle',
					'ChannelCreate': 'hash-plus',
					'ChannelUpdate': 'hash',
					'ChannelDelete': 'hash-x'
				};

				let icon = icons[event.event_name] || 'circle';
				if (event.event_name === 'GuildMemberRemove' && eventData.reason === 'kicked') {
					icon = 'person-x';
				}
				let details = '';

				switch (event.event_name) {
					case 'MessageCreate':
						const channelId1 = event.channel_id;
						const messageId1 = event.message_id;
						const messageLink1 = channelId1 && messageId1 ? `https://discord.com/channels/${event.guild_id}/${channelId1}/${messageId1}` : null;
						details = `<div class="text-muted small mt-1">
							${eventData.content ? `"${eventData.content}"<br>` : ''}
							${messageLink1 ? `<a href="${messageLink1}" target="_blank" class="text-primary"><i class="bi bi-box-arrow-up-right"></i> View message</a>` : ''}
						</div>`;
						break;
					case 'MessageUpdate':
						const channelId2 = event.channel_id;
						const messageId2 = event.message_id;
						const messageLink2 = channelId2 && messageId2 ? `https://discord.com/channels/${event.guild_id}/${channelId2}/${messageId2}` : null;
						details = `<div class="text-muted small mt-1">
							<strong>Before:</strong> "${eventData.oldContent || ''}"<br>
							<strong>After:</strong> "${eventData.newContent || ''}"<br>
							${messageLink2 ? `<a href="${messageLink2}" target="_blank" class="text-primary"><i class="bi bi-box-arrow-up-right"></i> View message</a>` : ''}
						</div>`;
						break;
					case 'MessageDelete':
						details = `<div class="text-muted small mt-1">
							${eventData.content ? `"${eventData.content}"<br>` : ''}
							<span class="text-muted">Message ID: ${event.message_id}</span>
						</div>`;
						break;
					case 'GuildMemberUpdate':
						const changes = [];
						if (eventData.nickname) {
							changes.push(`<strong>Nickname:</strong> "${eventData.nickname.old || 'None'}" → "${eventData.nickname.new || 'None'}"`);
						}
						if (eventData.avatar) {
							changes.push(`<strong>Avatar changed</strong><br>
								<img src="${eventData.avatar.old}" width="40" height="40" class="rounded me-2"> → 
								<img src="${eventData.avatar.new}" width="40" height="40" class="rounded">`);
						}
						if (eventData.boost) {
							if (eventData.boost.action === 'started') {
								changes.push(`<strong class="text-info">🎉 Started boosting the server!</strong>`);
							} else {
								changes.push(`<strong>Stopped boosting the server</strong>`);
							}
						}
						if (eventData.timeout) {
							if (eventData.timeout.removed) {
								changes.push(`<strong class="text-success">Timeout removed</strong>`);
							} else {
								changes.push(`<strong class="text-warning">⏱️ Timed out for ${eventData.timeout.duration}</strong>`);
							}
						}
						if (eventData.roles) {
							if (eventData.roles.added && eventData.roles.added.length > 0) {
								const roleNames = eventData.roles.added.map(r => r.name).join(', ');
								changes.push(`<strong>Roles added:</strong> ${roleNames}`);
							}
							if (eventData.roles.removed && eventData.roles.removed.length > 0) {
								const roleNames = eventData.roles.removed.map(r => r.name).join(', ');
								changes.push(`<strong>Roles removed:</strong> ${roleNames}`);
							}
						}
						details = changes.length > 0 ? `<div class="text-muted small mt-1">${changes.join('<br>')}</div>` : '';
						break;
					case 'VoiceStateUpdate':
						const vcDetails = [];
						if (eventData.action === 'join') {
							vcDetails.push(`<strong class="text-success">🎤 Joined voice channel</strong> #${eventData.channelName}`);
						} else if (eventData.action === 'leave') {
							vcDetails.push(`<strong class="text-danger">🚪 Left voice channel</strong> #${eventData.channelName}`);
						} else if (eventData.action === 'move') {
							vcDetails.push(`<strong>🔀 Moved channels</strong><br>From: #${eventData.oldChannelName}<br>To: #${eventData.newChannelName}`);
						}

						const vcChanges = [];
						if (eventData.serverMute) {
							vcChanges.push(`<i class="bi bi-mic-mute-fill text-${eventData.serverMute.new ? 'danger' : 'success'}"></i> Server ${eventData.serverMute.new ? '<strong>muted</strong>' : 'unmuted'}`);
						}
						if (eventData.serverDeaf) {
							vcChanges.push(`<i class="bi bi-volume-mute-fill text-${eventData.serverDeaf.new ? 'danger' : 'success'}"></i> Server ${eventData.serverDeaf.new ? '<strong>deafened</strong>' : 'undeafened'}`);
						}
						if (eventData.selfMute) {
							vcChanges.push(`<i class="bi bi-mic-fill"></i> Self ${eventData.selfMute.new ? 'muted' : 'unmuted'}`);
						}
						if (eventData.selfDeaf) {
							vcChanges.push(`<i class="bi bi-headphones"></i> Self ${eventData.selfDeaf.new ? 'deafened' : 'undeafened'}`);
						}
						if (eventData.streaming) {
							vcChanges.push(`<i class="bi bi-broadcast-pin text-${eventData.streaming.new ? 'info' : 'muted'}"></i> ${eventData.streaming.new ? '<strong>Started streaming 🔴</strong>' : 'Stopped streaming'}`);
						}
						if (eventData.camera) {
							vcChanges.push(`<i class="bi bi-camera-video-fill text-${eventData.camera.new ? 'info' : 'muted'}"></i> Camera ${eventData.camera.new ? '<strong>ON</strong>' : 'off'}`);
						}

						if (vcChanges.length > 0) {
							vcDetails.push(`<div class="mt-1">${vcChanges.join('<br>')}</div>`);
						}

						details = `<div class="text-muted small mt-1">${vcDetails.join('<br>')}</div>`;
						break;
					case 'MessageReactionAdd':
					case 'MessageReactionRemove':
						const channelId3 = event.channel_id;
						const messageId3 = event.message_id;
						const messageLink3 = channelId3 && messageId3 ? `https://discord.com/channels/${event.guild_id}/${channelId3}/${messageId3}` : null;
						details = `<div class="text-muted small mt-1">
							Emoji: ${eventData.emoji}<br>
							${messageLink3 ? `<a href="${messageLink3}" target="_blank" class="text-primary"><i class="bi bi-box-arrow-up-right"></i> View message</a>` : ''}
						</div>`;
						break;
					case 'GuildBanAdd':
						if (eventData.executor) {
							details = `<div class="text-muted small mt-1">
							<strong class="text-danger">🔨 Banned from server</strong><br>
							By: <img src="${eventData.executor.avatar}" width="20" height="20" class="rounded me-1">${eventData.executor.username}<br>
							Reason: ${eventData.reason || 'No reason provided'}
						</div>`;
						} else {
							details = `<div class="text-muted small mt-1">Reason: ${eventData.reason || 'No reason provided'}</div>`;
						}
						break;
					case 'GuildMemberRemove':
						if (eventData.reason === 'kicked' && eventData.executor) {
							details = `<div class="text-muted small mt-1">
							<strong class="text-warning">⚠️ Kicked from server</strong><br>
							By: <img src="${eventData.executor.avatar}" width="20" height="20" class="rounded me-1">${eventData.executor.username}<br>
							${eventData.roles && eventData.roles.length > 0 ? `Had roles: ${eventData.roles.map(r => r.name).join(', ')}` : ''}
						</div>`;
						} else {
							details = `<div class="text-muted small mt-1">
							${eventData.roles && eventData.roles.length > 0 ? `Had roles: ${eventData.roles.map(r => r.name).join(', ')}` : ''}
						</div>`;
						}
						break;
					case 'InteractionCreate':
						if (eventData.commandName) {
							const channelId4 = event.channel_id;
							const channelLink = channelId4 ? `https://discord.com/channels/${event.guild_id}/${channelId4}` : null;
							details = `<div class="text-muted small mt-1">
								Command: <code>/${eventData.commandName}</code><br>
								${channelLink ? `<a href="${channelLink}" target="_blank" class="text-primary"><i class="bi bi-box-arrow-up-right"></i> View channel</a>` : ''}
							</div>`;
						}
						break;
					case 'InviteCreate':
						details = `<div class="text-muted small mt-1">
							Code: <code>${eventData.code}</code><br>
							Channel: #${eventData.channelName || 'unknown'}<br>
							Max uses: ${eventData.maxUses || 'Unlimited'}
						</div>`;
						break;
					case 'InviteDelete':
						details = `<div class="text-muted small mt-1">
							Code: <code>${eventData.code}</code><br>
							Channel: #${eventData.channelName || 'unknown'}
						</div>`;
						break;
					case 'GuildRoleCreate':
					case 'GuildRoleUpdate':
					case 'GuildRoleDelete':
						details = `<div class="text-muted small mt-1">Role: ${eventData.roleName || eventData.name}</div>`;
						if (eventData.changes) {
							const roleChanges = [];
							if (eventData.changes.name) roleChanges.push(`Name: "${eventData.changes.name.old}" → "${eventData.changes.name.new}"`);
							if (eventData.changes.color) roleChanges.push(`Color: ${eventData.changes.color.old} → ${eventData.changes.color.new}`);
							if (roleChanges.length > 0) details += `<div class="text-muted small">${roleChanges.join('<br>')}</div>`;
						}
						break;
					case 'ChannelCreate':
					case 'ChannelUpdate':
					case 'ChannelDelete':
						details = `<div class="text-muted small mt-1">Channel: #${eventData.channelName || eventData.name}</div>`;
						break;
				}

				const eventNames = {
					'MessageCreate': 'Sent a message',
					'MessageUpdate': 'Edited a message',
					'MessageDelete': 'Deleted a message',
					'MessageReactionAdd': 'Added reaction',
					'MessageReactionRemove': 'Removed reaction',
					'GuildMemberAdd': 'Joined server',
					'GuildMemberRemove': 'Left server',
					'GuildMemberUpdate': 'Updated profile',
					'VoiceStateUpdate': 'Voice activity',
					'GuildBanAdd': 'Banned from server',
					'GuildBanRemove': 'Unbanned',
					'InteractionCreate': 'Used command',
					'InviteCreate': 'Created invite',
					'InviteDelete': 'Deleted invite',
					'GuildRoleCreate': 'Role created',
					'GuildRoleUpdate': 'Role updated',
					'GuildRoleDelete': 'Role deleted',
					'ChannelCreate': 'Channel created',
					'ChannelUpdate': 'Channel updated',
					'ChannelDelete': 'Channel deleted'
				};
				let eventName = eventNames[event.event_name] || event.event_name;

				if (event.event_name === 'GuildMemberRemove' && eventData.reason === 'kicked') {
					eventName = 'Kicked from server';
				}

				return `
					<div class="list-group-item">
						<div class="d-flex justify-content-between align-items-start">
							<div class="flex-grow-1">
								<div><i class="bi bi-${icon} me-2"></i><strong>${eventName}</strong></div>
								${details}
							</div>
							<small class="text-muted text-nowrap ms-2">${date.toLocaleString()}</small>
						</div>
					</div>
				`;
			}).join('');
			document.getElementById('memberRecentActivity').innerHTML = activityHTML;
		}

		window.manageMemberRolesAction = () => manageMemberRoles(member.id, member.displayName, member.avatarURL, member.roles);
		window.changeNicknameAction = () => changeNickname(member.id, member.displayName, member.avatarURL, member.nickname);
		window.timeoutMemberAction = () => timeoutMember(member.id, member.displayName, member.avatarURL);
		window.kickMemberAction = () => kickMember(member.id, member.displayName, member.avatarURL);
		window.banMemberAction = () => banMember(member.id, member.displayName, member.avatarURL);

	} catch (err) {
		console.error('Error loading member details:', err);
		showNotification('Error loading member details: ' + err.message, 'danger');
	}
}

function formatDiscordMessage(content, membersMap, rolesMap, channelsMap) {
	if (!content) return '<em>No content</em>';

	const placeholders = [];
	let placeholderIndex = 0;

	// Format user mentions: <@userId> or <@!userId>
	let formatted = content.replace(/<@!?(\d+)>/g, (match, userId) => {
		const member = membersMap.get(userId);
		const placeholder = `__MENTION_USER_${placeholderIndex++}__`;
		if (member) {
			placeholders.push(`<span class="badge bg-primary mention">@${member.displayName || member.username}</span>`);
		} else {
			placeholders.push(`<span class="badge bg-secondary mention">@Unknown</span>`);
		}
		return placeholder;
	});

	// Format role mentions: <@&roleId>
	formatted = formatted.replace(/<@&(\d+)>/g, (match, roleId) => {
		const role = rolesMap.get(roleId);
		const placeholder = `__MENTION_ROLE_${placeholderIndex++}__`;
		if (role) {
			const roleColor = role.color && role.color !== '#000000' ? role.color : '#99AAB5';
			placeholders.push(`<span class="badge mention" style="background-color: ${roleColor};">@${role.name}</span>`);
		} else {
			placeholders.push(`<span class="badge bg-secondary mention">@Unknown Role</span>`);
		}
		return placeholder;
	});

	// Format channel mentions: <#channelId>
	formatted = formatted.replace(/<#(\d+)>/g, (match, channelId) => {
		const channel = channelsMap.get(channelId);
		const placeholder = `__MENTION_CHANNEL_${placeholderIndex++}__`;
		if (channel) {
			placeholders.push(`<span class="badge bg-info mention">#${channel.name}</span>`);
		} else {
			placeholders.push(`<span class="badge bg-secondary mention">#Unknown Channel</span>`);
		}
		return placeholder;
	});

	// Escape HTML
	formatted = formatted
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	// Restore placeholders
	let restoreIndex = 0;
	formatted = formatted.replace(/__(MENTION_USER|MENTION_ROLE|MENTION_CHANNEL)_(\d+)__/g, () => {
		return placeholders[restoreIndex++];
	});

	// Format URLs
	formatted = formatted.replace(/(https?:\/\/[^\s&lt;&gt;]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

	// Format line breaks
	formatted = formatted.replace(/\n/g, '<br>');

	return formatted;
}

async function loadCachedMessages() {
	try {
		const response = await fetch('/api/server/messages?limit=30');
		const data = await response.json();
		const messagesContainer = document.getElementById('messagesContainer');

		if (data.error) {
			messagesContainer.innerHTML = `
				<div class="alert alert-warning m-3">
					<i class="bi bi-exclamation-triangle me-2"></i>
					${data.error}
				</div>
			`;
			const statsElement = document.getElementById('messagesStats');
			if (statsElement) statsElement.textContent = '0 messages';
			return;
		}

		if (!data.messages || data.messages.length === 0) {
			messagesContainer.innerHTML = '<div class="text-center p-4 text-muted">No cached messages</div>';
			const statsElement = document.getElementById('messagesStats');
			if (statsElement) statsElement.textContent = '0 messages';
			return;
		}

		// Load server info for members, roles, and channels
		const serverInfoResponse = await fetch('/api/server/info');
		const serverInfo = await serverInfoResponse.json();

		const membersMap = new Map();
		const rolesMap = new Map();
		const channelsMap = new Map();

		if (serverInfo.members) {
			serverInfo.members.forEach(member => {
				membersMap.set(member.id, member);
			});
		}

		if (serverInfo.roles) {
			serverInfo.roles.forEach(role => {
				rolesMap.set(role.id, role);
			});
		}

		if (serverInfo.channels) {
			serverInfo.channels.forEach(channel => {
				channelsMap.set(channel.id, channel);
			});
		}

		messagesContainer.innerHTML = '';

		const selectAllDiv = document.createElement('div');
		selectAllDiv.className = 'select-all-container';
		selectAllDiv.innerHTML = `
			<input type="checkbox" class="item-checkbox" id="selectAllCheckbox" onchange="selectAllItems('message')">
			<label for="selectAllCheckbox">Select All</label>
		`;
		messagesContainer.appendChild(selectAllDiv);

		const fragment = document.createDocumentFragment();

		data.messages.forEach(msg => {
			const authorAvatar = msg.author?.avatarURL || msg.authorAvatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
			const authorName = msg.author?.username || msg.authorDisplayName || msg.authorUsername || msg.authorName || 'Unknown';
			const timestamp = msg.createdTimestamp || msg.timestamp || Date.now();
			const rawContent = msg.content || '';
			const formattedContent = formatDiscordMessage(rawContent, membersMap, rolesMap, channelsMap);
			const messageId = msg.id || msg.messageId;
			const isDeleted = msg.deleted === true;
			const deletedAt = msg.deletedAt ? new Date(msg.deletedAt).toLocaleString() : null;

			const channelId = msg.channelId || msg.channel?.id;
			const channelName = msg.channel?.name || msg.channelName || (channelId ? (channelsMap.get(channelId)?.name || 'Unknown') : 'Unknown');
			const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

			const messageItem = document.createElement('div');
			messageItem.className = 'list-group-item';
			if (isDeleted) messageItem.classList.add('message-deleted');
			messageItem.setAttribute('data-message-id', messageId);
			messageItem.setAttribute('data-item-id', messageId);

			let contentHTML = `
				<div class="d-flex align-items-start justify-content-between">
					<div class="d-flex align-items-start flex-grow-1">
						<input type="checkbox" class="item-checkbox me-2" data-item-type="message" value="${messageId}" onchange="toggleItemSelection('${messageId}', 'message')" onclick="event.stopPropagation()">
						<small class="text-muted me-2 flex-shrink-0" style="min-width: 45px;">${timeStr}</small>
						<img src="${authorAvatar}" alt="${authorName}" class="rounded-circle me-2" width="40" height="40" loading="lazy" style="${isDeleted ? 'opacity: 0.5; filter: grayscale(100%);' : ''}">
						<div class="flex-grow-1">
							<div class="mb-1 d-flex align-items-center flex-wrap gap-2">
								<strong style="${isDeleted ? 'opacity: 0.6; text-decoration: line-through;' : ''}">${authorName}</strong>
								<small class="text-muted">#${channelName}</small>
								${msg.pinned ? '<i class="bi bi-pin-fill text-warning" title="Pinned"></i>' : ''}
								${msg.edited ? '<span class="badge bg-secondary" title="Edited"><i class="bi bi-pencil-fill"></i> Edited</span>' : ''}
								${isDeleted ? '<span class="badge bg-danger">Deleted</span>' : ''}
							</div>
							${isDeleted && deletedAt ? `<small class="text-danger d-block mb-1">Deleted: ${deletedAt}</small>` : ''}
							<div class="message-content" style="${isDeleted ? 'opacity: 0.6; font-style: italic;' : ''}">
								${isDeleted && !rawContent ? '<em class="text-muted">Message content was deleted</em>' : formattedContent}
							</div>`;

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
						<span class="reaction-badge" onclick="showReactionDetails('${messageId}', '${r.emoji}')" style="cursor: pointer;" title="Click to see who reacted">
							${emojiDisplay}
							<span class="reaction-count">${r.count}</span>
						</span>
					`;
				});
				contentHTML += '</div>';
			}

			contentHTML += `
						</div>
					</div>
					<div class="item-menu">
						<button class="item-menu-btn" onclick="toggleMenu(this)">
							<i class="bi bi-three-dots-vertical"></i>
						</button>
						<div class="item-menu-dropdown">
							<button onclick="viewMessageHistory('${messageId}')">
								<i class="bi bi-clock-history"></i>
								<span>View History</span>
							</button>
							<button onclick="copyMessageId('${messageId}')">
								<i class="bi bi-clipboard"></i>
								<span>Copy ID</span>
							</button>
							<button onclick="copyMessageContent('${rawContent.replace(/'/g, "\\'")}')">
								<i class="bi bi-clipboard-check"></i>
								<span>Copy Content</span>
							</button>
							<div class="divider"></div>
							<button onclick="addReactionToMessage('${messageId}')">
								<i class="bi bi-emoji-smile"></i>
								<span>Add Reaction</span>
							</button>
							<button class="text-warning" onclick="toggleMessagePriority('${messageId}')">
								<i class="bi bi-star"></i>
								<span>Toggle Priority</span>
							</button>
							<div class="divider"></div>
							<button class="text-danger" onclick="deleteMessageFromCache('${messageId}', '${msg.channelId || ''}')">
								<i class="bi bi-trash"></i>
								<span>Delete</span>
							</button>
						</div>
					</div>
				</div>
			`;

			messageItem.innerHTML = contentHTML;
			fragment.appendChild(messageItem);
		});

		messagesContainer.appendChild(fragment);
		const statsElement = document.getElementById('messagesStats');
		if (statsElement) statsElement.textContent = `${data.messages.length} messages`;
	} catch (err) {
		console.error('Error loading messages:', err);
		const messagesContainer = document.getElementById('messagesContainer');
		if (messagesContainer) {
			messagesContainer.innerHTML = `
				<div class="alert alert-danger m-3">
					<i class="bi bi-x-circle me-2"></i>
					Error loading messages: ${err.message}
				</div>
			`;
		}
	}
}

function initServerSearch() {
	setTimeout(() => {
		const searchInput = document.getElementById('serverSearch');
		const clearBtn = document.getElementById('clearSearch');

		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				const query = e.target.value.toLowerCase();
				const members = document.querySelectorAll('#membersList .list-group-item');
				members.forEach(member => {
					const text = member.textContent.toLowerCase();
					member.style.display = text.includes(query) ? '' : 'none';
				});
			});
		}

		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				if (searchInput) {
					searchInput.value = '';
					const members = document.querySelectorAll('#membersList .list-group-item');
					members.forEach(member => member.style.display = '');
				}
			});
		}
	}, 100);
}

window.loadMoreMessages = async function () {
	await loadCachedMessages();
	showNotification('Messages reloaded', 'success');
};

window.createChannel = function () {
	showNotification('Channel creation not implemented yet', 'info');
};

window.createRole = async function () {
	const name = prompt('Role name:');
	if (name === null) return;

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
			await loadPage('roles');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
};

const setupRolePermissionOptions = [
	{ value: 'Administrator', label: 'Administrator', description: 'Grants every permission' },
	{ value: 'ViewChannel', label: 'View Channels', description: 'See channels by default' },
	{ value: 'ManageGuild', label: 'Manage Server', description: 'Manage server settings' },
	{ value: 'ManageRoles', label: 'Manage Roles', description: 'Create, edit, and delete roles' },
	{ value: 'ManageChannels', label: 'Manage Channels', description: 'Create, edit, and delete channels' },
	{ value: 'ViewAuditLog', label: 'View Audit Log', description: 'See server audit logs' },
	{ value: 'ManageMessages', label: 'Manage Messages', description: 'Delete and pin messages from others' },
	{ value: 'ManageNicknames', label: 'Manage Nicknames', description: 'Change nicknames of members' },
	{ value: 'KickMembers', label: 'Kick Members', description: 'Remove members from the server' },
	{ value: 'BanMembers', label: 'Ban Members', description: 'Ban members from the server' },
	{ value: 'ModerateMembers', label: 'Timeout Members', description: 'Time out members' },
	{ value: 'MentionEveryone', label: 'Mention @everyone', description: 'Mention @everyone and @here' },
	{ value: 'SendMessages', label: 'Send Messages', description: 'Send messages in text channels' },
	{ value: 'ReadMessageHistory', label: 'Read Message History', description: 'Read past messages' },
	{ value: 'AttachFiles', label: 'Attach Files', description: 'Upload files and images' },
	{ value: 'EmbedLinks', label: 'Embed Links', description: 'Embed rich previews for links' },
	{ value: 'AddReactions', label: 'Add Reactions', description: 'Add reactions to messages' },
	{ value: 'UseExternalEmojis', label: 'Use External Emojis', description: 'Use emojis from other servers' },
	{ value: 'UseExternalStickers', label: 'Use External Stickers', description: 'Use stickers from other servers' },
	{ value: 'ManageWebhooks', label: 'Manage Webhooks', description: 'Create and manage webhooks' },
	{ value: 'ManageThreads', label: 'Manage Threads', description: 'Manage existing threads' },
	{ value: 'CreatePublicThreads', label: 'Create Public Threads', description: 'Start public threads' },
	{ value: 'CreatePrivateThreads', label: 'Create Private Threads', description: 'Start private threads' },
	{ value: 'ManageEvents', label: 'Manage Events', description: 'Create and manage scheduled events' },
	{ value: 'Connect', label: 'Connect to Voice', description: 'Join voice channels' },
	{ value: 'Speak', label: 'Speak in Voice', description: 'Talk in voice channels' },
	{ value: 'Stream', label: 'Stream', description: 'Go live in voice channels' },
	{ value: 'PrioritySpeaker', label: 'Priority Speaker', description: 'Use priority speaker in voice' },
	{ value: 'MuteMembers', label: 'Mute Members', description: 'Mute other members in voice' },
	{ value: 'DeafenMembers', label: 'Deafen Members', description: 'Deafen other members in voice' },
	{ value: 'MoveMembers', label: 'Move Members', description: 'Move members between channels' }
];

const BOT_PERMISSION_BIT_VALUES = {
	Administrator: 8n,
	ViewChannel: 1024n,
	ManageGuild: 32n,
	ManageRoles: 268435456n,
	ManageChannels: 16n,
	ViewAuditLog: 128n,
	ManageMessages: 8192n,
	ManageNicknames: 134217728n,
	KickMembers: 2n,
	BanMembers: 4n,
	ModerateMembers: 1099511627776n,
	MentionEveryone: 131072n,
	SendMessages: 2048n,
	ReadMessageHistory: 65536n,
	AttachFiles: 32768n,
	EmbedLinks: 16384n,
	AddReactions: 64n,
	UseExternalEmojis: 262144n,
	UseExternalStickers: 137438953472n,
	ManageWebhooks: 536870912n,
	ManageThreads: 17179869184n,
	CreatePublicThreads: 34359738368n,
	CreatePrivateThreads: 68719476736n,
	ManageEvents: 8589934592n,
	Connect: 1048576n,
	Speak: 2097152n,
	Stream: 512n,
	PrioritySpeaker: 256n,
	MuteMembers: 4194304n,
	DeafenMembers: 8388608n,
	MoveMembers: 16777216n
};

const botPermissionOptions = [
	{ value: 'Administrator', label: 'Administrator', description: 'Full access to all permissions', bit: BOT_PERMISSION_BIT_VALUES.Administrator },
	{ value: 'ViewChannel', label: 'View Channels', description: 'See all channels by default', bit: BOT_PERMISSION_BIT_VALUES.ViewChannel },
	{ value: 'SendMessages', label: 'Send Messages', description: 'Send messages in text channels', bit: BOT_PERMISSION_BIT_VALUES.SendMessages },
	{ value: 'ReadMessageHistory', label: 'Read Message History', description: 'Read previous messages in channels', bit: BOT_PERMISSION_BIT_VALUES.ReadMessageHistory },
	{ value: 'AddReactions', label: 'Add Reactions', description: 'Add reactions to existing messages', bit: BOT_PERMISSION_BIT_VALUES.AddReactions },
	{ value: 'EmbedLinks', label: 'Embed Links', description: 'Create rich embeds from links', bit: BOT_PERMISSION_BIT_VALUES.EmbedLinks },
	{ value: 'AttachFiles', label: 'Attach Files', description: 'Upload files and media content', bit: BOT_PERMISSION_BIT_VALUES.AttachFiles },
	{ value: 'MentionEveryone', label: 'Mention Everyone', description: 'Use @everyone and @here mentions', bit: BOT_PERMISSION_BIT_VALUES.MentionEveryone },
	{ value: 'ManageMessages', label: 'Manage Messages', description: 'Delete or pin messages from other members', bit: BOT_PERMISSION_BIT_VALUES.ManageMessages },
	{ value: 'ManageChannels', label: 'Manage Channels', description: 'Create, delete, or edit channels', bit: BOT_PERMISSION_BIT_VALUES.ManageChannels },
	{ value: 'ManageGuild', label: 'Manage Server', description: 'Manage server settings and integrations', bit: BOT_PERMISSION_BIT_VALUES.ManageGuild },
	{ value: 'ManageRoles', label: 'Manage Roles', description: 'Create and edit roles', bit: BOT_PERMISSION_BIT_VALUES.ManageRoles },
	{ value: 'ManageNicknames', label: 'Manage Nicknames', description: 'Change other members’ nicknames', bit: BOT_PERMISSION_BIT_VALUES.ManageNicknames },
	{ value: 'KickMembers', label: 'Kick Members', description: 'Remove members from the server', bit: BOT_PERMISSION_BIT_VALUES.KickMembers },
	{ value: 'BanMembers', label: 'Ban Members', description: 'Ban members from the server', bit: BOT_PERMISSION_BIT_VALUES.BanMembers },
	{ value: 'ModerateMembers', label: 'Timeout Members', description: 'Apply timeouts to members', bit: BOT_PERMISSION_BIT_VALUES.ModerateMembers },
	{ value: 'ManageWebhooks', label: 'Manage Webhooks', description: 'Create and manage webhooks', bit: BOT_PERMISSION_BIT_VALUES.ManageWebhooks },
	{ value: 'ViewAuditLog', label: 'View Audit Log', description: 'View server audit log entries', bit: BOT_PERMISSION_BIT_VALUES.ViewAuditLog },
	{ value: 'ManageThreads', label: 'Manage Threads', description: 'Manage active threads', bit: BOT_PERMISSION_BIT_VALUES.ManageThreads },
	{ value: 'CreatePublicThreads', label: 'Create Public Threads', description: 'Start public discussion threads', bit: BOT_PERMISSION_BIT_VALUES.CreatePublicThreads },
	{ value: 'CreatePrivateThreads', label: 'Create Private Threads', description: 'Start private threads', bit: BOT_PERMISSION_BIT_VALUES.CreatePrivateThreads },
	{ value: 'ManageEvents', label: 'Manage Events', description: 'Create and manage scheduled events', bit: BOT_PERMISSION_BIT_VALUES.ManageEvents },
	{ value: 'UseExternalEmojis', label: 'Use External Emojis', description: 'Use emojis from other servers', bit: BOT_PERMISSION_BIT_VALUES.UseExternalEmojis },
	{ value: 'UseExternalStickers', label: 'Use External Stickers', description: 'Use stickers from other servers', bit: BOT_PERMISSION_BIT_VALUES.UseExternalStickers },
	{ value: 'Stream', label: 'Video/Screen Stream', description: 'Go live in voice channels', bit: BOT_PERMISSION_BIT_VALUES.Stream },
	{ value: 'PrioritySpeaker', label: 'Priority Speaker', description: 'Use priority speaker mode', bit: BOT_PERMISSION_BIT_VALUES.PrioritySpeaker },
	{ value: 'Connect', label: 'Connect to Voice', description: 'Join voice channels', bit: BOT_PERMISSION_BIT_VALUES.Connect },
	{ value: 'Speak', label: 'Speak in Voice', description: 'Talk in voice channels', bit: BOT_PERMISSION_BIT_VALUES.Speak },
	{ value: 'MuteMembers', label: 'Mute Members', description: 'Mute other members in voice channels', bit: BOT_PERMISSION_BIT_VALUES.MuteMembers },
	{ value: 'DeafenMembers', label: 'Deafen Members', description: 'Deafen other members in voice channels', bit: BOT_PERMISSION_BIT_VALUES.DeafenMembers },
	{ value: 'MoveMembers', label: 'Move Members', description: 'Move members between voice channels', bit: BOT_PERMISSION_BIT_VALUES.MoveMembers }
];

const defaultBotPermissionNames = [
	'ViewChannel',
	'SendMessages',
	'ReadMessageHistory',
	'AddReactions',
	'EmbedLinks',
	'AttachFiles',
	'Connect',
	'Speak'
];

const setupRolePermissionPresets = {
	administrator: ['Administrator'],
	moderator: [
		'ViewChannel',
		'ManageChannels',
		'ManageRoles',
		'ManageMessages',
		'ManageNicknames',
		'ViewAuditLog',
		'KickMembers',
		'BanMembers',
		'ModerateMembers',
		'MentionEveryone',
		'SendMessages',
		'ReadMessageHistory',
		'AttachFiles',
		'EmbedLinks',
		'AddReactions',
		'UseExternalEmojis',
		'UseExternalStickers',
		'ManageThreads',
		'Connect',
		'Speak',
		'MuteMembers',
		'DeafenMembers',
		'MoveMembers'
	],
	member: [
		'ViewChannel',
		'SendMessages',
		'ReadMessageHistory',
		'AttachFiles',
		'EmbedLinks',
		'AddReactions',
		'UseExternalEmojis',
		'UseExternalStickers',
		'Connect',
		'Speak',
		'Stream'
	],
	friend: [
		'ViewChannel',
		'SendMessages',
		'ReadMessageHistory',
		'AttachFiles',
		'EmbedLinks',
		'AddReactions',
		'UseExternalEmojis',
		'UseExternalStickers',
		'Connect',
		'Speak',
		'Stream'
	]
};

function applySetupRolePreset(roleType) {
	const preset = setupRolePermissionPresets[roleType] || [];
	const checkboxes = document.querySelectorAll('#setupRolePermissions input[type="checkbox"]');
	checkboxes.forEach(input => {
		input.checked = preset.includes(input.value);
	});
}

function renderSetupRolePermissions(roleType) {
	const container = document.getElementById('setupRolePermissions');
	if (!container) return;
	container.innerHTML = '';
	setupRolePermissionOptions.forEach(option => {
		const item = document.createElement('label');
		item.className = 'form-check permissions-option';

		const input = document.createElement('input');
		input.type = 'checkbox';
		input.className = 'form-check-input';
		input.value = option.value;
		input.id = `setupPerm${option.value}`;

		const content = document.createElement('div');
		content.className = 'permission-label';

		const name = document.createElement('span');
		name.className = 'permission-name';
		name.textContent = option.label;

		const description = document.createElement('span');
		description.className = 'permission-description';
		description.textContent = option.description;

		content.appendChild(name);
		content.appendChild(description);
		item.appendChild(input);
		item.appendChild(content);
		container.appendChild(item);
	});
	applySetupRolePreset(roleType);
}

function getSavedBotPermissionNames(config) {
	const saved = new Set();
	if (config.bot_permission_names) {
		config.bot_permission_names.split(',').map(name => name.trim()).filter(Boolean).forEach(name => saved.add(name));
		return saved;
	}

	if (config.bot_permissions) {
		try {
			const bitfield = BigInt(config.bot_permissions);
			botPermissionOptions.forEach(option => {
				if ((bitfield & option.bit) === option.bit) {
					saved.add(option.value);
				}
			});
			if (saved.size > 0) {
				return saved;
			}
		} catch (err) {
			console.warn('Failed to parse bot_permissions bitfield:', err);
		}
	}

	defaultBotPermissionNames.forEach(name => saved.add(name));
	return saved;
}

function renderBotPermissions(config) {
	const container = document.getElementById('botPermissionsContainer');
	if (!container) return;

	const savedNames = getSavedBotPermissionNames(config);
	container.innerHTML = '';

	botPermissionOptions.forEach(option => {
		const item = document.createElement('label');
		item.className = 'form-check permissions-option';

		const input = document.createElement('input');
		input.type = 'checkbox';
		input.className = 'form-check-input';
		input.dataset.permission = option.value;
		input.checked = savedNames.has(option.value);

		const content = document.createElement('div');
		content.className = 'permission-label';

		const name = document.createElement('span');
		name.className = 'permission-name';
		name.textContent = option.label;

		const description = document.createElement('span');
		description.className = 'permission-description';
		description.textContent = option.description;

		content.appendChild(name);
		content.appendChild(description);
		item.appendChild(input);
		item.appendChild(content);
		container.appendChild(item);

		input.addEventListener('change', () => {
			if (option.value === 'Administrator' && input.checked) {
				container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
					if (cb !== input) cb.checked = false;
				});
			} else if (option.value !== 'Administrator' && input.checked) {
				const adminCheckbox = container.querySelector('input[data-permission="Administrator"]');
				if (adminCheckbox && adminCheckbox.checked) {
					adminCheckbox.checked = false;
				}
			}
			updateBotPermissionsSummary();
		});
	});

	updateBotPermissionsSummary();
}

function updateBotPermissionsSummary() {
	const container = document.getElementById('botPermissionsContainer');
	const summary = document.getElementById('botPermissionsSummary');
	const countBadge = document.getElementById('botPermissionsCount');

	if (!container) {
		return { selected: [], bitfield: 0n };
	}

	const selected = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
		.map(input => input.dataset.permission);

	const bitfield = selected.reduce((acc, name) => {
		const option = botPermissionOptions.find(opt => opt.value === name);
		return option ? (acc | option.bit) : acc;
	}, 0n);

	if (summary) {
		if (selected.length === 0) {
			summary.textContent = 'Permissions bitfield: 0 • No permissions selected';
		} else {
			summary.textContent = `Permissions bitfield: ${bitfield.toString()} • ${selected.join(', ')}`;
		}
	}

	if (countBadge) {
		countBadge.textContent = `${selected.length} selected`;
	}

	return { selected, bitfield };
}

async function saveBotPermissions(options = {}) {
	const { showLoading: shouldShowLoading = true, showNotification: shouldShowNotification = true, throwOnError = false } = options;
	const container = document.getElementById('botPermissionsContainer');

	if (!container) {
		return true;
	}

	const { selected } = updateBotPermissionsSummary();

	try {
		if (shouldShowLoading) showLoading();

		const response = await fetch('/api/config/bot-permissions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ permissions: selected })
		});

		const data = await response.json();

		if (response.ok && data.success) {
			if (shouldShowNotification) {
				showNotification('Bot permissions saved', 'success');
			}
			return true;
		}

		const errorMessage = data.error || 'Failed to save bot permissions';
		if (shouldShowNotification) {
			showNotification(errorMessage, 'danger');
		}
		if (throwOnError) {
			throw new Error(errorMessage);
		}
		return false;
	} catch (err) {
		if (shouldShowNotification) {
			showNotification('Error: ' + err.message, 'danger');
		}
		if (throwOnError) {
			throw err;
		}
		return false;
	} finally {
		if (shouldShowLoading) hideLoading();
	}
}

window.selectBotPermissionsPreset = function (preset) {
	const container = document.getElementById('botPermissionsContainer');
	if (!container) return;

	const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
	const names = {
		recommended: defaultBotPermissionNames,
		minimal: ['ViewChannel', 'SendMessages'],
		admin: ['Administrator'],
		none: []
	}[preset] || [];

	checkboxes.forEach(cb => {
		cb.checked = names.includes(cb.dataset.permission);
	});

	updateBotPermissionsSummary();
};

function renderWizardBotPermissions(config) {
	const container = document.getElementById('wizardBotPermissionsContainer');
	if (!container) return;

	const savedNames = getSavedBotPermissionNames(config);
	container.innerHTML = '';

	botPermissionOptions.forEach(option => {
		const item = document.createElement('label');
		item.className = 'form-check permissions-option';

		const input = document.createElement('input');
		input.type = 'checkbox';
		input.className = 'form-check-input';
		input.dataset.permission = option.value;
		input.checked = savedNames.has(option.value);

		const content = document.createElement('div');
		content.className = 'permission-label';

		const name = document.createElement('span');
		name.className = 'permission-name';
		name.textContent = option.label;

		const description = document.createElement('span');
		description.className = 'permission-description';
		description.textContent = option.description;

		content.appendChild(name);
		content.appendChild(description);
		item.appendChild(input);
		item.appendChild(content);
		container.appendChild(item);

		input.addEventListener('change', () => {
			if (option.value === 'Administrator' && input.checked) {
				container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
					if (cb !== input) cb.checked = false;
				});
			} else if (option.value !== 'Administrator' && input.checked) {
				const adminCheckbox = container.querySelector('input[data-permission="Administrator"]');
				if (adminCheckbox && adminCheckbox.checked) {
					adminCheckbox.checked = false;
				}
			}
			updateWizardBotPermissionsSummary();
			updateWizardInviteLink();
		});
	});

	updateWizardBotPermissionsSummary();
}

function updateWizardBotPermissionsSummary() {
	const container = document.getElementById('wizardBotPermissionsContainer');
	const summary = document.getElementById('wizardBotPermissionsSummary');
	const countBadge = document.getElementById('wizardBotPermissionsCount');

	if (!container) {
		return { selected: [], bitfield: 0n };
	}

	const selected = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
		.map(input => input.dataset.permission);

	const bitfield = selected.reduce((acc, name) => {
		const option = botPermissionOptions.find(opt => opt.value === name);
		return option ? (acc | option.bit) : acc;
	}, 0n);

	if (summary) {
		if (selected.length === 0) {
			summary.textContent = 'Permissions bitfield: 0 • No permissions selected';
		} else {
			summary.textContent = `Permissions bitfield: ${bitfield.toString()} • ${selected.join(', ')}`;
		}
	}

	if (countBadge) {
		countBadge.textContent = `${selected.length} selected`;
	}

	return { selected, bitfield };
}

async function saveWizardBotPermissions(options = {}) {
	const { showLoading: shouldShowLoading = true, showNotification: shouldShowNotification = true, throwOnError = false } = options;
	const container = document.getElementById('wizardBotPermissionsContainer');

	if (!container) {
		return true;
	}

	const { selected } = updateWizardBotPermissionsSummary();

	try {
		if (shouldShowLoading) showLoading();

		const response = await fetch('/api/config/bot-permissions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ permissions: selected })
		});

		const data = await response.json();

		if (response.ok && data.success) {
			if (shouldShowNotification) {
				showNotification('Bot permissions saved', 'success');
			}
			return true;
		}

		const errorMessage = data.error || 'Failed to save bot permissions';
		if (shouldShowNotification) {
			showNotification(errorMessage, 'danger');
		}
		if (throwOnError) {
			throw new Error(errorMessage);
		}
		return false;
	} catch (err) {
		if (shouldShowNotification) {
			showNotification('Error: ' + err.message, 'danger');
		}
		if (throwOnError) {
			throw err;
		}
		return false;
	} finally {
		if (shouldShowLoading) hideLoading();
	}
}

window.selectWizardBotPermissionsPreset = function (preset) {
	const container = document.getElementById('wizardBotPermissionsContainer');
	if (!container) return;

	const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
	const names = {
		recommended: defaultBotPermissionNames,
		minimal: ['ViewChannel', 'SendMessages'],
		admin: ['Administrator'],
		none: []
	}[preset] || [];

	checkboxes.forEach(cb => {
		cb.checked = names.includes(cb.dataset.permission);
	});

	updateWizardBotPermissionsSummary();
	updateWizardInviteLink();
};

window.showSetupRoleModal = async function () {
	const modal = new bootstrap.Modal(document.getElementById('setupRoleModal'));

	try {
		const response = await fetch('/api/server/info');
		const serverInfo = await response.json();

		if (serverInfo.error) {
			showNotification('Error loading channels: ' + serverInfo.error, 'danger');
			return;
		}

		const textChannels = serverInfo.channels.filter(c => c.type === 0);

		const channelsReadSelect = document.getElementById('setupRoleChannelsRead');
		const channelsReadWriteSelect = document.getElementById('setupRoleChannelsReadWrite');

		channelsReadSelect.innerHTML = '';
		channelsReadWriteSelect.innerHTML = '';

		textChannels.forEach(channel => {
			const option1 = document.createElement('option');
			option1.value = channel.name;
			option1.textContent = `#${channel.name}`;
			channelsReadSelect.appendChild(option1);

			const option2 = document.createElement('option');
			option2.value = channel.name;
			option2.textContent = `#${channel.name}`;
			channelsReadWriteSelect.appendChild(option2);
		});

		document.getElementById('setupRoleName').value = '';
		document.getElementById('setupRoleColor').value = '#99AAB5';
		document.getElementById('setupRoleType').value = 'member';

		renderSetupRolePermissions('member');

		const typeSelect = document.getElementById('setupRoleType');
		typeSelect.onchange = (event) => {
			applySetupRolePreset(event.target.value);
		};

		modal.show();
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
};

window.createSetupRole = async function () {
	const roleType = document.getElementById('setupRoleType').value;
	const roleName = document.getElementById('setupRoleName').value.trim();
	const roleColor = document.getElementById('setupRoleColor').value;
	const channelsReadSelect = document.getElementById('setupRoleChannelsRead');
	const channelsReadWriteSelect = document.getElementById('setupRoleChannelsReadWrite');
	const permissionsSelect = document.querySelectorAll('#setupRolePermissions input[type="checkbox"]:checked');

	if (!roleName) {
		showNotification('Please enter a role name', 'warning');
		return;
	}

	const channelsRead = Array.from(channelsReadSelect.selectedOptions).map(opt => opt.value);
	const channelsReadWrite = Array.from(channelsReadWriteSelect.selectedOptions).map(opt => opt.value);
	const selectedPermissions = Array.from(permissionsSelect).map(input => input.value);

	try {
		showLoading('Creating role...');
		const response = await fetch('/api/server/create-setup-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				roleType,
				roleName,
				roleColor,
				channelsRead,
				channelsReadWrite,
				permissions: selectedPermissions
			})
		});

		const data = await response.json();
		if (data.success) {
			showNotification(data.message || 'Role created successfully!', 'success');
			const modal = bootstrap.Modal.getInstance(document.getElementById('setupRoleModal'));
			modal.hide();
			await loadPage('roles');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	} finally {
		hideLoading();
	}
};

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

		if (messagesOffset === 0 || reset) {
			const selectAllDiv = document.createElement('div');
			selectAllDiv.className = 'select-all-container';
			selectAllDiv.innerHTML = `
				<input type="checkbox" class="item-checkbox" id="selectAllCheckbox" onchange="selectAllItems('message')">
				<label for="selectAllCheckbox">Select All</label>
			`;
			container.appendChild(selectAllDiv);
		}

		const fragment = document.createDocumentFragment();

		data.messages.forEach(msg => {
			const time = new Date(msg.timestamp);
			const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

			const messageItem = document.createElement('div');
			messageItem.className = 'list-group-item';
			messageItem.setAttribute('data-message-id', msg.id);
			messageItem.setAttribute('data-item-id', msg.id);

			let contentHTML = `
				<div class="d-flex align-items-start justify-content-between">
					<div class="d-flex align-items-start flex-grow-1">
						<input type="checkbox" class="item-checkbox me-2" data-item-type="message" value="${msg.id}" onchange="toggleItemSelection('${msg.id}', 'message')" onclick="event.stopPropagation()">
						<small class="text-muted me-2 flex-shrink-0" style="min-width: 45px;">${timeStr}</small>
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
	if (!confirm('Delete this message from Discord? It will remain visible as deleted.')) return;

	try {
		const response = await fetch('/api/server/delete-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId, channelId })
		});

		const data = await response.json();
		if (data.success) {
			// Reload messages to show deleted status instead of removing
			await loadCachedMessages();
			showNotification('Message deleted!', 'success');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function initConfigPage() {
	try {
		const response = await fetch('/api/config');
		const config = await response.json();
		currentConfig = config;

		updateConfigStatus(config);

		if (document.getElementById('config_client_token')) {
			document.getElementById('config_client_token').value = config.client_token || '';
		}
		if (document.getElementById('config_client_id')) {
			document.getElementById('config_client_id').value = config.client_id || '';
		}
		if (document.getElementById('config_discord_guild_id')) {
			document.getElementById('config_discord_guild_id').value = config.discord_guild_id || '';
		}

		renderBotPermissions(config);

		const isStandalone = config.db_type === 'sqlite';

		if (isStandalone) {
			document.getElementById('sqliteConfigSection').style.display = 'block';
			document.getElementById('mysqlConfigForm').style.display = 'none';
			document.getElementById('redisNotAvailableSection').style.display = 'block';
			document.getElementById('redisConfigForm').style.display = 'none';
			if (document.getElementById('config_db_path')) {
				document.getElementById('config_db_path').value = config.db_path || './src/cordium.sqlite';
			}
		} else {
			document.getElementById('sqliteConfigSection').style.display = 'none';
			document.getElementById('mysqlConfigForm').style.display = 'block';
			document.getElementById('redisNotAvailableSection').style.display = 'none';
			document.getElementById('redisConfigForm').style.display = 'block';

			if (document.getElementById('config_db_host')) {
				document.getElementById('config_db_host').value = config.db_host || '';
				document.getElementById('config_db_port').value = config.db_port || '3306';
				document.getElementById('config_db_name').value = config.db_name || '';
				document.getElementById('config_db_user').value = config.db_user || '';
				document.getElementById('config_db_pass').value = config.db_pass || '';
			}

			if (document.getElementById('config_redis_host')) {
				document.getElementById('config_redis_host').value = config.redis_host || '';
				document.getElementById('config_redis_port').value = config.redis_port || '6379';
				document.getElementById('config_redis_password').value = config.redis_password || '';
				document.getElementById('config_redis_db').value = config.redis_db || '0';
			}
		}

		if (document.getElementById('config_configurator_port')) {
			document.getElementById('config_configurator_port').value = config.configurator_port || '3001';
		}
		if (document.getElementById('config_save_attachments')) {
			document.getElementById('config_save_attachments').checked = config.save_attachments === 'true';
		}

		const discordForm = document.getElementById('discordConfigForm');
		if (discordForm) {
			discordForm.addEventListener('submit', async (e) => {
				e.preventDefault();
			try {
				showLoading();
				await saveConfigFields(
					['client_token', 'client_id', 'discord_guild_id'],
					'config_',
					{ showLoading: false, showNotification: false, throwOnError: true }
				);
				await saveBotPermissions({ showLoading: false, showNotification: false, throwOnError: true });
				showNotification('Discord configuration saved', 'success');
			} catch (err) {
				console.error('Error saving Discord configuration:', err);
				showNotification('Error saving Discord configuration: ' + err.message, 'danger');
			} finally {
				hideLoading();
			}
			});
		}

		const mysqlForm = document.getElementById('mysqlConfigForm');
		if (mysqlForm) {
			mysqlForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				await saveConfigFields(['db_host', 'db_port', 'db_name', 'db_user', 'db_pass'], 'config_');
			});
		}

		const redisForm = document.getElementById('redisConfigForm');
		if (redisForm) {
			redisForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				await saveConfigFields(['redis_host', 'redis_port', 'redis_password', 'redis_db'], 'config_');
			});
		}

		const advancedForm = document.getElementById('advancedConfigForm');
		if (advancedForm) {
			advancedForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const response = await fetch('/api/config');
				const currentConfig = await response.json();

				currentConfig.configurator_port = document.getElementById('config_configurator_port').value;
				currentConfig.save_attachments = document.getElementById('config_save_attachments').checked ? 'true' : 'false';

				await fetch('/api/config', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(currentConfig)
				});

				showNotification('Advanced settings saved', 'success');
			});
		}

	} catch (err) {
		console.error('Error initializing config page:', err);
		showNotification('Error loading configuration', 'danger');
	}
}

async function updateConfigStatus(config) {
	const isStandalone = config.db_type === 'sqlite';

	document.getElementById('currentModeInfo').innerHTML = `
		<span class="badge ${isStandalone ? 'bg-info' : 'bg-primary'}">${isStandalone ? 'Standalone' : 'Component'}</span>
		<p class="text-muted mb-0 mt-2 small">
			${isStandalone ? 'SQLite + RAM caching' : 'MySQL + Redis caching'}
		</p>
	`;

	document.getElementById('databaseStatus').innerHTML = `
		<span class="status-indicator status-${config.db_type ? 'online' : 'offline'}">
			${config.db_type === 'sqlite' ? 'SQLite' : config.db_type === 'mysql' ? 'MySQL' : 'Not configured'}
		</span>
	`;

	document.getElementById('redisStatus').innerHTML = `
		<span class="status-indicator status-${config.redis_host ? 'online' : 'offline'}">
			${config.redis_host ? 'Configured' : 'Not available'}
		</span>
	`;

	document.getElementById('databaseTypeBadge').textContent = isStandalone ? 'SQLite' : 'MySQL';
	document.getElementById('databaseTypeBadge').className = `badge bg-${isStandalone ? 'info' : 'success'}`;

	document.getElementById('redisModeBadge').textContent = isStandalone ? 'RAM Cache' : 'Redis';
	document.getElementById('redisModeBadge').className = `badge bg-${isStandalone ? 'warning' : 'danger'}`;

	try {
		const infoResponse = await fetch('/api/server/info');
		const serverInfo = await infoResponse.json();
		const discordBadge = document.getElementById('discordStatusBadge');

		if (discordBadge) {
			if (!serverInfo.error && serverInfo.guildName) {
				discordBadge.textContent = 'Connected';
				discordBadge.className = 'badge bg-success';
				discordBadge.title = `Connected to ${serverInfo.guildName}`;
			} else {
				discordBadge.textContent = 'Disconnected';
				discordBadge.className = 'badge bg-secondary';
				discordBadge.title = 'Bot not connected';
			}
		}
	} catch (err) {
		const discordBadge = document.getElementById('discordStatusBadge');
		if (discordBadge) {
			discordBadge.textContent = 'Not Connected';
			discordBadge.className = 'badge bg-secondary';
		}
	}
}

async function saveConfigFields(fields, prefix, options = {}) {
	const {
		showLoading: shouldShowLoading = true,
		showNotification: shouldShowNotification = true,
		throwOnError = false
	} = options;

	try {
		if (shouldShowLoading) showLoading();
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
			if (shouldShowNotification) {
				showNotification('Configuration saved', 'success');
			}
			return true;
		} else {
			const errorMessage = data.error || 'Error saving configuration';
			if (shouldShowNotification) {
				showNotification(errorMessage, 'danger');
			}
			if (throwOnError) {
				throw new Error(errorMessage);
			}
			return false;
		}
	} catch (err) {
		if (shouldShowNotification) {
			showNotification('Error: ' + err.message, 'danger');
		}
		if (throwOnError) {
			throw err;
		}
		return false;
	} finally {
		if (shouldShowLoading) hideLoading();
	}
}

window.togglePasswordVisibility = function (fieldId) {
	const field = document.getElementById(fieldId);
	const icon = field.nextElementSibling.querySelector('i');
	if (field.type === 'password') {
		field.type = 'text';
		icon.className = 'bi bi-eye-slash';
	} else {
		field.type = 'password';
		icon.className = 'bi bi-eye';
	}
};

window.testDatabaseConnection = async function () {
	const result = document.getElementById('dbTestResult');
	result.style.display = 'block';
	result.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Testing connection...';

	try {
		const response = await fetch('/api/config/test-database', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db_host: document.getElementById('config_db_host').value,
				db_port: document.getElementById('config_db_port').value,
				db_name: document.getElementById('config_db_name').value,
				db_user: document.getElementById('config_db_user').value,
				db_pass: document.getElementById('config_db_pass').value
			})
		});

		const data = await response.json();
		if (data.success) {
			result.className = 'alert alert-success py-2';
			result.innerHTML = '<i class="bi bi-check-circle me-2"></i>Connection successful!';
		} else {
			result.className = 'alert alert-danger py-2';
			result.innerHTML = '<i class="bi bi-x-circle me-2"></i>' + (data.error || 'Connection failed');
		}
	} catch (err) {
		result.className = 'alert alert-danger py-2';
		result.innerHTML = '<i class="bi bi-x-circle me-2"></i>Error: ' + err.message;
	}
};

window.testRedisConnection = async function () {
	const result = document.getElementById('redisTestResult');
	result.style.display = 'block';
	result.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Testing connection...';

	try {
		const response = await fetch('/api/config/test-redis', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				redis_host: document.getElementById('config_redis_host').value,
				redis_port: document.getElementById('config_redis_port').value,
				redis_password: document.getElementById('config_redis_password').value,
				redis_db: document.getElementById('config_redis_db').value
			})
		});

		const data = await response.json();
		if (data.success) {
			result.className = 'alert alert-success py-2';
			result.innerHTML = '<i class="bi bi-check-circle me-2"></i>Connection successful!';
		} else {
			result.className = 'alert alert-danger py-2';
			result.innerHTML = '<i class="bi bi-x-circle me-2"></i>' + (data.error || 'Connection failed');
		}
	} catch (err) {
		result.className = 'alert alert-danger py-2';
		result.innerHTML = '<i class="bi bi-x-circle me-2"></i>Error: ' + err.message;
	}
};

window.reconfigureWizard = async function () {
	if (confirm('This will restart the setup wizard. Your current configuration will be kept until you complete the wizard. Continue?')) {
		try {
			const response = await fetch('/api/config');
			const config = await response.json();

			config.wizard_step = '1';
			config.wizard_mode = '';

			await fetch('/api/config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config)
			});

			window.location.reload();
		} catch (err) {
			console.error('Error restarting wizard:', err);
			showNotification('Error: ' + err.message, 'danger');
		}
	}
};

async function saveConfigSection(data) {
	try {
		const response = await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (response.ok) {
			showNotification('Configuration saved successfully', 'success');
		} else {
			showNotification('Failed to save configuration', 'danger');
		}
	} catch (err) {
		showNotification('Error saving configuration: ' + err.message, 'danger');
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

async function initFilesPage(category, title) {
	const response = await fetch(`/api/files/${category}`);
	const files = await response.json();

	document.getElementById('pageTitle').textContent = title;

	const filesList = document.getElementById('filesList');
	const fileNameDisplay = document.getElementById('currentFileName');
	const saveBtn = document.getElementById('saveBtn');
	const deleteBtn = document.getElementById('deleteBtn');
	const editorContainer = document.getElementById('editorContainer');

	filesList.innerHTML = files.length === 0 ? '<p class="text-muted p-3 text-center">No files found</p>' : '';

	const textarea = document.createElement('textarea');
	textarea.id = 'fileEditor';
	editorContainer.innerHTML = '';
	editorContainer.appendChild(textarea);

	currentEditor = CodeMirror.fromTextArea(textarea, {
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
			deleteBtn.disabled = false;
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
			if (currentFile && confirm(`Are you sure you want to delete ${currentFile}?`)) {
				await deleteFile(category, currentFile);
				await loadPage(currentPage);
			}
		});
	}

	window.createNewFile = async () => {
		const fileName = prompt('Enter file name (without .js extension):');
		if (fileName) {
			const fullName = fileName.endsWith('.js') ? fileName : `${fileName}.js`;
			await saveFile(category, fullName, '');
			await loadPage(currentPage);
		}
	};
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

function showLoading(message = 'Loading...') {
	const overlay = document.querySelector('.loading-overlay');
	const spinner = document.querySelector('.loading-spinner');
	const messageEl = spinner.querySelector('.loading-message');

	if (messageEl) {
		messageEl.textContent = message;
	}

	overlay.style.display = 'flex';
	spinner.style.display = 'flex';
}

function hideLoading() {
	document.querySelector('.loading-overlay').style.display = 'none';
	document.querySelector('.loading-spinner').style.display = 'none';
}

function showNotification(message, type = 'info') {
	const container = document.getElementById('notificationContainer') || createNotificationContainer();

	const icons = {
		success: 'check-circle-fill',
		danger: 'x-circle-fill',
		warning: 'exclamation-triangle-fill',
		info: 'info-circle-fill',
		primary: 'bell-fill'
	};

	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.innerHTML = `
		<div class="notification-icon">
			<i class="bi bi-${icons[type] || icons.info}"></i>
		</div>
		<div class="notification-content">
			<div class="notification-message">${message}</div>
		</div>
		<button class="notification-close" onclick="this.parentElement.remove()">
			<i class="bi bi-x"></i>
		</button>
	`;

	container.appendChild(notification);

	setTimeout(() => notification.classList.add('show'), 10);

	setTimeout(() => {
		notification.classList.remove('show');
		setTimeout(() => notification.remove(), 300);
	}, 4000);
}

function createNotificationContainer() {
	const container = document.createElement('div');
	container.id = 'notificationContainer';
	container.className = 'notification-container';
	document.body.appendChild(container);
	return container;
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
			await loadPage('channels');
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
			await loadPage('channels');
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
			await loadPage('channels');
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
			await loadPage('roles');
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
			await loadPage('roles');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function deleteRole(roleId, roleName) {
	if (!confirm(`Delete role "${roleName}"?\n\nThis action cannot be undone!`)) return;

	console.log('Deleting role:', roleId, roleName);

	try {
		const response = await fetch('/api/server/delete-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roleId })
		});

		console.log('Response status:', response.status);
		const data = await response.json();
		console.log('Response data:', data);

		if (data.success) {
			showNotification('Role deleted successfully!', 'success');
			await new Promise(resolve => setTimeout(resolve, 1000));
			await loadPage('roles');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		console.error('Error deleting role:', err);
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
			await loadPage('members');
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

let currentModalMemberId = null;
let currentModalMemberName = null;
let currentModalMemberAvatar = null;
let currentMemberRoles = [];
let membersDataCache = {};

let selectedItems = new Set();
let selectionMode = null;

async function manageMemberRoles(memberId, displayName, avatarURL, roles) {
	const memberData = membersDataCache[memberId] || {};

	currentModalMemberId = memberId;
	currentModalMemberName = displayName || memberData.displayName;
	currentModalMemberAvatar = avatarURL || memberData.avatarURL;
	currentMemberRoles = roles || memberData.roles || [];

	document.getElementById('roleModalMemberInfo').innerHTML = `
		<img src="${currentModalMemberAvatar}" width="40" height="40" class="rounded me-2">
		<div>
			<strong>${currentModalMemberName}</strong>
			<div class="text-muted small">${memberId}</div>
		</div>
	`;

	try {
		const response = await fetch('/api/server/roles');
		const data = await response.json();

		if (data.error) {
			showNotification('Error loading roles: ' + data.error, 'danger');
			return;
		}

		const rolesHTML = data.roles
			.filter(role => role.name !== '@everyone')
			.map(role => {
				const hasRole = currentMemberRoles.some(r => r.id === role.id);
				const roleColor = role.color !== '#000000' ? role.color : '#99aab5';
				return `
					<div class="form-check mb-2 p-2 rounded" style="background: rgba(255,255,255,0.03);">
						<input class="form-check-input" type="checkbox" value="${role.id}" id="role_${role.id}" ${hasRole ? 'checked' : ''}>
						<label class="form-check-label d-flex align-items-center" for="role_${role.id}">
							<span class="badge me-2" style="background-color: ${roleColor};">&nbsp;</span>
							${role.name}
							<span class="text-muted small ms-2">(${role.memberCount} members)</span>
						</label>
					</div>
				`;
			}).join('');

		document.getElementById('rolesList').innerHTML = rolesHTML;

		const modal = new bootstrap.Modal(document.getElementById('manageRolesModal'));
		modal.show();
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function saveRoleChanges() {
	const checkboxes = document.querySelectorAll('#rolesList input[type="checkbox"]');
	const selectedRoles = Array.from(checkboxes)
		.filter(cb => cb.checked)
		.map(cb => cb.value);

	const currentRoleIds = currentMemberRoles.map(r => r.id);
	const rolesToAdd = selectedRoles.filter(id => !currentRoleIds.includes(id));
	const rolesToRemove = currentRoleIds.filter(id => !selectedRoles.includes(id));

	const promises = [];

	for (const roleId of rolesToAdd) {
		promises.push(
			fetch('/api/server/add-member-role', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ memberId: currentModalMemberId, roleId })
			})
		);
	}

	for (const roleId of rolesToRemove) {
		promises.push(
			fetch('/api/server/remove-member-role', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ memberId: currentModalMemberId, roleId })
			})
		);
	}

	try {
		await Promise.all(promises);
		showNotification('Roles updated successfully!', 'success');
		bootstrap.Modal.getInstance(document.getElementById('manageRolesModal')).hide();
		await loadPage('members');
	} catch (err) {
		showNotification('Error updating roles: ' + err.message, 'danger');
	}
}

async function changeNickname(memberId, displayName, avatarURL, currentNickname) {
	const memberData = membersDataCache[memberId] || {};

	currentModalMemberId = memberId;
	currentModalMemberName = displayName || memberData.displayName;
	currentModalMemberAvatar = avatarURL || memberData.avatarURL;

	document.getElementById('nicknameModalMemberInfo').innerHTML = `
		<img src="${currentModalMemberAvatar}" width="40" height="40" class="rounded me-2">
		<div>
			<strong>${currentModalMemberName}</strong>
			<div class="text-muted small">${memberId}</div>
		</div>
	`;

	document.getElementById('nicknameInput').value = currentNickname || memberData.nickname || '';

	const modal = new bootstrap.Modal(document.getElementById('changeNicknameModal'));
	modal.show();

	setTimeout(() => document.getElementById('nicknameInput').focus(), 500);
}

async function saveNicknameChange() {
	const nickname = document.getElementById('nicknameInput').value;

	try {
		const response = await fetch('/api/server/change-nickname', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId: currentModalMemberId, nickname })
		});

		const data = await response.json();
		if (data.success) {
			showNotification('Nickname changed successfully!', 'success');
			bootstrap.Modal.getInstance(document.getElementById('changeNicknameModal')).hide();
			await loadPage('members');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function timeoutMember(memberId, displayName, avatarURL) {
	const memberData = membersDataCache[memberId] || {};

	currentModalMemberId = memberId;
	currentModalMemberName = displayName || memberData.displayName;
	currentModalMemberAvatar = avatarURL || memberData.avatarURL;

	document.getElementById('timeoutModalMemberInfo').innerHTML = `
		<img src="${currentModalMemberAvatar}" width="40" height="40" class="rounded me-2">
		<div>
			<strong>${currentModalMemberName}</strong>
			<div class="text-muted small">${memberId}</div>
		</div>
	`;

	document.getElementById('timeoutDuration').value = '60';
	document.getElementById('timeoutReason').value = '';

	document.querySelectorAll('#timeoutModal .btn-group button').forEach(btn => {
		btn.classList.remove('active');
	});
	document.querySelector('#timeoutModal .btn-group button[onclick="setTimeoutDuration(60)"]').classList.add('active');

	const modal = new bootstrap.Modal(document.getElementById('timeoutModal'));
	modal.show();
}

function setTimeoutDuration(minutes) {
	document.getElementById('timeoutDuration').value = minutes;
	document.querySelectorAll('#timeoutModal .btn-group button').forEach(btn => {
		btn.classList.remove('active');
	});
	event.target.classList.add('active');
}

async function saveTimeout() {
	const duration = parseInt(document.getElementById('timeoutDuration').value);
	const reason = document.getElementById('timeoutReason').value;

	if (duration < 1 || duration > 40320) {
		showNotification('Duration must be between 1 minute and 28 days (40320 minutes)', 'warning');
		return;
	}

	try {
		const response = await fetch('/api/server/timeout-member', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId: currentModalMemberId, duration, reason })
		});

		const data = await response.json();
		if (data.success) {
			showNotification(`${currentModalMemberName} timed out for ${duration} minutes!`, 'success');
			bootstrap.Modal.getInstance(document.getElementById('timeoutModal')).hide();
			await loadPage('members');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function kickMember(memberId, displayName, avatarURL) {
	const memberData = membersDataCache[memberId] || {};

	currentModalMemberId = memberId;
	currentModalMemberName = displayName || memberData.displayName;
	currentModalMemberAvatar = avatarURL || memberData.avatarURL;

	document.getElementById('kickModalMemberInfo').innerHTML = `
		<img src="${currentModalMemberAvatar}" width="40" height="40" class="rounded me-2">
		<div>
			<strong>${currentModalMemberName}</strong>
			<div class="text-muted small">${memberId}</div>
		</div>
	`;

	document.getElementById('kickReason').value = '';

	const modal = new bootstrap.Modal(document.getElementById('kickModal'));
	modal.show();
}

async function confirmKick() {
	const reason = document.getElementById('kickReason').value;

	if (!reason.trim()) {
		showNotification('Please provide a reason for the kick', 'warning');
		return;
	}

	try {
		const response = await fetch('/api/server/kick-member', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ memberId: currentModalMemberId, reason })
		});

		const data = await response.json();
		if (data.success) {
			showNotification(`${currentModalMemberName} has been kicked!`, 'success');
			bootstrap.Modal.getInstance(document.getElementById('kickModal')).hide();
			await loadPage('members');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

async function banMember(memberId, displayName, avatarURL) {
	const memberData = membersDataCache[memberId] || {};

	currentModalMemberId = memberId;
	currentModalMemberName = displayName || memberData.displayName;
	currentModalMemberAvatar = avatarURL || memberData.avatarURL;

	document.getElementById('banModalMemberInfo').innerHTML = `
		<img src="${currentModalMemberAvatar}" width="40" height="40" class="rounded me-2">
		<div>
			<strong>${currentModalMemberName}</strong>
			<div class="text-muted small">${memberId}</div>
		</div>
	`;

	document.getElementById('banReason').value = '';
	document.getElementById('deleteMessages').checked = true;

	const modal = new bootstrap.Modal(document.getElementById('banModal'));
	modal.show();
}

async function confirmBan() {
	const reason = document.getElementById('banReason').value;
	const deleteMessages = document.getElementById('deleteMessages').checked;

	if (!reason.trim()) {
		showNotification('Please provide a reason for the ban', 'warning');
		return;
	}

	try {
		const response = await fetch('/api/server/ban-member', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				memberId: currentModalMemberId,
				reason,
				deleteMessageDays: deleteMessages ? 7 : 0
			})
		});

		const data = await response.json();
		if (data.success) {
			showNotification(`${currentModalMemberName} has been banned!`, 'success');
			bootstrap.Modal.getInstance(document.getElementById('banModal')).hide();
			await loadPage('members');
		} else {
			showNotification('Failed: ' + data.error, 'danger');
		}
	} catch (err) {
		showNotification('Error: ' + err.message, 'danger');
	}
}

function toggleItemSelection(itemId, itemType) {
	if (selectedItems.has(itemId)) {
		selectedItems.delete(itemId);
		document.querySelector(`[data-item-id="${itemId}"]`)?.classList.remove('selected');
	} else {
		selectedItems.add(itemId);
		document.querySelector(`[data-item-id="${itemId}"]`)?.classList.add('selected');
	}

	selectionMode = itemType;
	updateSelectionBar();
}

function selectAllItems(itemType) {
	const checkboxes = document.querySelectorAll(`.item-checkbox[data-item-type="${itemType}"]`);
	const selectAllCheckbox = document.getElementById('selectAllCheckbox');

	if (selectAllCheckbox && selectAllCheckbox.checked) {
		checkboxes.forEach(cb => {
			cb.checked = true;
			selectedItems.add(cb.value);
			document.querySelector(`[data-item-id="${cb.value}"]`)?.classList.add('selected');
		});
	} else {
		checkboxes.forEach(cb => {
			cb.checked = false;
			selectedItems.delete(cb.value);
			document.querySelector(`[data-item-id="${cb.value}"]`)?.classList.remove('selected');
		});
	}

	selectionMode = selectedItems.size > 0 ? itemType : null;
	updateSelectionBar();
}

function clearSelection() {
	selectedItems.clear();
	selectionMode = null;
	document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
	document.querySelectorAll('.list-group-item.selected').forEach(item => item.classList.remove('selected'));
	const selectAllCheckbox = document.getElementById('selectAllCheckbox');
	if (selectAllCheckbox) selectAllCheckbox.checked = false;
	updateSelectionBar();
}

function updateSelectionBar() {
	const selectionBar = document.getElementById('selectionBar');
	const selectionCount = document.getElementById('selectionCount');
	const selectionActions = document.getElementById('selectionActions');

	const count = selectedItems.size;

	if (count === 0) {
		selectionBar.classList.remove('visible');
		return;
	}

	selectionCount.textContent = `${count} selected`;
	selectionBar.classList.add('visible');

	let actionsHTML = '';

	switch (selectionMode) {
		case 'role':
			actionsHTML = `
				<button class="btn btn-danger" onclick="bulkDeleteRoles()">
					<i class="bi bi-trash"></i>
					Delete Roles
				</button>
			`;
			break;
		case 'channel':
			actionsHTML = `
				<button class="btn btn-danger" onclick="bulkDeleteChannels()">
					<i class="bi bi-trash"></i>
					Delete Channels
				</button>
			`;
			break;
		case 'message':
			actionsHTML = `
				<button class="btn btn-light" onclick="bulkPinMessages()">
					<i class="bi bi-pin-angle"></i>
					Pin Messages
				</button>
				<button class="btn btn-light" onclick="bulkUnpinMessages()">
					<i class="bi bi-pin"></i>
					Unpin Messages
				</button>
				<button class="btn btn-danger" onclick="bulkDeleteMessages()">
					<i class="bi bi-trash"></i>
					Delete Messages
				</button>
			`;
			break;
	}

	selectionActions.innerHTML = actionsHTML;
}

async function bulkDeleteRoles() {
	if (!confirm(`Are you sure you want to delete ${selectedItems.size} role(s)?`)) return;

	const promises = Array.from(selectedItems).map(roleId =>
		fetch('/api/server/delete-role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roleId })
		})
	);

	try {
		await Promise.all(promises);
		showNotification(`${selectedItems.size} role(s) deleted successfully!`, 'success');
		clearSelection();
		await new Promise(resolve => setTimeout(resolve, 1000));
		await loadPage('roles');
	} catch (err) {
		showNotification('Error deleting roles: ' + err.message, 'danger');
	}
}

async function bulkDeleteChannels() {
	if (!confirm(`Are you sure you want to delete ${selectedItems.size} channel(s)?`)) return;

	const promises = Array.from(selectedItems).map(channelId =>
		fetch('/api/server/delete-channel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ channelId })
		})
	);

	try {
		await Promise.all(promises);
		showNotification(`${selectedItems.size} channel(s) deleted successfully!`, 'success');
		clearSelection();
		await loadPage('channels');
	} catch (err) {
		showNotification('Error deleting channels: ' + err.message, 'danger');
	}
}

async function bulkDeleteMessages() {
	if (!confirm(`Are you sure you want to delete ${selectedItems.size} message(s)?`)) return;

	const promises = Array.from(selectedItems).map(messageId =>
		fetch('/api/server/delete-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId })
		})
	);

	try {
		await Promise.all(promises);
		showNotification(`${selectedItems.size} message(s) deleted successfully!`, 'success');
		clearSelection();
		await loadPage('messages');
	} catch (err) {
		showNotification('Error deleting messages: ' + err.message, 'danger');
	}
}

async function bulkPinMessages() {
	const promises = Array.from(selectedItems).map(messageId =>
		fetch('/api/server/pin-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId })
		})
	);

	try {
		await Promise.all(promises);
		showNotification(`${selectedItems.size} message(s) pinned successfully!`, 'success');
		clearSelection();
		await loadPage('messages');
	} catch (err) {
		showNotification('Error pinning messages: ' + err.message, 'danger');
	}
}

async function bulkUnpinMessages() {
	const promises = Array.from(selectedItems).map(messageId =>
		fetch('/api/server/unpin-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId })
		})
	);

	try {
		await Promise.all(promises);
		showNotification(`${selectedItems.size} message(s) unpinned successfully!`, 'success');
		clearSelection();
		await loadPage('messages');
	} catch (err) {
		showNotification('Error unpinning messages: ' + err.message, 'danger');
	}
}



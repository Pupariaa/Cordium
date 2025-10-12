let currentTheme = 'dark';
let currentEditor = null;
let currentConfig = {};
let currentPage = 'setup';

document.addEventListener('DOMContentLoaded', async () => {
	initTheme();
	await checkConfigStatus();
	initNavigation();

	const savedPage = localStorage.getItem('currentPage');
	const statusResponse = await fetch('/api/config/status');
	const statusData = await statusResponse.json();

	if (savedPage && statusData.configured) {
		loadPage(savedPage);
		document.querySelectorAll('.nav-link').forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('data-page') === savedPage) {
				link.classList.add('active');
			}
		});
	} else if (statusData.configured && !savedPage) {
		loadPage('server');
		document.querySelectorAll('.nav-link').forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('data-page') === 'server') {
				link.classList.add('active');
			}
		});
	} else {
		loadPage('setup');
	}
});

function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'dark';
	setTheme(savedTheme);

	document.getElementById('themeToggle').addEventListener('click', () => {
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	});
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

function initNavigation() {
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', async (e) => {
			e.preventDefault();
			const page = link.getAttribute('data-page');

			if (page !== 'setup') {
				const response = await fetch('/api/config/status');
				const data = await response.json();
				if (!data.configured) {
					showNotification('Please complete the initial setup first', 'warning');
					loadPage('setup');
					return;
				}
			}

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
		updateStatusBadge(data.configured);
		updateNavigationAccess(data.configured);
	} catch (err) {
		console.error('Failed to check config status:', err);
	}
}

function updateNavigationAccess(configured) {
	document.querySelectorAll('.nav-link').forEach(link => {
		const page = link.getAttribute('data-page');
		if (page !== 'setup') {
			if (!configured) {
				link.classList.add('disabled');
				link.style.opacity = '0.5';
				link.style.cursor = 'not-allowed';
			} else {
				link.classList.remove('disabled');
				link.style.opacity = '1';
				link.style.cursor = 'pointer';
			}
		}
	});
}

function updateStatusBadge(configured) {
	const badge = document.getElementById('configStatus');
	const text = document.getElementById('statusText');

	if (configured) {
		badge.className = 'status-badge bg-success';
		text.textContent = 'Configured';
	} else {
		badge.className = 'status-badge bg-warning';
		text.textContent = 'Not Configured';
	}
}

async function loadPage(page) {
	currentPage = page;
	localStorage.setItem('currentPage', page);
	const content = document.getElementById('content');
	showLoading();

	try {
		switch (page) {
			case 'setup':
				await renderSetupPage(content);
				break;
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

async function renderSetupPage(container) {
	const response = await fetch('/api/config');
	const config = await response.json();

	const statusResponse = await fetch('/api/config/status');
	const statusData = await statusResponse.json();
	const isConfigured = statusData.configured;

	container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">
                    <i class="bi bi-rocket-takeoff me-2"></i>
                    Initial Setup
                </h2>
                ${isConfigured ? `
                    <div class="alert alert-success" role="alert">
                        <i class="bi bi-check-circle-fill me-2"></i>
                        Your bot is configured! You can now access all features from the sidebar.
                        <br><br>
                        <strong>To launch the bot:</strong> Restart with <code>npm start</code> - The bot and this panel will run together.
                    </div>
                ` : `
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Configure the essential settings to get your Discord bot running.
                    </div>
                `}
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card config-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="bi bi-discord text-primary me-2"></i>
                            Discord Configuration
                        </h5>
                        <div class="alert alert-warning py-2 px-2 mb-2" style="font-size: 0.8rem;">
                            <strong>Enable Intents:</strong> In Discord Developer Portal > Bot, enable Presence, Server Members, and Message Content intents.
                        </div>
                        <hr>
                        <form id="discordForm">
                            <div class="mb-3">
                                <label class="form-label">Bot Token</label>
                                <input type="password" class="form-control" id="client_token" 
                                       value="${config.client_token || ''}" required>
                                <small class="form-text text-muted">
                                    Discord Developer Portal > Bot > Reset Token
                                </small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Client ID</label>
                                <input type="text" class="form-control" id="client_id" 
                                       value="${config.client_id || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Guild ID</label>
                                <input type="text" class="form-control" id="discord_guild_id" 
                                       value="${config.discord_guild_id || ''}" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-save me-2"></i>
                                Save Discord Config
                            </button>
                        </form>
                        <div id="inviteLink" class="mt-3" style="display: none;">
                            <hr>
                            <h6><i class="bi bi-link-45deg me-1"></i>Invite Link</h6>
                            <div class="input-group">
                                <input type="text" class="form-control" id="inviteLinkInput" readonly>
                                <button class="btn btn-outline-primary" type="button" id="copyInviteBtn">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </div>
                            <small class="text-muted">Use this link to add your bot to your Discord server</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card config-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="bi bi-database text-success me-2"></i>
                            Database Configuration
                        </h5>
                        <div class="alert alert-info py-2 px-2 mb-2" style="font-size: 0.8rem;">
                            <strong>MySQL 5.7+ or MariaDB 10.3+</strong> - Records all Discord events for analytics and logs. Not required, leave empty to skip.
                        </div>
                        <hr>
                        <form id="databaseForm">
                            <div class="mb-2">
                                <label class="form-label">Host</label>
                                <input type="text" class="form-control" id="db_host" 
                                       value="${config.db_host || ''}" placeholder="localhost or IP address">
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Database Name</label>
                                <input type="text" class="form-control" id="db_name" 
                                       value="${config.db_name || ''}" placeholder="cordium_events">
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-2">
                                        <label class="form-label">Port</label>
                                        <input type="number" class="form-control" id="db_port" 
                                               value="${config.db_port || ''}" placeholder="3306">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-2">
                                        <label class="form-label">User</label>
                                        <input type="text" class="form-control" id="db_user" 
                                               value="${config.db_user || ''}" placeholder="username">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-2">
                                        <label class="form-label">Password</label>
                                        <input type="password" class="form-control" id="db_pass" 
                                               value="${config.db_pass || ''}" placeholder="password">
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-success flex-fill" id="testDbBtn">
                                    <i class="bi bi-wifi me-2"></i>
                                    Test Connection
                                </button>
                                <button type="submit" class="btn btn-success flex-fill">
                                    <i class="bi bi-save me-2"></i>
                                    Save
                                </button>
                            </div>
                        </form>
                        <div id="dbTestResult" class="mt-3" style="display: none;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <div class="card config-card bg-primary text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Ready to Launch?</h5>
                        <p class="card-text mb-2">Once configured, restart with:</p>
                        <code class="bg-dark p-2 rounded d-inline-block mb-2">npm start</code>
                        <p class="card-text mb-0" style="font-size: 0.85rem;">The bot and this panel will run together. Edit commands and settings anytime!</p>
                    </div>
                </div>
            </div>
        </div>
    `;

	document.getElementById('discordForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await savePartialConfig(['client_token', 'client_id', 'discord_guild_id']);
		updateInviteLink();
	});

	const clientIdInput = document.getElementById('client_id');
	clientIdInput.addEventListener('input', updateInviteLink);
	updateInviteLink();

	document.getElementById('copyInviteBtn').addEventListener('click', () => {
		const input = document.getElementById('inviteLinkInput');
		input.select();
		document.execCommand('copy');
		showNotification('Invite link copied to clipboard!', 'success');
	});

	document.getElementById('databaseForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await savePartialConfig(['db_host', 'db_name', 'db_port', 'db_user', 'db_pass']);
	});

	document.getElementById('testDbBtn').addEventListener('click', async () => {
		await testDatabaseConnection();
	});
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
			const textActions = channel.type === 0 ? `
				<button class="btn btn-sm btn-primary" onclick="sendMessageToChannel('${channel.id}', '${channel.name}')" title="Send message">
					<i class="bi bi-send"></i>
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
					<div class="btn-group" role="group">
						${textActions}
						<button class="btn btn-sm btn-warning" onclick="editChannel('${channel.id}', '${channel.name}', '${channel.type}', '${(channel.topic || '').replace(/'/g, "\\'")}' )" title="Edit channel">
							<i class="bi bi-pencil"></i>
						</button>
						<button class="btn btn-sm btn-secondary" onclick="copyChannelId('${channel.id}')" title="Copy ID">
							<i class="bi bi-clipboard"></i>
						</button>
						<button class="btn btn-sm btn-danger" onclick="deleteChannel('${channel.id}', '${channel.name}')" title="Delete channel">
							<i class="bi bi-trash"></i>
						</button>
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
					<div class="btn-group" role="group">
						<button class="btn btn-sm btn-success" onclick="createChannel('${category.id}')" title="Add channel">
							<i class="bi bi-plus-circle"></i>
						</button>
						<button class="btn btn-sm btn-warning" onclick="editChannel('${category.id}', '${category.name}', '4', '')" title="Edit category">
							<i class="bi bi-pencil"></i>
						</button>
						<button class="btn btn-sm btn-danger" onclick="deleteChannel('${category.id}', '${category.name}')" title="Delete category">
							<i class="bi bi-trash"></i>
						</button>
					</div>
				</div>
			`;

			childChannels.forEach(channel => {
				const icon = channelTypeIcons[channel.type] || 'bi-circle';
				const typeName = channelTypeNames[channel.type] || 'Unknown';
				const textActions = channel.type === 0 ? `
					<button class="btn btn-sm btn-primary" onclick="sendMessageToChannel('${channel.id}', '${channel.name}')" title="Send message">
						<i class="bi bi-send"></i>
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
						<div class="btn-group" role="group">
							${textActions}
							<button class="btn btn-sm btn-warning" onclick="editChannel('${channel.id}', '${channel.name}', '${channel.type}', '${(channel.topic || '').replace(/'/g, "\\'")}' )" title="Edit channel">
								<i class="bi bi-pencil"></i>
							</button>
							<button class="btn btn-sm btn-secondary" onclick="copyChannelId('${channel.id}')" title="Copy ID">
								<i class="bi bi-clipboard"></i>
							</button>
							<button class="btn btn-sm btn-danger" onclick="deleteChannel('${channel.id}', '${channel.name}')" title="Delete channel">
								<i class="bi bi-trash"></i>
							</button>
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
				<div class="btn-group-vertical" role="group">
					<button class="btn btn-sm btn-info" onclick="event.stopPropagation(); showMemberDetails('${member.id}', '${member.username.replace(/'/g, "\\'")}')" title="Full details">
						<i class="bi bi-info-circle"></i>
					</button>
					<button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); manageMemberRoles('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')" title="Manage roles">
						<i class="bi bi-shield"></i>
					</button>
					<button class="btn btn-sm btn-warning" onclick="event.stopPropagation(); changeNickname('${member.id}', '${member.nickname ? member.nickname.replace(/'/g, "\\'") : ''}')" title="Change nickname">
						<i class="bi bi-pencil"></i>
					</button>
					<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); timeoutMember('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')" title="Timeout">
						<i class="bi bi-clock"></i>
					</button>
					<button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); kickMember('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')" title="Kick">
						<i class="bi bi-box-arrow-right"></i>
					</button>
					<button class="btn btn-sm btn-dark" onclick="event.stopPropagation(); banMember('${member.id}', '${member.displayName.replace(/'/g, "\\'")}')" title="Ban">
						<i class="bi bi-hammer"></i>
					</button>
					<button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); copyMemberId('${member.id}')" title="Copy ID">
						<i class="bi bi-clipboard"></i>
					</button>
				</div>
			` : `
				<div class="btn-group-vertical" role="group">
					<button class="btn btn-sm btn-info" onclick="event.stopPropagation(); showMemberDetails('${member.id}', '${member.username.replace(/'/g, "\\'")}')" title="Full details">
						<i class="bi bi-info-circle"></i>
					</button>
					<button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); copyMemberId('${member.id}')" title="Copy ID">
						<i class="bi bi-clipboard"></i>
					</button>
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
			const deleteBtn = !isEveryoneRole ? `
				<button class="btn btn-sm btn-danger" onclick="deleteRole('${role.id}', '${role.name}')" title="Delete role">
					<i class="bi bi-trash"></i>
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
					<div class="btn-group" role="group">
						<button class="btn btn-sm btn-info" onclick="showRoleMembers('${role.id}', '${role.name}')" title="View members">
							<i class="bi bi-people"></i>
						</button>
						<button class="btn btn-sm btn-primary" onclick="assignRole('${role.id}', '${role.name}')" title="Assign to member">
							<i class="bi bi-person-plus"></i>
						</button>
						<button class="btn btn-sm btn-warning" onclick="editRole('${role.id}', '${role.name}', '${role.hexColor}')" title="Edit role">
							<i class="bi bi-pencil"></i>
						</button>
						<button class="btn btn-sm btn-secondary" onclick="copyRoleId('${role.id}')" title="Copy ID">
							<i class="bi bi-clipboard"></i>
						</button>
						${deleteBtn}
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

			<div class="row mb-4">
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

			<div class="row">
				<div class="col-12">
					<ul class="nav nav-tabs mb-3" id="serverTabs" role="tablist">
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
					</ul>
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
					</div>
				</div>
			</div>
		`;
	} catch (err) {
		container.innerHTML = `
			<div class="alert alert-danger" role="alert">
				<i class="bi bi-exclamation-triangle-fill me-2"></i>
				Error loading server information: ${err.message}
			</div>
		`;
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
                    <i class="bi bi-sliders me-2"></i>
                    Advanced Configuration
                </h2>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card config-card">
                    <div class="card-body">
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

async function savePartialConfig(fields) {
	try {
		showLoading();
		const response = await fetch('/api/config');
		const currentConfig = await response.json();

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
			updateStatusBadge(data.configured);
			updateNavigationAccess(data.configured);

			if (data.configured) {
				showNotification('Bot configured! Restart with npm start to launch', 'success');
			}
		} else {
			showNotification('Error saving configuration', 'danger');
		}
	} catch (err) {
		showNotification('Error saving configuration: ' + err.message, 'danger');
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
			'api_port', 'timezone', 'locale', 'dev'
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

function updateInviteLink() {
	const clientId = document.getElementById('client_id').value.trim();
	const inviteLinkDiv = document.getElementById('inviteLink');
	const inviteLinkInput = document.getElementById('inviteLinkInput');

	if (clientId) {
		const permissions = '8';
		const scopes = 'bot%20applications.commands';
		const intents = '3276799';
		const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}&integration_type=0`;

		inviteLinkInput.value = inviteUrl;
		inviteLinkDiv.style.display = 'block';
	} else {
		inviteLinkDiv.style.display = 'none';
	}
}

async function testDatabaseConnection() {
	const dbConfig = {
		host: document.getElementById('db_host').value,
		name: document.getElementById('db_name').value,
		port: document.getElementById('db_port').value,
		user: document.getElementById('db_user').value,
		pass: document.getElementById('db_pass').value
	};

	if (!dbConfig.host || !dbConfig.name) {
		showNotification('Please fill in at least host and database name', 'warning');
		return;
	}

	const resultDiv = document.getElementById('dbTestResult');
	resultDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Testing connection...';
	resultDiv.className = 'alert alert-info mt-3';
	resultDiv.style.display = 'block';

	try {
		const response = await fetch('/api/test-db', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dbConfig)
		});

		const data = await response.json();

		if (data.success) {
			resultDiv.className = 'alert alert-success mt-3';
			resultDiv.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Database connection successful!';
			showNotification('Database connection successful!', 'success');
		} else {
			resultDiv.className = 'alert alert-danger mt-3';
			resultDiv.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i>Connection failed: ${data.error}`;
		}
	} catch (err) {
		resultDiv.className = 'alert alert-danger mt-3';
		resultDiv.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i>Error: ${err.message}`;
	}
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


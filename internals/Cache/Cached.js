const sqlite3 = require('sqlite3').verbose();

class MessageDatabase {
  constructor(dbPath = './database.db') {
    // Initialize the database connection
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to the SQLite database.');
        this._createTable();
      }
    });
  }

  /*
    TODO:
      - parties table
      - attachments table
      - members table
      - calls table
      - components table
      - embeds table
      - interactions table
      - mentions table
    
    infos:
      - flags:
          Crossposted
          IsCrosspost
          SuppressEmbeds
          SourceMessageDeleted
          Urgent
          HasThread
          Ephemeral
          Loading
          FailedToMentionSomeRolesInThread
          
          ShouldShowLinkNotDiscordWarning

          SuppressNotifications
          IsVoiceMessage
      - dynamics:
          content
          editedAt
          flags
          hasThread
          mentionsId
          pinned

  */

  // Private method to create the messages table
  _createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,

        messageActivityType INTEGER CHECK(messageActivityType >= 0 AND messageActivityType <= 3),
        partyId TEXT,
        
        authorId TEXT NOT NULL,

        callId TEXT, 

        channelId TEXT NOT NULL,

        content TEXT NOT NULL,

        createdTimestamp INTEGER NOT NULL,

        crosspostable BOOLEAN NOT NULL,

        editedAt INTEGER,

        flags INTEGER NOT NULL,

        activityApplicationId TEXT,

        hasThread BOOLEAN NOT NULL,

        interactionId TEXT,

        mentionsId TEXT,

        pinned BOOLEAN NOT NULL,

        pollId TEXT,


      )`;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table "messages" created or already exists.');
      }
    });
  }

  // Method to insert a new message
  set(message) {
    const insertSQL = `
      INSERT INTO messages (
        id, channelId, guildId, createdTimestamp, type, system, content, authorId, authorBot,
        authorUsername, authorDiscriminator, authorAvatar, pinned, tts, nonce, editedTimestamp,
        webhookId, applicationId, activity, flags, reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      message.id, message.channelId, message.guildId, message.createdTimestamp, message.type,
      message.system, message.content, message.author.id, message.author.bot,
      message.author.username, message.author.discriminator, message.author.avatar,
      message.pinned, message.tts, message.nonce, message.editedTimestamp,
      message.webhookId, message.applicationId, message.activity, message.flags.bitfield,
      message.reference
    ];

    this.db.run(insertSQL, params, (err) => {
      if (err) {
        console.error('Error inserting message:', err.message);
      } else {
        console.log('Message inserted successfully.');
      }
    });
  }

  // Method to get a message by its ID
  get(id, callback) {
    const selectSQL = `SELECT * FROM messages WHERE id = ?`;
    this.db.get(selectSQL, [id], (err, row) => {
      if (err) {
        console.error('Error retrieving message:', err.message);
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }

  // Method to update a message by its ID
  update(id, updatedFields) {
    let updateSQL = `UPDATE messages SET `;
    const params = [];

    Object.keys(updatedFields).forEach((key, index) => {
      updateSQL += `${key} = ?`;
      updateSQL += index < Object.keys(updatedFields).length - 1 ? ', ' : ' ';
      params.push(updatedFields[key]);
    });

    updateSQL += `WHERE id = ?`;
    params.push(id);

    this.db.run(updateSQL, params, (err) => {
      if (err) {
        console.error('Error updating message:', err.message);
      } else {
        console.log('Message updated successfully.');
      }
    });
  }

  // Close the database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Closed the database connection.');
      }
    });
  }
}

// Example Usage
const db = new MessageDatabase();












// Insert a message
db.set({
  id: '1283332123897495572',
  channelId: '1282201980319830016',
  guildId: '1264528675810840589',
  createdTimestamp: 1726040621495,
  type: 0,
  system: false,
  content: 'fefe',
  author: {
    id: '938519682690977892',
    bot: false,
    username: 'puparia',
    discriminator: '0',
    avatar: '2e9eab2fe1ac90530295a9d869a340c9'
  },
  pinned: false,
  tts: false,
  nonce: '1283332128691453952',
  editedTimestamp: null,
  webhookId: null,
  applicationId: null,
  activity: null,
  flags: { bitfield: 0 },
  reference: null
});

// Get a message by ID
db.get('1283332123897495572', (err, message) => {
  if (err) {
    console.error('Error fetching message:', err);
  } else {
    console.log('Fetched message:', message);
  }
});

// Update a message
db.update('1283332123897495572', { content: 'updated content' });

// Close the database when done
db.close();

// scripts/init-db.ts
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

// Automatically load environment variables from .env.local
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env.local");
}

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
  console.log("⏳ Initializing Neon Database Schema...");

  try {
    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure bio & avatar_url exist on databases created prior to profile feature
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';`;

    // 2. Friendships Table
    await sql`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Posts Table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  visibility VARCHAR(20) DEFAULT 'everyone',
  media_url TEXT,
  media_type VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Likes / Reactions Table
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        reaction_type VARCHAR(20) NOT NULL DEFAULT 'like',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_post_like UNIQUE (post_id, user_id)
      );
    `;

    // 5. Comments Table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Comments Reaction Table
    await sql`
      CREATE TABLE IF NOT EXISTS comment_reactions (
        id SERIAL PRIMARY KEY,
        comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction_type VARCHAR(20) NOT NULL DEFAULT 'like',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      );
    `;

    // 7. Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        entity_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 8. Bookmarks Table
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      );
    `;
  
    // 9. Cloudinary Media Columns
    await sql`
      ALTER TABLE posts
        ADD COLUMN IF NOT EXISTS media_url TEXT,
        ADD COLUMN IF NOT EXISTS media_type VARCHAR(10);
      `;


    console.log("✅ Database schema initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
  } finally {
    process.exit();
  }
}

initDB();

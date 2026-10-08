CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  article TEXT NOT NULL,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_on TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gifs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  public_id TEXT,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_on TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_comments (
  id SERIAL PRIMARY KEY,
  comment TEXT NOT NULL,
  article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_on TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gif_comments (
  id SERIAL PRIMARY KEY,
  comment TEXT NOT NULL,
  gif_id INT NOT NULL REFERENCES gifs(id) ON DELETE CASCADE,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_on TIMESTAMP DEFAULT NOW()
);
-- SELECT c.comment, a.title
-- FROM article_comments c
-- JOIN articles a ON a.id = c.article_id;
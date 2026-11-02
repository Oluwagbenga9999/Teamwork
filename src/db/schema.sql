CREATE TABLE
  IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    job_role VARCHAR(100),
    department VARCHAR(100),
    address VARCHAR(255),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
  );

-- For a database that already has the old users table:
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS job_role VARCHAR(100),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS address VARCHAR(255);

CREATE TABLE
  IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    article TEXT NOT NULL,
    author_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW ()
  );

CREATE TABLE
  IF NOT EXISTS gifs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image_url TEXT NOT NULL,
    public_id TEXT,
    author_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW ()
  );

CREATE TABLE
  IF NOT EXISTS article_comments (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    article_id INT NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW ()
  );

CREATE TABLE
  IF NOT EXISTS gif_comments (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    gif_id INT NOT NULL REFERENCES gifs (id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW ()
  );

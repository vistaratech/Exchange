-- PostgreSQL schema for the production persistence adapter.
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE post_status AS ENUM ('active', 'archived', 'removed');
CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled', 'completed');
CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'dismissed', 'resolved');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email citext NOT NULL UNIQUE,
  phone varchar(24) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  profile_image text,
  city varchar(120) NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(80) NOT NULL UNIQUE, icon varchar(64), status boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), title varchar(140) NOT NULL,
  description text NOT NULL, condition item_condition NOT NULL, category_id uuid NOT NULL REFERENCES categories(id), city varchar(120) NOT NULL,
  locality varchar(120), desired_items text, open_to_any_exchange boolean NOT NULL DEFAULT false,
  status post_status NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE post_images (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE, image_url text NOT NULL, sort_order smallint NOT NULL DEFAULT 0, UNIQUE(post_id, sort_order));
CREATE TABLE conversations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE conversation_participants (conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id), PRIMARY KEY(conversation_id, user_id));
CREATE TABLE messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, sender_id uuid NOT NULL REFERENCES users(id), message text NOT NULL, attachment_url text, created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz);
CREATE TABLE exchange_proposals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_id uuid NOT NULL REFERENCES users(id), receiver_id uuid NOT NULL REFERENCES users(id),
 sender_post_id uuid NOT NULL REFERENCES posts(id), receiver_post_id uuid NOT NULL REFERENCES posts(id), message text, status proposal_status NOT NULL DEFAULT 'pending',
 sender_completed_at timestamptz, receiver_completed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE saved_posts (user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id, post_id));
CREATE TABLE reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), exchange_id uuid NOT NULL REFERENCES exchange_proposals(id), reviewer_id uuid NOT NULL REFERENCES users(id), reviewed_user_id uuid NOT NULL REFERENCES users(id), rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5), review text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(exchange_id, reviewer_id));
CREATE TABLE reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES users(id), reported_user_id uuid REFERENCES users(id), reported_post_id uuid REFERENCES posts(id), reason varchar(80) NOT NULL, description text, status report_status NOT NULL DEFAULT 'open', created_at timestamptz NOT NULL DEFAULT now(), CHECK (reported_user_id IS NOT NULL OR reported_post_id IS NOT NULL));
CREATE TABLE blocks (blocker_id uuid NOT NULL REFERENCES users(id), blocked_id uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(blocker_id, blocked_id), CHECK(blocker_id <> blocked_id));
CREATE INDEX posts_discovery_idx ON posts (status, city, category_id, created_at DESC);
CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at);
CREATE INDEX proposals_receiver_idx ON exchange_proposals (receiver_id, status, created_at DESC);
CREATE INDEX reports_status_idx ON reports (status, created_at DESC);

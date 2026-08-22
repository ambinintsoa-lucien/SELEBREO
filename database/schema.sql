-- ============================================================
-- SELEBREO — schéma de référence PostgreSQL (lecture humaine)
-- Le schéma réellement appliqué est généré par Prisma
-- (backend/prisma/schema.prisma) via `npx prisma migrate dev`.
-- Ce fichier sert de documentation/référence indépendante.
-- ============================================================

CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email            VARCHAR(255) UNIQUE NOT NULL,
    username         VARCHAR(50) UNIQUE NOT NULL,
    password_hash    TEXT NOT NULL,
    full_name        VARCHAR(150),
    bio              VARCHAR(500),
    country          VARCHAR(100),
    avatar_url       TEXT,
    primary_theme_id UUID REFERENCES categories(id),
    role             VARCHAR(20) NOT NULL DEFAULT 'USER',   -- USER | ADMIN | MODERATOR
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | SUSPENDED | DELETED
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
    -- Humour, Musique, Danse, Sport, Études, Technologie, Art, Gaming,
    -- Mode, Lifestyle, Amour, Divertissement, Autre
);

CREATE TABLE posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id     UUID NOT NULL REFERENCES users(id),
    video_url     TEXT NOT NULL,
    thumbnail_url TEXT,
    description   VARCHAR(220) NOT NULL,
    hashtags      TEXT[] DEFAULT '{}',
    category_id   UUID NOT NULL REFERENCES categories(id),
    visibility    VARCHAR(20) NOT NULL DEFAULT 'PUBLIC', -- PUBLIC | FOLLOWERS_ONLY | PRIVATE
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

CREATE TABLE likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    post_id    UUID NOT NULL REFERENCES posts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id) -- empêche un like en double
);

CREATE TABLE comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    post_id    UUID NOT NULL REFERENCES posts(id),
    content    VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_post ON comments(post_id);

CREATE TABLE followers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES users(id),
    followed_id  UUID NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (follower_id, followed_id)
);

CREATE TABLE competition_periods (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label                       VARCHAR(100) NOT NULL,
    started_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at                    TIMESTAMPTZ,
    is_active                   BOOLEAN NOT NULL DEFAULT true,
    initial_stage_delay_days    INT NOT NULL DEFAULT 7,   -- Top 100 après 1 semaine
    stage_reduction_delay_days  INT NOT NULL DEFAULT 30   -- paliers suivants, tous les mois
);

CREATE TABLE competition_stages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id  UUID NOT NULL REFERENCES competition_periods(id),
    name       VARCHAR(20) NOT NULL, -- TOP_100 | TOP_80 | TOP_40 | TOP_20 | TOP_10 | TOP_4 | TOP_2 | FINALE | TOP_1
    "order"    INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at   TIMESTAMPTZ,
    UNIQUE (period_id, name)
);

-- Score cumulatif : jamais remis à zéro entre paliers
CREATE TABLE ranking_entries (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id     UUID NOT NULL REFERENCES competition_periods(id),
    stage_id      UUID NOT NULL REFERENCES competition_stages(id),
    user_id       UUID NOT NULL REFERENCES users(id),
    post_id       UUID REFERENCES posts(id),
    total_score   INT NOT NULL DEFAULT 0,
    position      INT,
    is_eliminated BOOLEAN NOT NULL DEFAULT false,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (period_id, user_id)
);
CREATE INDEX idx_ranking_stage_position ON ranking_entries(stage_id, position);

CREATE TABLE duels (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id        UUID NOT NULL REFERENCES competition_periods(id),
    stage_id         UUID NOT NULL REFERENCES competition_stages(id),
    participant_a_id UUID NOT NULL REFERENCES users(id),
    participant_b_id UUID NOT NULL REFERENCES users(id),
    winner_id        UUID REFERENCES users(id),
    status           VARCHAR(20) NOT NULL DEFAULT 'ONGOING', -- ONGOING | FINISHED
    voting_ends_at   TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_duels_stage ON duels(stage_id);

-- Un vote par utilisateur par duel (anti-fraude) ; votes "like" sur posts séparés
CREATE TABLE votes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id          UUID NOT NULL REFERENCES users(id),
    post_id           UUID REFERENCES posts(id),
    duel_id           UUID REFERENCES duels(id),
    voted_for_user_id UUID REFERENCES users(id),
    type              VARCHAR(20) NOT NULL, -- LIKE_BOOST | DUEL
    ip_hash           TEXT,   -- jamais l'IP en clair
    device_hash       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (voter_id, duel_id)
);
CREATE INDEX idx_votes_post ON votes(post_id);
CREATE INDEX idx_votes_duel ON votes(duel_id);

CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id),
    type         VARCHAR(30) NOT NULL, -- NEW_FOLLOWER | LIKE | COMMENT | VOTE | RANKING_CHANGE | ...
    message      TEXT NOT NULL,
    related_id   UUID,
    is_read      BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);

CREATE TABLE reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_id    UUID NOT NULL REFERENCES users(id),
    reported_user_id  UUID REFERENCES users(id),
    post_id           UUID REFERENCES posts(id),
    comment_id        UUID REFERENCES comments(id),
    reason            VARCHAR(30) NOT NULL, -- SPAM | HARASSMENT | HATE_SPEECH | NUDITY | VIOLENCE | FALSE_INFORMATION | OTHER
    details           TEXT,
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING | REVIEWED_ACCEPTED | REVIEWED_REJECTED
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON reports(status);

CREATE TABLE blocked_users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id),
    blocked_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (blocker_id, blocked_id)
);

CREATE TABLE admin_actions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id   UUID NOT NULL REFERENCES users(id),
    type       VARCHAR(30) NOT NULL, -- SUSPEND_USER | DELETE_POST | DELETE_COMMENT | RESOLVE_REPORT | ADJUST_RANKING | ANNOUNCEMENT
    target_id  UUID,
    details    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);

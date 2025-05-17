-- Esquema de la base de datos Supabase
-- Generado automáticamente el $(date)

-- Tabla: badges
CREATE TABLE badges (
  id uuid NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL,
  icon_name text NOT NULL,
  required_count integer,
  created_at timestamp with time zone NOT NULL
);

-- Tabla: course_lessons
CREATE TABLE course_lessons (
  id uuid NOT NULL PRIMARY KEY,
  section_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  video_url text,
  position integer NOT NULL,
  duration_minutes integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  FOREIGN KEY (section_id) REFERENCES course_sections(id)
);

-- Tabla: course_sections
CREATE TABLE course_sections (
  id uuid NOT NULL PRIMARY KEY,
  course_id uuid NOT NULL,
  title text NOT NULL,
  position integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tabla: courses
CREATE TABLE courses (
  id uuid NOT NULL PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  instructor text NOT NULL,
  image_url text NOT NULL,
  level text NOT NULL,
  category text NOT NULL,
  duration_minutes integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);

-- Tabla: ctf_registrations
CREATE TABLE ctf_registrations (
  id uuid NOT NULL PRIMARY KEY,
  ctf_id integer NOT NULL,
  user_id uuid NOT NULL,
  registered_at timestamp with time zone NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Tabla: machine_hints
CREATE TABLE machine_hints (
  id uuid NOT NULL PRIMARY KEY,
  machine_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  level integer NOT NULL,
  point_cost integer NOT NULL,
  created_at timestamp with time zone NOT NULL
);

-- Tabla: machine_sessions
CREATE TABLE machine_sessions (
  id uuid NOT NULL PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid NOT NULL,
  machine_type_id uuid NOT NULL,
  status text NOT NULL,
  username text,
  password text,
  ip_address text,
  connection_info jsonb,
  started_at timestamp with time zone NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  terminated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (machine_type_id) REFERENCES machine_types(id)
);

-- Tabla: machine_sessions_history
CREATE TABLE machine_sessions_history (
  id uuid NOT NULL PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid NOT NULL,
  machine_type_id uuid NOT NULL,
  status text NOT NULL,
  started_at timestamp with time zone NOT NULL,
  terminated_at timestamp with time zone NOT NULL,
  duration_minutes integer,
  created_at timestamp with time zone NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (machine_type_id) REFERENCES machine_types(id)
);

-- Tabla: machine_types
CREATE TABLE machine_types (
  id uuid NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL,
  os_type text NOT NULL,
  points integer NOT NULL,
  max_time_minutes integer NOT NULL,
  image_url text,
  creator text,
  categories text[],
  requirements text[],
  skills text[],
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);

-- Tabla: profiles
CREATE TABLE profiles (
  id uuid NOT NULL PRIMARY KEY,
  username text,
  avatar_url text,
  role text,
  points integer,
  level integer,
  rank integer,
  preferred_level text,
  solved_machines integer,
  completed_challenges integer,
  recommended_course text,
  completed_assessment boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Tabla: user_activities
CREATE TABLE user_activities (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  points integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Tabla: user_badge_progress
CREATE TABLE user_badge_progress (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  current_progress integer NOT NULL,
  earned boolean NOT NULL,
  earned_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- Tabla: user_course_progress
CREATE TABLE user_course_progress (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  progress_percentage integer NOT NULL,
  started_at timestamp with time zone NOT NULL,
  completed boolean NOT NULL,
  completed_at timestamp with time zone,
  last_lesson_id uuid,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (last_lesson_id) REFERENCES course_lessons(id)
);

-- Tabla: user_hints
CREATE TABLE user_hints (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  machine_id text NOT NULL,
  hint_level integer NOT NULL,
  points_spent integer NOT NULL,
  unlocked_at timestamp with time zone NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Tabla: user_lesson_progress
CREATE TABLE user_lesson_progress (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  course_id uuid,
  completed boolean NOT NULL,
  completed_at timestamp with time zone,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tabla: user_machine_progress
CREATE TABLE user_machine_progress (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  machine_id text NOT NULL,
  progress integer NOT NULL,
  started_at timestamp with time zone NOT NULL,
  last_activity_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone,
  flags text[],
  completed_tasks text[],
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);
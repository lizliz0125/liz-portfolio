-- 每次点赞插入一行；总赞数 = COUNT(*)
CREATE TABLE IF NOT EXISTS likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- 行级安全
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read likes"
  ON likes FOR SELECT USING (true);

CREATE POLICY "anyone can insert likes"
  ON likes FOR INSERT WITH CHECK (true);

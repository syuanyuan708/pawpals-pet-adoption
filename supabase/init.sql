-- PawPals 宠物领养应用数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- =============================================
-- 1. 创建用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT 'https://via.placeholder.com/150',
  join_date TIMESTAMPTZ DEFAULT NOW(),
  pets_adopted_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. 创建收容所表
-- =============================================
CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. 创建宠物表
-- =============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  weight TEXT,
  color TEXT,
  distance TEXT,
  description TEXT,
  tags TEXT[],
  image TEXT NOT NULL,
  is_latest BOOLEAN DEFAULT FALSE,
  health_info TEXT[],
  location TEXT,
  shelter_id UUID REFERENCES shelters(id),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. 创建领养申请表
-- =============================================
CREATE TABLE IF NOT EXISTS adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  pet_id UUID REFERENCES pets(id) NOT NULL,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  house_type TEXT,
  has_experience BOOLEAN,
  has_children BOOLEAN,
  has_allergies BOOLEAN,
  agreed_to_terms BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. 创建消息表
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id) NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  time TEXT,
  is_unread BOOLEAN DEFAULT TRUE,
  type TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. 创建收藏表
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  pet_id UUID REFERENCES pets(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

-- =============================================
-- 7. 创建索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_location ON pets(location);
CREATE INDEX IF NOT EXISTS idx_pets_shelter ON pets(shelter_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON adoption_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_pet ON adoption_applications(pet_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- =============================================
-- 8. 启用行级安全策略 (RLS)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. 创建自动同步用户的触发器函数
-- =============================================
-- 当 auth.users 有新用户注册时，自动在 public.users 创建记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'https://via.placeholder.com/150'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器（如果不存在则创建）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 10. 用户表 RLS 策略
-- =============================================
-- 允许已认证用户查看自己的信息
DROP POLICY IF EXISTS "用户可以查看自己的信息" ON users;
CREATE POLICY "用户可以查看自己的信息" ON users
  FOR SELECT USING (auth.uid() = id);

-- 允许用户更新自己的信息
DROP POLICY IF EXISTS "用户可以更新自己的信息" ON users;
CREATE POLICY "用户可以更新自己的信息" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 允许服务角色插入用户（触发器使用 SECURITY DEFINER）
DROP POLICY IF EXISTS "允许插入新用户" ON users;
CREATE POLICY "服务角色可以插入用户" ON users
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 11. 收容所表 RLS 策略
-- =============================================
-- 所有人可以查看收容所
CREATE POLICY "所有人可以查看收容所" ON shelters
  FOR SELECT USING (true);

-- =============================================
-- 12. 宠物表 RLS 策略
-- =============================================
-- 所有人可以查看可领养的宠物
CREATE POLICY "所有人可以查看宠物" ON pets
  FOR SELECT USING (true);

-- =============================================
-- 13. 领养申请表 RLS 策略
-- =============================================
-- 用户可以查看自己的申请
CREATE POLICY "用户可以查看自己的申请" ON adoption_applications
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的申请
CREATE POLICY "用户可以创建申请" ON adoption_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 14. 消息表 RLS 策略
-- =============================================
-- 用户可以查看发给自己的消息
CREATE POLICY "用户可以查看自己的消息" ON messages
  FOR SELECT USING (auth.uid() = recipient_id);

-- 用户可以更新自己的消息（标记已读）
CREATE POLICY "用户可以更新自己的消息" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- 允许系统插入消息（通过 service role）
CREATE POLICY "允许插入消息" ON messages
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 15. 收藏表 RLS 策略
-- =============================================
-- 用户可以查看自己的收藏
CREATE POLICY "用户可以查看自己的收藏" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以添加收藏
CREATE POLICY "用户可以添加收藏" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "用户可以删除自己的收藏" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 16. 插入示例数据
-- =============================================

-- 插入收容所数据
INSERT INTO shelters (id, name, owner, avatar, is_verified, location) VALUES
  ('11111111-1111-1111-1111-111111111111', '快乐爪爪庇护所', '莎拉·詹金斯', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB18O16LCiRbAg6uXnPqJ84Y97ktvrAYPOB5xhU-DwKmQteFa9XnbOThbhZLNrVsEUo83mCvGR6jw6Y19BDkXhJrZEUqucdBDDxhbmpA5-EjAlw_eBVr7FbygiCgYPh0QbA_hUVWhKSRHCgM3YmyDqohxtl06iKFpCQ7GXlgppKTePatoAdMDmzu-gfLPgkhAlNz6Ex6BKQNz_gQ93clovD0WvEyVFbQfz8N01Sl6cAn16z8we60ppz82gyU9mLiIK58EO8_zyH5MHF', true, '旧金山'),
  ('22222222-2222-2222-2222-222222222222', '猫咪乐园', '王先生', 'https://picsum.photos/100/100', true, '上海市')
ON CONFLICT DO NOTHING;

-- 插入宠物数据
INSERT INTO pets (id, name, type, breed, age, gender, weight, color, distance, description, tags, image, is_latest, health_info, location, shelter_id, is_available) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '巴迪',
    '狗狗',
    '金毛寻回犬',
    '2岁',
    '公',
    '25 公斤',
    '金色',
    '2.5 公里',
    '巴迪是一只非常友好且精力充沛的金毛寻回犬，喜欢在公园里玩捡球游戏。它与孩子和其他狗狗相处得很好。它已经受过室内训练，懂简单的指令，比如坐下、定住和握手。',
    ARRAY['活泼', '忠诚', '已接种疫苗'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCOYmOoQvuSE2PPxMj23P_p3kb-FRaaka0422ts0X8w_P3KanqSggDK4c_E-ao-Q0IB2RIhqjgDwnE6Mo3NXP9oue2AidoiceLSJ3hHEuKcmGHkSaBFofBEXdYdtN4Zp1Qt_2PEi59M9vSnOYqcjDj5HX7p8aVfOoVcjZGuTW13J2zCjbcqRWYy1rnBfhMoAzKsV5FlZl6Mtb_BgRSPd_8NSL-F4EUujM_Xmvy4ZVw9xMMoKKZc2NbeyzzKWb1MKxRIrkjohAISLnkf',
    false,
    ARRAY['疫苗接种齐全', '已植入芯片', '需要带围栏的院子'],
    '旧金山',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '露娜',
    '猫咪',
    '暹罗猫',
    '4个月',
    '母',
    '2 公斤',
    '奶油色',
    '1.8 公里',
    '露娜是一只优雅且粘人的暹罗猫。她喜欢在阳光充足的窗台上打盹，也喜欢和它的主人互动。',
    ARRAY['温顺', '爱干净'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCI-9T3A497TDKQbxSIib1ZF1tMMjFigAW6v_JGv4Z6vcZhfo7-nSMEaK2vrRVeD_-M87Tj8NN4fpc5veCT5w2WQNBaiDp31Tz6D0x1ONdEqhJfWMl4BmLxd4iRg0EmNzdbqRclNP1gR-59qXR8vbdRjKmphyURg1iF9gkl2X_oezWNrViXQvJGjmRGoE860jiPyqu6bMMXoeySPmimiSsNlgeLRtq7AKrL2HIpdaGuQhwKUbxgAFwtsSuKMqyz6fUR2c71rpfH_Vds',
    true,
    ARRAY['已接种疫苗', '已体内外驱虫'],
    '上海市',
    '22222222-2222-2222-2222-222222222222',
    true
  )
ON CONFLICT DO NOTHING;

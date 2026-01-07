-- PawPals 数据表修复脚本
-- 用于修复已有数据库中的 RLS 策略和外键约束问题
-- 在 Supabase SQL Editor 中执行此脚本

-- =============================================
-- 1. 修复用户表触发器（自动创建用户记录）
-- =============================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. 修复用户表 RLS 策略
-- =============================================
DROP POLICY IF EXISTS "用户可以查看自己的信息" ON users;
DROP POLICY IF EXISTS "用户可以更新自己的信息" ON users;
DROP POLICY IF EXISTS "允许插入新用户" ON users;
DROP POLICY IF EXISTS "服务角色可以插入用户" ON users;

CREATE POLICY "用户可以查看自己的信息" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的信息" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "允许插入用户" ON users
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. 修复消息表 - 允许用户给自己发消息
-- =============================================
DROP POLICY IF EXISTS "用户可以查看自己的消息" ON messages;
DROP POLICY IF EXISTS "用户可以更新自己的消息" ON messages;
DROP POLICY IF EXISTS "允许插入消息" ON messages;

-- 用户可以查看发给自己的消息
CREATE POLICY "用户可以查看自己的消息" ON messages
  FOR SELECT USING (auth.uid() = recipient_id);

-- 用户可以更新自己的消息（标记已读）
CREATE POLICY "用户可以更新自己的消息" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- 任何已认证用户都可以插入消息
CREATE POLICY "已认证用户可以发消息" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 4. 修复领养申请表
-- =============================================
DROP POLICY IF EXISTS "用户可以查看自己的申请" ON adoption_applications;
DROP POLICY IF EXISTS "用户可以创建申请" ON adoption_applications;

-- 用户可以查看自己的申请
CREATE POLICY "用户可以查看自己的申请" ON adoption_applications
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建申请
CREATE POLICY "用户可以创建申请" ON adoption_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的申请
CREATE POLICY "用户可以更新自己的申请" ON adoption_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 5. 修复收藏表
-- =============================================
DROP POLICY IF EXISTS "用户可以查看自己的收藏" ON favorites;
DROP POLICY IF EXISTS "用户可以添加收藏" ON favorites;
DROP POLICY IF EXISTS "用户可以删除自己的收藏" ON favorites;

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
-- 6. 确保收容所和宠物表可公开读取
-- =============================================
DROP POLICY IF EXISTS "所有人可以查看收容所" ON shelters;
DROP POLICY IF EXISTS "所有人可以查看宠物" ON pets;

CREATE POLICY "所有人可以查看收容所" ON shelters
  FOR SELECT USING (true);

CREATE POLICY "所有人可以查看宠物" ON pets
  FOR SELECT USING (true);

-- =============================================
-- 7. 为已注册但未同步的用户手动同步
-- =============================================
-- 将 auth.users 中存在但 public.users 中不存在的用户同步过来
INSERT INTO public.users (id, email, name, avatar)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'https://via.placeholder.com/150'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- =============================================
-- 完成！
-- =============================================
SELECT '修复完成！所有 RLS 策略已更新，触发器已创建。' AS result;

-- =============================================
-- PawPals 后台管理系统 RLS 策略更新
-- 在 Supabase SQL Editor 中执行此脚本
-- =============================================

-- 1. 允许所有人读取宠物数据（包括已下线的）
DROP POLICY IF EXISTS "所有人可以查看宠物" ON pets;
CREATE POLICY "所有人可以查看宠物" ON pets
    FOR SELECT USING (true);

-- 2. 允许所有人插入宠物（后台录入）
DROP POLICY IF EXISTS "允许插入宠物" ON pets;
CREATE POLICY "允许插入宠物" ON pets
    FOR INSERT WITH CHECK (true);

-- 3. 允许所有人更新宠物（后台编辑）
DROP POLICY IF EXISTS "允许更新宠物" ON pets;
CREATE POLICY "允许更新宠物" ON pets
    FOR UPDATE USING (true);

-- 4. 允许所有人删除宠物（后台删除）
DROP POLICY IF EXISTS "允许删除宠物" ON pets;
CREATE POLICY "允许删除宠物" ON pets
    FOR DELETE USING (true);

-- 5. 允许所有人查看收容所
DROP POLICY IF EXISTS "所有人可以查看收容所" ON shelters;
CREATE POLICY "所有人可以查看收容所" ON shelters
    FOR SELECT USING (true);

-- 6. 允许所有人查看所有领养申请（管理后台需要）
DROP POLICY IF EXISTS "允许查看所有申请" ON adoption_applications;
CREATE POLICY "允许查看所有申请" ON adoption_applications
    FOR SELECT USING (true);

-- 7. 允许更新领养申请状态（审批操作）
DROP POLICY IF EXISTS "允许更新申请" ON adoption_applications;
CREATE POLICY "允许更新申请" ON adoption_applications
    FOR UPDATE USING (true);

-- 8. 确保消息表允许插入（系统通知）
DROP POLICY IF EXISTS "允许插入消息" ON messages;
CREATE POLICY "允许插入消息" ON messages
    FOR INSERT WITH CHECK (true);

-- 提示：执行完毕后刷新后台管理页面
SELECT '✅ RLS 策略已更新，请刷新后台管理页面' as result;

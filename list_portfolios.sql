-- ===================================================================
--  LIST ALL PORTFOLIOS IN SUPABASE DATABASE
-- ===================================================================
--  This script provides comprehensive information about all portfolios
--  in your database, including user details, content, and status.
-- ===================================================================

-- 1. BASIC PORTFOLIO LISTING
-- ===================================================================
SELECT 
    '=== BASIC PORTFOLIO INFORMATION ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    p.user_id,
    p.is_published,
    p.is_default,
    p.theme_name,
    p.created_at,
    p.updated_at,
    up.email as user_email,
    up.full_name as user_full_name,
    up.username as user_username
FROM user_portfolios p
LEFT JOIN user_profiles up ON p.user_id = up.id
ORDER BY p.created_at DESC;

-- 2. PORTFOLIO CONTENT SUMMARY
-- ===================================================================
SELECT 
    '=== PORTFOLIO CONTENT SUMMARY ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    p.artist_name,
    p.bio,
    p.hero_title,
    p.hero_subtitle,
    p.about_title,
    p.contact_email,
    p.contact_phone,
    p.contact_location,
    p.seo_title,
    p.seo_description,
    p.github_url,
    p.website_url,
    p.linkedin_url,
    p.twitter_url,
    p.instagram_url,
    p.youtube_url,
    p.profile_photo_url,
    p.hero_image_url,
    p.is_published,
    p.theme_name
FROM user_portfolios p
ORDER BY p.created_at DESC;

-- 3. PORTFOLIO SECTIONS STATUS
-- ===================================================================
SELECT 
    '=== PORTFOLIO SECTIONS STATUS ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    CASE WHEN p.hobbies_title IS NOT NULL OR p.hobbies_json IS NOT NULL THEN '✓' ELSE '✗' END as has_hobbies,
    CASE WHEN p.skills_title IS NOT NULL OR p.skills_json IS NOT NULL THEN '✓' ELSE '✗' END as has_skills,
    CASE WHEN p.press_title IS NOT NULL OR p.press_json IS NOT NULL THEN '✓' ELSE '✗' END as has_press,
    CASE WHEN p.key_projects_title IS NOT NULL OR p.key_projects_json IS NOT NULL THEN '✓' ELSE '✗' END as has_projects,
    CASE WHEN p.resume_title IS NOT NULL THEN '✓' ELSE '✗' END as has_resume,
    CASE WHEN p.hero_title IS NOT NULL OR p.hero_subtitle IS NOT NULL THEN '✓' ELSE '✗' END as has_hero,
    CASE WHEN p.about_title IS NOT NULL OR p.about_text IS NOT NULL THEN '✓' ELSE '✗' END as has_about,
    CASE WHEN p.contact_email IS NOT NULL OR p.contact_phone IS NOT NULL THEN '✓' ELSE '✗' END as has_contact,
    CASE WHEN p.sections_config IS NOT NULL THEN '✓' ELSE '✗' END as has_sections_config
FROM user_portfolios p
ORDER BY p.created_at DESC;

-- 4. PUBLISHED PORTFOLIOS ONLY
-- ===================================================================
SELECT 
    '=== PUBLISHED PORTFOLIOS ONLY ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    p.artist_name,
    p.theme_name,
    p.created_at,
    up.email as user_email,
    up.full_name as user_full_name,
    up.username as user_username
FROM user_portfolios p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE p.is_published = true
ORDER BY p.created_at DESC;

-- 5. PORTFOLIO STATISTICS
-- ===================================================================
SELECT 
    '=== PORTFOLIO STATISTICS ===' as section;

SELECT 
    COUNT(*) as total_portfolios,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_portfolios,
    COUNT(CASE WHEN is_published = false THEN 1 END) as unpublished_portfolios,
    COUNT(CASE WHEN is_default = true THEN 1 END) as default_portfolios,
    COUNT(CASE WHEN theme_name IS NOT NULL THEN 1 END) as portfolios_with_theme,
    COUNT(CASE WHEN artist_name IS NOT NULL THEN 1 END) as portfolios_with_artist_name,
    COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as portfolios_with_bio,
    COUNT(CASE WHEN contact_email IS NOT NULL THEN 1 END) as portfolios_with_contact_email
FROM user_portfolios;

-- 6. THEME DISTRIBUTION
-- ===================================================================
SELECT 
    '=== THEME DISTRIBUTION ===' as section;

SELECT 
    COALESCE(theme_name, 'No theme set') as theme_name,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_portfolios), 2) as percentage
FROM user_portfolios
GROUP BY theme_name
ORDER BY count DESC;

-- 7. RECENT PORTFOLIOS (LAST 30 DAYS)
-- ===================================================================
SELECT 
    '=== RECENT PORTFOLIOS (LAST 30 DAYS) ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    p.artist_name,
    p.is_published,
    p.theme_name,
    p.created_at,
    up.email as user_email,
    up.full_name as user_full_name
FROM user_portfolios p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
ORDER BY p.created_at DESC;

-- 8. PORTFOLIOS BY USER
-- ===================================================================
SELECT 
    '=== PORTFOLIOS BY USER ===' as section;

SELECT 
    up.id as user_id,
    up.email,
    up.full_name,
    up.username,
    COUNT(p.id) as portfolio_count,
    COUNT(CASE WHEN p.is_published = true THEN 1 END) as published_count,
    COUNT(CASE WHEN p.is_default = true THEN 1 END) as default_count,
    MAX(p.created_at) as latest_portfolio_created
FROM user_profiles up
LEFT JOIN user_portfolios p ON up.id = p.user_id
GROUP BY up.id, up.email, up.full_name, up.username
ORDER BY portfolio_count DESC, up.email;

-- 9. EMPTY PORTFOLIOS (NO CONTENT)
-- ===================================================================
SELECT 
    '=== EMPTY PORTFOLIOS (NO CONTENT) ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    p.user_id,
    p.created_at,
    up.email as user_email,
    up.full_name as user_full_name
FROM user_portfolios p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE 
    p.artist_name IS NULL 
    AND p.bio IS NULL 
    AND p.hero_title IS NULL 
    AND p.about_title IS NULL 
    AND p.contact_email IS NULL
    AND p.hobbies_title IS NULL 
    AND p.skills_title IS NULL 
    AND p.press_title IS NULL 
    AND p.key_projects_title IS NULL
ORDER BY p.created_at DESC;

-- 10. PORTFOLIO URLS FOR TESTING
-- ===================================================================
SELECT 
    '=== PORTFOLIO URLS FOR TESTING ===' as section;

SELECT 
    p.name,
    p.slug,
    p.is_published,
    CASE 
        WHEN p.is_published = true THEN 
            'https://yourdomain.com/portfolio/' || up.username || '/' || p.slug
        ELSE 
            'https://yourdomain.com/portfolio/preview/' || p.id
    END as portfolio_url,
    up.username,
    up.email as user_email
FROM user_portfolios p
LEFT JOIN user_profiles up ON p.user_id = up.id
ORDER BY p.is_published DESC, p.created_at DESC;

-- ===================================================================
--  END OF PORTFOLIO LISTING
-- ===================================================================
SELECT 'Portfolio listing complete. Check all sections above for detailed information.' as status; 
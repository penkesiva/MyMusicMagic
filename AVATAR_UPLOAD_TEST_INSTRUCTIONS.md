# Avatar Upload Test Instructions

## Manual Testing Steps

Since the automated test requires environment variables, here are manual steps to test the avatar upload fix:

### 1. Apply the Storage Policy Fix

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the following SQL script:

```sql
-- Copy and paste the contents of fix_avatar_storage_policies.sql
```

### 2. Apply the Migration

1. In the same SQL Editor, run:

```sql
-- Copy and paste the contents of supabase/migrations/20241207000000_fix_avatar_storage.sql
```

### 3. Test in the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Profile Settings page:
   - Go to `/dashboard/profile`
   - Or click on your avatar in the dashboard and select "Profile Settings"

3. Test the upload functionality:
   - Click the "Upload Photo" button
   - Select an image file (JPEG, PNG, GIF, or WebP)
   - File size should be under 5MB
   - Watch for the loading state
   - Check for success/error messages

### 4. Check Browser Console

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Try uploading an image
4. Look for detailed log messages:
   - "Uploading avatar: {...}"
   - "Upload successful: {...}"
   - "Public URL generated: ..."
   - Any error messages

### 5. Verify the Fix

**Success Indicators:**
- ✅ Upload button shows loading state
- ✅ Success message appears after upload
- ✅ Profile picture displays correctly
- ✅ No console errors
- ✅ File input clears after upload

**Error Indicators:**
- ❌ Error message appears
- ❌ Console shows specific error details
- ❌ Upload button remains disabled
- ❌ Profile picture doesn't update

### 6. Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "Bucket not found" | Run the storage policy fix script |
| "Permission denied" | Check RLS policies are applied |
| "File too large" | Use a smaller image (< 5MB) |
| "Invalid file type" | Use JPEG, PNG, GIF, or WebP |
| "Upload failed: ..." | Check console for specific error details |

### 7. Debug Information

The updated code now provides detailed logging. Check the browser console for:

```javascript
// Upload attempt
Uploading avatar: {
  bucket: 'avatars',
  fileName: 'user-id/timestamp-filename.jpg',
  fileSize: 123456,
  fileType: 'image/jpeg'
}

// Success
Upload successful: { path: 'user-id/timestamp-filename.jpg' }
Public URL generated: https://...

// Errors
Upload error details: { message: 'Specific error message' }
```

### 8. Storage Bucket Verification

In Supabase Dashboard:
1. Go to Storage
2. Check if "avatars" bucket exists
3. Verify it's set to "Public"
4. Check file size limit (should be 5MB)
5. Verify allowed MIME types include image formats

### 9. RLS Policy Verification

In Supabase Dashboard:
1. Go to Authentication > Policies
2. Look for storage.objects policies
3. Verify these policies exist:
   - "Users can upload their own avatar"
   - "Users can update their own avatar"
   - "Users can delete their own avatar"
   - "Avatars are publicly viewable"

## Quick Fix Commands

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the SQL directly
supabase db reset --linked
```

## Support

If the issue persists:
1. Check the browser console for specific error messages
2. Verify all SQL scripts were executed successfully
3. Check Supabase dashboard for bucket and policy configuration
4. Ensure user authentication is working properly 
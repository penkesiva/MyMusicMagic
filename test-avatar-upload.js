const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAvatarStorage() {
  console.log('🔍 Testing Avatar Storage Configuration...\n');

  try {
    // 1. Check if avatars bucket exists
    console.log('1. Checking avatars bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }

    const avatarsBucket = buckets.find(bucket => bucket.id === 'avatars');
    if (!avatarsBucket) {
      console.error('❌ Avatars bucket not found!');
      console.log('Available buckets:', buckets.map(b => b.id));
      return;
    }

    console.log('✅ Avatars bucket found:', {
      id: avatarsBucket.id,
      name: avatarsBucket.name,
      public: avatarsBucket.public,
      fileSizeLimit: avatarsBucket.file_size_limit,
      allowedMimeTypes: avatarsBucket.allowed_mime_types
    });

    // 2. Check storage policies
    console.log('\n2. Checking storage policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage')
      .ilike('policyname', '%avatar%');

    if (policyError) {
      console.error('❌ Error checking policies:', policyError);
    } else {
      console.log('✅ Avatar policies found:', policies.length);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });
    }

    // 3. Test file upload (if we have a test user)
    console.log('\n3. Testing file upload...');
    
    // Create a simple test file
    const testFileName = 'test-avatar.txt';
    const testContent = 'This is a test avatar file';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    
    const testUserId = 'test-user-' + Date.now();
    const uploadPath = `${testUserId}/test-upload-${Date.now()}.txt`;

    console.log('   Uploading test file to:', uploadPath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(uploadPath, testFile);

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([uploadPath]);
      
      if (deleteError) {
        console.warn('⚠️  Could not clean up test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    // 4. Check RLS policies
    console.log('\n4. Checking RLS policies...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_storage_policies');

    if (rlsError) {
      console.log('ℹ️  Could not check RLS policies via RPC, checking manually...');
      
      // Manual check of common policy patterns
      const { data: manualCheck, error: manualError } = await supabase
        .from('information_schema.table_privileges')
        .select('*')
        .eq('table_name', 'objects')
        .eq('table_schema', 'storage');

      if (!manualError && manualCheck.length > 0) {
        console.log('✅ Storage objects table has privileges configured');
      }
    } else {
      console.log('✅ RLS policies check successful');
    }

    console.log('\n🎉 Avatar storage test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAvatarStorage(); 
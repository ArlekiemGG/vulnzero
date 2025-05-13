
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Extract userId from query parameters
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://locviruzkdfnhusfquuc.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    // Fallback: Call the Supabase function directly
    const isAdminUrl = `${supabaseUrl}/rest/v1/rpc/is_admin`;
    try {
      const response = await fetch(isAdminUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ user_id: userId }),
      });
      
      const isAdmin = await response.json();
      return res.status(200).json({ data: { isAdmin } });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check admin status' });
    }
  }
  
  // Create a Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Call the is_admin function
    const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
    
    if (error) throw error;
    
    return res.status(200).json({ data: { isAdmin: data } });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Failed to check admin status' });
  }
}

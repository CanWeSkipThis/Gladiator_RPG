window.supabaseReady = (async () => {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');

    const SUPABASE_URL = 'https://drevdfsvjeohdoitnnyz.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_1s_o5OiZh8QnvN8-BPQGkA_XhSVTCzN';

    window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window.supabase;
})();
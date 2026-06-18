async function registerWithEmail(email, password) {
    await window.supabaseReady;

    const { data, error } = await window.supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error('Email sign-up failed:', error);
        return null;
    }

    await updateHeaderStatus();
    renderMenu();
	
    return data;
}

async function loginWithEmail(email, password) {
    await window.supabaseReady;

    const { data, error } = await window.supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Email sign-in failed:', error);
        return null;
    }

    await updateHeaderStatus();
    renderMenu();

    return data;
}

async function signOut() {
    await window.supabaseReady;

    const { error } = await window.supabase.auth.signOut();
    if (error) {
        console.error('Sign-out failed:', error);
        return false;
    }

    await updateHeaderStatus();
    renderMenu();
	
    return true;
}

async function getCurrentUser() {
    await window.supabaseReady;

    try {
        const {
            data: { user }
        } = await window.supabase.auth.getUser();

        return user || null;
    } catch (error) {
        return null;
    }
}

window.registerWithEmail = registerWithEmail;
window.loginWithEmail = loginWithEmail;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
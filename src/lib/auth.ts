import { supabase } from './supabase'
import { UserProfile, Doctor } from './supabase'

export interface AuthState {
  user: any | null
  profile: UserProfile | null
  loading: boolean
  authState: 'LOGGED_OUT' | 'LOGGED_IN' | 'AWAITING_2FA'
}

export const authService = {
  async signUp(email: string, password: string, userData: { full_name: string; role?: string; phone?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/login`
      }
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (data.user) {
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (mfaData && mfaData.nextLevel !== 'aal1' && mfaData.nextLevel !== mfaData.currentLevel) {
        return { data, error, needs2FA: true }
      }
    }
    
    return { data, error, needs2FA: false }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async sendPasswordResetEmail(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
  },

  async updateUserPassword(password: string) {
    return supabase.auth.updateUser({ password });
  },

  async enroll2FA() {
    return supabase.auth.mfa.enroll({
      factorType: 'totp',
    });
  },

  async verify2FA(token: string) {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId: (await supabase.auth.mfa.listFactors()).data.factors[0].id,
      code: token,
    });
    if (error) return { error };

    return supabase.auth.mfa.verify({
      factorId: data.id,
      challengeId: data.id, // This seems odd, but it's how it works
      code: token,
    });
  },

  async unenroll2FA(factorId: string) {
    return supabase.auth.mfa.unenroll({ factorId });
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  async getDoctorProfile(userId: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*, profile:user_profiles(*)')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateDoctorProfile(userId: string, profileUpdates: Partial<UserProfile>, doctorUpdates: Partial<Doctor>) {
    const { data: profileData, error: profileError } = await this.updateProfile(userId, profileUpdates)
    if (profileError) return { data: null, error: profileError }

    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .update(doctorUpdates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data: { ...profileData, ...doctorData }, error: doctorError }
  },

  onAuthStateChange(callback: (state: AuthState) => void) {
    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      let profile: UserProfile | null = null;
      let authState: AuthState['authState'] = 'LOGGED_OUT';
      
      if (user) {
        profile = await this.getProfile(user.id);
        const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (mfaData && mfaData.nextLevel !== 'aal1' && mfaData.nextLevel !== mfaData.currentLevel) {
          authState = 'AWAITING_2FA';
        } else {
          authState = 'LOGGED_IN';
        }
      }
      
      callback({ user, profile, loading: false, authState });
    });
    return subscription;
  }
}

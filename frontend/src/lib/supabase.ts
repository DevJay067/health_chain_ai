import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration is not complete. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export utility functions for common operations
export const supabaseOperations = {
  // Health Records operations
  async getHealthRecords(userId: string) {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async createHealthRecord(userId: string, record: any) {
    const { data, error } = await supabase
      .from('health_records')
      .insert([{ ...record, user_id: userId }]);
    
    if (error) throw error;
    return data;
  },

  async updateHealthRecord(recordId: string, updates: any) {
    const { data, error } = await supabase
      .from('health_records')
      .update(updates)
      .eq('id', recordId);
    
    if (error) throw error;
    return data;
  },

  async deleteHealthRecord(recordId: string) {
    const { data, error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', recordId);
    
    if (error) throw error;
    return data;
  },

  // Vital Signs operations
  async getVitalSigns(userId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async recordVitalSigns(userId: string, vitals: any) {
    const { data, error } = await supabase
      .from('vital_signs')
      .insert([{ ...vitals, user_id: userId, timestamp: new Date().toISOString() }]);
    
    if (error) throw error;
    return data;
  },

  // Health Insights operations
  async getHealthInsights(userId: string) {
    const { data, error } = await supabase
      .from('health_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createHealthInsight(userId: string, insight: any) {
    const { data, error } = await supabase
      .from('health_insights')
      .insert([{ ...insight, user_id: userId }]);
    
    if (error) throw error;
    return data;
  },

  // Device connections operations
  async getConnectedDevices(userId: string) {
    const { data, error } = await supabase
      .from('connected_devices')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async saveDeviceConnection(userId: string, device: any) {
    const { data, error } = await supabase
      .from('connected_devices')
      .insert([{ ...device, user_id: userId }]);
    
    if (error) throw error;
    return data;
  },

  // Risk assessment operations
  async saveRiskAssessment(userId: string, assessment: any) {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert([{ ...assessment, user_id: userId }]);
    
    if (error) throw error;
    return data;
  },

  async getRiskAssessment(userId: string) {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  },
};

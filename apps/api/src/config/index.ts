import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: '/api/v1',
  jwtSecret: process.env.JWT_SECRET || 'revx-secure-dev-jwt-secret-key-32-chars-long!',
  
  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL || 'https://mock.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'mock-anon-key',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Server-side LLM Provider Configuration
  llmProvider: process.env.LLM_PROVIDER || 'mock', // 'openai' | 'gemini' | 'anthropic' | 'mock'
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',

  // Google Maps Configuration (Server-side validation)
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',

  // Green Computing & Cache Settings
  aiCacheEnabled: process.env.AI_CACHE_ENABLED !== 'false',
  maxTelemetryPointsPerBatch: 500,
};

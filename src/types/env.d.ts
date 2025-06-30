namespace NodeJS {
  interface ProcessEnv {
    // Next.js
    NODE_ENV: 'development' | 'production' | 'test';
    
    // API
    NEXT_PUBLIC_API_URL: string;
    
    // Auth
    NEXT_PUBLIC_AUTH_SECRET: string;
    
    // Database
    DATABASE_URL: string;
    
    // Uploads
    UPLOAD_DIR: string;
  }
}

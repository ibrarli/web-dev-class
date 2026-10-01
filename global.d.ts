declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
      NEXT_PUBLIC_CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
    }
  }
}

export {};
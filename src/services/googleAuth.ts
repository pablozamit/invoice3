export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private gapi: any = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = async () => {
        try {
          await new Promise<void>((resolveGapi) => {
            (window as any).gapi.load('client:auth2', resolveGapi);
          });

          this.gapi = (window as any).gapi;
          
          // Explicitly initialize auth2 first
          await this.gapi.auth2.init({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
          });

          // Then initialize the client
          await this.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: [
              'https://sheets.googleapis.com/$discovery/rest?version=v4',
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ]
          });

          this.isInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const authInstance = this.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }
  }

  isSignedIn(): boolean {
    if (!this.isInitialized || !this.gapi) return false;
    const authInstance = this.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  getClient() {
    return this.gapi?.client;
  }
}
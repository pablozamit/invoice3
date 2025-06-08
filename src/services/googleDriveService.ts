import { GoogleAuthService } from './googleAuth';

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private authService = GoogleAuthService.getInstance();

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      await this.authService.signIn();
      const client = this.authService.getClient();

      if (!client) {
        throw new Error('Google API client not initialized');
      }

      const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

      // Convert file to base64
      const fileContent = await this.fileToBase64(file);
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const metadata = {
        'name': fileName,
        'parents': [folderId]
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + file.type + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        fileContent +
        close_delim;

      const request = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client.getToken().access_token}`,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      const response = await request.json();
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      return `https://drive.google.com/file/d/${response.id}/view`;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  generateFileName(empresa: string, fecha: string, importeTotal: string): string {
    // Clean company name
    const cleanEmpresa = empresa.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    // Format: EMPRESA FECHA IMPORTE.pdf
    return `${cleanEmpresa} ${fecha} ${importeTotal}.pdf`;
  }
}
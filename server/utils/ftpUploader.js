import ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class FTPUploader {
    constructor() {
        this.client = new ftp.Client();
        this.client.ftp.verbose = process.env.NODE_ENV === 'development';
        
        this.config = {
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            port: parseInt(process.env.FTP_PORT) || 21,
            secure: process.env.FTP_SECURE === 'true'
        };
        
        this.baseUrl = process.env.FTP_BASE_URL;
        this.remoteDir = process.env.FTP_REMOTE_DIR || '/ases_uploads';
    }

    async uploadFile(filePath, options = {}) {
        const {
            maxRetries = 3,
            timeout = 30000,
            chunkSize = 1024 * 1024 // 1MB chunks
        } = options;
        
        let retries = 0;
        let lastError = null;
        
        // Generate unique filename
        const originalName = path.basename(filePath);
        const fileExt = path.extname(originalName);
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');
        const safeName = `${timestamp}_${randomString}${fileExt}`;
        
        // Create remote path based on date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const remotePath = path.join(
            this.remoteDir,
            String(year),
            month,
            day,
            safeName
        ).replace(/\\/g, '/');
        
        while (retries < maxRetries) {
            try {
                await this.client.access(this.config);
                
                // Ensure remote directory exists
                const dirParts = remotePath.split('/').slice(0, -1);
                let currentPath = '';
                
                for (const part of dirParts) {
                    if (part) {
                        currentPath += '/' + part;
                        try {
                            await this.client.cd(currentPath);
                        } catch {
                            await this.client.ensureDir(currentPath);
                        }
                    }
                }
                
                // Upload with progress tracking
                const fileStats = fs.statSync(filePath);
                let uploadedBytes = 0;
                
                const progressCallback = (chunk) => {
                    uploadedBytes += chunk.length;
                    const progress = (uploadedBytes / fileStats.size) * 100;
                    
                    // Emit progress event if callback provided
                    if (options.onProgress) {
                        options.onProgress({
                            bytesUploaded: uploadedBytes,
                            totalBytes: fileStats.size,
                            percentage: progress,
                            speed: chunk.length / 1024 // KB/s
                        });
                    }
                };
                
                // Upload file
                await this.client.uploadFrom(filePath, remotePath, {
                    chunkSize,
                    onProgress: progressCallback
                });
                
                // Verify upload
                const remoteSize = await this.client.size(remotePath);
                if (remoteSize !== fileStats.size) {
                    throw new Error(`Upload verification failed: size mismatch (local: ${fileStats.size}, remote: ${remoteSize})`);
                }
                
                // Generate URL
                const fileUrl = `${this.baseUrl}${remotePath}`;
                
                await this.client.close();
                
                return {
                    success: true,
                    url: fileUrl,
                    filename: safeName,
                    originalName,
                    size: fileStats.size,
                    mimeType: this.getMimeType(fileExt),
                    uploadedAt: new Date().toISOString(),
                    remotePath
                };
                
            } catch (error) {
                lastError = error;
                retries++;
                
                console.error(`FTP upload attempt ${retries} failed:`, error.message);
                
                if (retries < maxRetries) {
                    // Exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, retries), 10000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    // Reset client for retry
                    this.client.close();
                    this.client = new ftp.Client();
                }
            }
        }
        
        throw new Error(`FTP upload failed after ${maxRetries} attempts: ${lastError.message}`);
    }

    async deleteFile(remotePath) {
        try {
            await this.client.access(this.config);
            await this.client.remove(remotePath);
            await this.client.close();
            return { success: true };
        } catch (error) {
            console.error('FTP delete error:', error);
            throw error;
        }
    }

    async listFiles(remoteDir = this.remoteDir) {
        try {
            await this.client.access(this.config);
            const files = await this.client.list(remoteDir);
            await this.client.close();
            
            return files.map(file => ({
                name: file.name,
                size: file.size,
                type: file.isDirectory ? 'directory' : 'file',
                modified: file.modifiedAt,
                path: path.join(remoteDir, file.name).replace(/\\/g, '/')
            }));
        } catch (error) {
            console.error('FTP list error:', error);
            throw error;
        }
    }

    getMimeType(extension) {
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.txt': 'text/plain',
            '.csv': 'text/csv'
        };
        
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }

    async testConnection() {
        try {
            await this.client.access(this.config);
            const pwd = await this.client.pwd();
            await this.client.close();
            
            return {
                success: true,
                message: 'FTP connection successful',
                currentDirectory: pwd,
                config: {
                    host: this.config.host,
                    port: this.config.port,
                    secure: this.config.secure
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `FTP connection failed: ${error.message}`,
                error: error.message
            };
        }
    }
}
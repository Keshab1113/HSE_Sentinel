// utils/ftpUploader.js
import ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class FTPUploader {
    constructor() {
        this.client = new ftp.Client();
        this.client.ftp.verbose = process.env.NODE_ENV === 'development';
        
        this.config = {
            host: process.env.FTP_HOST || '31.97.154.157',
            user: process.env.FTP_USER || 'officemom',
            password: process.env.FTP_PASS,
            port: parseInt(process.env.FTP_PORT) || 21,
            secure: process.env.FTP_SECURE === 'true'
        };
        
        this.baseUrl = process.env.FTP_BASE_URL || 'https://officemom.me/MOM';
        this.remoteDir = process.env.FTP_REMOTE_DIR || '/ases_uploads';
        
        console.log("FTP Uploader initialized with config:", {
            host: this.config.host,
            port: this.config.port,
            user: this.config.user,
            remoteDir: this.remoteDir,
            baseUrl: this.baseUrl
        });
    }

    async ensureDirectoryExists(ftpPath) {
        try {
            const parts = ftpPath.split('/').filter(p => p);
            let currentPath = '';
            
            for (const part of parts) {
                currentPath += '/' + part;
                try {
                    await this.client.cd(currentPath);
                    console.log(`Directory exists: ${currentPath}`);
                } catch (err) {
                    console.log(`Creating directory: ${currentPath}`);
                    await this.client.mkdir(currentPath);
                    await this.client.cd(currentPath);
                }
            }
        } catch (error) {
            console.error("Error ensuring directory exists:", error);
            throw error;
        }
    }

    async uploadFile(filePath, options = {}) {
        const {
            maxRetries = 3,
            timeout = 30000,
            onProgress = () => {}
        } = options;
        
        let retries = 0;
        let lastError = null;
        
        // Get file info
        const fileStats = fs.statSync(filePath);
        const originalName = path.basename(filePath);
        const fileExt = path.extname(originalName) || '';
        
        // Generate safe filename
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');
        const safeName = `${timestamp}_${randomString}${fileExt}`;
        
        // Create remote path based on date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const remoteDir = `${this.remoteDir}/${year}/${month}/${day}`;
        const remotePath = `${remoteDir}/${safeName}`;
        
        console.log(`Starting upload process for: ${originalName}`);
        console.log(`Remote path: ${remotePath}`);
        console.log(`File size: ${fileStats.size} bytes`);

        while (retries < maxRetries) {
            try {
                console.log(`Connecting to FTP server (attempt ${retries + 1}/${maxRetries})...`);
                
                // Set timeout
                this.client.ftp.connectionTimeout = timeout;
                
                // Connect to FTP
                await this.client.access(this.config);
                console.log("Connected to FTP server");
                
                // Ensure remote directory exists
                console.log(`Ensuring directory exists: ${remoteDir}`);
                await this.ensureDirectoryExists(remoteDir);
                
                // Upload with progress tracking
                console.log(`Uploading file to: ${remotePath}`);
                
                let uploadedBytes = 0;
                
                const progressHandler = (info) => {
                    uploadedBytes = info.bytes;
                    const percentage = (uploadedBytes / fileStats.size) * 100;
                    
                    onProgress({
                        bytesUploaded: uploadedBytes,
                        totalBytes: fileStats.size,
                        percentage: percentage,
                        speed: info.bytes / (info.seconds || 1) // bytes per second
                    });
                    
                    if (percentage % 25 === 0) {
                        console.log(`Upload progress: ${percentage.toFixed(1)}%`);
                    }
                };
                
                this.client.trackProgress(progressHandler);
                
                await this.client.uploadFrom(filePath, remotePath);
                
                this.client.trackProgress();
                
                // Verify upload
                try {
                    const remoteSize = await this.client.size(remotePath);
                    if (remoteSize !== fileStats.size) {
                        throw new Error(`Upload verification failed: size mismatch (local: ${fileStats.size}, remote: ${remoteSize})`);
                    }
                    console.log("Upload verified successfully");
                } catch (verifyError) {
                    console.log("Could not verify file size (continuing anyway):", verifyError.message);
                }
                
                // Close connection
                this.client.close();
                
                // Generate URL
                const fileUrl = `${this.baseUrl}${remotePath}`;
                
                console.log("Upload completed successfully:", fileUrl);
                
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
                
                // Close and recreate client on error
                try {
                    this.client.close();
                } catch (e) {
                    // Ignore close errors
                }
                
                if (retries < maxRetries) {
                    // Exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, retries), 10000);
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    // Create new client for retry
                    this.client = new ftp.Client();
                    this.client.ftp.verbose = process.env.NODE_ENV === 'development';
                }
            }
        }
        
        throw new Error(`FTP upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
    }

    async deleteFile(remotePath) {
        try {
            console.log(`Deleting file: ${remotePath}`);
            await this.client.access(this.config);
            await this.client.remove(remotePath);
            await this.client.close();
            console.log("File deleted successfully");
            return { success: true };
        } catch (error) {
            console.error('FTP delete error:', error);
            throw error;
        }
    }

    async listFiles(remoteDir = this.remoteDir) {
        try {
            console.log(`Listing files in: ${remoteDir}`);
            await this.client.access(this.config);
            const files = await this.client.list(remoteDir);
            await this.client.close();
            
            const fileList = files.map(file => ({
                name: file.name,
                size: file.size,
                type: file.isDirectory ? 'directory' : 'file',
                modified: file.modifiedAt,
                path: `${remoteDir}/${file.name}`.replace(/\\/g, '/'),
                url: `${this.baseUrl}${remoteDir}/${file.name}`.replace(/\\/g, '/')
            }));
            
            console.log(`Found ${fileList.length} files/directories`);
            return fileList;
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
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.zip': 'application/zip'
        };
        
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }

    async testConnection() {
        try {
            console.log("Testing FTP connection...");
            await this.client.access(this.config);
            const pwd = await this.client.pwd();
            const files = await this.client.list();
            await this.client.close();
            
            console.log("FTP connection test successful");
            
            return {
                success: true,
                message: 'FTP connection successful',
                currentDirectory: pwd,
                fileCount: files.length,
                config: {
                    host: this.config.host,
                    port: this.config.port,
                    secure: this.config.secure,
                    remoteDir: this.remoteDir
                }
            };
        } catch (error) {
            console.error("FTP connection test failed:", error);
            return {
                success: false,
                message: `FTP connection failed: ${error.message}`,
                error: error.message
            };
        }
    }
}
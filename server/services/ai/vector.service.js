const axios = require('axios');
const { pipeline } = require('@xenova/transformers');

class VectorService {
    constructor() {
        this.model = null;
        this.dimension = 384; // All-MiniLM-L6-v2 dimension
        
        // Qdrant configuration
        this.qdrantUrl = process.env.QDRANT_URL || 'https://qdrant.qhashai.com';
        this.collection = process.env.QDRANT_COLLECTION || 'tutor';
        this.apiKey = process.env.QDRANT_API_KEY || '';
    }

    async initialize() {
        if (!this.model) {
            try {
                this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                console.log('Vector model initialized successfully');
            } catch (error) {
                console.error('Failed to initialize vector model:', error);
                // Create a mock model for development
                this.model = {
                    process: async (text) => {
                        // Generate random embeddings for development
                        const embedding = Array.from({ length: this.dimension }, 
                            () => (Math.random() * 2) - 1);
                        return { data: embedding };
                    }
                };
            }
        }
        return this.model;
    }

    async generateEmbedding(text) {
        try {
            await this.initialize();
            
            // Clean and prepare text
            const cleanText = typeof text === 'string' 
                ? text.replace(/\s+/g, ' ').substring(0, 512).trim()
                : '';

            if (!cleanText) {
                // Return zero vector for empty text
                return Array.from({ length: this.dimension }, () => 0);
            }
            
            // Generate embedding
            let result;
            if (typeof this.model.process === 'function') {
                // Mock model
                result = await this.model.process(cleanText);
            } else {
                // Real model
                result = await this.model(cleanText, {
                    pooling: 'mean',
                    normalize: true
                });
            }
            
            // Convert to array and ensure correct dimension
            let embedding = Array.isArray(result.data) 
                ? result.data 
                : Array.from(result.data || []);
            
            // Pad or truncate to correct dimension
            if (embedding.length < this.dimension) {
                embedding = embedding.concat(
                    Array.from({ length: this.dimension - embedding.length }, () => 0)
                );
            } else if (embedding.length > this.dimension) {
                embedding = embedding.slice(0, this.dimension);
            }
            
            // Normalize if needed
            const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
            if (norm > 0) {
                embedding = embedding.map(val => val / norm);
            }
            
            return embedding;
        } catch (error) {
            console.error('Vector embedding error:', error);
            // Return random embedding as fallback
            return Array.from({ length: this.dimension }, 
                () => (Math.random() * 2) - 1);
        }
    }

    async storeInQdrant(embedding, metadata) {
        try {
            if (!this.qdrantUrl || this.qdrantUrl.includes('example.com')) {
                console.log('Qdrant not configured, skipping');
                return { success: false, message: 'Qdrant not configured' };
            }

            const point = {
                id: metadata.id || Date.now().toString(),
                vector: embedding,
                payload: {
                    text: metadata.text?.substring(0, 1000) || '',
                    indicator_type: metadata.indicator_type || 'neutral',
                    category: metadata.category || '',
                    file_type: metadata.file_type || '',
                    user_id: metadata.user_id || 0,
                    group_id: metadata.group_id || 0,
                    team_id: metadata.team_id || 0,
                    timestamp: new Date().toISOString(),
                    ...metadata.extra
                }
            };

            const response = await axios.put(
                `${this.qdrantUrl}/collections/${this.collection}/points`,
                {
                    points: [point]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.apiKey && { 'api-key': this.apiKey })
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            console.log('Qdrant storage successful');
            return response.data;
        } catch (error) {
            console.error('Qdrant storage error:', error.message);
            // This is non-critical, so just log and continue
            return { success: false, error: error.message };
        }
    }

    calculateCosineSimilarity(vecA, vecB) {
        if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
            return 0;
        }
        
        if (vecA.length !== vecB.length) {
            // Use the smaller length
            const minLength = Math.min(vecA.length, vecB.length);
            vecA = vecA.slice(0, minLength);
            vecB = vecB.slice(0, minLength);
        }
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        if (normA === 0 || normB === 0) return 0;
        
        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        
        // Ensure the result is between -1 and 1
        return Math.max(-1, Math.min(1, similarity));
    }
}

module.exports = { VectorService };
import pool from "../config/db.js";
import { MistralService } from "../services/ai/mistral.service.js";

export const runExtraction = async (resourceId) => {
  try {
    const [[resource]] = await pool.execute(
      "SELECT * FROM resources WHERE id = ?",
      [resourceId]
    );

    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }

    const mistral = new MistralService();
    
    // In production, download file from FTP first
    // For now, assume we have text or file path
    const result = await mistral.extractTextFromDocument(
      resource.storage_path || resource.content,
      resource.mime_type || 'text/plain'
    );

    if (!result.success) {
      throw new Error('Text extraction failed');
    }

    await pool.execute(
      `INSERT INTO extracted_text (resource_id, raw_text, language, confidence, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        resourceId,
        result.extractedText,
        result.language || 'en',
        result.confidence || 0.9,
        JSON.stringify(result.metadata || {})
      ]
    );

    await pool.execute(
      "UPDATE resources SET status='extracted', processed_at=NOW() WHERE id=?",
      [resourceId]
    );

    return {
      success: true,
      text: result.extractedText,
      metadata: result.metadata
    };
  } catch (error) {
    console.error("Extraction error:", error);
    
    // Update resource status to failed
    await pool.execute(
      "UPDATE resources SET status='failed', error_message=? WHERE id=?",
      [error.message, resourceId]
    );
    
    throw error;
  }
};
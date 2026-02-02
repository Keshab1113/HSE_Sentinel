const axios = require("axios");

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    this.baseURL = process.env.MISTRAL_OCR_URL || "https://api.mistral.ai/v1";
    
    if (!this.apiKey) {
      console.warn("MISTRAL_API_KEY not set. Mock mode enabled.");
      this.mockMode = true;
    }
  }

  async extractTextFromDocument(fileUrl, fileType) {
    // Mock response for development without API key
    if (this.mockMode) {
      console.log("MOCK: Extracting text from", fileType, "document");
      return {
        success: true,
        extractedText: `MOCK EXTRACTED SAFETY DOCUMENT - ${fileType}
        
        INCIDENT REPORT
        =================
        Date: ${new Date().toISOString().split('T')[0]}
        Location: Warehouse Zone A
        Employee: John Doe (ID: EMP-2024-001)
        Supervisor: Jane Smith
        
        Incident Type: Near Miss
        Description: Forklift operator nearly collided with pedestrian in aisle 3. Operator was reversing without spotter assistance. Pedestrian was wearing high-vis vest but was in designated equipment zone.
        
        Immediate Actions Taken:
        1. Work in area suspended
        2. Safety briefing conducted
        3. Area cordoned off for inspection
        
        Root Cause Analysis:
        - Insufficient spotter for reversing operations
        - Pedestrian entered restricted zone
        - Forklift warning alarm not functioning properly
        
        Corrective Actions:
        1. Mandatory spotter for all forklift reversing
        2. Repair warning alarms on all forklifts
        3. Retraining on zone restrictions
        
        Metrics:
        - Days Since Last Incident: 45
        - Training Hours This Month: 120
        - Safety Inspection Score: 85/100
        - Equipment Maintenance Compliance: 92%
        
        Recommendations:
        - Increase frequency of safety audits in high-traffic zones
        - Implement RFID zone access control
        - Monthly refresher training for equipment operators`,
        metadata: {
          model: "mock-mistral-small",
          tokens: 350,
          warning: "Running in mock mode - set MISTRAL_API_KEY for real extraction"
        }
      };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`, // Adjust endpoint based on actual Mistral OCR API
        {
          model: "mistral-large-latest",
          messages: [
            {
              role: "user",
              content: `You are a document analysis system. Analyze this ${fileType} safety document and extract ALL safety-related information.
                        Format your response as structured text with:
                        1. Document type and date
                        2. Key safety incidents/observations
                        3. Numerical metrics found
                        4. Risk assessments
                        5. Recommendations
                        6. Any compliance information`,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return {
        success: true,
        extractedText: response.data.choices[0].message.content,
        metadata: {
          model: response.data.model,
          tokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error("Mistral extraction error:", error.message);
      
      // Fallback to mock if API fails
      return {
        success: true,
        extractedText: `FALLBACK EXTRACTION - ${fileType}
        
        Safety Document Analysis Failed
        -------------------------------
        File Type: ${fileType}
        Error: ${error.message}
        
        Please review document manually for:
        - Incident reports
        - Safety observations
        - Training records
        - Inspection results
        - Maintenance logs
        - Compliance documentation
        
        Key areas to check:
        1. Dates and times of incidents
        2. Personnel involved
        3. Equipment identifiers
        4. Location information
        5. Corrective actions taken
        6. Follow-up required`,
        metadata: {
          model: "fallback",
          tokens: 0,
          error: error.message
        }
      };
    }
  }

  async classifySafetyEvent(text) {
    // Mock response for development
    if (this.mockMode || !text || text.trim().length < 10) {
      const isLeading = text.toLowerCase().includes('training') || 
                        text.toLowerCase().includes('inspection') || 
                        text.toLowerCase().includes('maintenance');
      
      const categories = isLeading 
        ? ['training', 'inspection', 'maintenance', 'safety_meeting']
        : ['incident', 'injury', 'property_damage', 'near_miss'];
      
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      return {
        indicator_type: isLeading ? "leading" : "lagging",
        category: randomCategory,
        confidence: 0.85 + (Math.random() * 0.1),
        risk_score: isLeading ? (3 + Math.random() * 2) : (6 + Math.random() * 3),
        key_entities: ["warehouse", "forklift", "safety", "employee"],
        recommended_actions: [
          isLeading ? "Continue regular monitoring" : "Implement corrective actions",
          "Document findings in safety log",
          "Schedule follow-up review"
        ]
      };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: `You are a safety expert. Classify the following safety event text.
                        Determine if it's a LEADING indicator (proactive, preventive measure) 
                        or LAGGING indicator (reactive, after-incident).
                        
                        LEADING examples: safety training completed, inspection passed, 
                        maintenance performed, safety meeting conducted, near-miss reported.
                        
                        LAGGING examples: injury occurred, property damage, spill, 
                        lost time incident, medical treatment case.
                        
                        Return JSON: {
                            "indicator_type": "leading" or "lagging",
                            "category": "training|inspection|maintenance|incident|injury|near_miss|property_damage|safety_meeting",
                            "confidence": 0.0-1.0,
                            "risk_score": 0-10,
                            "key_entities": ["entity1", "entity2"],
                            "recommended_actions": ["action1", "action2"]
                        }`,
            },
            {
              role: "user",
              content: text.substring(0, 3000), // Limit token usage
            },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result;
    } catch (error) {
      console.error("Mistral classification error:", error.message);
      
      // Fallback classification based on text content
      const textLower = text.toLowerCase();
      let indicator_type = "lagging";
      let category = "incident";
      
      if (textLower.includes('training') || textLower.includes('inspection') || 
          textLower.includes('maintenance') || textLower.includes('meeting') ||
          textLower.includes('audit')) {
        indicator_type = "leading";
        if (textLower.includes('training')) category = "training";
        else if (textLower.includes('inspection') || textLower.includes('audit')) category = "inspection";
        else if (textLower.includes('maintenance')) category = "maintenance";
        else category = "safety_meeting";
      } else if (textLower.includes('near miss') || textLower.includes('near-miss')) {
        indicator_type = "leading";
        category = "near_miss";
      }
      
      return {
        indicator_type,
        category,
        confidence: 0.7,
        risk_score: indicator_type === "leading" ? 4 : 6,
        key_entities: [],
        recommended_actions: ["Review document manually", "Consult safety officer", "Update safety logs"]
      };
    }
  }
}

module.exports = { MistralService };
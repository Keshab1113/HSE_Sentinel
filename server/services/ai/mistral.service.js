const axios = require("axios");

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || "";
    this.baseURL = process.env.MISTRAL_OCR_URL || "https://api.mistral.ai/v1";

    if (!this.apiKey) {
      console.warn("MISTRAL_API_KEY not set. Mock mode enabled.");
      this.mockMode = true;
    }
  }

  // services/ai/mistral.service.js - Updated extractTextFromDocument method
  async extractTextFromDocument(fileUrl, fileType) {
    if (this.mockMode) {
      console.log("MOCK: Extracting text from", fileType, "document");

      // Return a much larger mock text with proper content
      return {
        success: true,
        extractedText: `SAFETY INCIDENT REPORT & INSPECTION RECORD
Company: ABC Manufacturing Facility
Date: February 17, 2026
Location: Warehouse Zone A, Production Floor

NEAR MISS INCIDENT REPORT:
Time: 10:45 AM
Reported By: Michael Chen
Description: Forklift near collision with pedestrian in aisle 3. 
Operator applied emergency brakes, avoiding collision by approximately 2 feet.
Root Causes: Pedestrian entered forklift zone, warning systems not functioning, blind spots.
Corrective Actions: Installed mirrors, repaired warning systems, mandatory spotter requirement.

SAFETY INSPECTION FINDINGS:
Fire Extinguishers: 12 units inspected, OK
Emergency Exits: 100% accessible
PPE Compliance: Hard hats 95.5%, Safety glasses 93.3%, High-vis vests 91.1%
Machine Guarding Issues: Conveyor missing guard, Grinding wheel needs adjustment
Chemical Storage: Flammable cabinet door broken, 3 drums without spill pallets
Electrical Safety: 2 damaged cords removed, 3 missing junction box covers

TRAINING COMPLETION RECORDS:
Forklift Certification: 22/28 completed (78.5%) - Due 03/15/2026
Hazard Communication: 142/156 completed (91.0%) - Due 03/01/2026
Lockout/Tagout: 38/45 completed (84.4%) - Due 02/28/2026
First Aid/CPR: 18/25 completed (72.0%) - Due 04/15/2026
Safety Meeting Attendance: 134/156 on 02/10, 128/156 on 02/17

MAINTENANCE LOGS:
Preventive Maintenance Completion:
- Forklifts: 24/30 (80%) - 6 overdue
- Conveyors: 12/16 (75%) - 4 overdue
- Presses: 10/12 (83.3%) - 2 overdue
Equipment Breakdowns: Forklift hydraulic leak, Conveyor motor failure, Compressor regulator failure
Equipment over 10 years old: 4 forklifts (27%), 3 conveyors (37.5%), 2 presses (33.3%)

INCIDENT STATISTICS:
Year-to-Date Incidents:
- First Aid Cases: 5 total (severity 2.5)
- Medical Treatment: 2 total (severity 5.0)
- Lost Time Injuries: 1 total (severity 8.5)
- Property Damage: 3 total (severity 4.0)
- Near Misses: 14 total (severity 6.5)
TRIR: 4.2 (target <3.5)
Lost Time Injury Rate: 1.8 (target <1.0)

RISK ASSESSMENT:
High Priority Risks:
1. Conveyor #3 missing guard - Risk Score 18
2. Flammable cabinet broken - Risk Score 16

PREDICTIVE RISK ANALYSIS:
1. 85% Probability: Another near miss (forklift-pedestrian)
2. 70% Probability: Equipment breakdown causing downtime
3. 60% Probability: Lost time injury in warehouse
4. 55% Probability: Regulatory inspection trigger
5. 45% Probability: Chemical spill >5 gallons

RECOMMENDATIONS:
Immediate: Repair conveyor guarding, fix flammable cabinet, complete overdue maintenance
Short-term: Complete all training, install safety mirrors, repair warning alarms
Long-term: Equipment replacement plan, automated training tracking, facility risk assessment`,
        metadata: {
          model: "mock-mistral-large",
          tokens: 1200,
          pages: 4,
        },
      };
    }

    try {
      // Use correct Mistral API endpoint
      const response = await axios.post(
        `${this.baseURL}/ocr`, // Changed from /chat/completions
        {
          model: "mistral-ocr-latest",
          document: {
            type: fileType,
            source: fileUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      return {
        success: true,
        extractedText: response.data.text || response.data.content || "",
        metadata: {
          model: "mistral-ocr-latest",
          pages: response.data.pages || 1,
        },
      };
    } catch (error) {
      console.error("Mistral extraction error:", error.message);
      // Return mock data as fallback
      return {
        success: true,
        extractedText: `FALLBACK EXTRACTION - ${fileType}`,
        metadata: {
          model: "fallback",
          error: error.message,
        },
      };
    }
  }

  async classifySafetyEvent(text) {
    // Mock response for development
    if (this.mockMode || !text || text.trim().length < 10) {
      const isLeading =
        text.toLowerCase().includes("training") ||
        text.toLowerCase().includes("inspection") ||
        text.toLowerCase().includes("maintenance");

      const categories = isLeading
        ? ["training", "inspection", "maintenance", "safety_meeting"]
        : ["incident", "injury", "property_damage", "near_miss"];

      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      return {
        indicator_type: isLeading ? "leading" : "lagging",
        category: randomCategory,
        confidence: 0.85 + Math.random() * 0.1,
        risk_score: isLeading ? 3 + Math.random() * 2 : 6 + Math.random() * 3,
        key_entities: ["warehouse", "forklift", "safety", "employee"],
        recommended_actions: [
          isLeading
            ? "Continue regular monitoring"
            : "Implement corrective actions",
          "Document findings in safety log",
          "Schedule follow-up review",
        ],
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
          timeout: 30000,
        },
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result;
    } catch (error) {
      console.error("Mistral classification error:", error.message);

      // Fallback classification based on text content
      const textLower = text.toLowerCase();
      let indicator_type = "lagging";
      let category = "incident";

      if (
        textLower.includes("training") ||
        textLower.includes("inspection") ||
        textLower.includes("maintenance") ||
        textLower.includes("meeting") ||
        textLower.includes("audit")
      ) {
        indicator_type = "leading";
        if (textLower.includes("training")) category = "training";
        else if (
          textLower.includes("inspection") ||
          textLower.includes("audit")
        )
          category = "inspection";
        else if (textLower.includes("maintenance")) category = "maintenance";
        else category = "safety_meeting";
      } else if (
        textLower.includes("near miss") ||
        textLower.includes("near-miss")
      ) {
        indicator_type = "leading";
        category = "near_miss";
      }

      return {
        indicator_type,
        category,
        confidence: 0.7,
        risk_score: indicator_type === "leading" ? 4 : 6,
        key_entities: [],
        recommended_actions: [
          "Review document manually",
          "Consult safety officer",
          "Update safety logs",
        ],
      };
    }
  }
}

module.exports = { MistralService };

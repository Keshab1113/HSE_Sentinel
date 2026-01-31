const pool = require("../config/db");

/* =======================
   TEMPLATE MANAGEMENT
======================= */

exports.createTemplate = async (data, userId) => {
  const { name, area_type } = data;
  await pool.execute(
    `INSERT INTO inspection_templates (name, area_type, created_by)
     VALUES (?,?,?)`,
    [name, area_type, userId]
  );
};

exports.addItem = async (data) => {
  const { template_id, question, severity } = data;
  await pool.execute(
    `INSERT INTO inspection_items (template_id, question, severity)
     VALUES (?,?,?)`,
    [template_id, question, severity]
  );
};

exports.getTemplates = async () => {
  const [templates] = await pool.execute(
    "SELECT * FROM inspection_templates WHERE active=true"
  );

  for (const t of templates) {
    const [items] = await pool.execute(
      "SELECT * FROM inspection_items WHERE template_id=?",
      [t.id]
    );
    t.items = items;
  }

  return templates;
};

/* =======================
   INSPECTION EXECUTION
======================= */

exports.startInspection = async (data, userId) => {
  const { template_id, location, inspection_date } = data;

  const [res] = await pool.execute(
    `INSERT INTO inspections
     (template_id, conducted_by, location, inspection_date)
     VALUES (?,?,?,?)`,
    [template_id, userId, location, inspection_date]
  );

  return res.insertId;
};

/* =======================
   SUBMIT INSPECTION
======================= */

exports.submitInspection = async (inspectionId, data, userId) => {
  const { findings } = data;

  let score = 100;

  for (const f of findings) {
    let deduction = f.severity === "high" ? 20 : f.severity === "medium" ? 10 : 5;
    if (f.finding_type === "good_practice") deduction = 0;
    score -= deduction;

    // Create corrective task for NC
    let taskId = null;
    if (f.finding_type === "NC") {
      const [task] = await pool.execute(
        `INSERT INTO tasks
         (task_type, priority, status)
         VALUES ('Corrective Action', ?, 'open')`,
        [f.severity === "high" ? "high" : "medium"]
      );
      taskId = task.insertId;
    }

    await pool.execute(
      `INSERT INTO inspection_findings
       (inspection_id, finding_type, severity, description, linked_task_id)
       VALUES (?,?,?,?,?)`,
      [inspectionId, f.finding_type, f.severity, f.description, taskId]
    );
  }

  await pool.execute(
    `UPDATE inspections SET overall_score=? WHERE id=?`,
    [Math.max(score, 0), inspectionId]
  );
};

exports.getFindings = async () => {
  const [rows] = await pool.execute(`
    SELECT f.*, i.location, i.inspection_date
    FROM inspection_findings f
    JOIN inspections i ON f.inspection_id=i.id
  `);
  return rows;
};

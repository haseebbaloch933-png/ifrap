const express = require('express');
const { Pool } = require('pg');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ifrap_production',
});

// CSV Export for ESS5 Usufruct Land Tenure Ledgers
router.get('/csv/usufruct', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.rrr_id, 
        r.rrr_type, 
        p.full_name as stakeholder_name,
        p.cnic_number,
        r.share_numerator || '/' || r.share_denominator as share,
        r.approval_status,
        r.valid_from
      FROM la_rrr r
      JOIN la_party p ON r.party_id = p.party_id
      WHERE r.is_active = TRUE
      ORDER BY r.valid_from DESC
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).send('No Usufruct records found.');
    }

    const fields = ['rrr_id', 'rrr_type', 'stakeholder_name', 'cnic_number', 'share', 'approval_status', 'valid_from'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('ESS5_Usufruct_Ledger.csv');
    return res.send(csv);
  } catch (error) {
    console.error('[CSV Export Error]', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate CSV: ' + error.message });
  }
});

// PDF Export for ESS10 Grievance Redressal Mechanism (GRM) Logs
router.get('/pdf/grm', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.source_id,
        s.document_type,
        s.file_path,
        s.uploaded_at,
        r.approval_status
      FROM la_source s
      LEFT JOIN la_rrr r ON s.rrr_id = r.rrr_id
      WHERE s.document_type = 'GRM_Record'
      ORDER BY s.uploaded_at DESC
      LIMIT 100
    `);

    const doc = new PDFDocument({ margin: 50 });
    
    res.header('Content-Type', 'application/pdf');
    res.attachment('ESS10_GRM_Compliance_Report.pdf');
    
    doc.pipe(res);

    // Document Header
    doc.fontSize(20).text('IFRAP ESS10 Grievance Redressal Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
    doc.moveDown(2);

    if (result.rows.length === 0) {
      doc.fontSize(14).text('No Grievance Redressal records found.', { align: 'center' });
    } else {
      result.rows.forEach((row, i) => {
        doc.fontSize(14).text(`Incident #${i + 1}`);
        doc.fontSize(10).text(`Source ID: ${row.source_id}`);
        doc.fontSize(10).text(`Status: ${row.approval_status || 'Pending'}`);
        doc.fontSize(10).text(`Timestamp: ${row.uploaded_at}`);
        doc.fontSize(10).text(`Evidence Path: ${row.file_path}`);
        doc.moveDown();
      });
    }

    doc.end();
  } catch (error) {
    console.error('[PDF Export Error]', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Failed to generate PDF: ' + error.message });
    }
  }
});

// JSON Export for M&E Analytics & Grievance Safeguards
router.get('/json/me-analytics', async (req, res) => {
  try {
    const meData = {
      displacedHouseholds: {
        totalDisplacedHouseholds: 1250,
        assistedHouseholdsCount: 940,
        pendingAssistanceCount: 310,
        transitionalHousingAllocated: 480,
        vulnerableHouseholdsCount: 320,
        assistanceTypeBreakdown: { resettlementGrant: 420, livelihoodRestoration: 310, temporaryShelter: 210 },
        districtBreakdown: [
          { districtId: 'quetta', districtName: 'Quetta', displacedCount: 300, assistedCount: 250, completionPercentage: 83.3 },
          { districtId: 'pishin', districtName: 'Pishin', displacedCount: 280, assistedCount: 210, completionPercentage: 75.0 },
          { districtId: 'mastung', districtName: 'Mastung', displacedCount: 240, assistedCount: 180, completionPercentage: 75.0 },
          { districtId: 'kalat', districtName: 'Kalat', displacedCount: 200, assistedCount: 140, completionPercentage: 70.0 },
          { districtId: 'zhob', districtName: 'Zhob', displacedCount: 130, assistedCount: 90, completionPercentage: 69.2 },
          { districtId: 'ziarat', districtName: 'Ziarat', displacedCount: 100, assistedCount: 70, completionPercentage: 70.0 }
        ]
      },
      compensationBudget: {
        totalAllocatedBudgetPKR: 500000000,
        disbursedAmountPKR: 365000000,
        encumberedBudgetPKR: 85000000,
        remainingBudgetPKR: 50000000,
        burnRatePercentage: 73.0,
        monthlyBurnCurve: [
          { month: 'Jan', targetDisbursementPKR: 30000000, actualDisbursementPKR: 28000000 },
          { month: 'Feb', targetDisbursementPKR: 60000000, actualDisbursementPKR: 58000000 },
          { month: 'Mar', targetDisbursementPKR: 100000000, actualDisbursementPKR: 95000000 },
          { month: 'Apr', targetDisbursementPKR: 150000000, actualDisbursementPKR: 142000000 },
          { month: 'May', targetDisbursementPKR: 220000000, actualDisbursementPKR: 210000000 },
          { month: 'Jun', targetDisbursementPKR: 300000000, actualDisbursementPKR: 290000000 },
          { month: 'Jul', targetDisbursementPKR: 400000000, actualDisbursementPKR: 365000000 }
        ],
        categoryBreakdown: {
          landAcquisitionPKR: 180000000,
          cropLossCompensationPKR: 95000000,
          customaryWaterRightsCompensationPKR: 55000000,
          livelihoodRestorationPKR: 35000000
        }
      },
      grmTickets: {
        totalTicketsCount: 184,
        pendingTicketsCount: 26,
        inReviewTicketsCount: 12,
        resolvedTicketsCount: 146,
        resolutionRatePercentage: 79.35,
        avgResolutionDays: 4.2,
        slaBreakdown: { withinSLA: 138, escalated: 6, breachedSLA: 2, slaComplianceRatePercentage: 94.5 },
        categoryBreakdown: [
          { category: 'Usufruct_Dispute', total: 62, resolved: 50, pending: 12 },
          { category: 'Water_Allocation', total: 54, resolved: 45, pending: 9 },
          { category: 'Compensation_Delay', total: 40, resolved: 32, pending: 8 },
          { category: 'Environmental_Damage', total: 28, resolved: 19, pending: 9 }
        ],
        severityBreakdown: { low: 68, medium: 72, high: 32, critical: 12 },
        recentTickets: [
          { ticketId: 'GRM-2026-089', district: 'Quetta', category: 'Usufruct Dispute', status: 'Resolved', submittedAt: '2026-07-28', resolvedAt: '2026-07-30' }
        ]
      },
      lastUpdated: new Date().toISOString()
    };
    return res.json(meData);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;


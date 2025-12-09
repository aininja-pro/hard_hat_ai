/**
 * Export utilities for Submittal Scrubber compliance tables
 */

import { ComplianceItem } from '../components/ComplianceTable'
import * as XLSX from 'xlsx'

/**
 * Export compliance items to Excel format
 */
export function exportToExcel(
  items: ComplianceItem[],
  summary: string,
  filename = 'submittal-compliance.xlsx'
) {
  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Create summary sheet
  const summaryData = [['Submittal Compliance Analysis Summary'], [''], [summary]]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Create compliance sheet
  const complianceData = [
    ['Status', 'Requirement', 'Spec Text', 'Product Text', 'Notes'],
    ...items.map((item) => [
      item.status.toUpperCase(),
      item.requirement,
      item.spec_text,
      item.product_text,
      item.notes || '',
    ]),
  ]
  const complianceSheet = XLSX.utils.aoa_to_sheet(complianceData)

  // Set column widths
  complianceSheet['!cols'] = [
    { wch: 10 }, // Status
    { wch: 40 }, // Requirement
    { wch: 50 }, // Spec Text
    { wch: 50 }, // Product Text
    { wch: 40 }, // Notes
  ]

  XLSX.utils.book_append_sheet(workbook, complianceSheet, 'Compliance')

  // Create stats sheet
  const passCount = items.filter((item) => item.status.toLowerCase() === 'pass').length
  const warnCount = items.filter((item) => item.status.toLowerCase() === 'warn').length
  const failCount = items.filter((item) => item.status.toLowerCase() === 'fail').length

  const statsData = [
    ['Compliance Statistics'],
    [''],
    ['Status', 'Count'],
    ['Pass', passCount],
    ['Warn', warnCount],
    ['Fail', failCount],
    ['Total', items.length],
  ]
  const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics')

  // Write file
  XLSX.writeFile(workbook, filename)
}


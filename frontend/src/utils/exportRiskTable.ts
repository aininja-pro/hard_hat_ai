/**
 * Export utilities for Contract Hawk risk tables
 */

import { RiskItem } from '../components/RiskTable'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
// @ts-ignore - jspdf-autotable doesn't have types
import 'jspdf-autotable'

/**
 * Export risks to Excel format
 */
export function exportToExcel(risks: RiskItem[], summary: string, filename = 'contract-risks.xlsx') {
  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Create summary sheet
  const summaryData = [['Contract Risk Analysis Summary'], [''], [summary]]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Create risks sheet
  const risksData = [
    ['Clause', 'Severity', 'Severity Label', 'Explanation'],
    ...risks.map((risk) => [
      risk.clause,
      risk.severity,
      getSeverityLabel(risk.severity),
      risk.explanation,
    ]),
  ]
  const risksSheet = XLSX.utils.aoa_to_sheet(risksData)
  
  // Set column widths
  risksSheet['!cols'] = [
    { wch: 30 }, // Clause
    { wch: 10 }, // Severity
    { wch: 15 }, // Severity Label
    { wch: 60 }, // Explanation
  ]
  
  XLSX.utils.book_append_sheet(workbook, risksSheet, 'Risks')

  // Write file
  XLSX.writeFile(workbook, filename)
}

/**
 * Export risks to PDF format
 */
export function exportToPDF(risks: RiskItem[], summary: string, filename = 'contract-risks.pdf') {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(18)
  doc.text('Contract Risk Analysis', 14, 20)
  
  // Add summary
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Summary', 14, 35)
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const summaryLines = doc.splitTextToSize(summary, 180)
  doc.text(summaryLines, 14, 45)
  
  // Add risks table
  let yPos = 60
  
  if (risks.length > 0) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Identified Risks', 14, yPos)
    yPos += 10
    
    // Prepare table data
    const tableData = risks.map((risk) => [
      risk.clause,
      `${risk.severity} - ${getSeverityLabel(risk.severity)}`,
      risk.explanation,
    ])
    
    // Use autoTable plugin
    ;(doc as any).autoTable({
      head: [['Clause', 'Severity', 'Explanation']],
      body: tableData,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 110 },
      },
    })
  }
  
  // Save PDF
  doc.save(filename)
}

/**
 * Export risks to clipboard as formatted text
 */
export async function exportToClipboard(risks: RiskItem[], summary: string): Promise<boolean> {
  let text = 'CONTRACT RISK ANALYSIS\n'
  text += '='.repeat(50) + '\n\n'
  text += 'SUMMARY\n'
  text += '-'.repeat(50) + '\n'
  text += summary + '\n\n'
  text += 'IDENTIFIED RISKS\n'
  text += '-'.repeat(50) + '\n\n'
  
  risks.forEach((risk, index) => {
    text += `${index + 1}. ${risk.clause}\n`
    text += `   Severity: ${risk.severity} - ${getSeverityLabel(risk.severity)}\n`
    text += `   Explanation: ${risk.explanation}\n\n`
  })
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

function getSeverityLabel(severity: number): string {
  const labels = ['', 'Low', 'Low-Med', 'Medium', 'High', 'Critical']
  return labels[severity] || 'Unknown'
}


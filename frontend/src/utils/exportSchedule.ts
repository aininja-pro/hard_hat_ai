/**
 * Export utilities for Lookahead Builder schedules
 */

import { ScheduleItem } from '../components/ScheduleTable'
import * as XLSX from 'xlsx'

export interface ScheduleData {
  image_analysis?: {
    space_type: string
    estimated_dimensions: string
    current_phase: string
    visible_conditions: string[]
    trades_identified: string[]
  }
  schedule: ScheduleItem[]
  assumptions: string[]
  verify_with_foreman: string[]
  confidence_level: string
  confidence_explanation: string
  warnings: string[]
}

/**
 * Export schedule to Excel format
 */
export function exportToExcel(data: ScheduleData, filename = 'lookahead-schedule.xlsx') {
  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Create summary sheet
  const summaryData = [
    ['2-Week Lookahead Schedule'],
    [''],
  ]

  if (data.image_analysis) {
    summaryData.push(['Image Analysis'])
    summaryData.push(['Space Type:', data.image_analysis.space_type])
    summaryData.push(['Dimensions:', data.image_analysis.estimated_dimensions])
    summaryData.push(['Current Phase:', data.image_analysis.current_phase])
    summaryData.push(['Trades Identified:', data.image_analysis.trades_identified.join(', ')])
    summaryData.push([''])
  }

  summaryData.push(['Confidence Level:', data.confidence_level])
  summaryData.push(['Confidence Explanation:', data.confidence_explanation])
  summaryData.push([''])

  if (data.assumptions.length > 0) {
    summaryData.push(['Assumptions Made:'])
    data.assumptions.forEach((assumption) => {
      summaryData.push(['', assumption])
    })
    summaryData.push([''])
  }

  if (data.verify_with_foreman.length > 0) {
    summaryData.push(['Questions to Verify:'])
    data.verify_with_foreman.forEach((question) => {
      summaryData.push(['', question])
    })
    summaryData.push([''])
  }

  if (data.warnings.length > 0) {
    summaryData.push(['Warnings:'])
    data.warnings.forEach((warning) => {
      summaryData.push(['', warning])
    })
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Create schedule sheet
  const scheduleData = [
    ['Day', 'Date', 'Task', 'Trade', 'Crew Size', 'Duration (Hours)', 'Materials', 'Notes'],
    ...data.schedule.map((item) => [
      item.day,
      item.date,
      item.task,
      item.trade,
      item.crew_size,
      item.duration_hours,
      item.materials,
      item.notes,
    ]),
  ]
  const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData)

  // Set column widths
  scheduleSheet['!cols'] = [
    { wch: 6 },  // Day
    { wch: 12 }, // Date
    { wch: 50 }, // Task
    { wch: 15 }, // Trade
    { wch: 10 }, // Crew Size
    { wch: 12 }, // Duration
    { wch: 40 }, // Materials
    { wch: 40 }, // Notes
  ]

  XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule')

  // Write file
  XLSX.writeFile(workbook, filename)
}

/**
 * Export schedule to clipboard as formatted text
 */
export async function exportToClipboard(data: ScheduleData): Promise<boolean> {
  let text = '2-WEEK LOOKAHEAD SCHEDULE\n'
  text += '='.repeat(50) + '\n\n'

  if (data.image_analysis) {
    text += 'IMAGE ANALYSIS\n'
    text += '-'.repeat(50) + '\n'
    text += `Space Type: ${data.image_analysis.space_type}\n`
    text += `Dimensions: ${data.image_analysis.estimated_dimensions}\n`
    text += `Current Phase: ${data.image_analysis.current_phase}\n`
    text += `Trades: ${data.image_analysis.trades_identified.join(', ')}\n\n`
  }

  text += `Confidence Level: ${data.confidence_level}\n`
  text += `Explanation: ${data.confidence_explanation}\n\n`

  text += 'SCHEDULE\n'
  text += '-'.repeat(50) + '\n'
  text += 'Day | Date | Task | Trade | Crew | Hours | Materials/Notes\n'
  text += '-'.repeat(50) + '\n'

  data.schedule.forEach((item) => {
    text += `${item.day} | ${item.date} | ${item.task} | ${item.trade} | ${item.crew_size} | ${item.duration_hours} | ${item.materials}${item.notes ? ' - ' + item.notes : ''}\n`
  })

  text += '\n'

  if (data.assumptions.length > 0) {
    text += 'ASSUMPTIONS MADE\n'
    text += '-'.repeat(50) + '\n'
    data.assumptions.forEach((assumption) => {
      text += `- ${assumption}\n`
    })
    text += '\n'
  }

  if (data.verify_with_foreman.length > 0) {
    text += 'QUESTIONS TO VERIFY\n'
    text += '-'.repeat(50) + '\n'
    data.verify_with_foreman.forEach((question) => {
      text += `- ${question}\n`
    })
    text += '\n'
  }

  if (data.warnings.length > 0) {
    text += 'WARNINGS\n'
    text += '-'.repeat(50) + '\n'
    data.warnings.forEach((warning) => {
      text += `⚠ ${warning}\n`
    })
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}


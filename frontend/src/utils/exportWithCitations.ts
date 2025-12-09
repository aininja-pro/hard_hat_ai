/**
 * Export utilities for answers with citations
 */

import { Citation } from '../hooks/useClaudeStream'

/**
 * Format answer with citations for export
 */
export function formatAnswerWithCitations(
  answer: string,
  citations: Citation[]
): string {
  let formatted = answer + '\n\n'
  
  if (citations.length > 0) {
    formatted += '---\n'
    formatted += 'Citations:\n\n'
    
    citations.forEach((citation, index) => {
      formatted += `${index + 1}. Page ${citation.page}`
      if (citation.section) {
        formatted += ` - ${citation.section}`
      }
      formatted += '\n'
      
      if (citation.text) {
        formatted += `   "${citation.text}"\n`
      }
      formatted += '\n'
    })
  }
  
  return formatted
}

/**
 * Format answer with citations in Markdown format
 */
export function formatAnswerWithCitationsMarkdown(
  answer: string,
  citations: Citation[]
): string {
  let formatted = answer + '\n\n'
  
  if (citations.length > 0) {
    formatted += '## Citations\n\n'
    
    citations.forEach((citation, index) => {
      formatted += `### ${index + 1}. Page ${citation.page}\n`
      
      if (citation.section) {
        formatted += `**Section:** ${citation.section}\n\n`
      }
      
      if (citation.text) {
        formatted += `> ${citation.text}\n\n`
      }
    })
  }
  
  return formatted
}


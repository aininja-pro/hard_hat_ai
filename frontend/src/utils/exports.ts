/**
 * Export utilities for copying and sharing content
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Create a mailto link and open it
 */
export function openMailtoLink(emailBody: string, subject?: string): void {
  const subjectParam = subject ? `&subject=${encodeURIComponent(subject)}` : ''
  const bodyParam = `&body=${encodeURIComponent(emailBody)}`
  const mailtoUrl = `mailto:?${subjectParam}${bodyParam}`
  window.location.href = mailtoUrl
}

/**
 * Extract subject line from email text (if present)
 */
export function extractSubject(emailText: string): string | null {
  const subjectMatch = emailText.match(/^Subject:\s*(.+)$/im)
  return subjectMatch ? subjectMatch[1].trim() : null
}

/**
 * Extract email body (remove subject line if present)
 */
export function extractEmailBody(emailText: string): string {
  // Remove subject line if present
  const withoutSubject = emailText.replace(/^Subject:\s*.+$/im, '').trim()
  return withoutSubject
}


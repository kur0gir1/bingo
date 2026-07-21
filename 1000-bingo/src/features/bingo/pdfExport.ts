import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ExportPdfOptions {
  rootElement: HTMLElement
  filename: string
}

function revealForCapture(rootElement: HTMLElement): () => void {
  const previousStyle = rootElement.getAttribute('style')

  rootElement.style.display = 'block'
  rootElement.style.position = 'fixed'
  rootElement.style.left = '-10000px'
  rootElement.style.top = '0'
  rootElement.style.width = '210mm'
  rootElement.style.zIndex = '-1'
  rootElement.style.pointerEvents = 'none'
  rootElement.style.opacity = '1'

  return () => {
    if (previousStyle === null) {
      rootElement.removeAttribute('style')
    } else {
      rootElement.setAttribute('style', previousStyle)
    }
  }
}

export async function exportElementToPdf({ rootElement, filename }: ExportPdfOptions): Promise<void> {
  const restoreLayout = revealForCapture(rootElement)

  try {
    const pages = Array.from(rootElement.querySelectorAll<HTMLElement>('.print-page'))
    if (pages.length === 0) {
      throw new Error('No printable pages were found for export.')
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = 210
    const pageHeight = 297

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index]
      const previousStyle = page.getAttribute('style')

      page.style.width = `${pageWidth}mm`
      page.style.minHeight = `${pageHeight}mm`
      page.style.height = `${pageHeight}mm`

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: page.offsetWidth,
        height: page.offsetHeight,
      })

      if (previousStyle === null) {
        page.removeAttribute('style')
      } else {
        page.setAttribute('style', previousStyle)
      }

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('PDF export failed: captured page has zero size.')
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.98)

      if (index > 0) {
        pdf.addPage()
      }

      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
    }

    pdf.save(filename)
  } finally {
    restoreLayout()
  }
}

import Company from '#models/company'
import fs from 'node:fs'
import PDFDocument from 'pdfkit'

export default class PDFService {
  static async generateAttestation(company: Company): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument()
      const filename = `attestation_${company.id}.pdf`
      const filePath = `/tmp/${filename}`
      const writeStream = fs.createWriteStream(filePath)

      doc.pipe(writeStream)

      doc.fontSize(18).text("Attestation d'Enregistrement", { align: 'center' })
      doc.moveDown()
      doc
        .fontSize(12)
        .text(
          `Nous, soussignés, attestons que la société ${company.companyName} a été officiellement enregistrée conformément aux dispositions de l'article ... du code du travail de la République de Guinée.`
        )
      doc.moveDown()
      doc.text(`Nom de la société : ${company.companyName}`)
      doc.text(`Représentant : ${company.firstNames} ${company.lastName}`)
      doc.text(`Adresse : ${company.municipality}`)
      doc.text(`Date d'enregistrement : ${company?.validationDate?.toFormat('dd/MM/yyyy')}`)

      doc.end()

      writeStream.on('finish', () => resolve(filePath))
      writeStream.on('error', reject)
    })
  }
}

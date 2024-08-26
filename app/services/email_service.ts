import Company from '#models/company'
import mail from '@adonisjs/mail/services/main'

export default class EmailService {
  static async sendRegistrationConfirmation(company: Company) {
    const html = `
      <p>Mme/M. ${company.firstNames} ${company.lastName},</p>

      <p>Votre demande d'enregistrement de votre société ${company.companyName} à ${company.municipality}
      a été enregistrée, vous recevrez votre attestation après validation de nos services.</p>
    `
    await mail.sendLater((message) => {
      message
        .to(company.email)
        .subject(`Confirmation d'enregistrement de votre société ${company.companyName}`)
        .html(html)
    })
  }

  static async sendAcceptanceConfirmation(company: Company, pdfPath: string) {
    const html = `
      <p>Mme/M. ${company.firstNames} ${company.lastName},</p>

      <p>Nous avons le plaisir de vous informer que votre société <strong>${company.companyName}</strong> a été officiellement enregistrée et validée par nos services.</p>

      <p>Détails de l'enregistrement :</p>
      <ul>
        <li>Nom de la société : ${company.companyName}</li>
        <li>Adresse : ${company.municipality}</li>
        <li>Date de validation : ${company.validationDate?.toFormat('dd/MM/yyyy')}</li>
      </ul>

      <p>Votre attestation d'enregistrement est jointe à cet email.</p>

      <p>Nous vous remercions pour votre confiance et vous souhaitons pleine réussite dans vos activités.</p>

      <p>Cordialement,<br>
      Le Service d'Enregistrement des Entreprises</p>
      `

    await mail.sendLater((message) => {
      message
        .to(company.email)
        .subject(
          `Confirmation de validation - ${company.companyName} est officiellement enregistrée`
        )
        .html(html)
        .attach(pdfPath, {
          filename: 'attestation.pdf',
        })
    })
  }
}

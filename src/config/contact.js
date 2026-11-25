export const WHATSAPP_PHONE = 'REPLACE_WITH_VERIFIED_WHATSAPP_NUMBER'

export const hasConfiguredWhatsApp =
  /^\d{8,15}$/.test(WHATSAPP_PHONE)

// Discord webhook utility for admin notifications

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1421891459543597237/iC9XlCMFh5qtNYXmZzIRsI1S_XTwpe3kKIx1QEt8HXEeh1Txyfksq2P-TYdpUoCnV7B8'

export interface DiscordEmbed {
  title: string
  description?: string
  color: number
  fields?: {
    name: string
    value: string
    inline?: boolean
  }[]
  timestamp?: string
  footer?: {
    text: string
  }
  image?: {
    url: string
  }
}

export interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
}

export async function sendDiscordNotification(payload: DiscordWebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
      return false
    }

    console.log('Discord notification sent successfully')
    return true
  } catch (error) {
    console.error('Error sending Discord notification:', error)
    return false
  }
}

// Predefined notification functions for common events
export async function notifyPaymentApproval(
  userEmail: string,
  userName: string,
  planRequested: string,
  amount: string,
  referenceNumber?: string
) {
  const embed: DiscordEmbed = {
    title: "✅ Payment Approved",
    description: `A GCash payment has been approved and user subscription upgraded.`,
    color: 0x00ff00, // Green
    fields: [
      {
        name: "👤 User",
        value: `${userName}\n${userEmail}`,
        inline: true
      },
      {
        name: "💎 Plan",
        value: planRequested.toUpperCase(),
        inline: true
      },
      {
        name: "💰 Amount",
        value: amount.startsWith('₱') ? amount : `₱${amount}`,
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "OpusMentis - Payment System"
    }
  }

  if (referenceNumber) {
    embed.fields?.push({
      name: "🔖 Reference",
      value: referenceNumber,
      inline: true
    })
  }

  return await sendDiscordNotification({
    content: "🎉 **New payment approved!**",
    embeds: [embed],
    username: "OpusMentis Bot",
    avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png"
  })
}

export async function notifyPaymentRejection(
  userEmail: string,
  userName: string,
  planRequested: string,
  amount: string,
  reason?: string,
  referenceNumber?: string
) {
  const embed: DiscordEmbed = {
    title: "❌ Payment Rejected",
    description: `A GCash payment has been rejected.`,
    color: 0xff0000, // Red
    fields: [
      {
        name: "👤 User",
        value: `${userName}\n${userEmail}`,
        inline: true
      },
      {
        name: "💎 Plan",
        value: planRequested.toUpperCase(),
        inline: true
      },
      {
        name: "💰 Amount",
        value: amount.startsWith('₱') ? amount : `₱${amount}`,
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "OpusMentis - Payment System"
    }
  }

  if (referenceNumber) {
    embed.fields?.push({
      name: "🔖 Reference",
      value: referenceNumber,
      inline: true
    })
  }

  if (reason) {
    embed.fields?.push({
      name: "📝 Reason",
      value: reason,
      inline: false
    })
  }

  return await sendDiscordNotification({
    content: "⚠️ **Payment rejected**",
    embeds: [embed],
    username: "OpusMentis Bot",
    avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png"
  })
}

export async function notifyNewPaymentSubmission(
  userEmail: string,
  userName: string,
  planRequested: string,
  amount: string,
  referenceNumber?: string,
  receiptImageUrl?: string
) {
  const embed: DiscordEmbed = {
    title: "📋 New Payment Submitted",
    description: `A new GCash payment proof has been submitted and requires review.`,
    color: 0xffaa00, // Orange
    fields: [
      {
        name: "👤 User",
        value: `${userName}\n${userEmail}`,
        inline: true
      },
      {
        name: "💎 Plan Requested",
        value: planRequested.toUpperCase(),
        inline: true
      },
      {
        name: "💰 Amount",
        value: amount.startsWith('₱') ? amount : `₱${amount}`, // Fix double peso sign
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "OpusMentis - Payment System"
    }
  }

  if (referenceNumber) {
    embed.fields?.push({
      name: "🔖 Reference",
      value: referenceNumber,
      inline: true
    })
  }

  // Add receipt image if URL is provided
  if (receiptImageUrl) {
    embed.image = {
      url: receiptImageUrl
    }
  }

  return await sendDiscordNotification({
    content: "🔔 **New payment submission requires approval**",
    embeds: [embed],
    username: "OpusMentis Bot",
    avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png"
  })
}
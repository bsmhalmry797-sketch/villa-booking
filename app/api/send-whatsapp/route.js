import axios from 'axios'

export async function POST(req) {
  try {
    const { message } = await req.json()

    await axios.post(
      `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE}/messages/chat`,
      {
        token: process.env.ULTRAMSG_TOKEN,
        to: process.env.WHATSAPP_PHONE,
        body: message,
      }
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)

    return Response.json(
      { success: false },
      { status: 500 }
    )
  }
}
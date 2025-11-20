import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Type for Clerk user data
type ClerkUserData = {
    id: string
    email_addresses: Array<{ email_address: string }>
    first_name: string | null
    last_name: string | null
    image_url: string | null
}

export async function POST(req: Request) {
    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', {
            status: 400,
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occurred', {
            status: 400,
        })
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === 'user.created') {
        const data = evt.data as ClerkUserData

        try {
            await prisma.user.create({
                data: {
                    id: data.id,
                    email: data.email_addresses[0]?.email_address || '',
                    firstName: data.first_name || null,
                    lastName: data.last_name || null,
                    imageUrl: data.image_url || null,
                },
            })
        } catch (error) {
            console.error('Error creating user:', error)
            return new Response('Error creating user', { status: 500 })
        }
    }

    if (eventType === 'user.updated') {
        const data = evt.data as ClerkUserData

        try {
            await prisma.user.update({
                where: { id: data.id },
                data: {
                    email: data.email_addresses[0]?.email_address || '',
                    firstName: data.first_name || null,
                    lastName: data.last_name || null,
                    imageUrl: data.image_url || null,
                },
            })
        } catch (error) {
            console.error('Error updating user:', error)
            return new Response('Error updating user', { status: 500 })
        }
    }

    if (eventType === 'user.deleted') {
        const data = evt.data as { id?: string }

        if (!data.id) {
            return new Response('No user ID provided', { status: 400 })
        }

        try {
            await prisma.user.delete({
                where: { id: data.id },
            })
        } catch (error) {
            console.error('Error deleting user:', error)
            return new Response('Error deleting user', { status: 500 })
        }
    }

    return new Response('', { status: 200 })
}

// Supabase Edge Function for uploading images to Cloudflare R2
// Deploy with: supabase functions deploy upload-image

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID')
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') || 'diabeteslife-images'
const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL') // e.g., https://images.yourdomain.com

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate R2 configuration
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) {
      throw new Error('R2 configuration is not complete')
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'articles'
    const fileName = formData.get('fileName') as string

    if (!file || !fileName) {
      throw new Error('File and fileName are required')
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer()
    const contentType = file.type || 'image/webp'

    // Create S3-compatible endpoint for R2
    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    const objectKey = `${folder}/${fileName}`

    // Sign request using AWS Signature Version 4
    const date = new Date()
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const region = 'auto'
    const service = 's3'

    // Create canonical request
    const method = 'PUT'
    const canonicalUri = `/${R2_BUCKET_NAME}/${objectKey}`
    const canonicalQueryString = ''
    const payloadHash = await sha256Hex(new Uint8Array(arrayBuffer))

    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
    const canonicalHeaders = [
      `content-type:${contentType}`,
      `host:${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join('\n') + '\n'

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n')

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const canonicalRequestHash = await sha256Hex(new TextEncoder().encode(canonicalRequest))
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n')

    // Calculate signature
    const signingKey = await getSignatureKey(
      R2_SECRET_ACCESS_KEY!,
      dateStamp,
      region,
      service
    )
    const signature = await hmacSha256Hex(signingKey, stringToSign)

    // Create authorization header
    const authorization = [
      `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ')

    // Upload to R2
    const uploadResponse = await fetch(`${endpoint}/${R2_BUCKET_NAME}/${objectKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authorization,
      },
      body: arrayBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('R2 upload error:', errorText)
      throw new Error(`R2 upload failed: ${uploadResponse.status}`)
    }

    // Return public URL
    const publicUrl = `${R2_PUBLIC_URL}/${objectKey}`

    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ message: error.message || 'Upload failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper functions for AWS Signature V4
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

async function hmacSha256Hex(key: ArrayBuffer, data: string): Promise<string> {
  const signature = await hmacSha256(key, data)
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${key}`),
    dateStamp
  )
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  return hmacSha256(kService, 'aws4_request')
}

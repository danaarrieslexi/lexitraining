import { NextResponse } from 'next/server'

import isValidURL from '../../lib/isValidURL' 
import {getMinLinksAndVisits} from '@/app/lib/db'
import {addLink} from "@/app/lib/db"

import { setSessionUser }from '@/app/lib/session'


export const runtime = "edge"

export async function GET(request) {
    try {
        await setSessionUser(1)
        const links = await getMinLinksAndVisits(100, 0)
        return NextResponse.json(links, {status: 200})
    } catch (error) {
        console.error("Error in GET /api/links:", error);
        return NextResponse.json(
            { error: "Failed to fetch links", message: error?.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const headers = await request.headers
        const contentType = headers.get("content-type")
        if (contentType !== "application/json") {
            return NextResponse.json({"error": "Invalid request"}, {status: 415})
        }
        const data = await request.json()
        const url = data && data.url ? data.url : null
        
        if (!url) {
            return NextResponse.json({"error": "URL is required"}, {status: 400})
        }
        
        const validURL = await isValidURL(url, ["localhost:3000/blog", process.env.NEXT_PUBLIC_VERCEL_URL])
        if (!validURL) {
            return NextResponse.json({"message": `${url} is not valid.`}, {status: 400})
        }
        
        const dbResponse = await addLink(url)
        // addLink returns the database record directly, not an object with data/status
        return NextResponse.json(dbResponse, {status: 201})
    } catch (error) {
        console.error("Error adding link:", error);
        return NextResponse.json(
            { 
                error: "Failed to add link", 
                message: error?.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
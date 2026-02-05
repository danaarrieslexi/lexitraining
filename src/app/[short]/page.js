import {notFound, redirect} from 'next/navigation'
import {getShortLinkRecord} from "@/app/lib/db"
import getDomain from '../lib/getDomain'

export const runtime = "edge"

async function triggerVisit (linkId) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({linkId: linkId})
    }
    const domain = getDomain()
    const endpoint = `${domain}/api/visits`
    return await fetch(endpoint, options)
}


export default async function ShortPage({params}) {
    const {short} = await params
    if (!short) {
        notFound()
    }
    
    try {
        console.log('Looking for short code:', short)
        const records = await getShortLinkRecord(short)
        console.log('Records found:', records, 'Length:', records?.length)
        const record = records?.[0]
        
        if (!record) {
            console.log('No record found for short code:', short)
            console.log('Available records in database:', records)
            // Return a helpful message instead of just 404
            return <div className='text-center my-5'>
                <h1>Short link not found</h1>
                <p>The short code &quot;{short}&quot; does not exist in the database.</p>
                <p className='text-sm text-gray-500 mt-4'>Create a new link to generate a short code, or use an existing one.</p>
            </div>
        }
        
        const {url, id} = record
        if (!url) {
            console.log('Record found but no URL:', record)
            notFound()
        }
        
        if (id) {
            await triggerVisit(id)
        }
        
        // redirect(url, "push")

        return <div className='text-center my-5'>
                <h1>Redirect to: {url} </h1>
            </div>
    } catch (error) {
        console.error('Error in ShortPage:', error)
        notFound()
    }
}
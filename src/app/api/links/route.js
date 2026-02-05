import { NextResponse } from "next/server";
import { addLink } from "../../lib/db";

export async function POST(request) {
  try {
    const { url, short } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    // Allow optional custom short code, or generate one automatically
    const newLink = await addLink(url, short || null);
    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error("Error adding link:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
    
    // Return error message that's safe for production but helpful
    const errorMessage = error?.message || 'Unknown error';
    const isDev = process.env.NODE_ENV === 'development';
    
    // Check for common issues
    let userMessage = "Failed to add link";
    let statusCode = 500;
    
    if (errorMessage.includes('DATABASE_URL')) {
      userMessage = "Database configuration error. Please check Vercel environment variables.";
    } else if (errorMessage.includes('does not exist')) {
      userMessage = "Database table not found. Please run migrations.";
    } else if (errorMessage.includes('already exists')) {
      userMessage = errorMessage; // Use the exact error message for duplicate short codes
      statusCode = 409; // Conflict status code
    }
    
    return NextResponse.json(
      { 
        error: userMessage,
        message: isDev ? errorMessage : (errorMessage.includes('DATABASE_URL') ? errorMessage : undefined),
        code: error?.code
      },
      { status: statusCode }
    );
  }
}



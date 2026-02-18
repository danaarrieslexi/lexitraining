'use client'

import { useState } from 'react';

export default function LinksCreateForm () {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handlerForm = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        try {
          const response = await fetch('/api/links', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          // Check if response is JSON before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response received:', text.substring(0, 200));
            setError('Server returned an error. Please check the console for details.');
            return;
          }
          
          let result;
          try {
            result = await response.json();
          } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            setError('Invalid response from server. Please try again.');
            return;
          }
          
          if (response.ok) {
            console.log('Link added successfully:', result);
            setSuccess(true);
            // Reset form
            event.target.reset();
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
          } else {
            console.error('Error response:', result);
            setError(result.message || result.error || 'Failed to add link');
          }
        } catch (error) {
          console.error('Failed to submit form:', error);
          // Check if it's the JSON parsing error
          if (error.message && error.message.includes('JSON')) {
            setError('Server returned an invalid response. Please try again.');
          } else {
            setError('Network error: ' + error.message);
          }
        }
    }

return <> 
<form onSubmit={handlerForm}> 
<input type="text" defaultValue="https://github.com/danaarrieslexi/lexitraining/" placeholder="Your URL to shorten" name="url"/> 
<button type="submit">Shorten</button> 
{error && <div style={{color: 'red', marginTop: '10px'}}>Error: {error}</div>}
{success && <div style={{color: 'green', marginTop: '10px'}}>Link added successfully!</div>}
</form> 
</>
}
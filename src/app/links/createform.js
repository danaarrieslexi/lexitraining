'use client'

export default function LinksCreateForm () {

    const handlerForm = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        console.log(data);
        const JSONData = JSON.stringify(data);

    }

return <> 
<form onSubmit={handlerForm}> 
<input type="text" defaultValue="https://github.com/danaarrieslexi/lexitraining/" placeholder="Your URL to shorten" name="url"/> 
<button type="submit">Shorten</button> </form> </>
}
'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json()); // function to do fetching for use , not much different to fetch

export default function GitHubProfile() {
    const myGithubRepoProfile =  "https://api.github.com/repos/danaarrieslexi/lexitraining"
    const {data, error, isLoading} = useSWR(myGithubRepoProfile, fetcher)

if (error) return "An error has occurred";;
    
if (isLoading) return "Loading...";

return (

        <div>
            <h1>{data.name}</h1>
            <strong>{data.description}</strong>
            <p>{data.html_url}</p>
            <p>{data.stargazers_count}</p>
            <p>{data.watchers_count}</p>
            <p>{data.forks_count}</p>
            </div>
    )
}


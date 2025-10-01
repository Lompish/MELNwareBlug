export default async function (forum) {
    const response = await fetch(`/api/forums/by-name/${forum}`)
    const result = await response.json()

    return { response: response, result: result }
} 
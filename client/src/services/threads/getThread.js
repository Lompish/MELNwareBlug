export default async function (thread) {
    const response = await fetch(`/api/threads/by-title/${thread}`)
    const result = await response.json()

    return { response: response, result: result }
} 
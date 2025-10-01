export default async function () {
    const response = await fetch("/api/forums")
    const result = await response.json()

    return { response: response, result: result }
} 
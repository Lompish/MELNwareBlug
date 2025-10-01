export default async function () {
    const response = await fetch("/api/login")
    const result = await response.json()

    return { response: response, result: result }
} 
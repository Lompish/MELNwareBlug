export default async function () {
    const response = await fetch("/api/login", {
        method: "DELETE"
    })

    const result = await response.json()

    return { response: response, result: result }
} 
export default async function () {
    const response = await fetch("/api/login", {
        credentials: "include"
    })
    const result = await response.json()
    return { response, result }
}

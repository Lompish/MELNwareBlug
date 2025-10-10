export default async function logout() {
    const response = await fetch("/api/login", {
        method: "DELETE",
        credentials: "include"
    })
    const result = await response.json()
    return { response, result }
}

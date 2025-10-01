export default async function (email) {
    const response = await fetch(`/api/users/by-email/${email}`)

    const result = await response.json()

    return { response: response, result: result }
}
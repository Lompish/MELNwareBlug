export default async function (username) {
    const response = await fetch(`/api/users/by-username/${username}`)

    const result = await response.json()

    return { response: response, result: result }
}
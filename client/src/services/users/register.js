export default async function (email, username, password) {
    const response = await fetch("/api/users", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
            username: username,
            password: password
        })
    })

    const result = await response.json()

    return { response: response, result: result }
}
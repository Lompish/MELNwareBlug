export default async function (name) {
    const response = await fetch("/api/forums", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name
        })
    })

    const result = await response.json()

    return { response: response, result: result }
}
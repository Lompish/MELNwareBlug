export default async function (title, description, forum) {
    const response = await fetch("/api/threads", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            description: description,
            forum: forum
        })
    })

    const result = await response.json()

    return { response: response, result: result }
}
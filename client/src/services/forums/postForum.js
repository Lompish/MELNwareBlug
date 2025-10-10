export default async function (name, description = "") {
    const response = await fetch("/api/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            forumName: name,
            forumDescription: description
        })
    })

    const result = await response.json()
    return { response, result }
}

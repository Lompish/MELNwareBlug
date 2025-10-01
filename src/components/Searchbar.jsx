export default function Searchbar() {
    return <input
        type="search"
        placeholder="Search here..."
        className="grow w max-w-96 h-10 rounded-2xl pl-9 pr-3 bg-muted 
        text-foreground placeholder:text-muted-foreground
        border border-transparent focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring"
    />
}

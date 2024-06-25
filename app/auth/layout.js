export default function Layout({ children }) {
    return (
        <main className="h-screen flex items-center justify-center">
            <section>
                {children}
            </section>
        </main>
    )
}
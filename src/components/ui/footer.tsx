export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/50">
      {' '}
      <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-muted-foreground lg:px-8">
        {' '}
        <p>© {new Date().getFullYear()} Manajemen Kos — dikelola untuk pemilik dan penghuni.</p>{' '}
      </div>{' '}
    </footer>
  )
}

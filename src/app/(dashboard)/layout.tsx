import { Suspense } from 'react'
import Link from 'next/link'
import { Heart, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/**
 * Indonesian labels for the dashboard layout
 */
const LABELS = {
  appName: 'Atmando Health',
  menu: 'Menu',
  navigation: {
    dashboard: 'Beranda',
    members: 'Anggota Keluarga',
    health: 'Metrik Kesehatan',
    documents: 'Dokumen',
    vaccinations: 'Vaksinasi',
    medications: 'Obat',
    visits: 'Kunjungan Dokter',
    emergency: 'Kartu Darurat',
    settings: 'Pengaturan',
  },
  user: {
    profile: 'Profil',
    settings: 'Pengaturan',
    logout: 'Keluar',
  },
} as const

/**
 * Navigation items for the sidebar/mobile menu
 */
const NAV_ITEMS = [
  { href: '/dashboard', label: LABELS.navigation.dashboard },
  { href: '/members', label: LABELS.navigation.members },
  { href: '/health', label: LABELS.navigation.health },
  { href: '/documents', label: LABELS.navigation.documents },
  { href: '/vaccinations', label: LABELS.navigation.vaccinations },
  { href: '/medications', label: LABELS.navigation.medications },
  { href: '/visits', label: LABELS.navigation.visits },
  { href: '/emergency', label: LABELS.navigation.emergency },
] as const

/**
 * Header component with logo, mobile menu, and user menu
 */
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{LABELS.menu}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {LABELS.appName}
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 ml-2 md:ml-0">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="font-semibold hidden sm:inline-block">
            {LABELS.appName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">{LABELS.user.profile}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">{LABELS.user.profile}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">{LABELS.user.settings}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              {LABELS.user.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

/**
 * Dashboard layout with header and main content area
 * 
 * This layout wraps all dashboard pages and provides:
 * - Sticky header with logo, navigation, and user menu
 * - Mobile-friendly navigation via sheet/drawer
 * - Consistent padding and max-width for content
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6">
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}

/**
 * Loading skeleton for dashboard content
 */
function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Alerts skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-20 bg-muted rounded-lg" />
      </div>
      
      {/* Family overview skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-48 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Recent activity skeleton */}
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  )
}

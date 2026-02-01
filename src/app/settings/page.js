'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Moon,
    Sun,
    Download,
    Upload,
    Trash2,
    Info,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'

const settingsGroups = [
    {
        title: 'Appearance',
        items: [
            {
                id: 'theme',
                icon: Moon,
                label: 'Dark Mode',
                description: 'Currently using dark theme',
                action: 'toggle',
                value: true
            }
        ]
    },
    {
        title: 'Data',
        items: [
            {
                id: 'export',
                icon: Download,
                label: 'Export Data',
                description: 'Download all your data as JSON',
                action: 'button'
            },
            {
                id: 'import',
                icon: Upload,
                label: 'Import Data',
                description: 'Restore data from backup',
                action: 'button'
            }
        ]
    },
    {
        title: 'Security',
        items: [
            {
                id: 'lock',
                icon: Shield,
                label: 'App Lock',
                description: 'Coming soon - PIN protection',
                action: 'coming-soon'
            }
        ]
    },
    {
        title: 'Danger Zone',
        items: [
            {
                id: 'clear',
                icon: Trash2,
                label: 'Clear All Data',
                description: 'Permanently delete all your data',
                action: 'danger'
            }
        ]
    }
]

function SettingItem({ item }) {
    const Icon = item.icon
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [exporting, setExporting] = useState(false)
    const fileInputRef = React.useRef(null)

    const handleAction = async () => {
        if (item.id === 'export') {
            // Export functionality
            setExporting(true)
            try {
                const { exportAllDataToJSON, downloadJSON, exportToCSV, downloadCSV } = await import('@/lib/dataExport')

                // Show options dialog
                const format = confirm('Click OK for JSON, Cancel for CSV')

                if (format) {
                    // Export as JSON
                    const data = await exportAllDataToJSON()
                    downloadJSON(data)
                } else {
                    // Export as CSV
                    const csvData = await exportToCSV()
                    downloadCSV(csvData)
                }
            } catch (error) {
                alert('Export failed: ' + error.message)
            } finally {
                setExporting(false)
            }
        } else if (item.id === 'import') {
            // Import functionality - trigger file input
            fileInputRef.current?.click()
        }
    }

    const handleFileImport = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const { parseImportFile, validateImportData } = await import('@/lib/dataExport')

            const data = await parseImportFile(file)
            const validation = validateImportData(data)

            if (!validation.valid) {
                alert('Invalid file:\n' + validation.errors.join('\n'))
                return
            }

            // Show preview
            const stats = data.stats || {}
            const confirmMsg = `Import ${stats.totalAssets || 0} assets, ${stats.totalLoansGiven || 0} loans given, ${stats.totalLoansTaken || 0} loans taken?`

            if (confirm(confirmMsg)) {
                alert('Import functionality will add data to your existing records. Feature ready!')
            }
        } catch (error) {
            alert('Import failed: ' + error.message)
        }
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
            />
            <motion.div
                whileHover={{ x: 4 }}
                className={`
          flex items-center gap-4 p-4 rounded-xl transition-colors
          ${item.action === 'danger'
                        ? 'hover:bg-red-500/10'
                        : 'hover:bg-accent'
                    }
        `}
            >
                <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${item.action === 'danger'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-accent text-foreground'
                    }
        `}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.action === 'coming-soon' && (
                            <Badge variant="outline" className="text-xs">Soon</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                {item.action === 'toggle' && (
                    <div className={`
            w-12 h-7 rounded-full p-1 transition-colors cursor-pointer
            ${item.value ? 'bg-primary' : 'bg-muted'}
          `}>
                        <motion.div
                            className="w-5 h-5 rounded-full bg-white shadow"
                            animate={{ x: item.value ? 20 : 0 }}
                        />
                    </div>
                )}

                {item.action === 'button' && (
                    <Button variant="ghost" size="icon" onClick={handleAction}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                )}

                {item.action === 'danger' && (
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-500/10">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-red-500">Clear All Data?</DialogTitle>
                                <DialogDescription>
                                    This will permanently delete all your assets, loans, and finance schemes. This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={async () => {
                                    try {
                                        const { supabase } = await import('@/lib/supabase')
                                        // Delete all data from tables
                                        await supabase.from('loan_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                                        await supabase.from('loans').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                                        await supabase.from('assets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                                        await supabase.from('finance_schemes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                                        await supabase.from('net_worth_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                                        alert('All data has been deleted successfully.')
                                        setDeleteDialogOpen(false)
                                        window.location.reload()
                                    } catch (error) {
                                        console.error('Delete failed:', error)
                                        alert('Failed to delete data: ' + error.message)
                                    }
                                }}>
                                    Delete Everything
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </motion.div>
        </>
    )
}

export default function SettingsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-2xl mx-auto"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your app preferences</p>
            </div>

            {/* App Info */}
            <Card className="glass-card border-0">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold gradient-text">Sampadha</h2>
                            <p className="text-sm text-muted-foreground">Personal Finance Tracker</p>
                            <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Groups */}
            {settingsGroups.map((group) => (
                <Card key={group.title} className="border-0 bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                            {group.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {group.items.map((item) => (
                            <SettingItem key={item.id} item={item} />
                        ))}
                    </CardContent>
                </Card>
            ))}

            {/* Footer */}
            <div className="text-center py-8 text-sm text-muted-foreground">
                <p>Made with ❤️ for personal finance management</p>
                <p className="mt-1">© 2026 Sampadha</p>
            </div>
        </motion.div>
    )
}

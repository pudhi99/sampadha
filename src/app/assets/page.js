'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wallet,
    Coins,
    TrendingUp,
    Plus,
    Trash2,
    Edit,
    MoreVertical,
    Building2,
    Sparkles,
    Home,
    Car,
    MapPin,
    Tv
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getAssets, createAsset, updateAsset, deleteAsset } from '@/lib/db'
import { getCurrentGoldPrice, calculateGoldValue } from '@/lib/goldPrice'
import { ImageUpload } from '@/components/assets/ImageUpload'
import { AssetHelpDialog } from '@/components/assets/AssetHelpDialog'
import { uploadAssetImage } from '@/lib/imageUpload'
import { useAuth } from '@/context/AuthContext'
import { demoAssets } from '@/lib/demoData'

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 }
    }
}

// Format currency
function formatCurrency(amount) {
    const num = Number(amount) || 0
    if (num < 100000) {
        return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    } else if (num >= 100000 && num < 10000000) {
        return `₹${(num / 100000).toFixed(2)}L`
    } else {
        return `₹${(num / 10000000).toFixed(2)}Cr`
    }
}

// Asset type config
const assetTypeConfig = {
    CASH: {
        label: 'Cash & Bank',
        icon: Wallet,
        color: 'from-emerald-500/20 to-emerald-600/5',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-500',
        glow: 'glow-success'
    },
    GOLD: {
        label: 'Gold',
        icon: Coins,
        color: 'from-amber-500/20 to-amber-600/5',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-500',
        glow: 'glow-gold'
    },
    INVESTMENT: {
        label: 'Investments',
        icon: TrendingUp,
        color: 'from-violet-500/20 to-violet-600/5',
        iconBg: 'bg-violet-500/20',
        iconColor: 'text-violet-500',
        glow: 'glow-primary'
    },
    PHYSICAL: {
        label: 'Physical Assets',
        icon: Home,
        color: 'from-blue-500/20 to-blue-600/5',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-500',
        glow: 'glow-primary'
    }
}

// Category config for physical assets
const categoryConfig = {
    PROPERTY: { label: 'Property', icon: Home, color: 'text-blue-500' },
    VEHICLE: { label: 'Vehicle', icon: Car, color: 'text-orange-500' },
    LAND: { label: 'Land', icon: MapPin, color: 'text-green-500' },
    ELECTRONICS: { label: 'Electronics', icon: Tv, color: 'text-purple-500' },
    OTHER: { label: 'Other', icon: Building2, color: 'text-gray-500' }
}

// Asset Card Component
function AssetCard({ asset, onEdit, onDelete }) {
    const config = assetTypeConfig[asset.type] || assetTypeConfig.CASH
    const Icon = config.icon
    const profitLoss = Number(asset.current_value) - Number(asset.purchase_value)
    const profitPercent = asset.purchase_value > 0
        ? ((profitLoss / Number(asset.purchase_value)) * 100).toFixed(1)
        : 0

    return (
        <motion.div
            variants={itemVariants}
            layout
            whileHover={{ y: -4 }}
            className="group"
        >
            <Card className={`relative overflow-hidden bg-gradient-to-br ${config.color} border-0 floating-card`}>
                {/* Shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between mb-4">
                        <motion.div
                            className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            <Icon className={`w-6 h-6 ${config.iconColor}`} />
                        </motion.div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(asset)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => onDelete(asset.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-1 truncate">{asset.name}</h3>

                    <div className="space-y-2">
                        <p className="text-2xl font-bold">{formatCurrency(asset.current_value)}</p>

                        {asset.type === 'GOLD' && asset.metadata?.grams && (
                            <p className="text-sm text-muted-foreground">
                                {asset.metadata.grams}g • {asset.metadata.purity || '22K'}
                            </p>
                        )}

                        {profitLoss !== 0 && (
                            <div className={`flex items-center gap-1 text-sm ${profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                <span>{profitLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(profitLoss))}</span>
                                <span className="text-muted-foreground">({profitLoss >= 0 ? '+' : ''}{profitPercent}%)</span>
                            </div>
                        )}
                    </div>

                    {asset.notes && (
                        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{asset.notes}</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Asset Form Component
function AssetForm({ asset, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        name: asset?.name || '',
        type: asset?.type || 'CASH',
        current_value: asset?.current_value || '',
        purchase_value: asset?.purchase_value || '',
        notes: asset?.notes || '',
        metadata: asset?.metadata || {},
        category: asset?.category || 'OTHER',
        is_liability: asset?.is_liability || false,
        image_url: asset?.image_url || ''
    })
    const [loading, setLoading] = useState(false)
    const [fetchingPrice, setFetchingPrice] = useState(false)
    const [imageFile, setImageFile] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let imageUrl = formData.image_url

            // Upload image if a new file was selected
            if (imageFile && formData.type === 'PHYSICAL') {
                try {
                    const result = await uploadAssetImage(imageFile, asset?.id || 'new')
                    imageUrl = result.url
                } catch (imgError) {
                    console.error('Image upload failed:', imgError)
                }
            }

            await onSubmit({
                ...formData,
                current_value: Number(formData.current_value) || 0,
                purchase_value: Number(formData.purchase_value) || 0,
                image_url: imageUrl,
                category: formData.type === 'PHYSICAL' ? formData.category : null,
                is_liability: formData.type === 'PHYSICAL' ? formData.is_liability : false,
                metadata: formData.type === 'GOLD' ? {
                    grams: Number(formData.metadata.grams) || 0,
                    purity: formData.metadata.purity || '22K',
                    rate_per_gram: Number(formData.metadata.rate_per_gram) || 0
                } : {}
            })
            onClose()
        } catch (error) {
            console.error('Error saving asset:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., HDFC Savings, Gold Necklace"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CASH">Cash & Bank</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="INVESTMENT">Investment</SelectItem>
                        <SelectItem value="PHYSICAL">Physical Asset</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Physical Asset Fields */}
            {formData.type === 'PHYSICAL' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PROPERTY">🏠 Property</SelectItem>
                                    <SelectItem value="VEHICLE">🚗 Vehicle</SelectItem>
                                    <SelectItem value="LAND">🗺️ Land</SelectItem>
                                    <SelectItem value="ELECTRONICS">📱 Electronics</SelectItem>
                                    <SelectItem value="OTHER">📦 Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Asset Type</Label>
                            <div className="flex items-center gap-4 h-10">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_liability"
                                        checked={!formData.is_liability}
                                        onChange={() => setFormData({ ...formData, is_liability: false })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-emerald-500">✓ Asset</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_liability"
                                        checked={formData.is_liability}
                                        onChange={() => setFormData({ ...formData, is_liability: true })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-red-500">⚠ Liability</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Photo (optional)</Label>
                        <ImageUpload
                            value={formData.image_url}
                            onChange={(file) => {
                                setImageFile(file)
                            }}
                            onRemove={() => {
                                setImageFile(null)
                                setFormData({ ...formData, image_url: '' })
                            }}
                        />
                    </div>
                    {formData.is_liability && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-400">
                                ⚠ Liabilities reduce your net worth. Mark items with ongoing loans, EMIs, or depreciation as liabilities.
                            </p>
                        </div>
                    )}
                </>
            )}

            {formData.type === 'GOLD' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grams">Weight (grams)</Label>
                            <Input
                                id="grams"
                                type="number"
                                step="0.01"
                                placeholder="50"
                                value={formData.metadata.grams || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    metadata: { ...formData.metadata, grams: e.target.value }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purity">Purity</Label>
                            <Select
                                value={formData.metadata.purity || '22K'}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    metadata: { ...formData.metadata, purity: value }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="24K">24K</SelectItem>
                                    <SelectItem value="22K">22K</SelectItem>
                                    <SelectItem value="18K">18K</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate_per_gram">Rate per Gram (₹)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="rate_per_gram"
                                type="number"
                                placeholder="6500"
                                value={formData.metadata.rate_per_gram || ''}
                                onChange={(e) => {
                                    const rate = e.target.value
                                    setFormData({
                                        ...formData,
                                        metadata: { ...formData.metadata, rate_per_gram: rate },
                                        current_value: formData.metadata.grams && rate
                                            ? calculateGoldValue(
                                                Number(formData.metadata.grams),
                                                formData.metadata.purity === '24K' ? 24 : formData.metadata.purity === '22K' ? 22 : 18,
                                                Number(rate)
                                            )
                                            : formData.current_value
                                    })
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    setFetchingPrice(true)
                                    try {
                                        const goldPrice = await getCurrentGoldPrice()
                                        const purityNum = formData.metadata.purity === '24K' ? 24 : formData.metadata.purity === '22K' ? 22 : 18
                                        const currentValue = formData.metadata.grams
                                            ? calculateGoldValue(Number(formData.metadata.grams), purityNum, goldPrice.pricePerGram)
                                            : ''
                                        setFormData({
                                            ...formData,
                                            metadata: { ...formData.metadata, rate_per_gram: goldPrice.pricePerGram },
                                            current_value: currentValue
                                        })
                                    } catch (error) {
                                        console.error('Failed to fetch gold price', error)
                                    } finally {
                                        setFetchingPrice(false)
                                    }
                                }}
                                disabled={fetchingPrice}
                                className="whitespace-nowrap"
                            >
                                {fetchingPrice ? 'Fetching...' : "Today's Price"}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Current market rate updates automatically</p>
                    </div>

                    {formData.metadata.grams && formData.metadata.rate_per_gram && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-500">
                                Calculated Value: {formatCurrency(calculateGoldValue(
                                    Number(formData.metadata.grams),
                                    formData.metadata.purity === '24K' ? 24 : formData.metadata.purity === '22K' ? 22 : 18,
                                    Number(formData.metadata.rate_per_gram)
                                ))}
                            </p>
                        </div>
                    )}
                </>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="purchase_value">Purchase Value (₹)</Label>
                    <Input
                        id="purchase_value"
                        type="number"
                        placeholder="100000"
                        value={formData.purchase_value}
                        onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="current_value">Current Value (₹)</Label>
                    <Input
                        id="current_value"
                        type="number"
                        placeholder="120000"
                        value={formData.current_value}
                        onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                    id="notes"
                    placeholder="Any additional details..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : (asset ? 'Update' : 'Add Asset')}
                </Button>
            </div>
        </form >
    )
}

// Empty State Component
function EmptyState({ type, onAdd }) {
    const config = assetTypeConfig[type] || assetTypeConfig.CASH
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <motion.div
                className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center mb-4`}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No {config.label} Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-xs">
                Start tracking your {config.label.toLowerCase()} by adding your first entry.
            </p>
            <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add {config.label}
            </Button>
        </motion.div>
    )
}

export default function AssetsPage() {
    const { isDemo } = useAuth()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('ALL')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState(null)

    // Fetch assets
    useEffect(() => {
        fetchAssets()
    }, [isDemo])

    const fetchAssets = async () => {
        try {
            if (isDemo) {
                setAssets(demoAssets)
            } else {
                const data = await getAssets()
                setAssets(data || [])
            }
        } catch (error) {
            console.error('Error fetching assets:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter assets by type
    const filteredAssets = activeTab === 'ALL'
        ? assets
        : assets.filter(a => a.type === activeTab)

    // Calculate totals
    const totalValue = assets.reduce((sum, a) => sum + Number(a.current_value), 0)
    const totalPurchase = assets.reduce((sum, a) => sum + Number(a.purchase_value), 0)
    const totalProfit = totalValue - totalPurchase

    // Handle add/edit
    const handleSubmit = async (data) => {
        if (editingAsset) {
            await updateAsset(editingAsset.id, data)
        } else {
            await createAsset(data)
        }
        setEditingAsset(null)
        fetchAssets()
    }

    // Handle delete
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            await deleteAsset(id)
            fetchAssets()
        }
    }

    // Handle edit
    const handleEdit = (asset) => {
        setEditingAsset(asset)
        setDialogOpen(true)
    }

    // Open dialog for new asset
    const handleAdd = () => {
        setEditingAsset(null)
        setDialogOpen(true)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div>
                        <h1 className="text-2xl font-bold">Assets</h1>
                        <p className="text-muted-foreground">Manage your assets & physical property</p>
                    </div>
                    <AssetHelpDialog />
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={handleAdd}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Asset</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                        </DialogHeader>
                        <AssetForm
                            asset={editingAsset}
                            onSubmit={handleSubmit}
                            onClose={() => setDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="glass-card border-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Value</p>
                                <p className="text-2xl font-bold gradient-text">{formatCurrency(totalValue)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invested</p>
                                <p className="text-xl font-semibold">{formatCurrency(totalPurchase)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Profit/Loss</p>
                                <p className={`text-xl font-semibold ${totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="ALL" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="CASH" className="gap-2">
                        <Wallet className="w-4 h-4" />
                        <span className="hidden sm:inline">Cash</span>
                    </TabsTrigger>
                    <TabsTrigger value="GOLD" className="gap-2">
                        <Coins className="w-4 h-4" />
                        <span className="hidden sm:inline">Gold</span>
                    </TabsTrigger>
                    <TabsTrigger value="INVESTMENT" className="gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Invest</span>
                    </TabsTrigger>
                    <TabsTrigger value="PHYSICAL" className="gap-2">
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Physical</span>
                    </TabsTrigger>
                </TabsList>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />
                            ))}
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <EmptyState type={activeTab === 'ALL' ? 'CASH' : activeTab} onAdd={handleAdd} />
                    ) : (
                        <motion.div
                            key={activeTab}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {filteredAssets.map((asset) => (
                                <AssetCard
                                    key={asset.id}
                                    asset={asset}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Tabs>
        </motion.div >
    )
}

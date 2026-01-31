'use client'

import { useState } from 'react'
import { HelpCircle, Info } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Help Dialog explaining Assets vs Liabilities
 * Shows educational content with examples
 */
export function AssetHelpDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Info className="w-6 h-6 text-primary" />
                        Understanding Assets & Liabilities
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 text-sm">
                    {/* Assets Section */}
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <h3 className="font-semibold text-lg text-emerald-500 mb-3">
                            ✅ What are Assets?
                        </h3>
                        <p className="text-muted-foreground mb-3">
                            Assets are things you <strong>own</strong> that have economic value and can potentially generate income or appreciate over time.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Examples of Assets:</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li><strong>Property:</strong> House, Apartment, Commercial Building</li>
                                <li><strong>Land:</strong> Residential Plot, Agricultural Land, Farm</li>
                                <li><strong>Vehicles:</strong> Car you own outright, Bike (paid off)</li>
                                <li><strong>Investments:</strong> Stocks, Mutual Funds, Fixed Deposits, Gold</li>
                                <li><strong>Cash & Bank:</strong> Savings Account, Cash in Hand</li>
                                <li><strong>Electronics:</strong> Laptop, TV, Fridge (owned, not on loan)</li>
                                <li><strong>Other:</strong> Jewelry, Antiques, Art, Business Equipment</li>
                            </ul>
                        </div>
                        <div className="mt-3 p-3 bg-card rounded border border-border">
                            <p className="text-xs text-muted-foreground italic">
                                💡 <strong>Tip:</strong> Assets ADD to your net worth. They increase your financial strength.
                            </p>
                        </div>
                    </div>

                    {/* Liabilities Section */}
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <h3 className="font-semibold text-lg text-red-400 mb-3">
                            ⚠️ What are Liabilities?
                        </h3>
                        <p className="text-muted-foreground mb-3">
                            Liabilities are financial <strong>obligations</strong> or debts that you owe to others. They represent money you need to pay back.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Examples of Liabilities:</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li><strong>Loans:</strong> Home Loan, Personal Loan, Education Loan</li>
                                <li><strong>Vehicle Loans:</strong> Car Loan, Bike Loan (outstanding amount)</li>
                                <li><strong>Credit Cards:</strong> Unpaid Credit Card Balance</li>
                                <li><strong>EMIs:</strong> Any items purchased on EMI (TV, fridge, phone)</li>
                                <li><strong>Borrowed Money:</strong> Loans from friends, family, or lenders</li>
                                <li><strong>Mortgages:</strong> Outstanding home mortgage</li>
                            </ul>
                        </div>
                        <div className="mt-3 p-3 bg-card rounded border border-border">
                            <p className="text-xs text-muted-foreground italic">
                                💡 <strong>Tip:</strong> Liabilities REDUCE your net worth. Reducing debt increases financial freedom.
                            </p>
                        </div>
                    </div>

                    {/* Net Worth Formula */}
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <h3 className="font-semibold text-lg mb-2">📊 Your Net Worth</h3>
                        <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg border border-border">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-500">Assets</p>
                                <p className="text-xs text-muted-foreground">What you own</p>
                            </div>
                            <div className="text-3xl font-bold">−</div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-400">Liabilities</p>
                                <p className="text-xs text-muted-foreground">What you owe</p>
                            </div>
                            <div className="text-3xl font-bold">=</div>
                            <div className="text-center">
                                <p className="text-2xl font-bold gradient-text">Net Worth</p>
                                <p className="text-xs text-muted-foreground">Your wealth</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-3">
                            Track both to understand your true financial position
                        </p>
                    </div>

                    {/* Quick Example */}
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-semibold mb-2">📝 Quick Example</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between p-2 bg-emerald-500/5 rounded">
                                <span>Your house (owned)</span>
                                <span className="font-semibold text-emerald-500">Asset</span>
                            </div>
                            <div className="flex justify-between p-2 bg-red-500/5 rounded">
                                <span>Home loan for that house</span>
                                <span className="font-semibold text-red-400">Liability</span>
                            </div>
                            <div className="flex justify-between p-2 bg-emerald-500/5 rounded">
                                <span>Car (fully paid)</span>
                                <span className="font-semibold text-emerald-500">Asset</span>
                            </div>
                            <div className="flex justify-between p-2 bg-red-500/5 rounded">
                                <span>Car with ongoing loan</span>
                                <span className="font-semibold text-red-400">Liability (loan amount)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <DialogTrigger asChild>
                        <Button>Got it!</Button>
                    </DialogTrigger>
                </div>
            </DialogContent>
        </Dialog>
    )
}

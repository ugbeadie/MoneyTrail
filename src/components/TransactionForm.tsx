"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addTransaction } from "@/lib/actions";
import { PlusCircle, MinusCircle } from "lucide-react";
import type { TransactionType } from "@/types/transaction";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";

export default function TransactionForm() {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null); // 👈 create ref

  const handleSubmit = useCallback(
    async (formData: FormData): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        formData.set("type", transactionType);
        const result = await addTransaction(formData);

        if (result.success) {
          formRef.current?.reset();
          setError(null);
        } else {
          setError(result.error || "Failed to add transaction");
        }
      } catch (error) {
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    [transactionType]
  );

  const categories =
    transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {/* Transaction Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={transactionType === "income" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTransactionType("income")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Income
            </Button>
            <Button
              type="button"
              variant={transactionType === "expense" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTransactionType("expense")}
            >
              <MinusCircle className="w-4 h-4 mr-2" />
              Expense
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add a note about this transaction..."
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Receipt/Photo URL (Optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/receipt.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Add a link to a receipt or photo for this transaction
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

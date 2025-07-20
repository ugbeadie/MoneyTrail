"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { addTransaction, updateTransaction } from "@/lib/actions";
import { PlusCircle, MinusCircle, X } from "lucide-react";
import type { TransactionType, Transaction } from "@/types/transaction";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  onTransactionSaved?: () => void;
  onCancelEdit?: () => void;
}

export default function TransactionForm({
  editingTransaction,
  onTransactionSaved,
  onCancelEdit,
}: TransactionFormProps) {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const isEditing = !!editingTransaction;

  // Populate form when editing
  useEffect(() => {
    if (editingTransaction) {
      setTransactionType(editingTransaction.type);

      // Populate form fields
      if (formRef.current) {
        const form = formRef.current;
        (form.elements.namedItem("amount") as HTMLInputElement).value =
          editingTransaction.amount.toString();
        (form.elements.namedItem("description") as HTMLTextAreaElement).value =
          editingTransaction.description || "";
        (form.elements.namedItem("imageUrl") as HTMLInputElement).value =
          editingTransaction.imageUrl || "";
        (form.elements.namedItem("date") as HTMLInputElement).value =
          editingTransaction.date.toISOString().split("T")[0];

        // Set category value - we'll handle this with a key prop on the Select
      }
    } else {
      // Reset form when not editing
      setTransactionType("expense");
      formRef.current?.reset();
    }
  }, [editingTransaction]);

  const handleSubmit = useCallback(
    async (formData: FormData): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        formData.set("type", transactionType);

        let result;
        if (isEditing && editingTransaction) {
          formData.set("id", editingTransaction.id);
          result = await updateTransaction(formData);
        } else {
          result = await addTransaction(formData);
        }

        if (result.success) {
          if (isEditing) {
            toast.success("Transaction updated!");
          } else {
            formRef.current?.reset();
            toast.success("Transaction added!");
          }
          setError(null);
          onTransactionSaved?.();
        } else {
          setError(
            result.error ||
              `Failed to ${isEditing ? "update" : "add"} transaction`
          );
          toast.error(`Failed to ${isEditing ? "update" : "add"} transaction`);
        }
      } catch (error) {
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    [transactionType, isEditing, editingTransaction, onTransactionSaved]
  );

  const handleCancel = () => {
    formRef.current?.reset();
    setError(null);
    onCancelEdit?.();
  };

  const categories =
    transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </CardTitle>
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {/* Transaction Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={transactionType === "income" ? "default" : "outline"}
              className="flex-1 cursor-pointer"
              onClick={() => setTransactionType("income")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Income
            </Button>
            <Button
              type="button"
              variant={transactionType === "expense" ? "default" : "outline"}
              className="flex-1 cursor-pointer"
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
            <Select
              name="category"
              required
              key={`${transactionType}-${editingTransaction?.id || "new"}`}
              defaultValue={editingTransaction?.category}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="cursor-pointer"
                  >
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
              className="cursor-pointer"
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
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                ? "Update Transaction"
                : "Save Transaction"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

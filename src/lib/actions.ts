"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import type {
  Transaction,
  TransactionSummary,
  AddTransactionResult,
  TransactionType,
} from "@/types/transaction";

export async function addTransaction(
  formData: FormData
): Promise<AddTransactionResult> {
  try {
    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const dateStr = formData.get("date") as string;

    if (!type || !amountStr || !category || !dateStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Number.parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { success: false, error: "Invalid date" };
    }

    await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
      },
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add transaction" };
  }
}

export async function updateTransaction(
  formData: FormData
): Promise<AddTransactionResult> {
  try {
    const id = formData.get("id") as string;
    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const dateStr = formData.get("date") as string;

    if (!id || !type || !amountStr || !category || !dateStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Number.parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { success: false, error: "Invalid date" };
    }

    await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
      },
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(
  id: string
): Promise<AddTransactionResult> {
  try {
    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });

    return transactions.map((transaction) => ({
      ...transaction,
      type: transaction.type as TransactionType,
    }));
  } catch (error) {
    return [];
  }
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  try {
    const transactions = await prisma.transaction.findMany();

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (error) {
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

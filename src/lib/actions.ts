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

    // Create date in local timezone, then store as UTC
    const localDate = new Date(dateStr); // This creates a date at midnight in local timezone
    // Prisma will convert this local date to UTC when storing.
    // Example: 2023-10-26 00:00:00 PST (UTC-7) -> 2023-10-26 07:00:00Z in DB
    const date = localDate;

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
    console.error("Failed to add transaction:", error);
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

    const localDate = new Date(dateStr);
    const date = localDate;

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
    console.error("Failed to update transaction:", error);
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
    console.error("Failed to delete transaction:", error);
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
    console.error("Error fetching all transactions:", error);
    return [];
  }
}

export async function getTransactionsByMonth(
  month: number, // 0-indexed
  year: number
): Promise<Transaction[]> {
  try {
    // Calculate the start of the month in local time
    const localStartDate = new Date(year, month, 1);
    // Calculate the end of the month in local time
    const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Convert local dates to UTC for database query
    // This ensures that transactions whose local date falls within the month
    // are correctly fetched, regardless of timezone offset.
    const utcStartDate = new Date(
      Date.UTC(
        localStartDate.getFullYear(),
        localStartDate.getMonth(),
        localStartDate.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const utcEndDate = new Date(
      Date.UTC(
        localEndDate.getFullYear(),
        localEndDate.getMonth(),
        localEndDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
      orderBy: { date: "desc" },
    });

    return transactions.map((transaction) => ({
      ...transaction,
      type: transaction.type as TransactionType,
    }));
  } catch (error) {
    console.error("Error fetching transactions by month:", error);
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
    console.error("Error fetching transaction summary:", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

export async function getTransactionSummaryByMonth(
  month: number,
  year: number
): Promise<TransactionSummary> {
  try {
    const localStartDate = new Date(year, month, 1);
    const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const utcStartDate = new Date(
      Date.UTC(
        localStartDate.getFullYear(),
        localStartDate.getMonth(),
        localStartDate.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const utcEndDate = new Date(
      Date.UTC(
        localEndDate.getFullYear(),
        localEndDate.getMonth(),
        localEndDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
    });

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
    console.error("Error fetching transaction summary by month:", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

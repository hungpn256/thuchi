'use client';

import { useCallback, useEffect, useState } from 'react';

export const SPLIT_BILL_STORAGE_KEY = 'splitBillGroups';

export interface SplitBillMember {
  id: string; // uuid
  name: string;
}

export interface SplitBillExpense {
  id: string; // uuid
  payerId: string; // member id
  amount: number;
  description?: string;
  createdAt: string;
}

export interface SplitBillGroup {
  id: string; // uuid
  name: string;
  members: SplitBillMember[];
  expenses: SplitBillExpense[];
  createdAt: string;
  updatedAt: string;
}

export function useSplitBillGroups() {
  const [groups, setGroups] = useState<SplitBillGroup[]>([]);

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(SPLIT_BILL_STORAGE_KEY);
    if (raw) {
      try {
        setGroups(JSON.parse(raw));
      } catch {
        setGroups([]);
      }
    }
  }, []);

  // Save to localStorage
  const saveGroups = useCallback((next: SplitBillGroup[]) => {
    setGroups(next);
    localStorage.setItem(SPLIT_BILL_STORAGE_KEY, JSON.stringify(next));
  }, []);

  // CRUD operations
  const addGroup = useCallback(
    (group: SplitBillGroup) => {
      saveGroups([...groups, group]);
    },
    [groups, saveGroups],
  );

  const updateGroup = useCallback(
    (group: SplitBillGroup) => {
      saveGroups(groups.map((g) => (g.id === group.id ? group : g)));
    },
    [groups, saveGroups],
  );

  const deleteGroup = useCallback(
    (groupId: string) => {
      saveGroups(groups.filter((g) => g.id !== groupId));
    },
    [groups, saveGroups],
  );

  // Calculation helpers
  const calculateSummary = useCallback((group: SplitBillGroup) => {
    const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
    const perPerson = group.members.length > 0 ? total / group.members.length : 0;
    const paid: Record<string, number> = {};
    group.members.forEach((m) => {
      paid[m.id] = 0;
    });
    group.expenses.forEach((e) => {
      paid[e.payerId] += e.amount;
    });
    const balances = group.members.map((m) => ({
      member: m,
      paid: paid[m.id],
      shouldPay: perPerson,
      balance: paid[m.id] - perPerson,
    }));
    return { total, perPerson, balances };
  }, []);

  // Fair split calculation (who pays whom)
  const calculateSettlements = useCallback(
    (group: SplitBillGroup) => {
      const { balances } = calculateSummary(group);
      const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);
      const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);
      const settlements: Array<{ from: SplitBillMember; to: SplitBillMember; amount: number }> = [];
      let i = 0,
        j = 0;
      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(-debtor.balance, creditor.balance);
        if (amount > 0.01) {
          settlements.push({ from: debtor.member, to: creditor.member, amount });
          debtor.balance += amount;
          creditor.balance -= amount;
        }
        if (Math.abs(debtor.balance) < 0.01) i++;
        if (Math.abs(creditor.balance) < 0.01) j++;
      }
      return settlements;
    },
    [calculateSummary],
  );

  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    calculateSummary,
    calculateSettlements,
    saveGroups,
    setGroups,
  };
}

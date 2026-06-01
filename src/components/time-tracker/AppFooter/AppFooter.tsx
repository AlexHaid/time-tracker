"use client";

import React from "react";
import { formatTotal } from "@/lib/time-tracker/time-parser";
import type { TimeEntryWithDate } from "@/lib/time-tracker/types";
import styles from "./AppFooter.module.css";

interface AppFooterProps {
  selectedDate: string;
  selectedDateEntries: TimeEntryWithDate[];
  selectedDateTotalMinutes: number;
}

export default function AppFooter({
  selectedDate,
  selectedDateEntries,
  selectedDateTotalMinutes,
}: AppFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span>Time Tracker &mdash; Data stored locally in your browser</span>
        {selectedDate && selectedDateEntries.length > 0 && (
          <span>
            Selected day total: <strong className={styles.footerTotal}>{formatTotal(selectedDateTotalMinutes)}</strong>
          </span>
        )}
      </div>
    </footer>
  );
}

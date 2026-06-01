"use client";

import React from "react";
import { Clock, Timer } from "lucide-react";
import { formatTotal } from "@/lib/time-tracker/time-parser";
import ImportExportBar from "@/components/time-tracker/ImportExportBar/ImportExportBar";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  mounted: boolean;
  monthTotalMinutes: number;
  onDataChanged: () => void;
}

export default function AppHeader({ mounted, monthTotalMinutes, onDataChanged }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logoGroup}>
          <div className={styles.logoIcon}>
            <Timer style={{ height: "1.25rem", width: "1.25rem", color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <h1 className={styles.title}>Time Tracker</h1>
            <p className={styles.subtitle}>
              Track your time across days and periods
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {/* Monthly total */}
          <div className={styles.monthTotal}>
            <Clock style={{ height: "1rem", width: "1rem" }} className={styles.mutedText} />
            <span className={styles.mutedText}>This month:</span>
            <span className={styles.monthTotalValue}>
              {mounted ? formatTotal(monthTotalMinutes) : "\u2013"}
            </span>
          </div>
          <ImportExportBar onDataChanged={onDataChanged} />
        </div>
      </div>
    </header>
  );
}

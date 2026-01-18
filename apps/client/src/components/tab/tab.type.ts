import React from 'react';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  onTabChange?: (value: string) => void;
}

export interface TabButtonProps {
  item: TabItem;
  isActive: boolean;
  onClick: (value: string) => void;
}
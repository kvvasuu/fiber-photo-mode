"use client";

import type { ReactElement, ReactNode, Ref } from "react";
import { Children, createContext, isValidElement, useContext, useState } from "react";

interface TabsContextValue {
  activeTab: string | null;
  setActiveTab: (id: string) => void;
  availableTabs: Set<string>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs musi być użyte w Tabs");
  return ctx;
}

export function Tabs({
  children,
  defaultTab,
  className,
  ref,
}: {
  children: ReactNode;
  defaultTab?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const childrenArray = Children.toArray(children) as ReactElement[];
  const firstTab = defaultTab ?? childrenArray.find(isTabElement)?.props.tab ?? null;

  const [activeTab, setActiveTab] = useState<string | null>(firstTab);

  const availableTabs = collectTabs(children);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, availableTabs }}>
      <div className={`${className || ""} tabs`} ref={ref}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  const { availableTabs } = useTabs();

  const onlyOneTrigger = availableTabs.size === 1;

  return <div className={`${className || ""} list ${onlyOneTrigger ? "onlyOneTrigger" : ""}`}>{children}</div>;
}

export function TabsTrigger({ children, tab, className }: { children: ReactNode; tab: string; className?: string }) {
  const { activeTab, setActiveTab, availableTabs } = useTabs();

  if (!availableTabs.has(tab)) {
    return null;
  }

  return (
    <button
      className={`${className || ""} trigger  ${activeTab === tab ? "active" : ""}`}
      onClick={() => setActiveTab(tab)}
    >
      {children}
    </button>
  );
}

export function TabsTab({ children, tab, className }: { children: ReactNode; tab: string; className?: string }) {
  const { activeTab } = useTabs();

  return activeTab === tab ? <div className={`${className || ""} tab`}>{children}</div> : null;
}

function isTabElement(el: unknown): el is ReactElement<{ tab: string }> {
  return isValidElement(el) && "tab" in (el.props as any) && typeof (el.props as any)?.tab === "string";
}

function collectTabs(children: ReactNode): Set<string> {
  const tabs = new Set<string>();

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const props = child.props;

    if (typeof props !== "object" || props === null) return;

    if ("tab" in props && typeof (props as any).tab === "string") {
      tabs.add((props as any).tab);
      return;
    }

    if ("children" in props) {
      collectTabs(props.children as ReactNode).forEach((tab) => tabs.add(tab));
    }
  });

  return tabs;
}

import { TabButton } from './TabButton';

/**
 * @typedef {{ id: string, label: string }} TabItem
 */

/**
 * Horizontal tab navigation bar. Renders a row of tabs with bottom-border active indicator.
 *
 * @param {{ tabs: TabItem[], activeTab: string, onTabChange: (id: string) => void, className?: string }} props
 */
export function TabBar({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </div>
  );
}

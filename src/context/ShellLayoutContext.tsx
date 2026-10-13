import React, { createContext, useContext } from 'react';

export type DeviceMode = 'mobile' | 'expanded';

interface ShellLayoutContextValue {
  deviceMode: DeviceMode;
  isMobileShell: boolean;
  isExpandedShell: boolean;
}

const ShellLayoutContext = createContext<ShellLayoutContextValue>({
  deviceMode: 'mobile',
  isMobileShell: true,
  isExpandedShell: false
});

export const ShellLayoutProvider: React.FC<{
  deviceMode: DeviceMode;
  children: React.ReactNode;
}> = ({ deviceMode, children }) => (
  <ShellLayoutContext.Provider
    value={{
      deviceMode,
      isMobileShell: deviceMode === 'mobile',
      isExpandedShell: deviceMode === 'expanded'
    }}
  >
    {children}
  </ShellLayoutContext.Provider>
);

export const useShellLayout = () => useContext(ShellLayoutContext);

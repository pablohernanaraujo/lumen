import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  type NetworkInfo,
  networkStrategyService,
} from '../services/network-strategy-service';

export interface NetworkContextValue {
  isConnected: boolean;
  isReachable: boolean;
  networkType: string;
  isWiFi: boolean;
  isCellular: boolean;
  isExpensive: boolean;
  connectionQuality?: string;
  isOnline: boolean;
  wasOffline: boolean;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

export const useNetworkStatus = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkStatus must be used within a NetworkProvider');
  }
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: FC<NetworkProviderProps> = ({ children }) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(
    networkStrategyService.getCurrentNetworkInfo(),
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = networkStrategyService.onNetworkChange(
      (info: NetworkInfo) => {
        const previouslyConnected = networkInfo.isConnected;
        const nowConnected = info.isConnected && info.isInternetReachable;

        if (!previouslyConnected && nowConnected) {
          setWasOffline(true);
          setTimeout(() => setWasOffline(false), 3000);
        }

        setNetworkInfo(info);
      },
    );

    return unsubscribe;
  }, [networkInfo.isConnected]);

  const isOnline = networkInfo.isConnected && networkInfo.isInternetReachable;

  const value: NetworkContextValue = {
    isConnected: networkInfo.isConnected,
    isReachable: networkInfo.isInternetReachable,
    networkType: networkInfo.type,
    isWiFi: networkInfo.isWiFi,
    isCellular: networkInfo.isCellular,
    isExpensive: networkInfo.isExpensive,
    connectionQuality: networkInfo.effectiveConnectionType,
    isOnline,
    wasOffline,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

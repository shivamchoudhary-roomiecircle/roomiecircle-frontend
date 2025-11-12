import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";

interface ConfigValue {
  key: string;
  label: string;
  icon?: string;
}

interface ConfigData {
  LIFESTYLE_TAG: ConfigValue[];
  PROFESSION: ConfigValue[];
  PROFILE_SEARCH_STATUS: ConfigValue[];
  PROPERTY_TYPE: ConfigValue[];
  LAYOUT_TYPE: ConfigValue[];
  LISTING_TYPE: ConfigValue[];
  LISTING_DURATION: ConfigValue[];
  LISTING_URGENCY: ConfigValue[];
  RENTEE_TYPE: ConfigValue[];
  AMENITY_IN_HOME: ConfigValue[];
  AMENITY_ON_PROPERTY: ConfigValue[];
  AMENITY_SAFETY: ConfigValue[];
}

interface ConfigContextType {
  config: ConfigData | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true,
  error: null,
});

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
};

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiClient.getConfiguration();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";

interface ConfigValue {
  value: string;
  label: string;
  icon?: string;
  symbol?: string;
}

interface ConfigData {
  roomTypes: ConfigValue[];
  propertyTypes: ConfigValue[];
  bhkTypes: ConfigValue[];
  amenities: {
    in_home: ConfigValue[];
    on_property: ConfigValue[];
    safety: ConfigValue[];
  };
  professions: ConfigValue[];
  genders: ConfigValue[];
  lifestylePreferences: ConfigValue[];
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
      // Only fetch if config is null
      if (config !== null) {
        return;
      }

      setLoading(true);
      try {
        const data = await apiClient.getConfiguration();
        // Map API response to ConfigData structure
        const mappedConfig: ConfigData = {
          roomTypes: data.roomTypes || [],
          propertyTypes: data.propertyTypes || [],
          bhkTypes: data.bhkTypes || [],
          amenities: {
            in_home: data.amenities?.in_home || [],
            on_property: data.amenities?.on_property || [],
            safety: data.amenities?.safety || [],
          },
          professions: data.professions || [],
          genders: data.genders || [],
          lifestylePreferences: data.lifestylePreferences || [],
        };
        setConfig(mappedConfig);
        setError(null);
      } catch (err) {
        console.error("Failed to load configuration:", err);
        setError(err instanceof Error ? err.message : "Failed to load configuration");
        // Set empty config so page can still render
        setConfig({
          roomTypes: [],
          propertyTypes: [],
          bhkTypes: [],
          amenities: {
            in_home: [],
            on_property: [],
            safety: [],
          },
          professions: [],
          genders: [],
          lifestylePreferences: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []); // Only run on mount

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

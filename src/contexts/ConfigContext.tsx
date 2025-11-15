import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";

interface ConfigValue {
  value: string;
  label: string;
  icon?: string;
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
  renteeTypes: ConfigValue[];
  lifestyleTags: ConfigValue[];
  genderOptions: ConfigValue[];
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

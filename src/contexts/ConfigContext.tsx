import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { configApi } from "@/lib/api";

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
  roomStatuses: ConfigValue[];
  amenityCategories: ConfigValue[];
  amenities: Record<string, ConfigValue[]>;
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

const MAX_FETCH_ATTEMPTS = 3;

const createEmptyConfig = (): ConfigData => ({
  roomTypes: [],
  propertyTypes: [],
  bhkTypes: [],
  roomStatuses: [],
  amenityCategories: [],
  amenities: {},
  professions: [],
  genders: [],
  lifestylePreferences: [],
});

const hasConfigValues = (cfg: ConfigData | null): boolean => {
  if (!cfg) return false;
  return (
    cfg.roomTypes.length > 0 ||
    cfg.propertyTypes.length > 0 ||
    cfg.bhkTypes.length > 0 ||
    cfg.roomStatuses.length > 0 ||
    cfg.amenityCategories.length > 0 ||
    Object.keys(cfg.amenities).length > 0 ||
    cfg.professions.length > 0 ||
    cfg.genders.length > 0 ||
    cfg.lifestylePreferences.length > 0
  );
};

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
  const fetchAttemptsRef = useRef(0);

  useEffect(() => {
    const shouldFetch = !hasConfigValues(config);
    if (!shouldFetch) {
      return;
    }

    if (fetchAttemptsRef.current >= MAX_FETCH_ATTEMPTS) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchConfig = async () => {
      setLoading(true);
      fetchAttemptsRef.current += 1;

      try {
        const data = await configApi.getConfiguration();
        if (!isMounted) return;

        // Map amenities dynamically from API response
        const amenitiesRecord: Record<string, ConfigValue[]> = {};
        if (data.amenities) {
          Object.entries(data.amenities).forEach(([key, values]) => {
            amenitiesRecord[key] = values as ConfigValue[];
          });
        }

        const mappedConfig: ConfigData = {
          roomTypes: data.roomTypes || [],
          propertyTypes: data.propertyTypes || [],
          bhkTypes: data.bhkTypes || [],
          roomStatuses: data.roomStatuses || [],
          amenityCategories: data.amenityCategories || [],
          amenities: amenitiesRecord,
          professions: data.professions || [],
          genders: data.genders || [],
          lifestylePreferences: data.lifestylePreferences || [],
        };

        setConfig(mappedConfig);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load configuration:", err);
        setError(err instanceof Error ? err.message : "Failed to load configuration");
        // Trigger another fetch attempt if within limit by setting empty config
        setConfig(createEmptyConfig());
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [config]);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

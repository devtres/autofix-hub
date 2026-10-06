import { createContext, useContext, useState } from 'react';

const VehicleContext = createContext();

const STORAGE_KEY = 'afh_selected_vehicle';

export function VehicleProvider({ children }) {
  const [selectedVehicle, setSelectedVehicleState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [onlyCompatible, setOnlyCompatible] = useState(false);

  const setVehicle = (v) => {
    setSelectedVehicleState(v);
    if (v) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearVehicle = () => {
    setSelectedVehicleState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const checkFit = (product) => {
    if (!product) return { fits: true, isUniversal: false, label: '' };
    if (product.is_universal || product.universal) {
      return { fits: true, isUniversal: true, label: 'Universal Part' };
    }
    if (!selectedVehicle) {
      return { fits: true, isUniversal: false, label: '' };
    }

    const sameMake =
      product.make &&
      selectedVehicle.make &&
      product.make.trim().toLowerCase() === selectedVehicle.make.trim().toLowerCase();

    const cleanStr = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const pModelClean = cleanStr(product.model);
    const vModelClean = cleanStr(selectedVehicle.model);

    const sameModel =
      pModelClean &&
      vModelClean &&
      (pModelClean === vModelClean ||
        pModelClean.includes(vModelClean) ||
        vModelClean.includes(pModelClean));

    if (sameMake && sameModel) {
      const vYear = Number(selectedVehicle.year);
      const start = product.year_start ? Number(product.year_start) : null;
      const end = product.year_end ? Number(product.year_end) : null;

      if (vYear && start && end) {
        if (vYear >= start && vYear <= end) {
          return { fits: true, isUniversal: false, label: `Fits your ${selectedVehicle.model}` };
        }
        return { fits: false, isUniversal: false, label: `Year mismatch (${start}–${end})` };
      }
      return { fits: true, isUniversal: false, label: `Fits your ${selectedVehicle.model}` };
    }

    // Fallback: check fitment string contains model name
    if (
      selectedVehicle.model &&
      (product.fitment || '').toLowerCase().includes(selectedVehicle.model.toLowerCase())
    ) {
      return { fits: true, isUniversal: false, label: `Fits your ${selectedVehicle.model}` };
    }

    return { fits: false, isUniversal: false, label: 'Incompatible' };
  };

  return (
    <VehicleContext.Provider
      value={{
        selectedVehicle,
        setVehicle,
        clearVehicle,
        onlyCompatible,
        setOnlyCompatible,
        checkFit,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicle must be used within VehicleProvider');
  return ctx;
}

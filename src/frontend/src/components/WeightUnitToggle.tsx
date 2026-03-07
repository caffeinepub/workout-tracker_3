import { Loader2 } from "lucide-react";
import { WeightUnit } from "../backend";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useSaveCallerUserProfile } from "../hooks/useSaveCallerUserProfile";

export default function WeightUnitToggle() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  if (isLoading || !userProfile) return null;

  const currentUnit = userProfile.weightUnit ?? WeightUnit.lbs;

  const handleToggle = (unit: WeightUnit) => {
    if (unit === currentUnit || isPending) return;
    saveProfile({ ...userProfile, weightUnit: unit });
  };

  return (
    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-0.5">
      {isPending && (
        <Loader2 className="h-3 w-3 animate-spin text-white/70 ml-1" />
      )}
      <button
        type="button"
        onClick={() => handleToggle(WeightUnit.lbs)}
        disabled={isPending}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
          currentUnit === WeightUnit.lbs
            ? "bg-white text-orange-600 shadow-sm"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
      >
        lbs
      </button>
      <button
        type="button"
        onClick={() => handleToggle(WeightUnit.kg)}
        disabled={isPending}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
          currentUnit === WeightUnit.kg
            ? "bg-white text-orange-600 shadow-sm"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
      >
        kg
      </button>
    </div>
  );
}

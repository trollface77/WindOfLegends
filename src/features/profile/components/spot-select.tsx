import { FormField, Select } from "@/components/ui/form-field";
import type { SpotOption } from "@/features/geo";

interface Props {
  label: string;
  noneLabel: string;
  spots: SpotOption[];
  defaultValue: string | null;
  error?: string;
}

export function SpotSelect({
  label,
  noneLabel,
  spots,
  defaultValue,
  error,
}: Props) {
  return (
    <FormField id="homeSpotId" label={label} error={error}>
      <Select
        id="homeSpotId"
        name="homeSpotId"
        defaultValue={defaultValue ?? ""}
        error={error}
      >
        <option value="">{noneLabel}</option>
        {spots.map((spot) => (
          <option key={spot.id} value={spot.id}>
            {spot.name}
          </option>
        ))}
      </Select>
    </FormField>
  );
}

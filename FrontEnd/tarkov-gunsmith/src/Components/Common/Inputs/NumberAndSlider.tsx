import { NumberInput, Slider } from "@mantine/core";
import { useBallisticSimulatorFormContext } from
    "../../../Pages/BallisticsSimulator.tsx/ballistic-simulator--form-context";

interface NumberAndSliderProps {
    label: string,
    property: string;
    precision: number;
    max: number;
    min: number;
    step: number;
    marks?: {
        value: number;
        label?: React.ReactNode;
    }[]
}

export function NumberAndSlider(props: NumberAndSliderProps) {
    const { label, property, precision, max, min, step, marks} = props;
    const form = useBallisticSimulatorFormContext();

    const marksPadding = marks ? 11.5 : 0

    return (
        <div>
            <NumberInput
                label={label}
                precision={precision}
                max={max}
                min={min}
                step={step}
                stepHoldDelay={500}
                stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                {...form.getInputProps(property)}
            />
            <Slider
                pb={marksPadding}
                label={null}
                max={max}
                min={min}
                step={step}
                {...form.getInputProps(property)}
                marks={marks}
            />
        </div>
    )
}